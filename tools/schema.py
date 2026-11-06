"""Add BreadcrumbList / Article / WebSite JSON-LD to every generated page. Idempotent: replaces its own block (data-lsc="schema").
Run after gen.py and i18n.py. Keeps datePublished from an earlier run."""
import os, re, json, html, datetime, urllib.parse
ROOT = "/home/user/gugodavtyan555/ru-site"
BASE = "https://lucky-spin-ru.netlify.app"
TODAY = datetime.date.today().isoformat()
FIRST = "2026-11-05"
ORG = {"@type": "Organization", "name": "Lucky Spin Club", "url": BASE + "/"}
BLOCK_RE = re.compile(r'<script type="application/ld\+json" data-lsc="schema">.*?</script>\n?', re.S)

def text(s):
    return html.unescape(re.sub(r"<[^>]+>", "", s)).strip()

n = 0
for dp, dn, fn in os.walk(ROOT):
    for f in fn:
        if not f.endswith(".html"): continue
        full = os.path.join(dp, f); rel = os.path.relpath(full, ROOT)
        if rel == "404.html" or rel.startswith("widget/"): continue
        src = open(full).read()
        m = re.search(r'<link rel="canonical" href="([^"]+)"', src)
        if not m: continue
        canon = m.group(1)
        old = BLOCK_RE.search(src)
        published = FIRST
        if old:
            pm = re.search(r'"datePublished": "([^"]+)"', old.group(0))
            if pm: published = pm.group(1)
        src = BLOCK_RE.sub("", src)
        lang = re.search(r'<html lang="([a-z]+)"', src).group(1)
        graph = []
        cm = re.search(r'<div class="crumbs">(.*?)</div>', src, re.S)
        if cm:
            parts = cm.group(1).split(" / ")
            items = []
            for i, part in enumerate(parts):
                am = re.search(r'<a href="([^"]+)">(.*?)</a>', part)
                if am:
                    url = urllib.parse.urljoin(canon, am.group(1))
                    url = re.sub(r"/index\.html$", "/", url)
                    items.append({"@type": "ListItem", "position": i + 1, "name": text(am.group(2)), "item": url})
                else:
                    items.append({"@type": "ListItem", "position": i + 1, "name": text(part), "item": canon})
            graph.append({"@type": "BreadcrumbList", "itemListElement": items})
        if "/articles/" in "/" + rel:
            h1 = text(re.search(r"<h1>(.*?)</h1>", src, re.S).group(1))
            desc = re.search(r'<meta name="description" content="([^"]*)"', src)
            img = re.search(r'<meta property="og:image" content="([^"]+)"', src)
            art = {"@type": "Article", "headline": h1[:110], "inLanguage": lang, "mainEntityOfPage": canon,
                   "datePublished": published, "dateModified": "2026-11-06", "author": ORG, "publisher": ORG}
            if desc: art["description"] = html.unescape(desc.group(1))
            if img: art["image"] = img.group(1)
            graph.append(art)
        if f == "index.html" and rel.count("/") <= 1:
            graph.append({"@type": "WebSite", "name": "Lucky Spin Club", "url": canon, "inLanguage": lang, "publisher": ORG})
        if not graph:
            open(full, "w").write(src); continue
        block = '<script type="application/ld+json" data-lsc="schema">' + json.dumps({"@context": "https://schema.org", "@graph": graph}, ensure_ascii=False) + '</script>\n'
        src = src.replace("</head>", block + "</head>", 1)
        open(full, "w").write(src); n += 1
print("schema added to", n, "pages")
