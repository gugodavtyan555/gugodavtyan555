"""Builds the static shop site from products.json and articles.py.

Usage: python3 build_site.py   (writes into ../site)
"""
import html
import json
from datetime import date
from pathlib import Path

from articles import ARTICLES

ROOT = Path(__file__).resolve().parent.parent
SITE = ROOT / "site"
DATA = json.loads((ROOT / "products.json").read_text())
BRAND = DATA["brand"]
URL = DATA["site_url"].rstrip("/")
PRODUCTS = DATA["products"]
PROMO = DATA.get("promo") if DATA.get("promo") and date.today().isoformat() <= DATA["promo"]["ends"] else None


def promo_price(p):
    return round(p["price"] * (100 - PROMO["percent"]) / 100, 2) if PROMO and p["price"] else p["price"]
E = html.escape

CSS = """
:root{--ink:#1F2A37;--muted:#5B6573;--line:#DDE3E0;--bg:#F7FAF8;--card:#FFFFFF;--accent:#2F7D5B;--accent-ink:#FFFFFF;--soft:#E3F1EA}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){--ink:#E8EEEA;--muted:#A3AFA8;--line:#2C3833;--bg:#121916;--card:#1A231F;--accent:#5DBB8C;--accent-ink:#0E1512;--soft:#1F3229}}
:root[data-theme="dark"]{--ink:#E8EEEA;--muted:#A3AFA8;--line:#2C3833;--bg:#121916;--card:#1A231F;--accent:#5DBB8C;--accent-ink:#0E1512;--soft:#1F3229}
*{box-sizing:border-box}
body{margin:0;font-family:Inter,system-ui,-apple-system,"Segoe UI",sans-serif;background:var(--bg);color:var(--ink);line-height:1.6;font-size:17px}
a{color:var(--accent)}
.promo{background:var(--accent);color:var(--accent-ink);text-align:center;padding:9px 16px;font-size:15px}
.wrap{max-width:1120px;margin:0 auto;padding:0 20px}
header.top{border-bottom:1px solid var(--line);background:var(--card)}
header.top .wrap{display:flex;align-items:center;justify-content:space-between;height:64px;gap:16px}
.logo{font-weight:800;font-size:20px;color:var(--ink);text-decoration:none;letter-spacing:-.01em}
.logo span{color:var(--accent)}
nav a{color:var(--muted);text-decoration:none;margin-left:20px;font-size:15px}
nav a:hover{color:var(--ink)}
.hero{padding:72px 0 48px}
.hero h1{font-size:clamp(34px,5vw,56px);line-height:1.08;margin:0 0 18px;letter-spacing:-.02em;max-width:780px}
.hero p{font-size:20px;color:var(--muted);max-width:640px;margin:0 0 28px}
.btn{display:inline-block;background:var(--accent);color:var(--accent-ink);padding:14px 26px;border-radius:10px;font-weight:700;text-decoration:none;border:0;font-size:17px;cursor:pointer}
.btn.ghost{background:transparent;color:var(--accent);border:2px solid var(--accent)}
.btn[aria-disabled="true"]{opacity:.55;cursor:not-allowed}
.trust{display:flex;flex-wrap:wrap;gap:10px 26px;color:var(--muted);font-size:15px;margin-top:26px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:24px;padding-bottom:64px}
.card{background:var(--card);border:1px solid var(--line);border-radius:16px;overflow:hidden;display:flex;flex-direction:column;text-decoration:none;color:inherit;transition:transform .15s}
.card:hover{transform:translateY(-3px)}
.card img{width:100%;height:auto;aspect-ratio:4/3;object-fit:cover;display:block;background:var(--soft)}
.card .b{padding:18px 20px 22px;display:flex;flex-direction:column;gap:8px;flex:1}
.card h3{margin:0;font-size:19px;line-height:1.3}
.card p{margin:0;color:var(--muted);font-size:15px;flex:1}
.price{font-weight:800;font-size:20px}
.price s{color:var(--muted);font-weight:500;font-size:16px;margin-left:6px}
.tag{display:inline-block;background:var(--soft);color:var(--accent);font-size:12px;font-weight:700;border-radius:999px;padding:3px 10px;text-transform:uppercase;letter-spacing:.04em}
h2.sec{font-size:30px;margin:0 0 22px;letter-spacing:-.01em}
.band{background:var(--card);border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding:56px 0}
.cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:28px}
.cols h3{margin:0 0 6px;font-size:18px}.cols p{margin:0;color:var(--muted)}
.faq{padding:56px 0}
details{border-bottom:1px solid var(--line);padding:16px 0}
summary{font-weight:700;cursor:pointer}
details p{color:var(--muted);margin:10px 0 0}
footer{border-top:1px solid var(--line);padding:32px 0 48px;color:var(--muted);font-size:14px}
footer a{color:var(--muted);margin-right:16px}
.product{display:grid;grid-template-columns:1.2fr 1fr;gap:44px;padding:44px 0 64px;align-items:start}
.product img{width:100%;height:auto;border-radius:16px;border:1px solid var(--line);display:block}
.product h1{font-size:clamp(30px,4vw,44px);line-height:1.1;margin:8px 0 12px;letter-spacing:-.02em}
.product .lead{color:var(--muted);font-size:19px;margin:0 0 18px}
.product ul{padding-left:0;list-style:none;margin:22px 0}
.product li{padding:8px 0 8px 30px;position:relative;border-bottom:1px solid var(--line)}
.product li:before{content:"✓";position:absolute;left:4px;color:var(--accent);font-weight:800}
.note{font-size:14px;color:var(--muted);margin-top:12px}
.buybox{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:24px}
article.post{max-width:740px;margin:0 auto;padding:44px 20px 64px}
article.post h1{font-size:clamp(30px,4vw,42px);line-height:1.15;letter-spacing:-.02em}
article.post h2{margin-top:36px}
article.post table{border-collapse:collapse;width:100%;font-size:15px}
article.post td,article.post th{border:1px solid var(--line);padding:8px 10px;text-align:left}
.cta{background:var(--soft);border-radius:14px;padding:22px;margin:32px 0}
.crumb{font-size:14px;color:var(--muted);padding-top:24px}
@media (max-width:820px){.product{grid-template-columns:1fr}nav a{margin-left:12px}nav .hide-sm{display:none}}
"""


def layout(title, description, body, path="", image=None, extra_head=""):
    canonical = f"{URL}/{path}"
    og_img = f"{URL}/img/{image}" if image else f"{URL}/img/money-bundle.png"
    return f"""<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{E(title)}</title>
<meta name="description" content="{E(description)}">
<link rel="canonical" href="{canonical}">
<meta property="og:title" content="{E(title)}"><meta property="og:description" content="{E(description)}">
<meta property="og:image" content="{og_img}"><meta property="og:url" content="{canonical}"><meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
{f'<meta name="google-site-verification" content="{E(DATA["google_site_verification"])}">' if DATA.get("google_site_verification") else ""}
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='22' fill='%232F7D5B'/><text x='50' y='68' font-size='58' text-anchor='middle' fill='white' font-family='Arial' font-weight='700'>P</text></svg>">
<style>{CSS}</style>
{extra_head}
</head><body>
{promo_bar()}
<header class="top"><div class="wrap">
<a class="logo" href="/">Penny <span>&amp;</span> Plan</a>
<nav><a href="/#shop">Shop</a><a href="/blog/">Guides</a><a class="hide-sm" href="/#faq">FAQ</a></nav>
</div></header>
{body}
<footer><div class="wrap">
<p><a href="/">Shop</a><a href="/blog/">Guides</a><a href="/license.html">License &amp; refunds</a><a href="/privacy.html">Privacy</a></p>
<p>&copy; {date.today().year} {BRAND}. Digital products, delivered instantly by email after checkout. Prices in USD.</p>
</div></footer>
</body></html>"""


def promo_bar():
    if not PROMO:
        return ""
    return (f'<div class="promo" data-ends="{PROMO["ends"]}">Launch sale: <b>{PROMO["percent"]}% off everything</b> with code '
            f'<b>{PROMO["code"]}</b>, until {date.fromisoformat(PROMO["ends"]).strftime("%B %-d")}.</div>'
            '<script>(function(){var b=document.querySelector(".promo");if(b&&new Date()>new Date(b.dataset.ends+"T23:59:59Z"))b.remove();})()</script>')


def buy_button(p, big=False):
    # Buy links go through /go/<id> on our own worker, which counts the click and redirects
    # to the Gumroad checkout (with the promo code when a promo is running).
    if p.get("checkout"):
        href = f'/go/{p["id"]}'
        if not p["price"]:
            return f'<a class="btn" href="{href}" rel="nofollow">Download free</a>'
        if PROMO:
            return (f'<a class="btn" href="{href}" rel="nofollow">Buy now · ${promo_price(p):.2f}</a>'
                    f'<p class="note">{PROMO["percent"]}% launch discount applied at checkout (code {PROMO["code"]}, until {PROMO["ends"]}).</p>')
        return f'<a class="btn" href="{href}" rel="nofollow">Buy now · ${p["price"]}</a>'
    return '<span class="btn" aria-disabled="true">Coming soon</span>'


def price_html(p):
    if not p["price"]:
        return "Free"
    if PROMO:
        return f'${promo_price(p):.2f}<s>${p["price"]}</s>'
    s = f'${p["price"]}'
    if p.get("compare_at"):
        s += f'<s>${p["compare_at"]}</s>'
    return s


def card(p):
    return f"""<a class="card" href="/p/{p['id']}.html">
<img src="/img/{p['id']}.png" alt="{E(p['name'])} preview" loading="lazy" width="1600" height="1200">
<div class="b"><span class="tag">{E(p['format'])}</span><h3>{E(p['name'])}</h3><p>{E(p['short'])}</p>
<div class="price">{price_html(p)}</div></div></a>"""


FAQ = [
    ("How do I get my files?", "Right after payment you get a download link on screen and by email. No account needed."),
    ("Do the spreadsheets work in Google Sheets?", "Yes. Open sheets.new, choose File > Import > Upload and pick the file. They also work in Microsoft Excel, LibreOffice and Apple Numbers."),
    ("Which apps does the planner work in?", "Any PDF app. On an iPad, GoodNotes, Notability and Noteshelf keep the links clickable. The Letter and A4 versions are for printing at home."),
    ("Can I change the categories and currency?", "Yes. Every template has a Setup sheet where you rename categories and set your currency symbol. The formulas follow your changes."),
    ("What if something does not work for me?", "Email us within 14 days and we will help you fix it or refund you. See License & refunds."),
]


def home():
    order = ["holiday-budget-planner", "money-bundle", "free-budget-template", "budget-planner", "debt-payoff-planner", "small-business-tracker", "savings-goals-tracker", "2027-planner"]
    items = sorted(PRODUCTS, key=lambda p: order.index(p["id"]) if p["id"] in order else 99)
    faq_ld = {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
        {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in FAQ]}
    body = f"""
<section class="hero"><div class="wrap">
<h1>Budget, debt and business spreadsheets that do the math for you.</h1>
<p>{E(DATA['tagline'])} Ready-made templates for Excel and Google Sheets, plus a 2027 planner for iPad and print.</p>
<a class="btn" href="#shop">Browse templates</a> &nbsp; <a class="btn ghost" href="/p/money-bundle.html">Get all 5 for $29</a>
<div class="trust"><span>✓ Instant download</span><span>✓ Excel &amp; Google Sheets</span><span>✓ No subscription</span><span>✓ 14-day help or refund</span></div>
</div></section>
<section id="shop"><div class="wrap"><h2 class="sec">Templates</h2><div class="grid">{''.join(card(p) for p in items)}</div></div></section>
<section class="band"><div class="wrap"><div class="cols">
<div><h3>Type a number, everything updates</h3><p>Dashboards, charts and totals are live formulas. No macros, no add-ons.</p></div>
<div><h3>Made to be edited</h3><p>Rename categories, change the currency, add rows. Yellow cells are yours; the rest is calculated.</p></div>
<div><h3>Yours to keep</h3><p>Pay once and keep the files forever, with no account and no monthly fee.</p></div>
</div></div></section>
<section class="faq" id="faq"><div class="wrap"><h2 class="sec">Questions</h2>
{''.join(f'<details><summary>{E(q)}</summary><p>{E(a)}</p></details>' for q, a in FAQ)}
</div></section>"""
    head = f'<script type="application/ld+json">{json.dumps(faq_ld)}</script>'
    return layout(f"{BRAND} · Budget & Finance Spreadsheet Templates for Excel and Google Sheets",
                  "Budget planner, debt payoff calculator, small business bookkeeping and savings tracker spreadsheets for Excel and Google Sheets, plus a 2027 hyperlinked planner.",
                  body, "", None, head)


def product_page(p):
    ld = {"@context": "https://schema.org", "@type": "Product", "name": p["name"], "description": p["short"],
          "image": f"{URL}/img/{p['id']}.png", "brand": {"@type": "Brand", "name": BRAND},
          "offers": {"@type": "Offer", "price": str(p["price"]), "priceCurrency": "USD",
                     "availability": "https://schema.org/InStock" if p.get("checkout") else "https://schema.org/PreOrder",
                     "url": f"{URL}/p/{p['id']}.html"}}
    others = [o for o in PRODUCTS if o["id"] != p["id"]][:3]
    related = [a for a in ARTICLES if p["id"] in a["products"]]
    rel_html = "".join(f'<p>Guide: <a href="/blog/{a["slug"]}.html">{E(a["title"])}</a></p>' for a in related)
    body = f"""<div class="wrap"><div class="crumb"><a href="/">Shop</a> / {E(p['name'])}</div>
<div class="product"><div><img src="/img/{p['id']}.png" alt="{E(p['name'])} preview" width="1600" height="1200"></div>
<div class="buybox"><span class="tag">{E(p['format'])}</span><h1>{E(p['name'])}</h1>
<p class="lead">{E(p['short'])}</p><div class="price" style="font-size:28px;margin-bottom:16px">{price_html(p)}</div>
{buy_button(p, True)}
<p class="note">Instant digital download. Nothing is shipped. Sample data is included so you can see how it works.</p>
<ul>{''.join(f'<li>{E(f)}</li>' for f in p['features'])}</ul>
{rel_html}
</div></div>
<h2 class="sec">You may also like</h2><div class="grid">{''.join(card(o) for o in others)}</div></div>"""
    head = f'<script type="application/ld+json">{json.dumps(ld)}</script>'
    return layout(f"{p['name']} · {p['format']} · {BRAND}", f"{p['short']} Instant download.",
                  body, f"p/{p['id']}.html", f"{p['id']}.png", head)


def article_page(a):
    prods = [p for p in PRODUCTS if p["id"] in a["products"]]
    cta = "".join(f'<div class="cta"><strong>{E(p["name"])}</strong>: {E(p["short"])}<br><br><a class="btn" href="/p/{p["id"]}.html">See the template · ${p["price"]}</a></div>' for p in prods[:1])
    ld = {"@context": "https://schema.org", "@type": "Article", "headline": a["title"], "description": a["description"],
          "datePublished": a["date"], "author": {"@type": "Organization", "name": BRAND}}
    body = f"""<article class="post"><div class="crumb"><a href="/blog/">Guides</a></div>
<h1>{E(a['title'])}</h1>{a['html']}{cta}</article>"""
    return layout(f"{a['title']} · {BRAND}", a["description"], body, f"blog/{a['slug']}.html",
                  f"{prods[0]['id']}.png" if prods else None, f'<script type="application/ld+json">{json.dumps(ld)}</script>')


def blog_index():
    items = "".join(f'<details open><summary><a href="/blog/{a["slug"]}.html">{E(a["title"])}</a></summary><p>{E(a["description"])}</p></details>' for a in ARTICLES)
    return layout(f"Money guides · {BRAND}", "Practical guides to budgeting, paying off debt, saving and simple bookkeeping.",
                  f'<article class="post"><h1>Money guides</h1>{items}</article>', "blog/")


def simple(title, path, inner):
    return layout(f"{title} · {BRAND}", title, f'<article class="post"><h1>{E(title)}</h1>{inner}</article>', path)


LICENSE = """<h2>License</h2><p>When you buy a template you get a personal-use license: use it for your own household or your own business, as many years as you like. Please do not resell, share or redistribute the files, or upload them to template sites.</p>
<h2>Refunds</h2><p>Because these are instant digital downloads, sales are generally final. If a file does not work for you, contact us within 14 days through the receipt email and we will help you fix it or refund you in full.</p>
<h2>Not financial advice</h2><p>The templates are planning tools. Results depend on the numbers you enter. For tax or legal questions, ask a qualified professional.</p>"""
PRIVACY = """<p>This site does not use accounts. Payments are processed by our checkout provider, which receives your email and payment details to deliver your files and send a receipt; we never see your card number.</p>
<p>We count page views and clicks on the buy buttons to see which pages are useful. We store only the page, the referring site, your country and whether you use a phone or a computer: no cookies, no IP addresses and no personal identifiers. We do not set advertising cookies and we do not sell personal data.</p>"""


def main():
    (SITE / "p").mkdir(parents=True, exist_ok=True)
    (SITE / "blog").mkdir(parents=True, exist_ok=True)
    pages = {"index.html": home(), "blog/index.html": blog_index(),
             "license.html": simple("License & refunds", "license.html", LICENSE),
             "privacy.html": simple("Privacy", "privacy.html", PRIVACY)}
    for p in PRODUCTS:
        pages[f"p/{p['id']}.html"] = product_page(p)
    for a in ARTICLES:
        pages[f"blog/{a['slug']}.html"] = article_page(a)
    for path, content in pages.items():
        (SITE / path).write_text(content)
    today = date.today().isoformat()
    urls = "".join(f"<url><loc>{URL}/{'' if k == 'index.html' else k.replace('index.html', '')}</loc><lastmod>{today}</lastmod></url>"
                   for k in pages)
    (SITE / "sitemap.xml").write_text(f'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">{urls}</urlset>')
    # IndexNow key (Bing, Yandex, Seznam...): proves we own the site when pinging new URLs.
    (SITE / "8f3c1d2e9a7b4c6d5e0f1a2b3c4d5e6f.txt").write_text("8f3c1d2e9a7b4c6d5e0f1a2b3c4d5e6f")
    (SITE / "robots.txt").write_text(f"User-agent: *\nAllow: /\nSitemap: {URL}/sitemap.xml\n")
    (SITE / "404.html").write_text(simple("Page not found", "404.html", '<p><a href="/">Back to the shop</a></p>'))
    print(f"built {len(pages)} pages into {SITE}")


if __name__ == "__main__":
    main()
