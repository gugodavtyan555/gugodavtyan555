"""Builds a Teachers Pay Teachers listing kit: for each product a folder with the product file,
4 square thumbnails, a watermarked preview PDF and the listing text.

Usage: python3 tpt_kit.py   (reads ../products.json, ../dist/pz, ../dist/upload, writes ../dist/tpt)
"""
import json
import shutil
import subprocess
import zipfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont
from reportlab.lib.colors import Color
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

ROOT = Path(__file__).resolve().parent.parent
PZ, UPLOAD, SITEIMG = ROOT / "dist" / "pz", ROOT / "dist" / "upload", ROOT / "site" / "img"
OUT = ROOT / "dist" / "tpt"
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

# product id -> TPT details: sample pages, zip, grades, subjects, resource type, extra description lines
TPT = {
    "escape-room-clockwork-lab": dict(pages=["e5-05.png", "e8-08.png"], zip="Escape-Room-Clockwork-Lab.zip",
        grades="2nd, 3rd, 4th, 5th, 6th", subjects="Math, Problem Solving, Critical Thinking", rtype="Escape Room / Activities",
        teach="Perfect for the last day before a break, early finishers, indoor recess, a brain break or a class party. Works with small groups of 3–6 students."),
    "mazes-for-kids": dict(pages=["mz-04.png", "mz2-48.png"], zip="Mazes-for-Kids.zip",
        grades="Kindergarten, 1st, 2nd, 3rd", subjects="Fine Motor Skills, Problem Solving", rtype="Printables / Centers",
        teach="Great for morning work, early finishers, sub plans and fine motor practice. Mazes get harder as students progress."),
    "sudoku-puzzle-book": dict(pages=["su-04.png", "su2-75.png"], zip="Sudoku-Puzzle-Book.zip",
        grades="3rd, 4th, 5th, 6th, 7th, 8th", subjects="Math, Logic, Critical Thinking", rtype="Printables / Activities",
        teach="Use for logic practice, early finishers, math centers or brain breaks. Four levels make differentiation easy."),
    "word-search-large-print": dict(pages=["ws-03.png", "wsa-54.png"], zip="Large-Print-Word-Search.zip",
        grades="3rd, 4th, 5th, 6th, Adult Education, Not Grade Specific", subjects="Vocabulary, Spelling", rtype="Printables / Activities",
        teach="Large, clear letters make these ideal for younger readers, ESL students, special education and seniors' activity programs."),
    "armenian-alphabet-kids": dict(pages=["hp-03.png", "hl-04.png"], zip="Armenian-Alphabet-for-Kids.zip",
        grades="PreK, Kindergarten, 1st, 2nd, Homeschool", subjects="World Languages, Alphabet, Handwriting", rtype="Worksheets / Flash Cards / Posters",
        teach="For Armenian Saturday schools, heritage-language classes, homeschool and families teaching their children to read and write Armenian (Eastern Armenian)."),
    "christmas-party-games": dict(pages=["xb-12.png", "xh-04.png"], zip="Christmas-Party-Games.zip",
        grades="1st, 2nd, 3rd, 4th, 5th, 6th", subjects="Holidays: Christmas, Classroom Community", rtype="Games / Activities",
        teach="Everything you need for a stress-free classroom Christmas party: bingo for the whole class, trivia for teams, charades and a scavenger hunt."),
    "thanksgiving-party-games": dict(pages=["tb-12.png", "th-04.png"], zip="Thanksgiving-Party-Games.zip",
        grades="1st, 2nd, 3rd, 4th, 5th, 6th", subjects="Holidays: Thanksgiving, Classroom Community", rtype="Games / Activities",
        teach="Ready-to-print Thanksgiving activities for the classroom: bingo, trivia, gratitude Table Talk cards and team games."),
    "new-years-eve-party-games": dict(pages=["nb-12.png", "nr-63.png"], zip="New-Years-Eve-Party-Games.zip",
        grades="1st, 2nd, 3rd, 4th, 5th, 6th", subjects="Holidays: New Year, Social Studies", rtype="Games / Activities",
        teach="Great for the first week back in January: New Year traditions around the world, goal-setting Year in Review cards and bingo."),
}


def square(img_path, size=1200, bg=(245, 240, 232)):
    im = Image.open(img_path).convert("RGB")
    im.thumbnail((int(size * 0.84), int(size * 0.84)))
    canvas_ = Image.new("RGB", (size, size), bg)
    shadow = Image.new("RGB", (im.width + 24, im.height + 24), (215, 207, 195))
    canvas_.paste(shadow, ((size - im.width) // 2 + 6, (size - im.height) // 2 + 10))
    canvas_.paste(im, ((size - im.width) // 2, (size - im.height) // 2))
    return canvas_


def cover_square(p, size=1200):
    im = Image.open(SITEIMG / f"{p['id']}.png").convert("RGB")  # 1600x1200 cover
    im = im.resize((size, int(size * im.height / im.width)))
    sq = Image.new("RGB", (size, size), im.getpixel((5, 5)))
    sq.paste(im, (0, (size - im.height) // 2))
    d = ImageDraw.Draw(sq)
    f = ImageFont.truetype(FONT, 40)
    label = "Printable · Letter + A4 · Answer keys" if p["id"] != "armenian-alphabet-kids" else "Printable · Letter + A4 · 39 letters"
    d.rectangle([0, size - 90, size, size], fill=(31, 42, 55))
    d.text((size / 2, size - 45), label, font=f, fill=(255, 255, 255), anchor="mm")
    return sq


def preview_pdf(pages, path, title):
    c = canvas.Canvas(str(path), pagesize=letter)
    W, H = letter
    c.setTitle(f"{title} (preview)")
    for pg in pages:
        c.drawImage(str(PZ / pg), 0, 0, W, H, preserveAspectRatio=True, anchor="c")
        c.saveState()
        c.setFillColor(Color(0.6, 0.6, 0.6, alpha=0.28))
        c.setFont("Helvetica-Bold", 54)
        c.translate(W / 2, H / 2)
        c.rotate(35)
        c.drawCentredString(0, 0, "PREVIEW · Penny & Plan")
        c.restoreState()
        c.showPage()
    c.save()


def listing(p, t):
    feats = "\n".join(f"✓ {f}" for f in p["features"])
    return f"""TITLE (paste into TPT, max 80 characters):
{p['name'][:80]}

PRICE: ${p['price']:.2f}

GRADES: {t['grades']}
SUBJECTS: {t['subjects']}
RESOURCE TYPE: {t['rtype']}
FORMAT: PDF (ZIP with US Letter and A4 versions)

DESCRIPTION (paste everything below):
{p['short']}

{t['teach']}

WHAT'S INCLUDED:
{feats}

HOW TO USE:
1. Download and unzip the file.
2. Print the US Letter or A4 version on your school or home printer.
3. Answer keys are included where needed.

TERMS OF USE: One license is for one teacher or one family. Please don't share or resell the files.

TAGS / KEYWORDS: {p['keywords']}
"""


def main():
    products = {p["id"]: p for p in json.loads((ROOT / "products.json").read_text())["products"]}
    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir(parents=True)
    for n, (pid, t) in enumerate(TPT.items(), 1):
        p = products[pid]
        d = OUT / f"{n:02d}-{pid}"
        d.mkdir()
        shutil.copy(UPLOAD / t["zip"], d / f"PRODUCT-FILE-{t['zip']}")
        cover_square(p).save(d / "thumbnail-1.jpg", quality=92)
        for i, pg in enumerate(t["pages"], 2):
            square(PZ / pg).save(d / f"thumbnail-{i}.jpg", quality=92)
        # 4th thumbnail: the first sample page again, cropped closer to show detail
        im = Image.open(PZ / t["pages"][0]).convert("RGB")
        w, h = im.size
        im.crop((0, 0, w, w)).resize((1200, 1200)).save(d / "thumbnail-4.jpg", quality=92)
        preview_pdf(t["pages"], d / "PREVIEW.pdf", p["name"])
        (d / "LISTING.txt").write_text(listing(p, t))
    z = OUT.parent / "TPT-Listing-Kit.zip"
    with zipfile.ZipFile(z, "w", zipfile.ZIP_DEFLATED) as zf:
        for f in sorted(OUT.rglob("*")):
            if f.is_file():
                zf.write(f, f.relative_to(OUT))
    print("wrote", z, z.stat().st_size // 1024, "KB")


if __name__ == "__main__":
    main()
