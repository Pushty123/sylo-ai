from fastapi import HTTPException
from db import supabase
def require_project_member(user_id,project_id):
    row=supabase.table("project_members").select("id,role,status").eq("project_id",project_id).eq("user_id",user_id).eq("status","active").maybe_single().execute().data
    if row: return row
    project=supabase.table("projects").select("created_by").eq("id",project_id).maybe_single().execute().data
    if project and project.get("created_by")==user_id: return {"role":"owner","status":"active"}
    raise HTTPException(403,"You are not an active member of this project")
def require_project_role(user_id,project_id,allowed):
    m=require_project_member(user_id,project_id)
    if m["role"] not in allowed and m["role"]!="owner": raise HTTPException(403,"Insufficient project role")
    return m
def can_access_sensitivity(role,sensitivity,action):
    if sensitivity=="confidential" and action=="external_ai": raise HTTPException(403,"Confidential data cannot be sent to external AI")
