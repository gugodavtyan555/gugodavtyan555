import os, json, html as H, datetime, re
S = "/tmp/claude-0/-workspace/8aeb4342-0200-5c82-93a5-effabca2f09f/scratchpad"
ROOT = "/home/user/gugodavtyan555/ru-site"
BASE = "https://lucky-spin-ru.netlify.app"
exec(open(S + "/i18n_text.py").read())
exec(open(S + "/legal.py").read())
exec(open(S + "/i18n_more.py").read())
exec(open(S + "/casino_pages.py").read())
exec(open(S + "/calc_pages.py").read())
CALC_ARTS = {"chto-takoe-vejdzher", "kak-poluchit-bonus", "frispiny"}
exec(open(S + "/bank_pages.py").read())
BANK_ARTS = {"kak-rabotayut-sloty", "otvetstvennaya-igra"}
exec(open(S + "/hub.py").read())
exec(open(S + "/quiz_pages.py").read())
def calc_promo(lg, pre):
    t = CT2[lg]
    return f'<div class="box calc-promo"><p>{t["promo"]}</p><a class="btn small" href="{pre}kalkulyator.html">{t["promo_btn"]}</a></div>'
CASINOS = None
_g = {}
# Load casino facts (currency lists) from casinos.py without running its page() call.
src = open(S + "/casinos.py").read().split("import html as _hh")[0]
exec(src, _g)
CASINOS = {c["id"]: c for c in _g["CASINOS"]}
LANGS = ["en", "es", "pt"]
BASE_PAGES = ["index.html", "stati.html", "kazino.html", "o-sajte.html", "privacy.html"]
def lang_pages(lg):
    return BASE_PAGES + [f"articles/{s}.html" for s in LANG_ARTS[lg]] + [f"kazino/{i}.html" for i in CASINO_LANGS[lg]] + (["kalkulyator.html", BANK_SLUG, QUIZ_SLUG, SELF_SLUG] if lg in CALC_LANGS else [])
def avail(path):
    return ["ru"] + [lg for lg in LANGS if path in lang_pages(lg)]

def url(lg, path):
    pre = "" if lg == "ru" else lg + "/"
    return BASE + "/" + pre + ("" if path == "index.html" else path)

def switch(cur, path, rootp):
    out = []
    av = avail(path)
    for lg in ["ru"] + LANGS:
        href = rootp + ("" if lg == "ru" else lg + "/") + (path if lg in av else "index.html")
        cls = ' aria-current="true"' if lg == cur else ""
        out.append(f'<a href="{href}" hreflang="{lg}"{cls}>{lg.upper()}</a>')
    return '<span class="langs">' + "".join(out) + '</span>'

def alts(path):
    s = "".join(f'<link rel="alternate" hreflang="{lg}" href="{url(lg, path)}">\n' for lg in avail(path))
    return s + f'<link rel="alternate" hreflang="x-default" href="{url("ru", path)}">\n'

def cref(lg, text, extra=""):
    return f'<a class="btn ref{extra}" href="#">{text}</a>'

RSS_LINK = {lg: f'<link rel="alternate" type="application/rss+xml" title="Lucky Spin Club ({lg.upper()})" href="{BASE}/{lg}/rss.xml">\n' for lg in ("es", "pt")}
def write(lg, path, title, desc, body, extra_head=""):
    u = UI[lg]
    depth = path.count("/")
    lp = "../" * depth            # to the language root
    rootp = "../" * (depth + 1)   # to the site root
    t = H.escape(title, quote=True); d = H.escape(desc, quote=True)
    page = f'''<!doctype html>
<html lang="{lg}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{t}</title>
<meta name="description" content="{d}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="{url(lg, path)}">
<meta property="og:url" content="{url(lg, path)}">
<meta property="og:type" content="website">
<meta property="og:title" content="{t}">
<meta property="og:description" content="{d}">
<meta property="og:locale" content="{u["locale"]}">
{alts(path)}<meta property="og:image" content="{BASE}/og-{lg}.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎰</text></svg>">
<!-- Yandex.Metrika counter -->
<script>
window.lscLoadMetrika = function () {{
if (window.lscMetrikaLoaded) return; window.lscMetrikaLoaded = true;
(function(m,e,t,r,i,k,a){{m[i]=m[i]||function(){{(m[i].a=m[i].a||[]).push(arguments)}};
m[i].l=1*new Date();
for (var j = 0; j < document.scripts.length; j++) {{if (document.scripts[j].src === r) {{ return; }}}}
k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)}})
(window, document, "script", "https://mc.yandex.ru/metrika/tag.js?id=114096229", "ym");
ym(114096229, "init", {{ssr:true, clickmap:true, accurateTrackBounce:true, trackLinks:true}});
}};
try {{ if (localStorage.getItem("lsc_consent") === "yes") window.lscLoadMetrika(); }} catch (e) {{}}
</script>
<!-- /Yandex.Metrika counter -->
{RSS_LINK.get(lg, "")}<link rel="stylesheet" href="{rootp}style.css">
{extra_head}
</head>
<body>
<div class="wrap">
  <header>
    <a class="logo" href="{lp}index.html">🎰 Lucky <span>Spin</span> Club</a>
    <nav>
      <a class="link" href="{lp}kazino.html">{u["casinos"]}</a>
      <a class="link" href="{lp}stati.html">{u["articles"]}</a>
      {switch(lg, path, rootp)}
      <span class="badge18">18+</span>
      {cref(lg, u["signup"], " small")}
    </nav>
  </header>
  <main>
{body}
  </main>
  <footer>
    <p>{u["foot1"]}</p>
    <p>{u["foot2"]}</p>
    <p>18+ · <a href="{lp}articles/otvetstvennaya-igra.html">{u["rg_link"]}</a> · <a href="{lp}o-sajte.html">{LEGAL[lg]["foot_about"]}</a> · <a href="{lp}privacy.html">{LEGAL[lg]["foot_priv"]}</a> · © <span class="year"></span> Lucky Spin Club</p>
  </footer>
</div>
<script src="{rootp}config.js"></script>
</body>
</html>
'''
    page = page.replace('class="btn ref small" href="#"', f'class="btn ref small" href="{lp}kazino.html"').replace('class="btn ref" href="#"', f'class="btn ref" href="{lp}kazino.html"')
    full = os.path.join(ROOT, lg, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    open(full, "w").write(page)

for lg in LANGS:
    u = UI[lg]
    # Home
    feats = "".join(f'<div class="card"><div class="ico">{i}</div><h3>{a}</h3><p>{b}</p></div>' for i, a, b in u["feats"])
    steps = "".join(f'<div class="card"><h3>{a}</h3><p>{b}</p></div>' for a, b in u["steps"])
    cards = "\n".join(f'<a class="card" href="articles/{s}.html"><div class="ico">{ART[s][lg][0]}</div><h3>{ART[s][lg][1]}</h3><p>{ART[s][lg][2]}</p></a>' for s in LANG_ARTS[lg])
    home = f'''    <section class="hero">
      <div class="slots">🍒 7️⃣ 💎</div>
      <h1>{u["hero_h1"]}</h1>
      <p>{u["hero_p"]}</p>
      {cref(lg, u["hero_btn"])}
      <div class="note"><a href="kazino.html">{u["compare_link"]}</a></div>
      <div class="note">{u["hero_note"]}</div>
    </section>
    <section><h2>{u["why_h2"]}</h2><div class="grid">{feats}</div></section>
    <section><h2>{u["start_h2"]}</h2><div class="grid steps">{steps}</div></section>
    <section><div class="cta"><h2 style="margin-bottom:10px">{u["cta_h2"]}</h2><p>{u["cta_p"]}</p>{cref(lg, u["cta_btn"])}</div></section>
    {"<section>" + calc_promo(lg, "") + bank_promo(lg, "") + "</section>" if lg in CALC_LANGS else ""}
    <section id="articles"><h2>{u["art_h2"]}</h2><div class="grid">
{cards}
    </div><p class="hub-link"><a href="stati.html">{ {"en": "All articles by topic →", "es": "Todos los artículos por tema →", "pt": "Todos os artigos por tema →"}[lg] }</a></p></section>
    <section><div class="rg">{u["rg"]}</div></section>'''
    write(lg, "index.html", u["home_title"], u["home_desc"], home)
    _ti, _de, _bo = hub_parts(lg, [(s, ART[s][lg][0], ART[s][lg][1], ART[s][lg][2]) for s in LANG_ARTS[lg]])
    write(lg, HUB_SLUG, _ti, _de, _bo)

    if lg in CALC_LANGS:
        _ti, _de, _bo, _he = calc_page_parts(lg, "../", lg + "/")
        write(lg, "kalkulyator.html", _ti, _de, _bo.replace('<div class="box"><p>', bank_promo(lg, "") + '<div class="box"><p>', 1), _he)
        _ti, _de, _bo, _he = bank_page_parts(lg, "../", lg + "/")
        write(lg, BANK_SLUG, _ti, _de, _bo, _he)
        for _slug, _fn in ((QUIZ_SLUG, quiz_page_parts), (SELF_SLUG, selftest_page_parts)):
            _ti, _de, _bo, _he = _fn(lg, "../")
            write(lg, _slug, _ti, _de, _bo, _he)
    # Comparison
    def logo_html(c):
        L = {'jozz': (260, 146), 'playfortuna': (260, 146), 'booi': (260, 146), 'spincrypto': (226, 150), 'winity': (500, 300)}
        if c["id"] in L:
            w, h = L[c["id"]]
            return f'<img class="logo" src="../images/logos/{c["id"]}.jpg" width="{w}" height="{h}" alt="{H.escape(c["name"])}">'
        return H.escape(c["name"])
    def card(cid):
        c = CASINOS[cid]; geo, lang_s = CASINO_TXT[cid][lg]
        cur = [u["only_crypto"] if x == "Только криптовалюта" else x for x in c["cur"]]
        chips = "".join(f'<span class="chip">{H.escape(x)}</span>' for x in cur)
        return f'''      <div class="casino">
        <h2>{logo_html(c)}</h2>
        <dl>
          <dt>{u["dt_geo"]}</dt><dd>{H.escape(geo)}</dd>
          <dt>{u["dt_cur"]}</dt><dd class="chips">{chips}</dd>
          <dt>{u["dt_lang"]}</dt><dd>{H.escape(lang_s)}</dd>
        </dl>
        <a class="more-link" href="kazino/{cid}.html">{H.escape(CT[lg]["more"].format(n=c["name"]))}</a>
        <a class="btn casino-ref" data-casino="{cid}" href="#">{u["go"]} {H.escape(c["name"])}</a>
      </div>
'''
    cmp_body = f'''    <article class="compare">
      <div class="crumbs"><a href="index.html">{u["home"]}</a> / {u["cmp_crumb"]}</div>
      <h1>{u["cmp_h1"]}</h1>
      <p>{u["cmp_p1"]}</p>
      <p>{u["cmp_p2"]}</p>
    </article>
    <section class="casinos">
{"".join(card(c) for c in LANG_CASINOS[lg])}    </section>
    <p class="note compare-note">{u["cmp_note"]}</p>'''
    write(lg, "kazino.html", u["cmp_title"], u["cmp_desc"], cmp_body)
    _ids = CASINO_LANGS[lg]; _names = {i: CASINOS[i]["name"] for i in _ids}
    for cid in _ids:
        c = CASINOS[cid]; geo, lang_s = CASINO_TXT[cid][lg]
        cur = [u["only_crypto"] if x == "Только криптовалюта" else x for x in c["cur"]]
        lg_logo = logo_html(c).replace('src="../images/', 'src="../../images/')
        ti, de, bo, he = casino_page_parts(lg, c, geo, lang_s, cur, lg_logo, _ids, _names)
        write(lg, f"kazino/{cid}.html", ti, de, bo, he)

    # Articles
    for s in LANG_ARTS[lg]:
        ico, short, teaser, h1, desc, content, faq = ART[s][lg]
        faq_html = f'\n<section class="faq">\n<h2>{u["faq_h2"]}</h2>\n' + "".join(
            f'<details><summary>{H.escape(q)}</summary><p>{H.escape(a)}</p></details>\n' for q, a in faq) + '</section>'
        ld = {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
            {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in faq]}
        head = '<script type="application/ld+json">' + json.dumps(ld, ensure_ascii=False) + '</script>'
        box = f'<div class="box"><p>{u["box_p"]}</p>{cref(lg, u["box_btn"])}<div class="note">{u["box_note"]} · <a href="../kazino.html">{u["compare_link"]}</a></div></div>'
        order = LANG_ARTS[lg]
        i = order.index(s)
        rel = [order[(i + k) % len(order)] for k in (1, 2, 3)]
        rel_h2 = {"en": "Related articles", "es": "Artículos relacionados", "pt": "Artigos relacionados"}[lg]
        rel_html = f'\n    <section class="related">\n      <h2>{rel_h2}</h2>\n      <div class="grid">\n' + "".join(
            f'        <a class="card" href="{r}.html"><div class="ico">{ART[r][lg][0]}</div><h3>{ART[r][lg][1]}</h3><p>{ART[r][lg][2]}</p></a>\n' for r in rel) + '      </div>\n    </section>'
        if s == "kriptokazino":
            box = ""
        body = f'''    <article>
      <div class="crumbs"><a href="../index.html">{u["home"]}</a> / <a href="../stati.html">{u["articles"]}</a> / {H.escape(short)}</div>
      <h1>{H.escape(h1)}</h1>
{content}
{calc_promo(lg, "../") if lg in CALC_LANGS and s in CALC_ARTS else ""}{bank_promo(lg, "../") if lg in CALC_LANGS and s in BANK_ARTS else ""}{selftest_promo(lg, "../") if lg in CALC_LANGS and s == "otvetstvennaya-igra" else ""}{box}{faq_html}
    </article>{rel_html}'''
        write(lg, f"articles/{s}.html", f"{h1} | Lucky Spin Club", desc, body, head)

for lg in LANGS:
    L = LEGAL[lg]; u = UI[lg]
    upd = {"en": "Updated", "es": "Actualizado", "pt": "Atualizado"}[lg]
    for path, ti, de, h1, ht, crumb in [("o-sajte.html", L["about_title"], L["about_desc"], L["about_h1"], L["about_html"], L["foot_about"]),
                                        ("privacy.html", L["priv_title"], L["priv_desc"], L["priv_h1"], L["priv_html"], L["foot_priv"])]:
        write(lg, path, ti, de, f'''    <article>
      <div class="crumbs"><a href="index.html">{u["home"]}</a> / {crumb}</div>
      <h1>{h1}</h1>
{ht}
      <p class="note">{upd}: {UPDATED[lg]}</p>
    </article>''')

# Sitemap: add the translated URLs (keep the Russian list first).
sm_path = os.path.join(ROOT, "sitemap.xml")
sm = open(sm_path).read()
today = datetime.date.today().isoformat()
extra = "".join(f"  <url><loc>{url(lg, p)}</loc><lastmod>{today}</lastmod></url>\n"
                for lg in LANGS for p in lang_pages(lg) if url(lg, p) not in sm)
sm = sm.replace("</urlset>", extra + "</urlset>")
open(sm_path, "w").write(sm)
print("built", sum(len(lang_pages(l)) for l in LANGS), "pages")

# RSS feeds for Spanish and Portuguese articles
import email.utils as _eu
_pub = _eu.format_datetime(datetime.datetime(2026, 11, 5, 23, 55, tzinfo=datetime.timezone.utc))
_now = _eu.format_datetime(datetime.datetime.now(datetime.timezone.utc))
for lg, (ttl, dsc) in {"es": ("Lucky Spin Club — guía de casinos online", "Artículos para principiantes: bonos y requisito de apuesta, tragamonedas, pagos y juego responsable. 18+"),
                       "pt": ("Lucky Spin Club — guia de cassinos online", "Artigos para iniciantes: bônus e rollover, caça-níqueis, pagamentos e jogo responsável. 18+")}.items():
    items = "".join(f"""  <item>
    <title>{H.escape(ART[s][lg][3])}</title>
    <link>{url(lg, "articles/" + s + ".html")}</link>
    <guid isPermaLink="true">{url(lg, "articles/" + s + ".html")}</guid>
    <description>{H.escape(ART[s][lg][4])}</description>
    <pubDate>{_pub}</pubDate>
  </item>
""" for s in LANG_ARTS[lg])
    open(os.path.join(ROOT, lg, "rss.xml"), "w").write(f"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>{ttl}</title>
  <link>{BASE}/{lg}/</link>
  <atom:link href="{BASE}/{lg}/rss.xml" rel="self" type="application/rss+xml"/>
  <description>{dsc}</description>
  <language>{lg}</language>
  <lastBuildDate>{_now}</lastBuildDate>
{items}</channel>
</rss>
""")
