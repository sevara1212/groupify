from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from db import supabase

router = APIRouter()


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
    result = (
        supabase.table("projects").select("*").eq("id", project_id).single().execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Project not found")
    return result.data


@router.get("/projects")
def list_projects():
    result = supabase.table("projects").select("*").order("created_at", desc=True).execute()
    return {"projects": result.data}
