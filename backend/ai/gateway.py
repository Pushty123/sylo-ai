"""Agent gateway: every agent call goes through run_agent().
Checks project scope, runs the agent, then logs the action with its human owner
in ai_actions and the project ledger (live Supabase schema)."""
import hashlib, json
from fastapi import HTTPException
from db import supabase
from core.ledger import log_event
from core.policy import require_project_member
from . import config as C
from .llm import _gemini_model

UPPER_AGENTS = {"scoping", "tutor", "match_explainer", "demo_test", "public_chat"}
INNER_AGENTS = {"review", "guard", "fairness", "private_chat"}

# agent name -> public.ai_action_type enum value
ACTION_TYPES = {"scoping": "scoping", "tutor": "research", "match_explainer": "matching",
                "demo_test": "generation", "review": "analysis", "guard": "analysis",
                "fairness": "analysis", "private_chat": "research", "public_chat": "research"}


def record_action(agent: str, user_id: str, project_id: str, args, result, model_name: str, detail: str = ""):
    out = json.dumps(result, ensure_ascii=False, default=str).encode()
    supabase.table("ai_actions").insert({
        "project_id": project_id, "initiated_by": user_id, "human_owner_id": user_id,
        "action_type": ACTION_TYPES.get(agent, "other"), "model_name": model_name, "tool_name": agent,
        "input_reference": hashlib.sha256(json.dumps(args, default=str).encode()).hexdigest(),
        "output_reference": hashlib.sha256(out).hexdigest(), "status": "completed"}).execute()
    log_event(project_id, actor_id=f"agent:{agent}", owner_id=user_id, action="AI_ACTION",
              detail=detail or f"{agent} agent run", payload_bytes=out)


def run_agent(agent: str, user_id: str, project_id: str, fn, *args, detail: str = ""):
    if agent not in UPPER_AGENTS | INNER_AGENTS:
        raise HTTPException(400, "unknown agent")
    require_project_member(user_id, project_id)
    result = fn(*args)
    model = C.OLLAMA_MODEL if agent in INNER_AGENTS else {"groq": C.GROQ_MODEL, "router": C.ROUTER_MODEL}.get(C.UPPER_PROVIDER) or _gemini_model()
    record_action(agent, user_id, project_id, args, result, model, detail)
    return result
