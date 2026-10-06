"""Explained matching: embeddings + conflict filter + eligibility + one newcomer slot."""
from functools import lru_cache
from sentence_transformers import SentenceTransformer, util
from db import supabase
from . import config as C

@lru_cache(maxsize=1)
def model():
    return SentenceTransformer(C.EMBED_MODEL)

def _skills_text(user_id: str, profile_skills: list) -> str:
    rows = supabase.table("skill_scores").select("skill,score,source").eq("user_id", user_id).execute().data
    verified = [f"{r['skill']} ({r['source']})" for r in rows]
    return ", ".join((profile_skills or []) + verified)

def rank(project_id: str, role: str = "student", top: int = 3) -> list:
    proj = supabase.table("projects").select("id,org_id").eq("id", project_id).single().execute().data
    ms = supabase.table("milestones").select("skills").eq("project_id", project_id).execute().data
    need = ", ".join(sorted({s for m in ms for s in (m["skills"] or [])}))
    users = supabase.table("users").select("id,name,roles,skills,verification_level").execute().data
    users = [u for u in users if role in (u["roles"] or []) and (u["verification_level"] or 0) >= 1]
    coi = {r["user_id"] for r in supabase.table("coi_declarations").select("user_id")
           .eq("org_id", proj["org_id"]).execute().data}
    past = {r["user_id"] for r in supabase.table("team_members").select("user_id").execute().data}
    need_vec = model().encode(need, convert_to_tensor=True)
    out = []
    for u in users:
        if u["id"] in coi:
            out.append({"user_id": u["id"], "name": u["name"], "score": 0, "filtered": True,
                        "reason": "Conflict of interest declared with the sponsor"})
            continue
        text = _skills_text(u["id"], u["skills"])
        score = float(util.cos_sim(need_vec, model().encode(text, convert_to_tensor=True))) if text else 0.0
        out.append({"user_id": u["id"], "name": u["name"], "score": round(score * 100),
                    "filtered": False, "newcomer": u["id"] not in past, "evidence": text})
    ok = sorted([c for c in out if not c["filtered"]], key=lambda c: -c["score"])
    picked = ok[:top]
    newcomers = [c for c in ok if c.get("newcomer")]
    if newcomers and not any(c.get("newcomer") for c in picked) and top > 1:
        picked[-1] = newcomers[0]            # keep one fair spot for a newcomer
        picked[-1]["newcomer_slot"] = True
    return picked + [c for c in out if c["filtered"]]
