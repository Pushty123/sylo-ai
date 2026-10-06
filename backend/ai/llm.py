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

def upper_json(system: str, user: str) -> dict:
    prompt = f"{system}\n{C.DATA_RULE}\nReply with JSON only.\n\n{user}"
    if C.UPPER_PROVIDER == "groq":
        r = httpx.post("https://api.groq.com/openai/v1/chat/completions",
                       headers={"Authorization": f"Bearer {C.GROQ_API_KEY}"},
                       json={"model": C.GROQ_MODEL, "response_format": {"type": "json_object"},
                             "messages": [{"role": "system", "content": system + "\n" + C.DATA_RULE},
                                          {"role": "user", "content": user + "\nReply with JSON only."}]},
                       timeout=60)
        r.raise_for_status()
        return _parse(r.json()["choices"][0]["message"]["content"])
    r = httpx.post(f"https://generativelanguage.googleapis.com/v1beta/models/{C.GEMINI_MODEL}:generateContent",
                   params={"key": C.GEMINI_API_KEY},
                   json={"contents": [{"parts": [{"text": prompt}]}],
                         "generationConfig": {"responseMimeType": "application/json"}},
                   timeout=60)
    r.raise_for_status()
    return _parse(r.json()["candidates"][0]["content"]["parts"][0]["text"])

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
