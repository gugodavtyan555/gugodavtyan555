"""'Ask a question' helper: builds ask/<lang>.json from the site's own FAQ (FAQPage JSON-LD) and glossary,
and inserts the search box into home, hub and article pages. No AI, no server. Run after schema.py (build.sh)."""
import os, re, glob, json, html
ROOT = "/home/user/gugodavtyan555/ru-site"
TXT = {
 "ru": dict(h="🔍 Задайте вопрос", ph="Например: как отыграть бонус", btn="Найти", note="Ответы из статей Lucky Spin Club. 18+",
            none="Ничего не нашли. Попробуйте другие слова или посмотрите", all="все статьи", more="Читать →", label="Ваш вопрос"),
 "en": dict(h="🔍 Ask a question", ph="For example: how to clear a bonus", btn="Search", note="Answers from Lucky Spin Club articles. 18+",
            none="Nothing found. Try other words or browse", all="all articles", more="Read →", label="Your question"),
 "es": dict(h="🔍 Haz una pregunta", ph="Por ejemplo: cómo liberar un bono", btn="Buscar", note="Respuestas de los artículos de Lucky Spin Club. 18+",
            none="No encontramos nada. Prueba otras palabras o mira", all="todos los artículos", more="Leer →", label="Tu pregunta"),
 "pt": dict(h="🔍 Faça uma pergunta", ph="Por exemplo: como liberar um bônus", btn="Buscar", note="Respostas dos artigos do Lucky Spin Club. 18+",
            none="Não encontramos nada. Tente outras palavras ou veja", all="todos os artigos", more="Ler →", label="Sua pergunta"),
}

def lang_of(rel):
    f = rel.split("/")[0]
    return f if f in ("en", "es", "pt") else "ru"

def text(s):
    return html.unescape(re.sub(r"<[^>]+>", "", s)).strip()

index = {lg: [] for lg in TXT}
pages = []
for full in glob.glob(os.path.join(ROOT, "**", "*.html"), recursive=True):
    rel = os.path.relpath(full, ROOT)
    if rel == "404.html" or rel.startswith("widget/"): continue
    pages.append(rel)
    src = open(full).read(); lg = lang_of(rel)
    title = text(re.search(r"<h1>(.*?)</h1>", src, re.S).group(1)) if "<h1>" in src else ""
    for m in re.finditer(r'<script type="application/ld\+json">(.*?)</script>', src, re.S):
        try: d = json.loads(m.group(1))
        except Exception: continue
        if d.get("@type") == "FAQPage":
            for q in d["mainEntity"]:
                index[lg].append({"q": q["name"], "a": q["acceptedAnswer"]["text"], "u": rel, "t": title})
    if rel.endswith("slovar-kazino.html"):
        for tid, term, dd in re.findall(r'<dt id="([^"]+)">(.*?)</dt><dd>(.*?)</dd>', src, re.S):
            index[lg].append({"q": text(term), "a": text(dd), "u": rel + "#" + tid, "t": title, "g": 1})
os.makedirs(os.path.join(ROOT, "ask"), exist_ok=True)
for lg, items in index.items():
    json.dump(items, open(os.path.join(ROOT, "ask", lg + ".json"), "w"), ensure_ascii=False, separators=(",", ":"))

def widget(lg, root):
    t = TXT[lg]
    return (f'<section class="ask calc" data-ask data-lang="{lg}" data-root="{root}" data-none="{html.escape(t["none"])}" '
            f'data-all="{html.escape(t["all"])}" data-more="{html.escape(t["more"])}">'
            f'<h2>{t["h"]}</h2><form class="ask-form" role="search"><label class="sr-only" for="ask-q">{t["label"]}</label>'
            f'<input type="search" id="ask-q" name="q" placeholder="{html.escape(t["ph"])}" autocomplete="off">'
            f'<button type="submit" class="btn small">{t["btn"]}</button></form>'
            f'<div class="ask-res" aria-live="polite"></div><p class="note">{t["note"]}</p></section>\n')

n = 0
for rel in pages:
    full = os.path.join(ROOT, rel); src = open(full).read()
    if "data-ask" in src: continue
    lg = lang_of(rel); root = "../" * rel.count("/")
    base = os.path.basename(rel)
    w = widget(lg, root)
    if base == "index.html" and rel.count("/") <= 1:
        if '<section class="home-finder">' in src:
            src = re.sub(r'(<section class="home-finder">.*?</section>\n)', lambda m: m.group(1) + "    " + w, src, count=1, flags=re.S)
        else:
            src = re.sub(r'(<section class="hero">.*?</section>\n)', lambda m: m.group(1) + "    " + w, src, count=1, flags=re.S)
    elif base == "stati.html":
        src = src.replace("    </article>\n", "    </article>\n    " + w, 1)
    elif "/articles/" in "/" + rel:
        if '<section class="related">' in src:
            src = src.replace('<section class="related">', w + '    <section class="related">', 1)
        else:
            src = src.replace("  </main>", "    " + w + "  </main>", 1)
    else:
        continue
    src = src.replace("</body>", f'<script src="{root}ask.js" defer></script>\n</body>', 1)
    open(full, "w").write(src); n += 1
print("ask: index", {k: len(v) for k, v in index.items()}, "| widget on", n, "pages")
