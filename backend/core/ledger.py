import hashlib,json
from datetime import datetime,timezone
from db import supabase
def _canonical(v): return json.dumps(v,sort_keys=True,separators=(",",":"),default=str)
def append_event(project_id,actor_id,event_type,entity_type,event_data,human_owner_id=None):
    last=supabase.table("ledger_entries").select("sequence_number,entry_hash").eq("project_id",project_id).order("sequence_number",desc=True).limit(1).execute().data
    previous=last[0]["entry_hash"] if last else "GENESIS"; seq=(last[0]["sequence_number"]+1) if last else 1
    payload={"project_id":project_id,"sequence_number":seq,"event_type":event_type,"actor_id":actor_id,"entity_type":entity_type,"event_data":event_data,"previous_hash":previous}
    h=hashlib.sha256((previous+_canonical(payload)).encode()).hexdigest()
    return supabase.table("ledger_entries").insert({**payload,"entry_hash":h,"human_owner_id":human_owner_id,"created_at":datetime.now(timezone.utc).isoformat()}).execute().data[0]
def verify_chain(project_id):
    rows=supabase.table("ledger_entries").select("*").eq("project_id",project_id).order("sequence_number").execute().data
    previous="GENESIS"
    for row in rows:
        payload={"project_id":row["project_id"],"sequence_number":row["sequence_number"],"event_type":row["event_type"],"actor_id":row["actor_id"],"entity_type":row["entity_type"],"event_data":row["event_data"],"previous_hash":row["previous_hash"]}
        expected=hashlib.sha256((previous+_canonical(payload)).encode()).hexdigest()
        if row["previous_hash"]!=previous or row["entry_hash"]!=expected:return {"valid":False,"broken_at":row["sequence_number"]}
        previous=row["entry_hash"]
    return {"valid":True,"entries":len(rows)}
