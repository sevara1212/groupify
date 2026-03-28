from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List

from db import supabase

router = APIRouter()


# ── Project endpoints ─────────────────────────────────────────────────────────

class ProjectCreate(BaseModel):
    name: str
    course_name: Optional[str] = None
    assignment_title: Optional[str] = None
    due_date: Optional[str] = None
    group_size: Optional[int] = 4
    ai_enabled: Optional[bool] = True


@router.post("/projects")
def create_project(payload: ProjectCreate):
    result = supabase.table("projects").insert(payload.model_dump()).execute()
    return result.data[0]


@router.get("/projects/{project_id}")
def get_project(project_id: str):
    try:
        result = (
            supabase.table("projects").select("*").eq("id", project_id).single().execute()
        )
    except Exception:
        raise HTTPException(status_code=404, detail="Project not found")
    if not result.data:
        raise HTTPException(status_code=404, detail="Project not found")
    return result.data


@router.get("/projects")
def list_projects():
    result = supabase.table("projects").select("*").order("created_at", desc=True).execute()
    return {"projects": result.data}


# ── Member endpoints ──────────────────────────────────────────────────────────

class MemberCreate(BaseModel):
    name: str
    role: Optional[str] = None


@router.get("/projects/{project_id}/members")
def list_members(project_id: str):
    result = (
        supabase.table("members")
        .select("*")
        .eq("project_id", project_id)
        .order("created_at")
        .execute()
    )
    return {"members": result.data}


@router.post("/projects/{project_id}/members")
def add_member(project_id: str, payload: MemberCreate):
    row = {
        "project_id": project_id,
        "name": payload.name,
        "role": payload.role,
    }
    result = supabase.table("members").insert(row).execute()
    return result.data[0]


@router.post("/projects/{project_id}/join")
def join_project(project_id: str, payload: MemberCreate):
    """Public endpoint — a user joins a project by name."""
    # Check project exists
    try:
        proj = supabase.table("projects").select("id, group_size").eq("id", project_id).single().execute()
    except Exception:
        raise HTTPException(status_code=404, detail="Project not found")
    if not proj.data:
        raise HTTPException(status_code=404, detail="Project not found")

    # Check group isn't full
    existing = supabase.table("members").select("id").eq("project_id", project_id).execute()
    if len(existing.data) >= (proj.data.get("group_size") or 8):
        raise HTTPException(status_code=400, detail="Group is full")

    row = {
        "project_id": project_id,
        "name": payload.name,
    }
    result = supabase.table("members").insert(row).execute()
    return result.data[0]
