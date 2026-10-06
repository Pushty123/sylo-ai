"""Per-viewer watermark on the confidential brief, plus an access log row."""
import datetime as dt, hashlib
import fitz  # PyMuPDF
from db import supabase

def stamp(pdf_bytes: bytes, user_id: str, user_name: str, project_id: str) -> bytes:
    when = dt.datetime.now().strftime("%d %b %Y %H:%M IST")
    code = hashlib.sha256(f"{user_id}|{project_id}|{when}".encode()).hexdigest()[:10]
    mark = f"{user_name} · {user_id[:8]} · {when} · {code}"
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    for page in doc:
        r = page.rect
        for i in range(3):
            pt = fitz.Point(r.width * 0.12, r.height * (0.3 + 0.25 * i))
            page.insert_text(pt, mark, fontsize=13, color=(0.85, 0.45, 0.2),
                             morph=(pt, fitz.Matrix(-25)))
    out = doc.tobytes()
    supabase.table("access_logs").insert({"user_id": user_id, "file_id": project_id,
                                          "action": "view", "watermark_id": code}).execute()
    return out
