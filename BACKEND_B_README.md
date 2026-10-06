# Backend B (M3): AI, matching, integrity

## Files
- `backend/ai/config.py` settings from .env
- `backend/ai/llm.py` upper AI (Gemini or Groq) and inner AI (Ollama)
- `backend/ai/gateway.py` agent gateway: scope, credits, ai_actions, ledger
- `backend/ai/agents.py` scoping, tutor, match explainer, demo test, review, guard, fairness
- `backend/ai/matching.py` embeddings + conflict filter + newcomer slot
- `backend/ai/github_skills.py` GitHub skill evidence
- `backend/ai/similarity.py` copy check (called by M2's /upload)
- `backend/ai/test_runner.py` hidden test runner
- `backend/ai/watermark.py` per-viewer watermark + access log
- `backend/ai/routes.py` all endpoints

## Needs from M2
- `db.py` exporting `supabase`
- `core/ledger.py` exporting `log_event(project_id, actor_id, owner_id, action, detail, payload_bytes)`
- Tables: team_members, memberships, projects, milestones, users, skill_scores, coi_declarations,
  invitations, ai_actions, ai_credit_balances, reference_documents, contributions (with text_content),
  similarity_flags, reviews, demo_attempts, external_links (unique user_id+platform),
  access_logs, confidential_briefs (with pdf_path), storage bucket "briefs"

## .env
UPPER_PROVIDER=gemini  GEMINI_API_KEY=...  (or UPPER_PROVIDER=groq GROQ_API_KEY=...)
OLLAMA_URL=http://localhost:11434  OLLAMA_MODEL=llama3.2:3b
HIDDEN_TEST_DIR=seed/hidden_tests

## Setup
pip install -r backend/requirements_backend_b.txt
ollama pull llama3.2:3b
In main.py:  from ai.routes import router as ai_router; app.include_router(ai_router)

## Quick tests (FastAPI /docs page works too)
POST /ai/scope {"project_id": "...", "user_id": "..."}
GET  /match/{project_id}?user_id=...
POST /skills/github/sync {"user_id": "...", "username": "octocat"}
POST /similarity/check {"text": "..."}
POST /review/{contribution_id} {"user_id": "...", "submission_path": "seed/model/predict.py"}

Declare any AI coding tool you used for these files in the main README.

## Real retinopathy model
1. Kaggle → New Notebook → Add data "aptos2019-blindness-detection" → GPU on.
2. Run seed/model/train_on_kaggle.py (about 30–40 minutes).
3. Download dr_model.pt → seed/model/; unzip hidden_tests.zip → seed/hidden_tests/.
4. The review runner calls seed/model/predict.py on the 25 held-back images. Accuracy shown is real.
Install on the laptop: pip install torchvision pillow pandas
Check dataset terms with the organisers; any public image dataset works with the same code.
