"""Mandala Coloring Pages: 40 vector mandalas (easy, medium, detailed and winter snowflake designs).

Every design is generated from a seed, so the book is reproducible. `colored=True` fills the shapes
for preview images. Usage: python3 mandala_pdf.py <output_dir>
"""
import math
import random
import sys
from pathlib import Path

from reportlab.lib.colors import HexColor, black, white
from reportlab.lib.pagesizes import A4, letter
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

pdfmetrics.registerFont(TTFont("Body", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"))
pdfmetrics.registerFont(TTFont("Bold", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"))
pdfmetrics.registerFont(TTFont("Serif", "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"))

INK = HexColor("#1F2A37")
MUTED = HexColor("#6B7280")
ACCENT = HexColor("#7A4E8C")
PALETTES = [["#F4A6A0", "#F7D08A", "#9CCFB8", "#7FA7D9", "#C7A3D9", "#F28C8C"],
            ["#2A9D8F", "#E9C46A", "#F4A261", "#E76F51", "#8AB17D", "#264653"],
            ["#A7C7E7", "#DCEBFA", "#7FB3D5", "#B9D9EB", "#5D8AA8", "#E8F1F8"],
            ["#FFB5A7", "#FCD5CE", "#F8EDEB", "#F9DCC4", "#FEC89A", "#E5989B"]]
LEVELS = [("Easy", 10, 4, 2.4), ("Medium", 12, 6, 1.6), ("Detailed", 8, 9, 1.1), ("Winter", 10, 7, 1.4)]


def petal(p, r0, r1, w, fat=1.0):
    h = r1 - r0
    p.moveTo(0, r0)
    p.curveTo(-w * fat, r0 + h * 0.3, -w * 0.55 * fat, r1 - h * 0.12, 0, r1)
    p.curveTo(w * 0.55 * fat, r1 - h * 0.12, w * fat, r0 + h * 0.3, 0, r0)
    p.close()


def motif(c, kind, r0, r1, n, fill):
    w = r0 * math.sin(math.pi / n)          # half the chord: neighbours just touch
    h = r1 - r0
    p = c.beginPath()
    if kind == "petal":
        petal(p, r0, r1, w)
    elif kind == "spike":
        p.moveTo(-w, r0)
        p.lineTo(0, r1)
        p.lineTo(w, r0)
        p.close()
    elif kind == "scallop":
        rr = min(w, h * 0.5)
        p.circle(0, r0 + rr, rr)
        if rr > 9:
            c.circle(0, r0 + rr, rr * 0.5, stroke=1, fill=0)
    elif kind == "drop":
        petal(p, r0 + h * 0.1, r1, w * 0.8, 0.8)
    elif kind == "leaf":
        p.moveTo(0, r0)
        p.curveTo(-w * 1.2, r0 + h * 0.5, -w * 0.2, r1, 0, r1)
        p.curveTo(w * 0.2, r1, w * 1.2, r0 + h * 0.5, 0, r0)
        p.close()
    elif kind == "flake":
        c.line(0, r0, 0, r1)
        for f in (0.4, 0.7):
            y = r0 + h * f
            c.line(0, y, -h * 0.32, y + h * 0.28)
            c.line(0, y, h * 0.32, y + h * 0.28)
        p.circle(0, r1, h * 0.06)
    c.drawPath(p, stroke=1, fill=1 if fill else 0)
    if kind in ("petal", "leaf", "drop") and h > 18:   # inner detail line
        q = c.beginPath()
        petal(q, r0 + h * 0.25, r1 - h * 0.15, w * 0.45, 0.8)
        c.drawPath(q, stroke=1, fill=0)


def mandala(c, cx, cy, R, seed, level, colored=False):
    rng = random.Random(seed)
    name, _cnt, rings, lw = level
    kinds = ["flake", "spike", "petal", "scallop"] if name == "Winter" else ["petal", "spike", "scallop", "drop", "leaf"]
    n0 = 6 if name == "Winter" else rng.choice([8, 10, 12])
    pal = [HexColor(x) for x in rng.choice(PALETTES)]
    radii = [R * 0.12]
    for k in range(rings):
        radii.append(radii[-1] + (R - R * 0.12) / rings * rng.uniform(0.85, 1.15))
    scale = R / radii[-1]
    radii = [r * scale for r in radii]
    c.saveState()
    c.translate(cx, cy)
    c.setLineJoin(1)
    c.setLineWidth(lw)
    c.setStrokeColor(black)
    if colored:   # soft ring backgrounds, outermost first
        for i in range(len(radii) - 1, -1, -1):
            c.setFillColor(pal[i % len(pal)] if i % 2 else white)
            c.circle(0, 0, radii[i], stroke=0, fill=1)
    prev = None
    for i in range(len(radii) - 1, 0, -1):
        r0, r1 = radii[i - 1], radii[i]
        n = n0 * (1 if r0 < R * 0.35 else 2 if r0 < R * 0.7 else 3)
        kind = rng.choice([k for k in kinds if k != prev] or kinds)
        prev = kind
        if name == "Winter" and i == len(radii) - 1:
            kind = "flake"
        c.setFillColor(pal[(i + 2) % len(pal)])
        for _k in range(n):
            motif(c, kind, r0 + lw, r1 - lw, n, colored and kind != "flake")
            c.rotate(360 / n)
        if kind != "flake":
            c.circle(0, 0, r0, stroke=1, fill=0)
    c.setFillColor(pal[0] if colored else white)
    c.circle(0, 0, radii[0], stroke=1, fill=1)
    c.circle(0, 0, radii[0] * 0.45, stroke=1, fill=0)
    c.restoreState()


def build(out, size, suffix):
    W, H = size
    path = out / f"Mandala-Coloring-Pages-{suffix}.pdf"
    c = canvas.Canvas(str(path), pagesize=size)
    c.setTitle("Mandala Coloring Pages")
    c.setAuthor("Penny & Plan")
    # cover
    c.setFillColor(HexColor("#F6F0F8"))
    c.rect(0, 0, W, H, stroke=0, fill=1)
    mandala(c, W / 2, H * 0.40, W * 0.36, 7, LEVELS[1], colored=True)
    c.setFillColor(INK)
    c.setFont("Serif", 40)
    c.drawCentredString(W / 2, H - 120, "Mandala")
    c.drawCentredString(W / 2, H - 168, "Coloring Pages")
    c.setFont("Body", 14)
    c.setFillColor(MUTED)
    c.drawCentredString(W / 2, H - 200, "40 designs · easy, medium, detailed & winter snowflakes")
    c.setFont("Bold", 11)
    c.setFillColor(ACCENT)
    c.drawCentredString(W / 2, 40, "Penny & Plan")
    c.showPage()
    # how to
    c.setFillColor(INK)
    c.setFont("Serif", 26)
    c.drawString(60, H - 90, "How to use this book")
    tips = ["Print single-sided so markers don't bleed through to the next design.",
            "Thicker paper (24–32 lb / 90–120 gsm) works best with markers and watercolour pencils.",
            "Easy designs have bold lines and big spaces: great for kids, beginners and relaxing evenings.",
            "Detailed designs have fine lines for fine-tip pens and colored pencils.",
            "Winter snowflake mandalas make lovely handmade cards and window decorations.",
            "Use the colour test page at the end to try your pens before you start.",
            "Personal use: print as many copies as you like for yourself, your family or your classroom."]
    y = H - 140
    c.setFont("Body", 13)
    for t in tips:
        c.setFillColor(ACCENT)
        c.drawString(60, y, "✿")
        c.setFillColor(INK)
        c.drawString(84, y, t)
        y -= 34
    c.showPage()
    seed = 100
    num = 0
    for level in LEVELS:
        for _i in range(level[1]):
            num += 1
            seed += 1
            mandala(c, W / 2, H / 2 + 10, min(W, H) / 2 - 50, seed, level)
            c.setFont("Body", 8)
            c.setFillColor(MUTED)
            c.drawCentredString(W / 2, 24, f"{num} · {level[0]} · Mandala Coloring Pages · penny-and-plan.pages.dev")
            c.showPage()
    # colour test page
    c.setFont("Serif", 24)
    c.setFillColor(INK)
    c.drawString(60, H - 90, "Colour test page")
    c.setStrokeColor(MUTED)
    for r in range(8):
        for col in range(6):
            c.roundRect(60 + col * ((W - 120) / 6), H - 170 - r * 70, (W - 120) / 6 - 12, 56, 8, stroke=1, fill=0)
    c.showPage()
    c.save()
    return path, num


def main():
    out = Path(sys.argv[1] if len(sys.argv) > 1 else "dist")
    for size, suffix in ((letter, "US-Letter"), (A4, "A4")):
        print(*build(out, size, suffix))


if __name__ == "__main__":
    main()
