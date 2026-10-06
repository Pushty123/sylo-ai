"""Copy check: difflib (exact wording) + embeddings (paraphrase). M2's /upload calls check()."""
import difflib
from sentence_transformers import util
from db import supabase
from .matching import model
from . import config as C

def check(text: str, contribution_id: str | None = None, project_id: str | None = None) -> dict:
    refs = [(r["id"], r["title"], r["content"]) for r in
            supabase.table("reference_documents").select("id,title,content").execute().data]
    q = supabase.table("contributions").select("id,text_content")
    refs += [(c["id"], "earlier submission", c["text_content"]) for c in q.execute().data
             if c.get("text_content") and c["id"] != contribution_id]
    if not text or not refs:
        return {"score": 0, "flagged": False}
    v = model().encode(text, convert_to_tensor=True)
    best = {"score": 0.0}
    for rid, title, content in refs:
        d = difflib.SequenceMatcher(None, text.lower(), content.lower()).ratio()
        e = float(util.cos_sim(v, model().encode(content, convert_to_tensor=True)))
        s = max(d, e)
        if s > best["score"]:
            best = {"score": s, "source_id": rid, "source_title": title}
    best["score"] = round(best["score"] * 100)
    best["flagged"] = best["score"] >= C.SIMILARITY_FLAG * 100
    if best["flagged"] and contribution_id:
        supabase.table("similarity_flags").insert({
            "contribution_id": contribution_id, "source_ref": best.get("source_id"),
            "score": best["score"], "mentor_decision": "pending"}).execute()
    return best
