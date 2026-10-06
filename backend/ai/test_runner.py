"""Runs a submitted model on hidden test images in a separate process with a timeout.
The submission file must define predict(image_path) -> label.
Hidden images and labels never leave this server; only scores are returned.
Production: run inside an isolated Docker container."""
import json, subprocess, sys, textwrap
from . import config as C

RUNNER = textwrap.dedent('''
import csv, importlib.util, json, os, sys, time
sub, folder = sys.argv[1], sys.argv[2]
spec = importlib.util.spec_from_file_location("submission", sub)
mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
rows = list(csv.DictReader(open(os.path.join(folder, "labels.csv"))))
correct, t0 = 0, time.time()
for r in rows:
    if str(mod.predict(os.path.join(folder, r["file"]))) == r["label"]:
        correct += 1
n = max(len(rows), 1)
print(json.dumps({"accuracy": round(100 * correct / n, 1), "sec_per_image": round((time.time() - t0) / n, 2), "images": len(rows)}))
''')

def run(submission_path: str) -> dict:
    try:
        p = subprocess.run([sys.executable, "-c", RUNNER, submission_path, C.HIDDEN_TEST_DIR],
                           capture_output=True, text=True, timeout=C.TEST_TIMEOUT_SEC)
        if p.returncode != 0:
            return {"error": "submission crashed", "detail": p.stderr[-400:]}
        return json.loads(p.stdout.strip().splitlines()[-1])
    except subprocess.TimeoutExpired:
        return {"error": f"timed out after {C.TEST_TIMEOUT_SEC}s"}
