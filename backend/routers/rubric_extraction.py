import json
import os
import io

import anthropic
from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi import Form
from typing import Optional

from db import supabase

router = APIRouter()


def _pdf_to_text(data: bytes) -> str:
    try:
        from pypdf import PdfReader
        reader = PdfReader(io.BytesIO(data))
        return "\n".join(page.extract_text() or "" for page in reader.pages)
    except Exception:
        return data.decode("utf-8", errors="replace")


def _read_file(data: bytes, filename: str) -> str:
    if filename.lower().endswith(".pdf"):
        return _pdf_to_text(data)
    return data.decode("utf-8", errors="replace")


def fallback_criteria_dicts(brief_text: str) -> list:
    """When there is no rubric file, derive workable criteria from the brief so quiz & allocation can run."""
    excerpt = brief_text.strip()
    if len(excerpt) > 500:
        excerpt = excerpt[:500] + "…"
    if not excerpt:
        excerpt = "the group assignment"
    return [
        {
            "name": "Research & sources",
            "weight_percent": 25,
            "description": f"Find and use relevant information. Context: {excerpt}",
            "required_skills": ["research", "academic_writing"],
            "task_stage": "early",
            "suggested_tasks": ["Compile a source list", "Summarise key readings for the team"],
        },
        {
            "name": "Analysis & core deliverables",
            "weight_percent": 35,
            "description": "Develop the main analysis or product the brief requires.",
            "required_skills": ["data_analysis", "academic_writing"],
            "task_stage": "mid",
            "suggested_tasks": ["Draft the main analytical section", "Build supporting visuals or data"],
        },
        {
            "name": "Design & communication",
            "weight_percent": 20,
            "description": "Polish structure, visuals, and clarity of outputs.",
            "required_skills": ["design", "presenting"],
            "task_stage": "late",
            "suggested_tasks": ["Refine layout and visuals", "Prepare speaking notes"],
        },
        {
            "name": "Team coordination",
            "weight_percent": 20,
            "description": "Integrate work and keep the group on schedule.",
            "required_skills": ["project_management", "presenting"],
            "task_stage": "mid",
            "suggested_tasks": ["Track milestones", "Merge sections into one submission"],
        },
    ]


def replace_rubric_criteria(project_id: str, criteria_list: list) -> list:
    supabase.table("rubric_criteria").delete().eq("project_id", project_id).execute()
    inserted = []
    for criterion in criteria_list:
        row = {**criterion, "project_id": project_id}
        if "required_skills" not in row:
            row["required_skills"] = []
        result = supabase.table("rubric_criteria").insert(row).execute()
        inserted.extend(result.data or [])
    return inserted


def ensure_rubric_criteria_for_quiz(project_id: str) -> list:
    """Load rubric rows for a project; if none exist but a brief was saved, insert fallback criteria."""
    result = (
        supabase.table("rubric_criteria")
        .select("*")
        .eq("project_id", project_id)
        .execute()
    )
    criteria = result.data or []
    if criteria:
        return criteria

    proj = (
        supabase.table("projects")
        .select("assignment_brief_text")
        .eq("id", project_id)
        .single()
        .execute()
    )
    brief = (proj.data or {}).get("assignment_brief_text") or ""
    if not brief.strip():
        raise HTTPException(
            status_code=400,
            detail="Upload the assignment brief first before generating the quiz",
        )
    return replace_rubric_criteria(project_id, fallback_criteria_dicts(brief))


def extract_criteria(project_id: str, rubric_text: str, brief_text: str) -> list:
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="ANTHROPIC_API_KEY not configured on server")

    client = anthropic.Anthropic(api_key=api_key)

    rubric_section = (rubric_text or "").strip() or "(none provided — infer criteria only from the brief below)"

    prompt = f"""Analyse this university assignment material.

Assignment Brief:
{brief_text}

Marking Rubric:
{rubric_section}

If a marking rubric is provided above, extract ALL criteria from it (use the brief for context).
If no rubric is provided or it is empty, infer 4–6 realistic marking criteria **only from the Assignment Brief**
(typical areas: research, analysis, writing, design, coding, presentation, project management).

Extract ALL marking criteria. Return a JSON array where each object has exactly these fields:
- name: string (criterion name)
- weight_percent: integer (marks percentage)
- description: string (what is assessed)
- required_skills: array of strings, only use values from:
  ["academic_writing", "research", "data_analysis", "design", "presenting", "coding", "project_management"]
- task_stage: string, one of: "early", "mid", "late"
- suggested_tasks: array of 2 specific actionable task strings a student would actually do

Return ONLY the JSON array. No explanation. No markdown."""

    try:
        message = client.messages.create(
            model="claude-opus-4-20250514",
            max_tokens=2048,
            system="You are a precise academic rubric analyser. Return only valid JSON arrays.",
            messages=[{"role": "user", "content": prompt}],
        )
    except anthropic.APIError as e:
        raise HTTPException(status_code=502, detail=f"Anthropic API error: {e}")

    raw = message.content[0].text.strip()
    # Strip markdown fences if Claude wraps the JSON
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[-1].rsplit("```", 1)[0].strip()

    try:
        criteria_list = json.loads(raw)
    except json.JSONDecodeError:
        if brief_text.strip():
            return replace_rubric_criteria(project_id, fallback_criteria_dicts(brief_text))
        raise HTTPException(status_code=502, detail="AI returned invalid JSON. Please try again.")

    if not criteria_list and brief_text.strip():
        criteria_list = fallback_criteria_dicts(brief_text)
    elif not criteria_list:
        raise HTTPException(
            status_code=400,
            detail="Add an assignment brief or rubric so we can extract criteria.",
        )

    return replace_rubric_criteria(project_id, criteria_list)


@router.post("/projects/{project_id}/upload")
async def upload_files(
    project_id: str,
    assignment_brief: Optional[UploadFile] = File(None),
    marking_rubric: Optional[UploadFile] = File(None),
):
    brief_text = ""
    rubric_text = ""

    if assignment_brief:
        data = await assignment_brief.read()
        brief_text = _read_file(data, assignment_brief.filename or "")

    if marking_rubric:
        data = await marking_rubric.read()
        rubric_text = _read_file(data, marking_rubric.filename or "")

    # Persist raw texts
    supabase.table("projects").update(
        {
            "assignment_brief_text": brief_text or None,
            "rubric_raw_text": rubric_text or None,
        }
    ).eq("id", project_id).execute()

    criteria = extract_criteria(project_id, rubric_text, brief_text)

    return {"criteria": criteria, "questions_generated": True}
