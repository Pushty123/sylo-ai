"""Backend B endpoints. Register in main.py:  app.include_router(ai.routes.router)
user_id comes from M2's auth dependency in the real build; it's a body field here for quick testing."""
import json
from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel
from db import supabase
from core.ledger import log_event
from . import agents, matching, github_skills, similarity, test_runner, watermark
from .gateway import run_agent

router = APIRouter()

class ScopeIn(BaseModel): project_id: str; user_id: str
class TutorIn(BaseModel): project_id: str; user_id: str; milestone_id: str; question: str
class GithubIn(BaseModel): user_id: str; username: str; token: str | None = None
class SimIn(BaseModel): text: str; contribution_id: str | None = None; project_id: str | None = None
class ReviewIn(BaseModel): user_id: str; submission_path: str; submission_summary: str = ""
class FairIn(BaseModel): user_id: str; project_id: str; charter_v1: dict; charter_v2: dict
class GuardIn(BaseModel): user_id: str; project_id: str; file_text: str
class DemoAns(BaseModel): user_id: str; project_id: str; answers: list[int]

def _project(pid):
    p = supabase.table("projects").select("*").eq("id", pid).single().execute().data
    if not p: raise HTTPException(404, "project not found")
    return p

@router.post("/ai/scope")
def scope(b: ScopeIn):
    p = _project(b.project_id)
    res = run_agent("scoping", b.user_id, b.project_id, agents.scoping, p["public_summary"], p.get("budget", 0),
                    detail="Scoping agent drafted milestones (pending mentor approval)")
    for m in res.get("milestones", []):
        supabase.table("milestones").insert({**m, "project_id": b.project_id, "status": "pending"}).execute()
    return res

@router.post("/ai/tutor")
def tutor(b: TutorIn):
    p = _project(b.project_id)
    m = supabase.table("milestones").select("title,skills,criteria").eq("id", b.milestone_id).single().execute().data
    return run_agent("tutor", b.user_id, b.project_id, agents.tutor, b.question, p["public_summary"],
                     json.dumps(m), detail="Tutor agent answered (draft pending)")

@router.get("/match/{project_id}")
def match(project_id: str, user_id: str):
    ranked = matching.rank(project_id)
    show = [c for c in ranked if not c["filtered"]]
    reasons = run_agent("match_explainer", user_id, project_id, agents.match_explainer,
                        [{"user_id": c["user_id"], "score": c["score"], "evidence": c["evidence"]} for c in show],
                        detail="Match reasons written").get("reasons", {})
    for c in show:
        c["reason"] = reasons.get(c["user_id"], c["evidence"])
        supabase.table("invitations").upsert({"project_id": project_id, "user_id": c["user_id"],
            "score": c["score"], "reasons": c["reason"], "newcomer_slot": c.get("newcomer_slot", False),
            "status": "suggested"}, on_conflict="project_id,user_id").execute()
    for c in ranked:
        if c["filtered"]:
            log_event(project_id, "matching", user_id, "COI_FILTERED", f"{c['name']} filtered: conflict", b"")
    return ranked

@router.post("/skills/github/sync")
def github(b: GithubIn):
    return github_skills.sync(b.user_id, b.username, b.token)

@router.post("/similarity/check")
def sim(b: SimIn):
    return similarity.check(b.text, b.contribution_id, b.project_id)

@router.post("/review/{contribution_id}")
def review(contribution_id: str, b: ReviewIn):
    c = supabase.table("contributions").select("*").eq("id", contribution_id).single().execute().data
    m = supabase.table("milestones").select("project_id,criteria").eq("id", c["milestone_id"]).single().execute().data
    tests = test_runner.run(b.submission_path)
    check = run_agent("review", b.user_id, m["project_id"], agents.review_checklist,
                      m["criteria"], tests, b.submission_summary, detail="Review agent checklist")
    supabase.table("reviews").insert({"contribution_id": contribution_id, "test_results": tests,
                                      "ai_checklist": check, "decision": "pending_mentor"}).execute()
    return {"tests": tests, "checklist": check}

@router.post("/ai/fairness")
def fairness(b: FairIn):
    return run_agent("fairness", b.user_id, b.project_id, agents.fairness_check, b.charter_v1, b.charter_v2,
                     detail="Fairness agent checked charter change")

@router.post("/ai/guard-label")
def guard(b: GuardIn):
    return run_agent("guard", b.user_id, b.project_id, agents.guard_label, b.file_text,
                     detail="Guard agent suggested a label (human confirms)")

_DEMO = {}
@router.post("/demo-test/{project_id}")
def demo_test(project_id: str, user_id: str):
    skills = sorted({s for m in supabase.table("milestones").select("skills").eq("project_id", project_id)
                     .execute().data for s in (m["skills"] or [])})
    q = run_agent("demo_test", user_id, project_id, agents.demo_questions, skills, detail="Demo test generated")
    _DEMO[project_id] = q.get("questions", [])
    return [{"q": x["q"], "options": x["options"]} for x in _DEMO[project_id]]   # answers stay on server

@router.post("/demo-test/{project_id}/score")
def demo_score(project_id: str, b: DemoAns):
    qs = _DEMO.get(project_id, [])
    score = round(100 * sum(1 for q, a in zip(qs, b.answers) if q["answer_index"] == a) / max(len(qs), 1))
    supabase.table("demo_attempts").insert({"project_id": project_id, "user_id": b.user_id, "score": score}).execute()
    return {"score": score}

@router.get("/brief/{project_id}/watermarked")
def brief(project_id: str, user_id: str, user_name: str):
    row = (supabase.table("confidential_briefs").select("pdf_path").eq("project_id", project_id)
           .single().execute().data)      # RLS returns nothing for non-members
    if not row: raise HTTPException(403, "access denied")
    pdf = supabase.storage.from_("briefs").download(row["pdf_path"])
    return Response(watermark.stamp(pdf, user_id, user_name, project_id), media_type="application/pdf")
