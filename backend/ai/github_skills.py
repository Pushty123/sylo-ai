"""Skill evidence from GitHub. Ownership is proven by GitHub OAuth (token from Supabase login)."""
import datetime as dt, re, httpx
from db import supabase

API = "https://api.github.com"
KEYWORDS = ["opencv", "tensorflow", "pytorch", "cnn", "keras", "scikit-learn", "flask", "fastapi",
            "react", "tflite", "onnx", "yolo", "pandas", "numpy", "docker"]

def _get(path, token, raw=False, **params):
    h = {"Accept": "application/vnd.github.raw" if raw else "application/vnd.github+json"}
    if token:
        h["Authorization"] = f"Bearer {token}"
    r = httpx.get(API + path, headers=h, params=params, timeout=30)
    return r if raw else (r.json() if r.status_code == 200 else [])

def sync(user_id: str, username: str, token: str | None = None) -> dict:
    repos = _get("/user/repos", token, per_page=100, affiliation="owner") if token \
        else _get(f"/users/{username}/repos", None, per_page=100)
    own = [r for r in repos if isinstance(r, dict) and not r.get("fork")]
    own = sorted(own, key=lambda r: r.get("pushed_at") or "", reverse=True)[:10]   # stay within rate limits
    since = (dt.datetime.utcnow() - dt.timedelta(days=365)).isoformat() + "Z"
    langs, commits, found = {}, 0, {}
    for r in own:
        full = r["full_name"]
        for k, v in (_get(f"/repos/{full}/languages", token) or {}).items():
            langs[k] = langs.get(k, 0) + v
        c = _get(f"/repos/{full}/commits", token, author=username, since=since, per_page=100)
        commits += len(c) if isinstance(c, list) else 0
        readme = _get(f"/repos/{full}/readme", token, raw=True)
        text = readme.text.lower() if readme.status_code == 200 else ""
        for kw in KEYWORDS:
            if re.search(rf"\b{re.escape(kw)}\b", text):
                found[kw] = found.get(kw, 0) + 1
    total = sum(langs.values()) or 1
    user = _get(f"/users/{username}", token) or {}
    age_days = (dt.datetime.utcnow() - dt.datetime.fromisoformat(
        user.get("created_at", dt.datetime.utcnow().isoformat()).replace("Z", ""))).days
    low = age_days < 90 or len(own) == 0 or (repos and len(own) / max(len(repos), 1) < 0.2)
    rows = []
    for lang, b in sorted(langs.items(), key=lambda x: -x[1])[:5]:
        n = sum(1 for r in own if r.get("language") == lang)
        rows.append({"user_id": user_id, "skill": lang, "source": "github",
                     "score": round(100 * b / total),
                     "evidence": f"{lang}: {n} own repos, {round(100*b/total)}% of code, {commits} commits in 12 months"})
    for kw, n in found.items():
        rows.append({"user_id": user_id, "skill": kw, "source": "github", "score": min(100, 40 + 20 * n),
                     "evidence": f"{kw} used in {n} repo README(s)"})
    if low:
        for r in rows:
            r["evidence"] += " · low evidence (new, empty or mostly forked account)"
    supabase.table("skill_scores").delete().eq("user_id", user_id).eq("source", "github").execute()
    if rows:
        supabase.table("skill_scores").insert(rows).execute()
    supabase.table("external_links").upsert({
        "user_id": user_id, "platform": "github", "url": f"https://github.com/{username}",
        "method": "oauth" if token else "public", "verified_at": dt.datetime.utcnow().isoformat() if token else None},
        on_conflict="user_id,platform").execute()
    return {"own_repos": len(own), "commits_12m": commits, "low_evidence": bool(low), "skills": rows}
