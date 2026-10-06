from fastapi import APIRouter,Depends,HTTPException
from pydantic import BaseModel
from db import supabase
from auth import current_user
from core.policy import require_project_member,require_project_role
from . import agents
from .gateway import run_agent
from .llm import inner_chat,wrap
router=APIRouter(prefix="/api")
private_router=APIRouter(prefix="/private-ai",tags=["private-ai"])
class ProjectIn(BaseModel): title:str; public_summary:str; confidential_brief:str=""; budget:int=0; currency:str="INR"
class ScopeIn(BaseModel): project_id:str
class TutorIn(BaseModel): project_id:str; milestone_id:str; question:str
class ContributionIn(BaseModel): project_id:str; milestone_id:str|None=None; title:str; description:str=""; artifact_fingerprint:str|None=None; contribution_type:str="other"
class SimIn(BaseModel): project_id:str; text:str; contribution_id:str|None=None
class ChatIn(BaseModel): project_id:str; prompt:str
def _one(q):
    r=q.maybe_single().execute()
    return r.data if r else None
@router.get("/me")
def me(u=Depends(current_user)): return u["profile"]
@router.post("/projects")
def create_project(b:ProjectIn,u=Depends(current_user)):
    if u["profile"].get("role") not in {"sponsor","admin","expert"}: raise HTTPException(403,"Only sponsor, expert or admin can create projects")
    # ledger entries for the project and the sponsor membership are written by database triggers
    row=supabase.table("projects").insert({"title":b.title,"created_by":u["auth"].id,"public_summary":b.public_summary,"confidential_brief":b.confidential_brief,"budget":b.budget,"currency":b.currency,"status":"open"}).execute().data[0]
    supabase.table("project_members").upsert({"project_id":row["id"],"user_id":u["auth"].id,"role":"sponsor","status":"active"},on_conflict="project_id,user_id").execute()
    return row
@router.post("/ai/scope")
def scope(b:ScopeIn,u=Depends(current_user)):
    require_project_role(u["auth"].id,b.project_id,{"sponsor","expert","admin"})
    p=_one(supabase.table("projects").select("public_summary,budget").eq("id",b.project_id))
    if not p: raise HTTPException(404,"Project not found")
    # upper (cloud) agent: only the public summary is sent, never the confidential brief
    res=run_agent("scoping",u["auth"].id,b.project_id,agents.scoping,p["public_summary"],p.get("budget",0))
    for i,m in enumerate(res.get("milestones",[]),1):
        seq=m.get("sequence",i)
        supabase.table("milestones").insert({"project_id":b.project_id,"title":m["title"],"description":m.get("description",""),"sequence":seq,"sequence_number":seq,"status":"pending"}).execute()
        for skill in m.get("skills",[]): supabase.table("project_skills").insert({"project_id":b.project_id,"skill_name":skill,"importance":1,"source":"ai_scope"}).execute()
    return res
@router.post("/ai/tutor")
def tutor(b:TutorIn,u=Depends(current_user)):
    require_project_member(u["auth"].id,b.project_id)
    p=_one(supabase.table("projects").select("public_summary").eq("id",b.project_id))
    m=_one(supabase.table("milestones").select("title,description").eq("id",b.milestone_id).eq("project_id",b.project_id))
    if not p or not m: raise HTTPException(404,"Project or milestone not found")
    return run_agent("tutor",u["auth"].id,b.project_id,agents.tutor,b.question,p["public_summary"],str(m))
@router.post("/contributions")
def contribution(b:ContributionIn,u=Depends(current_user)):
    from core.charter import require_charter_accepted
    require_project_member(u["auth"].id,b.project_id); require_charter_accepted(u["auth"].id,b.project_id)
    # the contributions ledger trigger records this row, including the fingerprint
    return supabase.table("contributions").insert({"project_id":b.project_id,"milestone_id":b.milestone_id,"user_id":u["auth"].id,"contributor_id":u["auth"].id,"contribution_type":b.contribution_type,"title":b.title,"description":b.description,"artifact_fingerprint":b.artifact_fingerprint}).execute().data[0]
@router.post("/integrity/similarity")
def similarity(b:SimIn,u=Depends(current_user)):
    from .similarity import check
    require_project_member(u["auth"].id,b.project_id); return check(b.text,b.contribution_id,b.project_id)

@private_router.post("/chat")
def private_chat(b:ChatIn,u=Depends(current_user)):
    """Project-scoped private AI used by the frontend workspace. Runs on local Ollama only,
    so the confidential brief never leaves the server. The frontend saves the turn via save_ai_turn."""
    if not b.prompt.strip(): raise HTTPException(400,"Prompt is empty")
    require_project_member(u["auth"].id,b.project_id)
    p=_one(supabase.table("projects").select("title,public_summary,confidential_brief,status").eq("id",b.project_id))
    if not p: raise HTTPException(404,"Project not found")
    context=f"Title: {p['title']}\nStatus: {p['status']}\nSummary: {p.get('public_summary') or ''}\nConfidential brief: {p.get('confidential_brief') or 'none'}"
    def ask(prompt,ctx):
        return inner_chat("You are Sylo's private research assistant for one project. Help with milestones, risks and methodology. "
                          "Use only the project context given. Ideas and code stay the team's.",
                          f"Project context:\n{wrap(ctx)}\nQuestion:\n{wrap(prompt)}")
    try: text=run_agent("private_chat",u["auth"].id,b.project_id,ask,b.prompt.strip(),context,detail="private project chat")
    except HTTPException: raise
    except Exception as exc: raise HTTPException(503,"Private AI (Ollama) is not reachable") from exc
    return {"result":text}
