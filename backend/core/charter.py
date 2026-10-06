import hashlib,json
from fastapi import APIRouter,Depends,HTTPException
from pydantic import BaseModel
from db import supabase
from auth import current_user
from core.policy import require_project_member,require_project_role
from core.ledger import append_event
from core.charter_terms import default_terms,default_role_terms
router=APIRouter(prefix="/api",tags=["charter"])
def _hash(model,terms,roles): return hashlib.sha256(json.dumps({"m":model,"t":terms,"r":roles},sort_keys=True).encode()).hexdigest()
def _latest(pid):
    return (supabase.table("charters").select("*").eq("project_id",pid).eq("status","active").order("version",desc=True).limit(1).execute().data or [None])[0]
def _members(pid):
    return [r for r in supabase.table("project_members").select("user_id,role,status").eq("project_id",pid).execute().data if r.get("status")=="active"]
def _accepted(cid,uid):
    r=supabase.table("charter_acceptances").select("*").eq("charter_id",cid).eq("user_id",uid).order("accepted_at",desc=True).limit(1).execute().data
    return r[0] if r and r[0].get("decision","accepted")=="accepted" else None
def require_charter_accepted(uid,pid):
    c=_latest(pid)
    if not c: raise HTTPException(423,"No charter published yet. Work starts after the charter is accepted.")
    if not _accepted(c["id"],uid): raise HTTPException(423,f"Please read and accept charter v{c['version']} before continuing.")
    return c
class PublishIn(BaseModel):
    project_id:str; engagement_model:str="funded"; terms:dict|None=None; role_terms:dict|None=None; change_summary:str=""
class AcceptIn(BaseModel):
    version:int; terms_hash:str; read_confirmed:bool; model_acknowledged:bool
class DeclineIn(BaseModel): version:int; reason:str=""
@router.get("/charters/template")
def template(engagement_model="funded",budget=0): return {"engagement_model":engagement_model,"terms":default_terms(engagement_model,budget),"role_terms":default_role_terms(engagement_model)}
@router.post("/charters/publish")
def publish(b:PublishIn,u=Depends(current_user)):
    require_project_role(u["auth"].id,b.project_id,{"sponsor","admin"})
    budget=(supabase.table("projects").select("budget").eq("id",b.project_id).limit(1).execute().data or [{}])[0].get("budget",0) or 0
    terms=b.terms or default_terms(b.engagement_model,budget); roles=b.role_terms or default_role_terms(b.engagement_model); prev=_latest(b.project_id)
    if prev and not b.change_summary.strip(): raise HTTPException(400,"Describe what changed. Charters are never changed silently.")
    version=(prev["version"]+1) if prev else 1; h=_hash(b.engagement_model,terms,roles)
    row=supabase.table("charters").insert({"project_id":b.project_id,"version":version,"terms":terms,"role_terms":roles,"engagement_model":b.engagement_model,"change_summary":b.change_summary or None,"content_hash":h,"created_by":u["auth"].id,"status":"active","is_current":True}).execute().data[0]
    if prev: supabase.table("charters").update({"status":"superseded","is_current":False}).eq("id",prev["id"]).execute()
    append_event(b.project_id,u["auth"].id,"CHARTER_CHANGED" if prev else "CHARTER_PUBLISHED","charter",{"version":version,"content_hash":h,"change_summary":b.change_summary or None},u["auth"].id)
    for m in _members(b.project_id):
        if m["user_id"]!=u["auth"].id:
            supabase.table("notifications").insert({"user_id":m["user_id"],"project_id":b.project_id,"type":"charter_changed" if prev else "charter_published","title":f"Charter v{version} requires your attention","body":f"What changed: {b.change_summary}" if prev else "Please read and accept the project charter.","link":f"/projects/{b.project_id}/charter"}).execute()
    return {"version":version,"content_hash":h}
@router.get("/charters/{project_id}/mine")
def mine(project_id,u=Depends(current_user)):
    m=require_project_member(u["auth"].id,project_id); c=_latest(project_id)
    if not c: raise HTTPException(404,"No charter published yet")
    role="sponsor" if m["role"]=="owner" else m["role"]; role_terms=(c.get("role_terms") or {}).get(role,{})
    return {"version":c["version"],"engagement_model":c.get("engagement_model"),"terms":c.get("terms") or {}, "your_role":role,"your_role_terms":role_terms,"terms_hash":c.get("content_hash"),"change_summary":c.get("change_summary"),"changed_since_you_last_accepted":[],"you_accepted":bool(_accepted(c["id"],u["auth"].id)),"must_acknowledge":(c.get("terms") or {}).get("1_engagement_model")}
@router.post("/charters/{project_id}/accept")
def accept(project_id,b:AcceptIn,u=Depends(current_user)):
    require_project_member(u["auth"].id,project_id); c=_latest(project_id)
    if not c or c["version"]!=b.version: raise HTTPException(409,"A newer charter version exists.")
    if b.terms_hash!=c.get("content_hash"): raise HTTPException(409,"The charter text is not current.")
    if not (b.read_confirmed and b.model_acknowledged): raise HTTPException(400,"Tick both boxes.")
    role=(supabase.table("project_members").select("role").eq("project_id",project_id).eq("user_id",u["auth"].id).maybe_single().execute().data or {}).get("role","student")
    e=append_event(project_id,u["auth"].id,"CHARTER_ACCEPTED","charter",{"version":c["version"],"role":role,"terms_hash":c["content_hash"]},u["auth"].id)
    supabase.table("charter_acceptances").insert({"charter_id":c["id"],"user_id":u["auth"].id,"role":role,"decision":"accepted","model_acknowledged":True,"read_confirmed":True,"terms_hash":c["content_hash"],"ledger_sequence":e["sequence_number"]}).execute()
    return {"accepted_version":c["version"],"ledger_sequence":e["sequence_number"],"team_ready":all(_accepted(c["id"],m["user_id"]) for m in _members(project_id))}
@router.post("/charters/{project_id}/decline")
def decline(project_id,b:DeclineIn,u=Depends(current_user)):
    require_project_member(u["auth"].id,project_id); c=_latest(project_id)
    if not c or c["version"]!=b.version: raise HTTPException(409,"Charter version changed.")
    e=append_event(project_id,u["auth"].id,"CHARTER_DECLINED","charter",{"version":c["version"],"reason":b.reason,"exit":"accepted credit kept"},u["auth"].id)
    supabase.table("charter_acceptances").insert({"charter_id":c["id"],"user_id":u["auth"].id,"decision":"declined","ledger_sequence":e["sequence_number"]}).execute()
    supabase.table("project_members").update({"status":"removed"}).eq("project_id",project_id).eq("user_id",u["auth"].id).execute()
    return {"declined_version":c["version"],"status":"removed","credit_kept":True}
@router.get("/charters/{project_id}/status")
def status(project_id,u=Depends(current_user)):
    require_project_member(u["auth"].id,project_id); c=_latest(project_id)
    if not c:return {"version":None,"members":[],"team_ready":False}
    rows=[{"user_id":m["user_id"],"role":m["role"],"accepted":bool(_accepted(c["id"],m["user_id"])),"accepted_at":(_accepted(c["id"],m["user_id"]) or {}).get("accepted_at")} for m in _members(project_id)]
    return {"version":c["version"],"members":rows,"team_ready":all(x["accepted"] for x in rows)}
@router.get("/notifications")
def notifications(u=Depends(current_user)): return supabase.table("notifications").select("*").eq("user_id",u["auth"].id).order("created_at",desc=True).limit(50).execute().data
