# Deploy Sylo AI (free, Render)

One web service runs the whole site: React website + FastAPI backend + public AI (Gemini).

1. Go to https://dashboard.render.com and sign in with GitHub.
2. **New → Blueprint** → pick the `sylo-ai` repo → branch `saathwi-frontend`. Render reads `render.yaml`.
3. It asks for 2 secret values:
   - `SUPABASE_SERVICE_KEY` — Supabase → Project Settings → API Keys → *secret* (or legacy *service_role*) key
   - `GEMINI_API_KEY` — your Google Gemini key (optionally change `GEMINI_MODEL`)
4. Click **Apply**. The first build takes ~5 minutes. Your link: `https://sylo-ai.onrender.com` (or similar).
5. In Supabase → Authentication → URL Configuration, set **Site URL** to that link (password-reset emails use it).

Notes
- Free services sleep after 15 min idle; the first visit after that takes ~1 minute.
- Private AI (Ollama/Qwen) needs a local computer and is not available on Render; Public AI works.
- Never commit keys. Secrets live only in Render's Environment settings.
