"""Agent gateway: every agent call goes through run_agent().
Checks role, project scope and AI credits, then logs the action with its human owner."""
import hashlib, json
from fastapi import HTTPException
from db import supabase                      # shared client from M2
from core.ledger import log_event            # shared ledger function from M2
from . import config as C

UPPER_AGENTS = {"scoping", "tutor", "match_explainer", "demo_test"}
INNER_AGENTS = {"review", "guard", "fairness"}

def _is_member(user_id: str, project_id: str) -> bool:
    rows = (supabase.table("team_members").select("user_id")
            .eq("project_id", project_id).eq("user_id", user_id).is_("left_at", "null").execute().data)
    if rows:
        return True
    proj = supabase.table("projects").select("org_id").eq("id", project_id).single().execute().data
    mem = (supabase.table("memberships").select("user_id")
           .eq("org_id", proj["org_id"]).eq("user_id", user_id).execute().data) if proj else []
    return bool(mem)                          # sponsor staff of this project

def _charge_credits(project_id: str):
    bal = (supabase.table("ai_credit_balances").select("*").eq("project_id", project_id)
           .maybe_single().execute())
    bal = bal.data if bal else None
    if bal and bal["used_amount"] + C.AI_CALL_COST > bal["reserve_amount"]:
        raise HTTPException(402, "AI credits for this project are used up")
    if bal:
        supabase.table("ai_credit_balances").update(
            {"used_amount": bal["used_amount"] + C.AI_CALL_COST}).eq("project_id", project_id).execute()

def run_agent(agent: str, user_id: str, project_id: str, fn, *args, detail: str = ""):
    if agent not in UPPER_AGENTS | INNER_AGENTS:
        raise HTTPException(400, "unknown agent")
    if not _is_member(user_id, project_id):
        raise HTTPException(403, "agent can only act for members of this project")
    _charge_credits(project_id)
    result = fn(*args)
    out = json.dumps(result, ensure_ascii=False).encode()
    supabase.table("ai_actions").insert({
        "agent": agent, "project_id": project_id, "owner_id": user_id,
        "input_hash": hashlib.sha256(json.dumps(args, default=str).encode()).hexdigest(),
        "credits_used": C.AI_CALL_COST}).execute()
    log_event(project_id, actor_id=f"agent:{agent}", owner_id=user_id, action="AI_ACTION",
              detail=detail or f"{agent} agent run", payload_bytes=out)
    return result
