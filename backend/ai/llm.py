"""Two separate AI clients.
upper_json -> cloud model (Gemini or Groq). Only ever receives NORMAL project data.
inner_json -> local Ollama. The only client allowed to see secret data. No internet needed."""
import json, re, httpx
from . import config as C

def _parse(text: str) -> dict:
    text = re.sub(r"```(json)?", "", text).strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        m = re.search(r"\{.*\}", text, re.S)
        return json.loads(m.group(0)) if m else {"error": "model did not return JSON", "raw": text[:300]}

class AIUnavailable(Exception):
    """Raised with a message that is safe to show in the UI."""

def _openai_compatible(url: str, key: str, model: str, system: str, user: str, json_mode: bool = True) -> dict:
    body = {"model": model,
            "messages": [{"role": "system", "content": system + "\n" + C.DATA_RULE},
                         {"role": "user", "content": user + "\nReply with JSON only."}]}
    if json_mode:
        body["response_format"] = {"type": "json_object"}
    r = httpx.post(url, headers={"Authorization": f"Bearer {key}"}, json=body, timeout=60)
    if r.status_code == 400 and json_mode:      # some router models don't support JSON mode
        return _openai_compatible(url, key, model, system, user, json_mode=False)
    _check(r)
    return _parse(r.json()["choices"][0]["message"]["content"])

def _check(r):
    if r.status_code >= 400:
        try: detail = r.json().get("error", {}).get("message") or r.text
        except Exception: detail = r.text
        raise AIUnavailable(f"Public AI ({C.UPPER_PROVIDER}) error {r.status_code}: {str(detail)[:200]}")

GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta"
_GEMINI = {"model": None}

def _gemini_model() -> str:
    m = _GEMINI["model"] or C.GEMINI_MODEL
    return m[len("models/"):] if m.startswith("models/") else m

def _gemini_generate(model: str, prompt: str):
    return httpx.post(f"{GEMINI_BASE}/models/{model}:generateContent",
                      headers={"x-goog-api-key": C.GEMINI_API_KEY},
                      json={"contents": [{"parts": [{"text": prompt}]}],
                            "generationConfig": {"responseMimeType": "application/json"}},
                      timeout=90)

def _version(name: str):
    return tuple(int(x) for x in re.findall(r"\d+", name.split("gemini-", 1)[-1])[:2] or [0])

def list_gemini_models() -> list:
    """Models this API key can call for text generation."""
    r = httpx.get(f"{GEMINI_BASE}/models", headers={"x-goog-api-key": C.GEMINI_API_KEY},
                  params={"pageSize": 200}, timeout=30)
    _check(r)
    return [m["name"].split("/", 1)[-1] for m in r.json().get("models", [])
            if "generateContent" in m.get("supportedGenerationMethods", []) and m["name"].split("/")[-1].startswith("gemini-")]

def _pick_gemini_model() -> str:
    """Prefer the model the user asked for (e.g. 'gemini-3.6' matches 'gemini-3.6-flash'),
    else the newest stable flash model the key can use."""
    names = list_gemini_models()
    if not names:
        raise AIUnavailable("This GEMINI_API_KEY cannot use any Gemini text model")
    wanted = _gemini_model()
    close = [n for n in names if n.startswith(wanted)]
    stable = [n for n in names if not any(t in n for t in ("preview", "exp", "image", "tts", "live", "embedding"))] or names
    pool = close or [n for n in stable if "flash" in n] or stable
    return sorted(pool, key=lambda n: (_version(n), "lite" not in n, -len(n)), reverse=True)[0]

def upper_json(system: str, user: str) -> dict:
    """Cloud model. Never pass confidential data here."""
    prov = C.UPPER_PROVIDER
    try:
        if prov == "router":
            if not (C.ROUTER_BASE_URL and C.ROUTER_API_KEY and C.ROUTER_MODEL):
                raise AIUnavailable("Public AI not configured: set ROUTER_BASE_URL, ROUTER_API_KEY and ROUTER_MODEL in backend/.env")
            return _openai_compatible(C.ROUTER_BASE_URL + "/chat/completions", C.ROUTER_API_KEY, C.ROUTER_MODEL, system, user)
        if prov == "groq":
            if not C.GROQ_API_KEY:
                raise AIUnavailable("Public AI not configured: set GROQ_API_KEY in backend/.env")
            return _openai_compatible("https://api.groq.com/openai/v1/chat/completions", C.GROQ_API_KEY, C.GROQ_MODEL, system, user)
        if prov != "gemini":
            raise AIUnavailable(f"Unknown UPPER_PROVIDER '{prov}' (use gemini, groq or router)")
        if not C.GEMINI_API_KEY:
            raise AIUnavailable("Public AI not configured: set GEMINI_API_KEY in backend/.env")
        prompt = f"{system}\n{C.DATA_RULE}\nReply with JSON only.\n\n{user}"
        r = _gemini_generate(_gemini_model(), prompt)
        if r.status_code == 404:                 # configured model name not available for this key
            _GEMINI["model"] = _pick_gemini_model()
            r = _gemini_generate(_gemini_model(), prompt)
        _check(r)
        parts = (r.json().get("candidates") or [{}])[0].get("content", {}).get("parts") or []
        if not parts:
            raise AIUnavailable("Public AI returned an empty answer (blocked or filtered). Try rephrasing.")
        return _parse("".join(p.get("text", "") for p in parts))
    except httpx.HTTPError as exc:
        raise AIUnavailable(f"Public AI ({prov}) is not reachable: {exc.__class__.__name__}") from exc

def inner_json(system: str, user: str) -> dict:
    r = httpx.post(f"{C.OLLAMA_URL}/api/chat",
                   json={"model": C.OLLAMA_MODEL, "stream": False, "format": "json",
                         "messages": [{"role": "system", "content": system + "\n" + C.DATA_RULE},
                                      {"role": "user", "content": user}]},
                   timeout=120)
    r.raise_for_status()
    return _parse(r.json()["message"]["content"])

def inner_chat(system: str, user: str) -> str:
    """Plain-text answer from the local Ollama model (private AI chat)."""
    r = httpx.post(f"{C.OLLAMA_URL}/api/chat",
                   json={"model": C.OLLAMA_MODEL, "stream": False, "think": False,
                         "messages": [{"role": "system", "content": system + "\n" + C.DATA_RULE},
                                      {"role": "user", "content": user}]},
                   timeout=180)
    r.raise_for_status()
    text = r.json()["message"]["content"]
    return re.sub(r"<think>.*?</think>", "", text, flags=re.S).strip()

def wrap(text: str) -> str:
    """Put untrusted text inside a data block (prompt-injection defence)."""
    return f"<data>\n{text}\n</data>"
