"""Packs ../site into one Cloudflare worker script (worker/worker.js).

The whole shop is ~1.4 MB, well under the free size limit, so it is served
straight from memory with no separate asset upload. The request handling
(stats, /go/ buy redirects) lives in worker_template.js.
"""
import base64
import json
import mimetypes
from pathlib import Path

from build_site import PRODUCTS, PROMO

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
SITE = ROOT / "site"
OUT = ROOT / "worker" / "worker.js"

TEXT = {".html", ".xml", ".txt", ".css", ".js", ".json", ".svg"}


def checkout_url(p):
    if PROMO and p["price"]:
        return f'{p["checkout"]}/{PROMO["code"]}'
    return p["checkout"]


def main():
    files = {}
    for f in sorted(SITE.rglob("*")):
        if not f.is_file():
            continue
        rel = "/" + f.relative_to(SITE).as_posix()
        ctype = mimetypes.guess_type(f.name)[0] or "application/octet-stream"
        if f.suffix in TEXT:
            files[rel] = {"t": ctype + "; charset=utf-8", "s": f.read_text()}
        else:
            files[rel] = {"t": ctype, "b": base64.b64encode(f.read_bytes()).decode()}
    go = {p["id"]: checkout_url(p) for p in PRODUCTS if p.get("checkout")}
    js = (HERE / "worker_template.js").read_text()
    js = js.replace("/*FILES*/", json.dumps(files), 1).replace("/*GO*/", json.dumps(go), 1)
    OUT.parent.mkdir(exist_ok=True)
    OUT.write_text(js)
    print(f"packed {len(files)} files into {OUT} ({OUT.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
