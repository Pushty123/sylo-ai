"""Project ledger. The database owns the hash chain: every write goes through the
append_ledger_event RPC so entries match what verify_project_ledger (used by the
frontend Integrity tab) checks. Never insert into ledger_entries directly."""
import hashlib
from db import supabase, user_client


def append_event(project_id, actor_id, event_type, entity_type, event_data, human_owner_id=None, entity_id=None):
    return supabase.rpc("append_ledger_event", {
        "p_project_id": project_id, "p_actor_id": actor_id, "p_event_type": event_type,
        "p_entity_type": entity_type, "p_entity_id": entity_id, "p_event_data": event_data or {},
        "p_human_owner_id": human_owner_id,
    }).execute().data


def log_event(project_id, actor_id, owner_id, action, detail="", payload_bytes=b""):
    """Compatibility wrapper used by the AI gateway. actor_id may be a label like 'agent:tutor',
    so the human owner is recorded as the actor and the agent name goes into event_data."""
    return append_event(project_id, owner_id, action, "ai_action", {
        "agent": actor_id, "detail": detail,
        "output_sha256": hashlib.sha256(payload_bytes or b"").hexdigest(),
    }, owner_id)


def verify_chain(project_id, access_token):
    """Runs the same verification as the frontend, as the calling user (RPC checks membership)."""
    return user_client(access_token).rpc("verify_project_ledger", {"p_project_id": project_id}).execute().data
