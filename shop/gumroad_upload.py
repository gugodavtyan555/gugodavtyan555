"""Creates the shop's products on Gumroad and writes the checkout links
back into products.json.

Needs a Gumroad access token on api.gumroad.com (the Claude Code cloud
proxy injects it; elsewhere set GUMROAD_TOKEN). Products that already
have a checkout link are skipped, so it is safe to run again.

Usage: python3 gumroad_upload.py [dist/upload]
"""
import json
import os
import subprocess
import sys
from pathlib import Path

API = "https://api.gumroad.com/v2"
ROOT = Path(__file__).resolve().parent
UPLOAD = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "dist" / "upload"
ZIPS = {
    "budget-planner": "Monthly-Budget-Planner.zip",
    "debt-payoff-planner": "Debt-Payoff-Planner.zip",
    "small-business-tracker": "Small-Business-Income-Expense-Tracker.zip",
    "savings-goals-tracker": "Savings-Goals-Tracker.zip",
    "2027-planner": "2027-Planner.zip",
    "money-bundle": "Complete-Money-Bundle.zip",
    "holiday-budget-planner": "Holiday-Gift-Budget-Planner.zip",
    "free-budget-template": "Free-One-Page-Budget.zip",
    "word-search-large-print": "Large-Print-Word-Search.zip",
    "sudoku-puzzle-book": "Sudoku-Puzzle-Book.zip",
    "mazes-for-kids": "Mazes-for-Kids.zip",
    "puzzle-bundle": "Puzzle-Book-Bundle.zip",
    "christmas-party-games": "Christmas-Party-Games.zip",
    "thanksgiving-party-games": "Thanksgiving-Party-Games.zip",
    "murder-mystery-mistletoe-manor": "Murder-Mystery-Mistletoe-Manor.zip",
    "new-years-eve-party-games": "New-Years-Eve-Party-Games.zip",
    "escape-room-clockwork-lab": "Escape-Room-Clockwork-Lab.zip",
}
PERMALINKS = {
    "budget-planner": "budget-planner",
    "debt-payoff-planner": "debt-payoff-planner",
    "small-business-tracker": "business-tracker",
    "savings-goals-tracker": "savings-tracker",
    "2027-planner": "planner-2027",
    "money-bundle": "money-bundle",
    "holiday-budget-planner": "holiday-budget",
    "free-budget-template": "free-budget",
    "word-search-large-print": "word-search",
    "sudoku-puzzle-book": "sudoku",
    "mazes-for-kids": "mazes",
    "puzzle-bundle": "puzzle-bundle",
    "christmas-party-games": "christmas-games",
    "thanksgiving-party-games": "thanksgiving-games",
    "murder-mystery-mistletoe-manor": "murder-mystery",
    "new-years-eve-party-games": "new-years-eve-games",
    "escape-room-clockwork-lab": "escape-room",
}


def curl(method, url, data=None, binary=None, headers_out=False):
    cmd = ["curl", "-sS", "-m", "300", "-X", method, url]
    token = os.environ.get("GUMROAD_TOKEN")
    if token and url.startswith(API):
        cmd += ["-H", f"Authorization: Bearer {token}"]
    if data is not None:
        cmd += ["-H", "Content-Type: application/json", "--data-binary", json.dumps(data)]
    if binary is not None:
        cmd += ["--data-binary", f"@{binary}"]
    if headers_out:
        cmd += ["-D", "-", "-o", "/dev/null"]
    out = subprocess.run(cmd, capture_output=True, text=True, check=True).stdout
    if headers_out:
        return out
    d = json.loads(out)
    if not d.get("success"):
        raise RuntimeError(f"{method} {url}: {d.get('message') or out[:300]}")
    return d


def upload_file(path):
    size = path.stat().st_size
    pre = curl("POST", f"{API}/files/presign", {"filename": path.name, "file_size": size})
    part_size = 100 * 1024 * 1024
    parts = []
    with open(path, "rb") as fh:
        for p in pre["parts"]:
            chunk = UPLOAD / f".part{p['part_number']}"
            chunk.write_bytes(fh.read(part_size))
            headers = curl("PUT", p["presigned_url"], binary=chunk, headers_out=True)
            chunk.unlink()
            etag = next(h.split(":", 1)[1].strip() for h in headers.splitlines() if h.lower().startswith("etag:"))
            parts.append({"part_number": p["part_number"], "etag": etag})
    done = curl("POST", f"{API}/files/complete", {"upload_id": pre["upload_id"], "key": pre["key"], "parts": parts})
    return done["file_url"]


def description_html(p):
    items = "".join(f"<li>{f}</li>" for f in p["features"])
    return (f"<p>{p['short']}</p><p><strong>What you get:</strong></p><ul>{items}</ul>"
            f"<p>Format: {p['format']}. Instant digital download, nothing is shipped. "
            "Sample data is included so you can see how it works.</p>"
            "<p>Personal use license. Please do not resell or share the files.</p>")


def main():
    data_path = ROOT / "products.json"
    data = json.loads(data_path.read_text())
    site = data["site_url"].rstrip("/")
    for p in data["products"]:
        if p.get("checkout"):
            print(f"skip {p['id']} (already on Gumroad)")
            continue
        zpath = UPLOAD / ZIPS[p["id"]]
        print(f"{p['id']}: uploading {zpath.name} ...")
        file_url = upload_file(zpath)
        created = curl("POST", f"{API}/products", {
            "name": p["name"],
            "price": int(round(p["price"] * 100)),
            "price_currency_type": "usd",
            "description": description_html(p),
            "custom_permalink": PERMALINKS[p["id"]],
            "custom_summary": p["short"],
            "files": [{"url": file_url, "display_name": zpath.stem.replace("-", " ")}],
            "draft": True,
            **({"customizable_price": True} if not p["price"] else {}),
        })["product"]
        pid = created["id"]
        curl("POST", f"{API}/products/{pid}/covers", {"url": f"{site}/img/{p['id']}.png"})
        pub = curl("PUT", f"{API}/products/{pid}/enable")["product"]
        p["checkout"] = pub.get("short_url") or created.get("short_url")
        p["gumroad_id"] = pid
        data_path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")
        print(f"  published: {p['checkout']}")


if __name__ == "__main__":
    main()
