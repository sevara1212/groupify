from datetime import date, timedelta, datetime
from collections import defaultdict

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Any

from db import supabase

router = APIRouter()


# ── Helpers ───────────────────────────────────────────────────────────────────

def _parse_date(val: str | None) -> date | None:
    if not val:
        return None
    try:
        return datetime.strptime(val[:10], "%Y-%m-%d").date()
    except ValueError:
        return None


def _upsert_alert(project_id: str, alert_type: str, message: str,
                  member_id: str | None, task_id: str | None) -> None:
    """Insert alert only if no undismissed one already exists for same project+member+type."""
    q = (
        supabase.table("risk_alerts")
        .select("id")
        .eq("project_id", project_id)
        .eq("type", alert_type)
        .eq("dismissed", False)
    )
    if member_id:
        q = q.eq("member_id", member_id)
    if task_id:
        q = q.eq("task_id", task_id)

    existing = q.execute()
    if existing.data:
        return  # already alerted

    row: dict[str, Any] = {
        "project_id": project_id,
        "type": alert_type,
        "message": message,
        "dismissed": False,
    }
    if member_id:
        row["member_id"] = member_id
    if task_id:
        row["task_id"] = task_id

    supabase.table("risk_alerts").insert(row).execute()


def _member_skill_scores(member_id: str, questions: list) -> dict[str, float]:
    """Extract skill scores from quiz answers for one member."""
    answers = (
        supabase.table("quiz_answers")
        .select("*")
        .eq("member_id", member_id)
        .execute()
        .data
    )
    q_by_id = {q["id"]: q for q in questions}
    scores: dict[str, float] = {}
    for ans in answers:
        q = q_by_id.get(ans.get("question_id") or ans.get("quiz_question_id"))
        if not q:
            continue
        if q.get("question_type") == "confidence_sliders" and isinstance(ans.get("answer"), dict):
            for skill, score in ans["answer"].items():
                try:
                    scores[skill] = float(score)
                except (TypeError, ValueError):
                    pass
    return scores


def _score_member_for_criterion(skill_scores: dict, criterion: dict,
                                 tasks_assigned: int) -> float:
    required = criterion.get("required_skills") or []
    base = sum(skill_scores.get(s, 5.0) for s in required)
    workload_penalty = 10 * tasks_assigned
    return base - workload_penalty


# ── GET /projects/{project_id}/risks ─────────────────────────────────────────

@router.get("/projects/{project_id}/risks")
def get_risks(project_id: str):
    today = date.today()

    tasks = (
        supabase.table("tasks")
        .select("id, title, due_date, progress_percent, status, member_id")
        .eq("project_id", project_id)
        .execute()
        .data
    )
    members = supabase.table("members").select("id, name").eq("project_id", project_id).execute().data
    member_by_id = {m["id"]: m["name"] for m in members}

    # ── Overdue ──
    for task in tasks:
        due = _parse_date(task.get("due_date"))
        progress = task.get("progress_percent") or 0
        if due and due < today and progress < 100 and task.get("status") != "done":
            days_overdue = (today - due).days
            member_name = member_by_id.get(task["member_id"], "A member")
            _upsert_alert(
                project_id,
                "overdue",
                f"{member_name}'s task '{task['title']}' was due {days_overdue} days ago "
                f"with {progress}% progress logged.",
                task["member_id"],
                task["id"],
            )

    # ── At Risk ──
    for task in tasks:
        due = _parse_date(task.get("due_date"))
        progress = task.get("progress_percent") or 0
        if (
            due
            and today < due <= today + timedelta(days=3)
            and progress < 50
            and task.get("status") != "done"
        ):
            days_left = (due - today).days
            _upsert_alert(
                project_id,
                "at_risk",
                f"'{task['title']}' is due in {days_left} days but only {progress}% complete.",
                task["member_id"],
                task["id"],
            )

    # ── Imbalance ──
    task_counts: dict[str, int] = defaultdict(int)
    for task in tasks:
        if task.get("member_id"):
            task_counts[task["member_id"]] += 1

    if task_counts:
        max_count = max(task_counts.values())
        min_count = min(task_counts.values())
        if max_count > 2 * min_count and min_count > 0:
            _upsert_alert(
                project_id,
                "imbalance",
                "Workload is uneven across the group. Peer review scores may be affected.",
                None,
                None,
            )

    # ── Fetch all undismissed alerts with joins ──
    alerts_raw = (
        supabase.table("risk_alerts")
        .select("*")
        .eq("project_id", project_id)
        .eq("dismissed", False)
        .execute()
        .data
    )

    task_by_id = {t["id"]: t for t in tasks}

    alerts = [
        {
            "id": a["id"],
            "type": a["type"],
            "message": a["message"],
            "member_id": a.get("member_id"),
            "member_name": member_by_id.get(a.get("member_id"), None),
            "task_id": a.get("task_id"),
            "task_title": task_by_id.get(a.get("task_id"), {}).get("title") if a.get("task_id") else None,
            "dismissed": False,
        }
        for a in alerts_raw
    ]

    return {"alerts": alerts}


# ── POST /risks/{alert_id}/dismiss ───────────────────────────────────────────

@router.post("/risks/{alert_id}/dismiss")
def dismiss_alert(alert_id: str):
    result = (
        supabase.table("risk_alerts")
        .update({"dismissed": True})
        .eq("id", alert_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Alert not found")
    return {"success": True}


# ── POST /projects/{project_id}/rebalance ────────────────────────────────────

class RebalanceRequest(BaseModel):
    task_id: str
    from_member_id: str


@router.post("/projects/{project_id}/rebalance")
def rebalance(project_id: str, body: RebalanceRequest):
    # Fetch the task
    task_res = supabase.table("tasks").select("*").eq("id", body.task_id).single().execute()
    if not task_res.data:
        raise HTTPException(status_code=404, detail="Task not found")
    task = task_res.data

    # Fetch criterion
    criterion: dict = {}
    if task.get("rubric_criterion_id"):
        crit_res = (
            supabase.table("rubric_criteria")
            .select("*")
            .eq("id", task["rubric_criterion_id"])
            .single()
            .execute()
        )
        criterion = crit_res.data or {}

    # Fetch members, their task counts, and skill scores
    members = (
        supabase.table("members").select("*").eq("project_id", project_id).execute().data
    )
    questions = (
        supabase.table("quiz_questions").select("*").eq("project_id", project_id).execute().data
    )

    all_tasks = (
        supabase.table("tasks")
        .select("member_id")
        .eq("project_id", project_id)
        .execute()
        .data
    )
    task_counts: dict[str, int] = defaultdict(int)
    for t in all_tasks:
        if t.get("member_id"):
            task_counts[t["member_id"]] += 1

    # Score remaining members (exclude from_member_id)
    candidates = [m for m in members if m["id"] != body.from_member_id]
    if not candidates:
        raise HTTPException(status_code=400, detail="No other members available for rebalance")

    scored = []
    for m in candidates:
        skill_scores = _member_skill_scores(m["id"], questions)
        score = _score_member_for_criterion(skill_scores, criterion, task_counts[m["id"]])
        scored.append((m, score))

    scored.sort(key=lambda x: x[1], reverse=True)

    from_member_res = supabase.table("members").select("id, name").eq("id", body.from_member_id).single().execute()
    from_member = from_member_res.data or {"id": body.from_member_id, "name": "Unknown"}

    weight = criterion.get("weight_percent", 0)
    suggested = criterion.get("suggested_tasks") or [task["title"]]
    project_res = supabase.table("projects").select("due_date").eq("id", project_id).single().execute()
    due_date_str = (project_res.data or {}).get("due_date")
    stage = criterion.get("task_stage", "mid")

    buffer = {"early": 21, "mid": 14, "late": 7}
    estimated: str | None = None
    if due_date_str:
        try:
            base = datetime.strptime(due_date_str[:10], "%Y-%m-%d").date()
            estimated = (base - timedelta(days=buffer.get(stage, 14))).isoformat()
        except ValueError:
            pass

    if weight > 20 and len(scored) >= 2:
        top1, top2 = scored[0][0], scored[1][0]
        proposed = [
            {
                "member_id": top1["id"],
                "member_name": top1["name"],
                "section": f"{suggested[0]} — Sections 1–2",
                "estimated_completion_date": estimated,
            },
            {
                "member_id": top2["id"],
                "member_name": top2["name"],
                "section": suggested[1] if len(suggested) > 1 else f"{suggested[0]} — Final review",
                "estimated_completion_date": estimated,
            },
        ]
        rubric_impact = (
            f"High-weight criterion ({weight}%) split across two members to reduce risk."
        )
    else:
        top = scored[0][0]
        proposed = [
            {
                "member_id": top["id"],
                "member_name": top["name"],
                "section": task["title"],
                "estimated_completion_date": estimated,
            }
        ]
        rubric_impact = (
            f"Task reassigned to best-fit member. "
            f"Criterion '{criterion.get('name', '')}' coverage maintained."
        )

    return {
        "task_id": body.task_id,
        "original_member": {"id": from_member["id"], "name": from_member["name"]},
        "proposed": proposed,
        "rubric_impact": rubric_impact,
    }


# ── POST /projects/{project_id}/rebalance/confirm ────────────────────────────

class RebalanceConfirmPayload(BaseModel):
    task_id: str
    original_member: dict[str, Any]
    proposed: list[dict[str, Any]]
    rubric_impact: str


@router.post("/projects/{project_id}/rebalance/confirm")
def confirm_rebalance(project_id: str, payload: RebalanceConfirmPayload):
    task_res = supabase.table("tasks").select("*").eq("id", payload.task_id).single().execute()
    if not task_res.data:
        raise HTTPException(status_code=404, detail="Task not found")
    task = task_res.data

    if not payload.proposed:
        raise HTTPException(status_code=400, detail="No proposed assignments provided")

    primary = payload.proposed[0]

    # Reassign original task to primary member
    supabase.table("tasks").update(
        {"member_id": primary["member_id"]}
    ).eq("id", payload.task_id).execute()

    # If split, insert second task for secondary member
    if len(payload.proposed) >= 2:
        secondary = payload.proposed[1]
        supabase.table("tasks").insert({
            "project_id": project_id,
            "member_id": secondary["member_id"],
            "rubric_criterion_id": task.get("rubric_criterion_id"),
            "title": secondary["section"],
            "status": "todo",
            "due_date": secondary.get("estimated_completion_date"),
            "progress_percent": 0,
        }).execute()

    # Update rubric criterion coverage status
    if task.get("rubric_criterion_id"):
        supabase.table("rubric_criteria").update(
            {"coverage_status": "in_progress"}
        ).eq("id", task["rubric_criterion_id"]).execute()

    # Dismiss all related undismissed alerts for original task
    supabase.table("risk_alerts").update(
        {"dismissed": True}
    ).eq("task_id", payload.task_id).eq("dismissed", False).execute()

    return {"success": True}
