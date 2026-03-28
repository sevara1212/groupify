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


def extract_criteria(project_id: str, rubric_text: str, brief_text: str) -> list:
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="ANTHROPIC_API_KEY not configured on server")

    client = anthropic.Anthropic(api_key=api_key)

    prompt = f"""Analyse this university assignment rubric and brief.

Assignment Brief:
{brief_text}

Marking Rubric:
{rubric_text}

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
        raise HTTPException(status_code=502, detail="AI returned invalid JSON. Please try again.")

    # Delete existing criteria for this project before inserting fresh ones
    supabase.table("rubric_criteria").delete().eq("project_id", project_id).execute()

    inserted = []
    for criterion in criteria_list:
        criterion["project_id"] = project_id
        result = supabase.table("rubric_criteria").insert(criterion).execute()
        inserted.extend(result.data)

    return inserted


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
