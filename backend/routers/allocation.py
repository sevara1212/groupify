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
            # Last preference_ranking question is task_stage preference
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


def _score(profile: dict, criterion: dict, tasks_assigned: int) -> float:
    required = criterion.get("required_skills") or []
    base = sum(profile["skill_scores"].get(s, 5.0) for s in required)
    stage_bonus = 15 if profile["task_preference"] == criterion.get("task_stage") else 0
    workload_penalty = 10 * tasks_assigned
    return base + stage_bonus - workload_penalty


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
    client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))
    prompt = (
        "Rewrite each rationale below as one friendly sentence under 20 words. "
        "Use the person's name and actual scores. Keep it encouraging. "
        "Return ONLY a JSON array of strings in the same order as input.\n\n"
        f"Input rationales:\n{json.dumps(raw)}"
    )
    msg = client.messages.create(
        model="claude-opus-4-20250514",
        max_tokens=1024,
        system="You rewrite assignment rationales. Return only valid JSON arrays of strings.",
        messages=[{"role": "user", "content": prompt}],
    )
    try:
        return json.loads(msg.content[0].text.strip())
    except Exception:
        return raw


def _suggested_due(project_due: str | None, stage: str) -> str | None:
    if not project_due:
        return None
    try:
        due = datetime.strptime(project_due, "%Y-%m-%d").date()
        delta = STAGE_BUFFER_DAYS.get(stage, 14)
        return (due - timedelta(days=delta)).isoformat()
    except ValueError:
        return None


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

    # Sort criteria by weight descending (greedy)
    sorted_criteria = sorted(criteria, key=lambda c: c.get("weight_percent", 0), reverse=True)

    tasks_assigned: dict[str, int] = defaultdict(int)   # member_id -> count
    member_tasks: dict[str, list] = defaultdict(list)    # member_id -> task list
    raw_rationales: list[str] = []
    assignment_meta: list[dict] = []  # tracks order for rationale polishing

    for criterion in sorted_criteria:
        required = criterion.get("required_skills") or []
        stage = criterion.get("task_stage", "mid")
        suggested = criterion.get("suggested_tasks") or []
        task_title = suggested[0] if suggested else criterion.get("name", "Task")

        # Score every member
        scored = [
            (p, _score(p, criterion, tasks_assigned[p["member_id"]]))
            for p in profiles
        ]
        scored.sort(key=lambda x: x[1], reverse=True)

        # Pick best member with < 2 tasks; fallback to lowest workload
        chosen = None
        for p, _ in scored:
            if tasks_assigned[p["member_id"]] < 2:
                chosen = p
                break
        if not chosen:
            chosen = min(profiles, key=lambda p: tasks_assigned[p["member_id"]])

        final_score = _score(chosen, criterion, tasks_assigned[chosen["member_id"]])
        raw_rat = _initial_rationale(chosen, criterion, final_score)
        raw_rationales.append(raw_rat)

        assignment_meta.append({
            "member_id": chosen["member_id"],
            "criterion": criterion,
            "task_title": task_title,
            "score": round(final_score, 2),
        })

        tasks_assigned[chosen["member_id"]] += 1

    # Polish all rationales in one Claude call
    polished = _polish_rationales(raw_rationales)

    # Build per-member output
    for i, meta in enumerate(assignment_meta):
        mid = meta["member_id"]
        criterion = meta["criterion"]
        profile = profile_by_id[mid]
        due = _suggested_due(project.get("due_date"), criterion.get("task_stage", "mid"))

        member_tasks[mid].append({
            "criterion_id": criterion["id"],
            "criterion_name": criterion.get("name", ""),
            "title": meta["task_title"],
            "suggested_due_date": due,
            "rationale": polished[i] if i < len(polished) else raw_rationales[i],
            "skill_match_score": meta["score"],
        })

    allocations = []
    for profile in profiles:
        mid = profile["member_id"]
        my_tasks = member_tasks.get(mid, [])
        # Determine dominant role from preferred_roles or top skill
        role = profile["preferred_roles"][0].replace("_", " ").title() if profile["preferred_roles"] else "Contributor"
        # Skill summary from criteria tasks
        all_required = []
        for t in my_tasks:
            crit = next((c for c in criteria if c["id"] == t["criterion_id"]), {})
            all_required.extend(crit.get("required_skills") or [])
        skill_sum = _skill_summary(profile, list(dict.fromkeys(all_required)))

        allocations.append({
            "member_id": mid,
            "member_name": profile["name"],
            "role": role,
            "skill_summary": skill_sum,
            "availability_summary": _availability_summary(profile["availability_slots"]),
            "tasks": my_tasks,
        })

    coverage = f"All {len(sorted_criteria)} criteria covered across {len(profiles)} members"
    return {"allocations": allocations, "coverage_summary": coverage}


# ── Routes ────────────────────────────────────────────────────────────────────

@router.post("/projects/{project_id}/allocate")
def allocate(project_id: str):
    project_res = supabase.table("projects").select("*").eq("id", project_id).single().execute()
    if not project_res.data:
        raise HTTPException(status_code=404, detail="Project not found")

    members = supabase.table("members").select("*").eq("project_id", project_id).execute().data
    criteria = supabase.table("rubric_criteria").select("*").eq("project_id", project_id).execute().data
    questions = supabase.table("quiz_questions").select("*").eq("project_id", project_id).execute().data

    if not criteria:
        raise HTTPException(status_code=400, detail="No rubric criteria found — upload rubric first")
    if not members:
        raise HTTPException(status_code=400, detail="No members found for this project")

    # Answers joined with questions via question_id
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
    tasks_to_insert = []

    for member_alloc in payload.allocations:
        mid = member_alloc["member_id"]
        for task in member_alloc.get("tasks", []):
            tasks_to_insert.append({
                "project_id": project_id,
                "member_id": mid,
                "rubric_criterion_id": task["criterion_id"],
                "title": task["title"],
                "status": "todo",
                "due_date": task.get("suggested_due_date"),
                "progress_percent": 0,
            })
            # Mark criterion as in_progress
            supabase.table("rubric_criteria").update(
                {"coverage_status": "in_progress"}
            ).eq("id", task["criterion_id"]).execute()

    if tasks_to_insert:
        supabase.table("tasks").insert(tasks_to_insert).execute()

    return {"success": True, "tasks_created": len(tasks_to_insert)}
