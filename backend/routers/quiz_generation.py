import json
import os

import anthropic
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Any

from db import supabase

router = APIRouter()


class AnswerPayload(BaseModel):
    answers: list[dict[str, Any]]


def generate_questions(project_id: str, criteria: list, unique_skills: list) -> list:
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="ANTHROPIC_API_KEY not configured on server")

    client = anthropic.Anthropic(api_key=api_key)

    criteria_json = json.dumps(criteria, indent=2)
    unique_skills_list = ", ".join(unique_skills)

    prompt = f"""Generate exactly 5 quiz questions for a university group assignment quiz.

The rubric has these criteria:
{criteria_json}

Unique skills needed: {unique_skills_list}

Rules:
- Question 1: type "multi_select_roles" — ask which group role fits them best. Options must reflect the actual skills in this rubric.
- Question 2: type "confidence_sliders" — rate confidence in each skill. Options must be exactly the unique skills from this rubric, with friendly labels.
- Question 3: type "preference_ranking" — working style relevant to this specific assignment type.
- Question 4: type "availability_grid" — when are you free. options: null
- Question 5: type "preference_ranking" — task stage preference (early setup, mid analysis, late polish) framed around this assignment's actual tasks.

Each question object:
{{
  "question_number": int,
  "question_text": string (friendly, conversational),
  "question_type": string,
  "skill_dimension": string,
  "options": array of {{ "label": string, "skill_tag": string }}
             or null for availability_grid
}}

Return ONLY the JSON array of 5 questions."""

    try:
        message = client.messages.create(
            model="claude-opus-4-20250514",
            max_tokens=2048,
            system="You generate structured quiz questions for student group work allocation. Return only valid JSON.",
            messages=[{"role": "user", "content": prompt}],
        )
    except anthropic.APIError as e:
        raise HTTPException(status_code=502, detail=f"Anthropic API error: {e}")

    raw = message.content[0].text.strip()
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[-1].rsplit("```", 1)[0].strip()

    try:
        questions = json.loads(raw)
    except json.JSONDecodeError:
        raise HTTPException(status_code=502, detail="AI returned invalid JSON. Please try again.")

    # Replace existing questions for this project
    supabase.table("quiz_questions").delete().eq("project_id", project_id).execute()

    inserted = []
    for q in questions:
        q["project_id"] = project_id
        result = supabase.table("quiz_questions").insert(q).execute()
        inserted.extend(result.data)

    return inserted


@router.post("/projects/{project_id}/quiz/generate")
def generate_quiz(project_id: str):
    result = (
        supabase.table("rubric_criteria")
        .select("*")
        .eq("project_id", project_id)
        .execute()
    )
    criteria = result.data

    if not criteria:
        raise HTTPException(
            status_code=400,
            detail="Upload rubric first before generating quiz",
        )

    # Collect unique skills across all criteria
    skills_seen: set[str] = set()
    for c in criteria:
        for skill in c.get("required_skills", []):
            skills_seen.add(skill)
    unique_skills = sorted(skills_seen)

    questions = generate_questions(project_id, criteria, unique_skills)
    return {"questions": questions}


@router.get("/projects/{project_id}/quiz/questions")
def get_questions(project_id: str):
    result = (
        supabase.table("quiz_questions")
        .select("*")
        .eq("project_id", project_id)
        .order("question_number")
        .execute()
    )
    return {"questions": result.data}


@router.post("/projects/{project_id}/quiz/answers/{member_id}")
def submit_answers(project_id: str, member_id: str, payload: AnswerPayload):
    # Clear previous answers for this member + project
    supabase.table("quiz_answers").delete().eq("member_id", member_id).eq(
        "project_id", project_id
    ).execute()

    rows = [
        {
            "project_id": project_id,
            "member_id": member_id,
            "question_id": a["question_id"],
            "answer": a["answer"],
        }
        for a in payload.answers
    ]

    if rows:
        supabase.table("quiz_answers").insert(rows).execute()

    # Mark member as quiz done
    supabase.table("members").update({"quiz_done": True}).eq("id", member_id).execute()

    return {"success": True}
