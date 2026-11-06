"""Publish promo/1 and promo/2 to Telegraph (api.telegra.ph). Converts the simple Markdown used there
to Telegraph nodes. Skips the editorial note line (the italic line right under the title) and the '---' rules."""
import json, re, sys, urllib.request, urllib.parse, os
API = "https://api.telegra.ph"
DIR = "/home/user/gugodavtyan555/promo"
STATE = "/tmp/claude-0/-workspace/8aeb4342-0200-5c82-93a5-effabca2f09f/scratchpad/telegraph_state.json"

def call(method, **params):
    data = urllib.parse.urlencode({k: (json.dumps(v, ensure_ascii=False) if isinstance(v, (list, dict)) else v) for k, v in params.items()}).encode()
    r = json.load(urllib.request.urlopen(urllib.request.Request(f"{API}/{method}", data=data)))
    if not r.get("ok"): raise SystemExit(f"{method} failed: {r}")
    return r["result"]

def inline(text):
    out, pos = [], 0
    for m in re.finditer(r"\*\*(.+?)\*\*|\*(.+?)\*|\[(.+?)\]\((.+?)\)", text):
        if m.start() > pos: out.append(text[pos:m.start()])
        if m.group(1): out.append({"tag": "b", "children": [m.group(1)]})
        elif m.group(2): out.append({"tag": "i", "children": [m.group(2)]})
        else: out.append({"tag": "a", "attrs": {"href": m.group(4)}, "children": [m.group(3)]})
        pos = m.end()
    if pos < len(text): out.append(text[pos:])
    return out

def to_nodes(md):
    lines = md.strip().split("\n")
    title = lines[0].lstrip("# ").strip()
    body = lines[1:]
    # drop the editorial note (first italic line) and horizontal rules
    body = [l for l in body if l.strip() != "---"]
    while body and not body[0].strip(): body.pop(0)
    if body and body[0].startswith("*") and body[0].endswith("*"): body.pop(0)
    nodes, lst, lst_tag = [], [], None
    def flush():
        nonlocal lst, lst_tag
        if lst: nodes.append({"tag": lst_tag, "children": lst})
        lst, lst_tag = [], None
    for l in body:
        s = l.strip()
        if not s: flush(); continue
        if s.startswith("## "): flush(); nodes.append({"tag": "h3", "children": [s[3:]]}); continue
        m = re.match(r"^(\d+)\.\s+(.*)", s)
        if s.startswith("- ") or m:
            tag = "ul" if s.startswith("- ") else "ol"
            if lst_tag and lst_tag != tag: flush()
            lst_tag = tag; lst.append({"tag": "li", "children": inline(s[2:] if tag == "ul" else m.group(2))}); continue
        flush(); nodes.append({"tag": "p", "children": inline(s)})
    flush()
    return title, nodes

state = json.load(open(STATE)) if os.path.exists(STATE) else {}
if "token" not in state:
    acc = call("createAccount", short_name="LuckySpinClub", author_name="Lucky Spin Club", author_url="https://lucky-spin-ru.netlify.app/")
    state["token"] = acc["access_token"]
for f in ["1-rtp-vc.md", "2-wager-pikabu.md"]:
    title, nodes = to_nodes(open(os.path.join(DIR, f)).read())
    if f in state.get("pages", {}):
        p = call("editPage", access_token=state["token"], path=state["pages"][f]["path"], title=title, author_name="Lucky Spin Club",
                 author_url="https://lucky-spin-ru.netlify.app/", content=nodes)
    else:
        p = call("createPage", access_token=state["token"], title=title, author_name="Lucky Spin Club",
                 author_url="https://lucky-spin-ru.netlify.app/", content=nodes)
    state.setdefault("pages", {})[f] = {"path": p["path"], "url": p["url"]}
    print(f, "->", p["url"])
json.dump(state, open(STATE, "w"))
