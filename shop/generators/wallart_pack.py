"""Zips the wall art JPGs with a printing size guide. Usage: python3 wallart_pack.py <art_dir> <zip_path>"""
import sys
import zipfile
from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

import xmas_pdf as P  # registers fonts

GUIDE = [
    ("2x3 files", "4x6, 8x12, 12x18, 16x24 and 24x36 inches  ·  10x15, 20x30, 40x60, 60x90 cm"),
    ("3x4 files", "6x8, 9x12, 12x16 and 18x24 inches  ·  30x40, 45x60 cm"),
    ("4x5 files", "8x10 and 16x20 inches  ·  20x25, 40x50 cm"),
    ("11x14 file", "11x14 inches  ·  28x36 cm"),
    ("ISO files", "A5, A4, A3, A2 and A1 (international paper sizes)"),
]


def guide(path):
    c = canvas.Canvas(str(path), pagesize=letter)
    W, H = letter
    c.setTitle("Wall art printing guide")
    y = H - 72
    c.setFont("Serif", 24)
    c.setFillColor(HexColor("#3A3230"))
    c.drawString(60, y, "Printing guide")
    y -= 30
    c.setFont("Body", 11)
    for ln in P.wrap("Thank you for your purchase! You have 6 designs, each in 5 file ratios. Pick the file that "
                     "matches your frame, and the art will fill it without cropping.", "Body", 11, W - 120):
        c.drawString(60, y, ln)
        y -= 15
    y -= 14
    for title, sizes in GUIDE:
        c.setFont("Bold", 12)
        c.setFillColor(HexColor("#C2643F"))
        c.drawString(60, y, title)
        c.setFont("Body", 11)
        c.setFillColor(HexColor("#3A3230"))
        for ln in P.wrap(sizes, "Body", 11, W - 220):
            c.drawString(170, y, ln)
            y -= 15
        y -= 10
    y -= 6
    tips = ["Print at home on matte photo paper or thick card for small sizes.",
            "For big sizes, upload the file to a local print shop or an online printing service.",
            "Files are 300 dpi at 16x24 in (2x3), 18x24 in (3x4), 16x20 in (4x5), 11x14 in and A2, so they stay sharp.",
            "Colours can look slightly different on paper than on screen, depending on the printer and paper.",
            "Personal use only: print as many copies as you like for your own home or as a personal gift. Please don't resell the files or the prints."]
    c.setFont("Bold", 13)
    c.setFillColor(HexColor("#5F6A4F"))
    c.drawString(60, y, "Tips")
    y -= 20
    c.setFont("Body", 11)
    c.setFillColor(HexColor("#3A3230"))
    for t in tips:
        lines = P.wrap(t, "Body", 11, W - 140)
        c.drawString(60, y, "•")
        for ln in lines:
            c.drawString(75, y, ln)
            y -= 15
        y -= 6
    c.setFont("Body", 9)
    c.setFillColor(HexColor("#7A6E62"))
    c.drawString(60, 40, "Penny & Plan · penny-and-plan.pages.dev")
    c.save()


def main():
    src, out = Path(sys.argv[1]), Path(sys.argv[2])
    g = src / "Printing-Guide.pdf"
    guide(g)
    with zipfile.ZipFile(out, "w", zipfile.ZIP_STORED) as z:  # JPGs are already compressed
        z.write(g, g.name)
        for f in sorted(src.glob("*.jpg")):
            ratio = f.stem.rsplit("-", 1)[1]
            z.write(f, f"{ratio}/{f.name}")
    print("wrote", out, out.stat().st_size // 1024 // 1024, "MB")


if __name__ == "__main__":
    main()
