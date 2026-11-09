"""Builds a set of 6 mid-century boho wall art prints as vector PDFs and high-resolution JPGs.

Every design is drawn relative to the page, so it is re-composed (not stretched) for each
frame ratio. Usage: python3 wallart.py <output_dir> [--preview]
"""
import math
import subprocess
import sys
from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.pdfgen import canvas

CREAM = HexColor("#F3EADC")
SAND = HexColor("#E3CDB1")
TERRA = HexColor("#C2643F")
RUST = HexColor("#9E4A2F")
MUSTARD = HexColor("#DFA343")
BLUSH = HexColor("#E3B4A0")
SAGE = HexColor("#8F9B7D")
OLIVE = HexColor("#5F6A4F")
CHAR = HexColor("#3A3230")

# name, (width, height) in points (1 pt = 1/72 in) and the pixel size of the JPG for print
RATIOS = {
    "2x3": ((432, 648), (4800, 7200)),       # 4x6, 8x12, 12x18, 16x24, 24x36 in
    "3x4": ((432, 576), (5400, 7200)),       # 6x8, 9x12, 12x16, 18x24 in
    "4x5": ((432, 540), (4800, 6000)),       # 8x10, 16x20 in
    "11x14": ((396, 504), (3300, 4200)),     # 11x14 in
    "ISO": ((420, 594), (4961, 7016)),       # A5, A4, A3, A2, A1
}


def bg(c, w, h, color=CREAM):
    c.setFillColor(color)
    c.rect(0, 0, w, h, stroke=0, fill=1)


def frame(w, h):
    """A centred square-ish working area with even margins."""
    s = min(w, h) * 0.78
    return (w - s) / 2, (h - s) / 2, s


def sun_and_hills(c, w, h):
    bg(c, w, h)
    x0, y0, s = frame(w, h)
    cy = y0 + s * 0.62
    c.setFillColor(TERRA)
    c.circle(w / 2, cy, s * 0.26, stroke=0, fill=1)
    layers = [(SAND, 0.42, 0.10), (MUSTARD, 0.33, 0.12), (SAGE, 0.22, 0.10), (OLIVE, 0.10, 0.08)]
    for color, base, amp in layers:
        c.setFillColor(color)
        p = c.beginPath()
        p.moveTo(0, 0)
        p.lineTo(0, y0 + s * base)
        p.curveTo(w * 0.3, y0 + s * (base + amp), w * 0.6, y0 + s * (base - amp * 0.6), w, y0 + s * (base + amp * 0.4))
        p.lineTo(w, 0)
        p.close()
        c.drawPath(p, stroke=0, fill=1)


def rainbow(c, w, h):
    bg(c, w, h)
    x0, y0, s = frame(w, h)
    cx, base = w / 2, y0 + s * 0.22
    colors = [TERRA, BLUSH, MUSTARD, SAGE, CREAM]
    r0 = s * 0.48
    band = r0 / 5.2
    for i, col in enumerate(colors):
        r = r0 - i * band
        c.setFillColor(col)
        p = c.beginPath()
        p.moveTo(cx - r, base)
        p.arcTo(cx - r, base - r, cx + r, base + r, 180, -180)
        p.lineTo(cx + r, base)
        p.close()
        c.drawPath(p, stroke=0, fill=1)
    c.setFillColor(SAND)
    c.rect(0, 0, w, base, stroke=0, fill=1)


def bauhaus(c, w, h):
    bg(c, w, h)
    cols, rows = 3, 4
    m = min(w, h) * 0.12
    cell = min((w - 2 * m) / cols, (h - 2 * m) / rows)
    gx, gy = (w - cell * cols) / 2, (h - cell * rows) / 2
    palette = [TERRA, MUSTARD, SAGE, BLUSH, RUST, OLIVE]
    shapes = ["half", "quarter", "circle", "half", "quarter", "half", "circle", "quarter", "half", "quarter", "circle", "half"]
    for i in range(rows * cols):
        r, k = divmod(i, cols)
        x, y = gx + k * cell, gy + (rows - 1 - r) * cell
        col = palette[(i * 5) % len(palette)]
        c.setFillColor(SAND if (r + k) % 2 else CREAM)
        c.rect(x, y, cell, cell, stroke=0, fill=1)
        c.setFillColor(col)
        rot = (i * 90) % 360
        kind = shapes[i]
        if kind == "circle":
            c.circle(x + cell / 2, y + cell / 2, cell * 0.36, stroke=0, fill=1)
        elif kind == "half":
            cx, cy = x + cell / 2, y + (0 if rot in (0, 90) else cell)
            start = 0 if cy == y else 180
            p = c.beginPath()
            p.moveTo(x, cy)
            p.arcTo(x, cy - cell / 2, x + cell, cy + cell / 2, start, 180)
            p.close()
            c.drawPath(p, stroke=0, fill=1)
        else:
            corners = [(x, y, 0), (x + cell, y, 90), (x + cell, y + cell, 180), (x, y + cell, 270)]
            ox, oy, st = corners[(i // 1) % 4]
            p = c.beginPath()
            p.moveTo(ox, oy)
            p.arcTo(ox - cell, oy - cell, ox + cell, oy + cell, st, 90)
            p.close()
            c.drawPath(p, stroke=0, fill=1)


def leaves(c, w, h):
    bg(c, w, h)
    x0, y0, s = frame(w, h)
    cx = w / 2
    c.setStrokeColor(OLIVE)
    c.setLineWidth(s * 0.012)
    c.setLineCap(1)
    c.line(cx, y0 + s * 0.02, cx, y0 + s * 0.98)
    n = 6
    for i in range(n):
        t = 0.12 + i * 0.14
        yy = y0 + s * t
        size = s * (0.30 - i * 0.025)
        for side in (-1, 1):
            c.saveState()
            c.translate(cx, yy + (0 if side < 0 else s * 0.06))
            c.rotate(35 * side * -1 + (0 if side < 0 else 0))
            c.setFillColor([SAGE, TERRA, MUSTARD, BLUSH][(i + (side > 0)) % 4])
            p = c.beginPath()
            p.moveTo(0, 0)
            p.curveTo(side * size * 0.3, size * 0.25, side * size * 0.8, size * 0.25, side * size, 0)
            p.curveTo(side * size * 0.8, -size * 0.18, side * size * 0.3, -size * 0.18, 0, 0)
            p.close()
            c.drawPath(p, stroke=0, fill=1)
            c.restoreState()
    c.setFillColor(OLIVE)
    p = c.beginPath()
    top = y0 + s * 0.98
    p.moveTo(cx, top)
    p.curveTo(cx - s * 0.05, top - s * 0.04, cx - s * 0.04, top - s * 0.1, cx, top - s * 0.12)
    p.curveTo(cx + s * 0.04, top - s * 0.1, cx + s * 0.05, top - s * 0.04, cx, top)
    c.drawPath(p, stroke=0, fill=1)


def stones(c, w, h):
    bg(c, w, h, SAND)
    x0, y0, s = frame(w, h)
    cx = w / 2
    stack = [(0.52, 0.18, CHAR, -2), (0.43, 0.165, TERRA, 3), (0.36, 0.15, MUSTARD, -4), (0.28, 0.135, BLUSH, 5), (0.20, 0.115, SAGE, -3)]
    y = y0 + s * 0.08
    c.setFillColor(HexColor("#D4BB9C"))
    c.ellipse(cx - s * 0.5, y - s * 0.025, cx + s * 0.5, y + s * 0.035, stroke=0, fill=1)
    for rw, rh, col, tilt in stack:
        c.saveState()
        c.translate(cx + s * 0.01 * tilt, y + s * rh / 2)
        c.rotate(tilt)
        c.setFillColor(col)
        c.ellipse(-s * rw / 2, -s * rh / 2, s * rw / 2, s * rh / 2, stroke=0, fill=1)
        c.restoreState()
        y += s * rh * 0.92
    c.setFillColor(CREAM)
    c.circle(cx + s * 0.32, y0 + s * 0.92, s * 0.08, stroke=0, fill=1)


def waves(c, w, h):
    bg(c, w, h)
    x0, y0, s = frame(w, h)
    c.setFillColor(MUSTARD)
    c.circle(w / 2, y0 + s * 0.78, s * 0.14, stroke=0, fill=1)
    c.setLineCap(1)
    lines = 9
    for i in range(lines):
        yy = y0 + s * (0.08 + i * 0.065)
        amp = s * 0.025
        c.setStrokeColor([TERRA, RUST, BLUSH][i % 3])
        c.setLineWidth(s * 0.018)
        p = c.beginPath()
        x = x0
        p.moveTo(x, yy)
        step = s / 4
        k = 0
        while x < x0 + s - 1:
            sign = 1 if k % 2 == 0 else -1
            p.curveTo(x + step * 0.35, yy + amp * sign, x + step * 0.65, yy + amp * sign, x + step, yy)
            x += step
            k += 1
        c.drawPath(p, stroke=1, fill=0)


DESIGNS = [("01-Sun-and-Hills", sun_and_hills), ("02-Rainbow-Arches", rainbow), ("03-Bauhaus-Shapes", bauhaus),
           ("04-Boho-Leaves", leaves), ("05-Balanced-Stones", stones), ("06-Golden-Waves", waves)]


def main():
    out = Path(sys.argv[1] if len(sys.argv) > 1 else "dist/wallart")
    preview = "--preview" in sys.argv
    out.mkdir(parents=True, exist_ok=True)
    for name, fn in DESIGNS:
        for ratio, ((w, h), (px, py)) in RATIOS.items():
            if preview and ratio != "2x3":
                continue
            pdf = out / f"{name}-{ratio}.pdf"
            c = canvas.Canvas(str(pdf), pagesize=(w, h))
            c.setTitle(name.split("-", 1)[1].replace("-", " "))
            c.setAuthor("Penny & Plan")
            fn(c, w, h)
            c.showPage()
            c.save()
            scale = (["-scale-to-x", "600", "-scale-to-y", "-1"] if preview else ["-scale-to-x", str(px), "-scale-to-y", str(py)])
            subprocess.run(["pdftoppm", "-jpeg", "-jpegopt", "quality=92", "-singlefile", *scale, str(pdf), str(out / f"{name}-{ratio}")], check=True)
    print("wrote wall art to", out)


if __name__ == "__main__":
    main()
