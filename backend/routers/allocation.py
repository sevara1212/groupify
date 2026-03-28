import json
import os
from datetime import date, timedelta, datetime
from collections import defaultdict

import anthropic
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Any

from db import supabase

router = APIRouter()


# ── Stage → buffer mapping (days before final due date) ──────────────────────

STAGE_BUFFER_DAYS = {"early": 21, "mid": 14, "late": 7}


# ── Helpers ──────────────────────────────────────────────────────────────────

def _build_skill_profile(member: dict, answers: list, questions: list) -> dict:
    """Build a skill profile for one member from their quiz answers."""
    q_by_id = {q["id"]: q for q in questions}
    member_answers = [a for a in answers if a["member_id"] == member["id"]]

    skill_scores: dict[str, float] = {}
    preferred_roles: list[str] = []
    availability_slots: list[str] = []
    task_preference: str = "mid"

    for ans in member_answers:
        q = q_by_id.get(ans.get("question_id") or ans.get("quiz_question_id"))
        if not q:
            continue
        qtype = q.get("question_type", "")
        value = ans.get("answer", {})

        if qtype == "confidence_sliders" and isinstance(value, dict):
            for skill_tag, score in value.items():
                try:
                    skill_scores[skill_tag] = float(score)
                except (TypeError, ValueError):
                    pass

        elif qtype == "multi_select_roles" and isinstance(value, list):
            preferred_roles = value

        elif qtype == "availability_grid" and isinstance(value, dict):
            availability_slots = [slot for slot, avail in value.items() if avail]

        elif qtype == "preference_ranking" and isinstance(value, list):
            if value and value[0] in ("early", "mid", "late"):
                task_preference = value[0]

    return {
        "member_id": member["id"],
        "name": member.get("name", "Unknown"),
        "skill_scores": skill_scores,
        "preferred_roles": preferred_roles,
        "availability_slots": availability_slots,
        "task_preference": task_preference,
    }


def _score(profile: dict, criterion: dict, tasks_assigned: int,
           total_members: int, total_criteria: int) -> float:
    """Score a member's fit for a criterion.

    Factors:
    1. Skill match — sum of relevant skill scores (0-10 each)
    2. Stage preference bonus — +15 if member prefers this stage
    3. Workload fairness penalty — heavier penalty when exceeding fair share
    4. Role preference bonus — +8 if preferred role overlaps required skills
    """
    required = criterion.get("required_skills") or []

    # 1. Skill match
    skill_match = sum(profile["skill_scores"].get(s, 5.0) for s in required) if required else 5.0

    # 2. Stage preference
    stage_bonus = 15 if profile["task_preference"] == criterion.get("task_stage") else 0

    # 3. Workload fairness — fair share = ceil(criteria / members)
    fair_share = max(1, -(-total_criteria // total_members))  # ceiling division
    if tasks_assigned >= fair_share + 1:
        workload_penalty = 25 * (tasks_assigned - fair_share)  # heavy penalty
    elif tasks_assigned >= fair_share:
        workload_penalty = 12
    else:
        workload_penalty = 5 * tasks_assigned

    # 4. Role preference bonus
    role_bonus = 0
    for role in profile.get("preferred_roles", []):
        role_lower = role.lower().replace(" ", "_")
        if role_lower in required:
            role_bonus = 8
            break

    return skill_match + stage_bonus + role_bonus - workload_penalty


def _availability_summary(slots: list[str]) -> str:
    if not slots:
        return "Availability not provided"

    day_order = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
    period_order = ["morning", "afternoon", "evening"]

    by_period: dict[str, list[str]] = defaultdict(list)
    for slot in slots:
        parts = slot.rsplit("_", 1)
        if len(parts) == 2:
            day_part, period = parts
            by_period[period].append(day_part)

    summaries = []
    for period in period_order:
        days = by_period.get(period, [])
        if not days:
            continue
        days_sorted = sorted(days, key=lambda d: day_order.index(d) if d in day_order else 99)
        day_labels = [d.capitalize() for d in days_sorted]
        if len(day_labels) >= 5:
            summaries.append(f"Most {period}s")
        elif len(day_labels) >= 2:
            summaries.append(f"{day_labels[0]}–{day_labels[-1]} {period}s")
        else:
            summaries.append(f"{day_labels[0]} {period}")

    return "Available " + ", ".join(summaries) if summaries else "Flexible availability"


def _initial_rationale(profile: dict, criterion: dict, score: float) -> str:
    required = criterion.get("required_skills") or []
    if required:
        top_skill = max(required, key=lambda s: profile["skill_scores"].get(s, 5))
        top_score = profile["skill_scores"].get(top_skill, 5)
        skill_part = f"{profile['name']} scored {top_score}/10 in {top_skill.replace('_', ' ')}."
    else:
        skill_part = f"{profile['name']} has a balanced skill set."

    stage = criterion.get("task_stage", "mid")
    pref = profile["task_preference"]
    return (
        f"{skill_part} "
        f"Prefers {pref} stage. "
        f"Assigned to {stage}-phase task."
    )


def _polish_rationales(raw: list[str]) -> list[str]:
    if not raw:
        return []
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        return raw

    client = anthropic.Anthropic(api_key=api_key)
    prompt = (
        "Rewrite each rationale below as one friendly sentence under 20 words. "
        "Use the person's name and actual scores. Keep it encouraging. "
        "Return ONLY a JSON array of strings in the same order as input.\n\n"
        f"Input rationales:\n{json.dumps(raw)}"
    )
    try:
        msg = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1024,
            system="You rewrite assignment rationales. Return only valid JSON arrays of strings.",
            messages=[{"role": "user", "content": prompt}],
        )
        text = msg.content[0].text.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[-1].rsplit("```", 1)[0].strip()
        return json.loads(text)
    except Exception:
        return raw


def _compute_deadline(project_due: str | None, stage: str, criterion_index: int,
                      total_criteria: int, stage_counts: dict[str, int],
                      stage_current: dict[str, int]) -> str | None:
    """Compute a smart deadline for a task.

    Strategy:
    - Divide the time before final due date into 3 phases: early (first 40%), mid (next 35%), late (last 25%)
    - Within each phase, spread tasks evenly
    - This gives each task a unique, staggered deadline
    """
    if not project_due:
        return None
    try:
        due = datetime.strptime(project_due[:10], "%Y-%m-%d").date()
    except ValueError:
        return None

    today = date.today()
    total_days = max((due - today).days, 7)  # at least 7 days

    # Phase boundaries
    phase_ranges = {
        "early": (0.05, 0.40),   # 5% to 40% of timeline
        "mid":   (0.40, 0.75),   # 40% to 75% of timeline
        "late":  (0.75, 0.95),   # 75% to 95% of timeline
    }

    start_pct, end_pct = phase_ranges.get(stage, (0.30, 0.70))
    phase_start_day = int(total_days * start_pct)
    phase_end_day = int(total_days * end_pct)

    # Spread tasks within this phase
    count_in_phase = max(stage_counts.get(stage, 1), 1)
    current_idx = stage_current.get(stage, 0)
    if count_in_phase == 1:
        offset = (phase_start_day + phase_end_day) // 2
    else:
        step = max(1, (phase_end_day - phase_start_day) // count_in_phase)
        offset = phase_start_day + step * current_idx + step // 2

    task_due = today + timedelta(days=min(offset, total_days - 1))
    return task_due.isoformat()


def _skill_summary(profile: dict, required: list[str]) -> str:
    if not required:
        return "Balanced skill set"
    pairs = [
        f"{s.replace('_', ' ').title()} {profile['skill_scores'].get(s, 5)}/10"
        for s in required[:2]
    ]
    return "Top skills: " + ", ".join(pairs)


# ── Main allocation logic ─────────────────────────────────────────────────────

def _run_allocation(project: dict, members: list, criteria: list,
                    questions: list, answers: list) -> dict:
    profiles = [_build_skill_profile(m, answers, questions) for m in members]
    profile_by_id = {p["member_id"]: p for p in profiles}
    total_members = len(profiles)
    total_criteria = len(criteria)

    # Sort criteria by weight descending (greedy)
    sorted_criteria = sorted(criteria, key=lambda c: c.get("weight_percent", 0), reverse=True)

    # Pre-count how many criteria per stage for deadline spreading
    stage_counts: dict[str, int] = defaultdict(int)
    for c in sorted_criteria:
        stage_counts[c.get("task_stage", "mid")] += 1
    stage_current: dict[str, int] = defaultdict(int)

    tasks_assigned: dict[str, int] = defaultdict(int)   # member_id -> count
    member_tasks: dict[str, list] = defaultdict(list)    # member_id -> task list
    raw_rationales: list[str] = []
    assignment_meta: list[dict] = []

    for idx, criterion in enumerate(sorted_criteria):
        required = criterion.get("required_skills") or []
        stage = criterion.get("task_stage", "mid")
        suggested = criterion.get("suggested_tasks") or []
        task_title = suggested[0] if suggested else criterion.get("name", "Task")

        # Score every member with fairness weighting
        scored = [
            (p, _score(p, criterion, tasks_assigned[p["member_id"]],
                       total_members, total_criteria))
            for p in profiles
        ]
        scored.sort(key=lambda x: x[1], reverse=True)

        # Pick best member — prefer those under fair share
        fair_share = max(1, -(-total_criteria // total_members))
        chosen = None

        # First pass: pick highest scorer still under fair share
        for p, _ in scored:
            if tasks_assigned[p["member_id"]] < fair_share:
                chosen = p
                break

        # Second pass: allow up to fair_share + 1
        if not chosen:
            for p, _ in scored:
                if tasks_assigned[p["member_id"]] < fair_share + 1:
                    chosen = p
                    break

        # Fallback: lowest workload member
        if not chosen:
            chosen = min(profiles, key=lambda p: tasks_assigned[p["member_id"]])

        final_score = _score(chosen, criterion, tasks_assigned[chosen["member_id"]],
                             total_members, total_criteria)
        raw_rat = _initial_rationale(chosen, criterion, final_score)
        raw_rationales.append(raw_rat)

        # Compute a smart deadline
        deadline = _compute_deadline(
            project.get("due_date"), stage, idx, total_criteria,
            stage_counts, stage_current
        )
        stage_current[stage] += 1

        assignment_meta.append({
            "member_id": chosen["member_id"],
            "criterion": criterion,
            "task_title": task_title,
            "score": round(final_score, 2),
            "deadline": deadline,
        })

        tasks_assigned[chosen["member_id"]] += 1

    # Polish all rationales in one Claude call
    polished = _polish_rationales(raw_rationales)

    # Build per-member output
    for i, meta in enumerate(assignment_meta):
        mid = meta["member_id"]
        criterion = meta["criterion"]
        profile = profile_by_id[mid]

        member_tasks[mid].append({
            "criterion_id": criterion["id"],
            "criterion_name": criterion.get("name", ""),
            "title": meta["task_title"],
            "suggested_due_date": meta["deadline"],
            "rationale": polished[i] if i < len(polished) else raw_rationales[i],
            "skill_match_score": meta["score"],
            "stage": criterion.get("task_stage", "mid"),
            "weight_percent": criterion.get("weight_percent", 0),
        })

    allocations = []
    for profile in profiles:
        mid = profile["member_id"]
        my_tasks = member_tasks.get(mid, [])
        role = profile["preferred_roles"][0].replace("_", " ").title() if profile["preferred_roles"] else "Contributor"
        all_required = []
        for t in my_tasks:
            crit = next((c for c in criteria if c["id"] == t["criterion_id"]), {})
            all_required.extend(crit.get("required_skills") or [])
        skill_sum = _skill_summary(profile, list(dict.fromkeys(all_required)))

        total_weight = sum(t.get("weight_percent", 0) for t in my_tasks)

        allocations.append({
            "member_id": mid,
            "member_name": profile["name"],
            "role": role,
            "skill_summary": skill_sum,
            "availability_summary": _availability_summary(profile["availability_slots"]),
            "total_weight_percent": total_weight,
            "tasks": my_tasks,
        })

    # Fairness metrics
    weights = [a["total_weight_percent"] for a in allocations]
    task_counts = [len(a["tasks"]) for a in allocations]
    fairness = {
        "task_count_range": f"{min(task_counts)}–{max(task_counts)}" if task_counts else "0",
        "weight_range": f"{min(weights)}%–{max(weights)}%" if weights else "0%",
        "is_balanced": (max(task_counts) - min(task_counts) <= 1) if task_counts else True,
    }

    coverage = f"All {len(sorted_criteria)} criteria covered across {len(profiles)} members"
    return {
        "allocations": allocations,
        "coverage_summary": coverage,
        "fairness": fairness,
    }


# ── Routes ────────────────────────────────────────────────────────────────────

@router.post("/projects/{project_id}/allocate")
def allocate(project_id: str):
    try:
        project_res = supabase.table("projects").select("*").eq("id", project_id).single().execute()
    except Exception:
        raise HTTPException(status_code=404, detail="Project not found")
    if not project_res.data:
        raise HTTPException(status_code=404, detail="Project not found")

    members = supabase.table("members").select("*").eq("project_id", project_id).execute().data
    criteria = supabase.table("rubric_criteria").select("*").eq("project_id", project_id).execute().data
    questions = supabase.table("quiz_questions").select("*").eq("project_id", project_id).execute().data

    if not criteria:
        raise HTTPException(status_code=400, detail="No rubric criteria found — upload rubric first")
    if not members:
        raise HTTPException(status_code=400, detail="No members found for this project")

    member_ids = [m["id"] for m in members]
    answers = (
        supabase.table("quiz_answers")
        .select("*")
        .in_("member_id", member_ids)
        .execute()
        .data
    )

    result = _run_allocation(project_res.data, members, criteria, questions, answers)
    return result


class ConfirmPayload(BaseModel):
    allocations: list[dict[str, Any]]


@router.post("/projects/{project_id}/allocate/confirm")
def confirm_allocation(project_id: str, payload: ConfirmPayload):
    # Delete existing tasks for this project (fresh allocation)
    supabase.table("tasks").delete().eq("project_id", project_id).execute()

    tasks_to_insert = []

    for member_alloc in payload.allocations:
        mid = member_alloc["member_id"]
        for task in member_alloc.get("tasks", []):
            tasks_to_insert.append({
                "project_id": project_id,
                "member_id": mid,
                "rubric_criterion_id": task.get("criterion_id"),
                "title": task["title"],
                "status": "todo",
                "due_date": task.get("suggested_due_date"),
                "progress_percent": 0,
            })
            # Mark criterion as in_progress
            if task.get("criterion_id"):
                supabase.table("rubric_criteria").update(
                    {"coverage_status": "in_progress"}
                ).eq("id", task["criterion_id"]).execute()

    if tasks_to_insert:
        supabase.table("tasks").insert(tasks_to_insert).execute()

    return {"success": True, "tasks_created": len(tasks_to_insert)}


# ── Task CRUD endpoints ──────────────────────────────────────────────────────

@router.get("/projects/{project_id}/tasks")
def list_tasks(project_id: str):
    """Get all tasks for a project, with member names."""
    tasks_raw = (
        supabase.table("tasks")
        .select("*")
        .eq("project_id", project_id)
        .order("due_date")
        .execute()
        .data
    )

    # Join member names
    members = supabase.table("members").select("id, name").eq("project_id", project_id).execute().data
    member_by_id = {m["id"]: m["name"] for m in members}

    # Join criterion names
    criteria = supabase.table("rubric_criteria").select("id, name").eq("project_id", project_id).execute().data
    crit_by_id = {c["id"]: c["name"] for c in criteria}

    tasks = []
    for t in tasks_raw:
        t["member_name"] = member_by_id.get(t.get("member_id"))
        t["criterion_name"] = crit_by_id.get(t.get("rubric_criterion_id"))
        tasks.append(t)

    return {"tasks": tasks}


class TaskUpdate(BaseModel):
    status: str | None = None
    progress_percent: int | None = None
    due_date: str | None = None
    title: str | None = None


@router.patch("/projects/{project_id}/tasks/{task_id}")
def update_task(project_id: str, task_id: str, payload: TaskUpdate):
    """Update a task's status, progress, deadline, or title."""
    update_data = {}
    if payload.status is not None:
        update_data["status"] = payload.status
    if payload.progress_percent is not None:
        update_data["progress_percent"] = payload.progress_percent
        # Auto-set status based on progress
        if payload.progress_percent >= 100:
            update_data["status"] = "done"
        elif payload.progress_percent > 0 and payload.status is None:
            update_data["status"] = "in_progress"
    if payload.due_date is not None:
        update_data["due_date"] = payload.due_date
    if payload.title is not None:
        update_data["title"] = payload.title

    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    result = (
        supabase.table("tasks")
        .update(update_data)
        .eq("id", task_id)
        .eq("project_id", project_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Task not found")

    # If task is done, check if all tasks for that criterion are done → mark criterion as covered
    task = result.data[0]
    if task.get("rubric_criterion_id") and update_data.get("status") == "done":
        sibling_tasks = (
            supabase.table("tasks")
            .select("status")
            .eq("rubric_criterion_id", task["rubric_criterion_id"])
            .execute()
            .data
        )
        if all(t["status"] == "done" for t in sibling_tasks):
            supabase.table("rubric_criteria").update(
                {"coverage_status": "covered"}
            ).eq("id", task["rubric_criterion_id"]).execute()

    return result.data[0]


# ── Rubric endpoints ─────────────────────────────────────────────────────────

@router.get("/projects/{project_id}/rubric")
def get_rubric(project_id: str):
    """Get rubric criteria for a project."""
    result = (
        supabase.table("rubric_criteria")
        .select("*")
        .eq("project_id", project_id)
        .order("weight_percent", desc=True)
        .execute()
    )
    return {"criteria": result.data}
