"""Generate a 1200x630 cover for every article (all languages) and wire it in:
<img class="cover"> after the article <h1>, and og:image pointing at the cover.
Idempotent: safe to run after every rebuild."""
import os, re, json, html, subprocess, glob
ROOT = "/home/user/gugodavtyan555/ru-site"
BASE = "https://lucky-spin-ru.netlify.app"
S = "/tmp/claude-0/-workspace/8aeb4342-0200-5c82-93a5-effabca2f09f/scratchpad"
LABEL = {"ru": "Гид для новичков", "en": "Beginner's guide", "es": "Guía para principiantes", "pt": "Guia para iniciantes"}

# slug -> icon from the Russian home page cards
home = open(os.path.join(ROOT, "index.html")).read()
ICON = dict(re.findall(r'<a class="card" href="articles/([a-z0-9-]+)\.html"><div class="ico">([^<]+)</div>', home))

jobs = []
for lg in ["ru", "en", "es", "pt"]:
    d = os.path.join(ROOT, "articles" if lg == "ru" else f"{lg}/articles")
    for f in sorted(glob.glob(d + "/*.html")):
        slug = os.path.basename(f)[:-5]
        src = open(f).read()
        m = re.search(r"<h1>(.*?)</h1>", src, re.S)
        title = html.unescape(re.sub("<[^>]+>", "", m.group(1))).strip()
        out = os.path.join(ROOT, "images", lg, slug + ".jpg")
        jobs.append({"file": f, "lang": lg, "slug": slug, "title": title, "icon": ICON.get(slug, "🎰"),
                     "label": LABEL[lg], "out": out})

todo = [j for j in jobs if not os.path.exists(j["out"])]
if todo:
    json.dump(todo, open(S + "/covers_jobs.json", "w"), ensure_ascii=False)
    subprocess.run(["node", S + "/covers.js", S + "/covers_jobs.json"], check=True)

for j in jobs:
    src = open(j["file"]).read()
    depth = j["file"][len(ROOT) + 1:].count("/")
    rel = "../" * depth + f"images/{j['lang']}/{j['slug']}.jpg"
    img = f'<img class="cover" src="{rel}" width="1200" height="630" alt="{html.escape(j["title"], quote=True)}">'
    src = re.sub(r'\n?<img class="cover"[^>]*>', "", src)
    src = re.sub(r"(<h1>.*?</h1>)", lambda m: m.group(1) + "\n      " + img, src, count=1, flags=re.S)
    abs_url = f"{BASE}/images/{j['lang']}/{j['slug']}.jpg"
    src = re.sub(r'<meta property="og:image" content="[^"]*">', f'<meta property="og:image" content="{abs_url}">', src, count=1)
    open(j["file"], "w").write(src)
print("covers:", len(jobs), "articles,", len(todo), "new images")
