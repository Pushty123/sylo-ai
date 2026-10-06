from fastapi import APIRouter,Depends,HTTPException
from pydantic import BaseModel
from db import supabase
from auth import current_user
from core.policy import require_project_member,require_project_role
from core.ledger import append_event
from . import agents
from .gateway import run_agent
router=APIRouter(prefix="/api")
class ProjectIn(BaseModel): title:str; public_summary:str; confidential_brief:str=""; budget:int=0; currency:str="INR"
class ScopeIn(BaseModel): project_id:str
class TutorIn(BaseModel): project_id:str; milestone_id:str; question:str
class ContributionIn(BaseModel): project_id:str; milestone_id:str|None=None; title:str; description:str=""; artifact_fingerprint:str|None=None
class SimIn(BaseModel): project_id:str; text:str; contribution_id:str|None=None
@router.get("/me")
def me(u=Depends(current_user)): return u["profile"]
@router.post("/projects")
def create_project(b:ProjectIn,u=Depends(current_user)):
    if u["profile"].get("role") not in {"sponsor","admin","expert"}: raise HTTPException(403,"Only sponsor, expert or admin can create projects")
    row=supabase.table("projects").insert({"title":b.title,"created_by":u["auth"].id,"public_summary":b.public_summary,"confidential_brief":b.confidential_brief,"budget":b.budget,"currency":b.currency,"status":"open"}).execute().data[0]
    supabase.table("project_members").upsert({"project_id":row["id"],"user_id":u["auth"].id,"role":"sponsor","status":"active"},on_conflict="project_id,user_id").execute()
    append_event(row["id"],u["auth"].id,"PROJECT_CREATED","project",{"title":b.title,"public_summary":b.public_summary},u["auth"].id)
    return row
@router.post("/ai/scope")
def scope(b:ScopeIn,u=Depends(current_user)):
    require_project_role(u["auth"].id,b.project_id,{"sponsor","expert","admin"})
    p=supabase.table("projects").select("public_summary,budget").eq("id",b.project_id).maybe_single().execute().data
    if not p: raise HTTPException(404,"Project not found")
    res=run_agent("scoping",u["auth"].id,b.project_id,agents.scoping,p["public_summary"],p.get("budget",0))
    for i,m in enumerate(res.get("milestones",[]),1):
        supabase.table("milestones").insert({"project_id":b.project_id,"title":m["title"],"description":m.get("description",""),"sequence":m.get("sequence",i),"sequence_number":m.get("sequence",i) ,"status":"pending"}).execute()
        for skill in m.get("skills",[]): supabase.table("project_skills").insert({"project_id":b.project_id,"skill_name":skill,"importance":"required","source":"ai_scope"}).execute()
    return res
@router.post("/ai/tutor")
def tutor(b:TutorIn,u=Depends(current_user)):
    require_project_member(u["auth"].id,b.project_id)
    p=supabase.table("projects").select("public_summary").eq("id",b.project_id).maybe_single().execute().data
    m=supabase.table("milestones").select("title,description").eq("id",b.milestone_id).maybe_single().execute().data
    return run_agent("tutor",u["auth"].id,b.project_id,agents.tutor,b.question,p["public_summary"],str(m))
@router.post("/contributions")
def contribution(b:ContributionIn,u=Depends(current_user)):
    from core.charter import require_charter_accepted
    require_project_member(u["auth"].id,b.project_id); require_charter_accepted(u["auth"].id,b.project_id)
    row=supabase.table("contributions").insert({"project_id":b.project_id,"milestone_id":b.milestone_id,"user_id":u["auth"].id,"contributor_id":u["auth"].id,"title":b.title,"description":b.description,"artifact_fingerprint":b.artifact_fingerprint}).execute().data[0]
    append_event(b.project_id,u["auth"].id,"CONTRIBUTION_SUBMITTED","contribution",{"contribution_id":row["id"],"fingerprint":b.artifact_fingerprint},u["auth"].id)
    return row
@router.post("/integrity/similarity")
def similarity(b:SimIn,u=Depends(current_user)):
    from .similarity import check
    require_project_member(u["auth"].id,b.project_id); return check(b.text,b.contribution_id,b.project_id)
