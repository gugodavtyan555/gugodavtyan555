"""Builds three free lead-magnet PDFs: samplers cut from the paid books plus a printable wedding checklist.

Each free PDF gets its own cover and a closing page that links to the full paid product with the
LAUNCH30 code. Usage: python3 free_pdf.py <dist_dir>   (needs the paid PDFs already built in dist_dir)
"""
import io
import sys
from pathlib import Path

from pypdf import PdfReader, PdfWriter
from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4, letter
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

sys.path.insert(0, str(Path(__file__).parent))
from wedding_xlsx import CHECKLIST  # noqa: E402

pdfmetrics.registerFont(TTFont("Body", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"))
pdfmetrics.registerFont(TTFont("Bold", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"))

INK = HexColor("#1F2A37")
MUTED = HexColor("#6B7280")
LINE = HexColor("#C9D1CC")
SITE = "https://penny-and-plan.pages.dev"

FREE = {
    "free-puzzle-sampler": {
        "file": "Free-Puzzle-Sampler", "accent": "#2F7D5B", "soft": "#E3F1EA",
        "title": ["Free Puzzle", "Sampler"], "sub": "Word search, sudoku and mazes to try at home",
        "parts": [("Large-Print-Word-Search", [2, 3, 4, 53, 54]), ("Sudoku-Puzzle-Book", [2, 4, 5, 67, 68]),
                  ("Mazes-for-Kids", [2, 4, 5, 6, 66, 67])],
        "inside": ["2 large-print word searches with answers", "4 easy sudoku puzzles with answers",
                   "3 mazes for kids with solutions"],
        "upsell": "The Puzzle Book Bundle", "upsell_sub": "50 word searches, 120 sudoku and 60 mazes in one download.",
        "upsell_id": "puzzle-bundle",
    },
    "free-christmas-games": {
        "file": "Free-Christmas-Party-Games", "accent": "#B03A2E", "soft": "#F7E6E3",
        "title": ["Free Christmas", "Party Games"], "sub": "3 printable games for family and friends",
        "parts": [("Christmas-Party-Games", [6, 7, 8, 9, 59, 60, 61, 62])],
        "inside": ["Christmas Trivia: 40 questions with answer key", "Christmas Word Scramble with answers",
                   "Finish the Carol with answers"],
        "upsell": "Christmas Party Games Bundle",
        "upsell_sub": "Scavenger hunt, 30 bingo cards, Who Am I?, charades, Would You Rather, Left-Right game and more.",
        "upsell_id": "christmas-party-games",
    },
    "free-wedding-checklist": {
        "file": "Free-Wedding-Checklist", "accent": "#9C5B6B", "soft": "#F6E9EA",
        "title": ["Free Wedding", "Checklist"], "sub": "Everything to do, from 12 months out to the big day",
        "parts": [],
        "inside": ["33 tasks grouped by month", "Tick-boxes and a notes line for each step",
                   "Print it or fill it in on a tablet"],
        "upsell": "Wedding Planner Spreadsheet + Bridal Shower Games",
        "upsell_sub": "Budget, guest list with RSVPs, vendors and this checklist dated from your wedding day, plus 9 shower games.",
        "upsell_id": "wedding-planner-bundle",
    },
}


def cover(c, W, H, cfg):
    acc, soft = HexColor(cfg["accent"]), HexColor(cfg["soft"])
    c.setFillColor(soft)
    c.rect(0, 0, W, H, stroke=0, fill=1)
    c.setFillColor(acc)
    c.rect(0, H - 18, W, 18, stroke=0, fill=1)
    c.setFont("Bold", 12)
    c.drawCentredString(W / 2, H - 150, "FREE PRINTABLE")
    c.setFillColor(INK)
    y = H - 230
    for line in cfg["title"]:
        c.setFont("Bold", 44)
        c.drawCentredString(W / 2, y, line)
        y -= 54
    c.setFont("Body", 15)
    c.setFillColor(MUTED)
    c.drawCentredString(W / 2, y - 6, cfg["sub"])
    y -= 90
    c.setFillColor(white)
    c.roundRect(70, y - 40 - 32 * len(cfg["inside"]), W - 140, 60 + 32 * len(cfg["inside"]), 12, stroke=0, fill=1)
    c.setFillColor(acc)
    c.setFont("Bold", 14)
    c.drawString(95, y - 8, "Inside")
    c.setFillColor(INK)
    c.setFont("Body", 13)
    for i, s in enumerate(cfg["inside"]):
        c.drawString(95, y - 40 - 32 * i, "✓  " + s)
    c.setFont("Body", 10)
    c.setFillColor(MUTED)
    c.drawCentredString(W / 2, 40, "Penny & Plan · penny-and-plan.pages.dev · Free for personal use")
    c.showPage()


def upsell(c, W, H, cfg):
    acc, soft = HexColor(cfg["accent"]), HexColor(cfg["soft"])
    url = f"{SITE}/p/{cfg['upsell_id']}.html?utm_source=freebie&utm_medium=pdf&utm_campaign={cfg['file'].lower()}"
    c.setFillColor(soft)
    c.rect(0, 0, W, H, stroke=0, fill=1)
    c.setFillColor(INK)
    c.setFont("Bold", 30)
    c.drawCentredString(W / 2, H - 170, "Enjoyed this?")
    c.setFont("Body", 15)
    c.setFillColor(MUTED)
    c.drawCentredString(W / 2, H - 205, "This free sampler is part of a bigger download:")
    c.setFillColor(INK)
    size = 22
    while pdfmetrics.stringWidth(cfg["upsell"], "Bold", size) > W - 120:
        size -= 1
    c.setFont("Bold", size)
    c.drawCentredString(W / 2, H - 270, cfg["upsell"])
    # wrap the sub line
    words, lines, cur = cfg["upsell_sub"].split(), [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if pdfmetrics.stringWidth(t, "Body", 14) > W - 160:
            lines.append(cur)
            cur = w
        else:
            cur = t
    lines.append(cur)
    c.setFont("Body", 14)
    for i, ln in enumerate(lines):
        c.drawCentredString(W / 2, H - 305 - 22 * i, ln)
    y = H - 305 - 22 * len(lines) - 60
    c.setFillColor(white)
    c.roundRect(W / 2 - 190, y - 70, 380, 100, 14, stroke=0, fill=1)
    c.setFillColor(INK)
    c.setFont("Body", 13)
    c.drawCentredString(W / 2, y, "Save 30% with code")
    c.setFillColor(acc)
    c.setFont("Bold", 30)
    c.drawCentredString(W / 2, y - 42, "LAUNCH30")
    by = y - 150
    c.setFillColor(acc)
    c.roundRect(W / 2 - 150, by, 300, 50, 25, stroke=0, fill=1)
    c.setFillColor(white)
    c.setFont("Bold", 16)
    c.drawCentredString(W / 2, by + 18, "Get the full version →")
    c.linkURL(url, (W / 2 - 150, by, W / 2 + 150, by + 50), relative=0)
    c.setFillColor(MUTED)
    c.setFont("Body", 11)
    c.drawCentredString(W / 2, by - 30, f"penny-and-plan.pages.dev/p/{cfg['upsell_id']}.html")
    c.setFont("Body", 10)
    c.drawCentredString(W / 2, 40, "Penny & Plan · Instant digital downloads · Print at home")
    c.showPage()


def checklist_pages(c, W, H, cfg):
    acc = HexColor(cfg["accent"])
    groups = [("12+ months before", 300), ("9–12 months before", 240), ("6–9 months before", 180),
              ("3–6 months before", 90), ("1–3 months before", 30), ("The final month", 3), ("The big day", -1)]
    buckets = []
    lo_prev = 10 ** 6
    for name, lo in groups:
        buckets.append((name, [t for d, t in CHECKLIST if lo < d <= lo_prev] if lo_prev != 10 ** 6
                        else [t for d, t in CHECKLIST if d > lo]))
        lo_prev = lo
    assert sum(len(b) for _, b in buckets) == len(CHECKLIST)

    def head(title):
        c.setFillColor(acc)
        c.rect(0, H - 14, W, 14, stroke=0, fill=1)
        c.setFillColor(INK)
        c.setFont("Bold", 24)
        c.drawString(55, H - 70, title)
        c.setFont("Body", 11)
        c.setFillColor(MUTED)
        c.drawString(55, H - 92, "Tick each task when it's done. Use the line for names, dates or notes.")
        return H - 130

    y = head("Wedding Checklist")
    for name, tasks in buckets:
        need = 30 + 34 * len(tasks)
        if y - need < 60:
            c.setFont("Body", 9)
            c.setFillColor(MUTED)
            c.drawCentredString(W / 2, 30, "Penny & Plan · Free Wedding Checklist")
            c.showPage()
            y = head("Wedding Checklist (continued)")
        c.setFillColor(acc)
        c.setFont("Bold", 14)
        c.drawString(55, y, name)
        y -= 26
        for t in tasks:
            c.setStrokeColor(acc)
            c.setLineWidth(1.2)
            c.rect(57, y - 3, 12, 12, stroke=1, fill=0)
            c.setFillColor(INK)
            c.setFont("Body", 12)
            c.drawString(80, y, t)
            tw = pdfmetrics.stringWidth(t, "Body", 12)
            c.setStrokeColor(LINE)
            c.setLineWidth(0.6)
            if 80 + tw + 20 < W - 55:
                c.line(80 + tw + 14, y - 3, W - 55, y - 3)
            y -= 34
        y -= 10
    c.setFont("Body", 9)
    c.setFillColor(MUTED)
    c.drawCentredString(W / 2, 30, "Penny & Plan · Free Wedding Checklist")
    c.showPage()


def build(out, pid, size, suffix):
    cfg = FREE[pid]
    W, H = size
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=size)
    c.setTitle(" ".join(cfg["title"]))
    c.setAuthor("Penny & Plan")
    cover(c, W, H, cfg)
    if pid == "free-wedding-checklist":
        checklist_pages(c, W, H, cfg)
    upsell(c, W, H, cfg)
    c.save()
    own = PdfReader(io.BytesIO(buf.getvalue()))
    w = PdfWriter()
    for p in own.pages[:-1]:
        w.add_page(p)
    for src, pages in cfg["parts"]:
        r = PdfReader(str(out / f"{src}-{suffix}.pdf"))
        for n in pages:
            w.add_page(r.pages[n - 1])
    w.add_page(own.pages[-1])
    w.add_metadata({"/Title": " ".join(cfg["title"]), "/Author": "Penny & Plan"})
    dest = out / f"{cfg['file']}-{suffix}.pdf"
    with open(dest, "wb") as f:
        w.write(f)
    return dest, len(w.pages)


def main():
    out = Path(sys.argv[1] if len(sys.argv) > 1 else "dist")
    for pid in FREE:
        for size, suffix in ((letter, "US-Letter"), (A4, "A4")):
            print(*build(out, pid, size, suffix))


if __name__ == "__main__":
    main()
