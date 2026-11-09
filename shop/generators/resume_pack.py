"""Packages the resume templates: a one-page 'How to edit' PDF guide plus the .docx files in one ZIP.

Usage: python3 resume_pack.py <resume_dir> <zip_path>
"""
import sys
import zipfile
from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

import xmas_pdf as P  # fonts + wrap

INK, ACCENT, MUTED = HexColor("#1F2A37"), HexColor("#2F7D5B"), HexColor("#6B7280")


def guide(path):
    c = canvas.Canvas(str(path), pagesize=letter)
    W, H = letter
    c.setTitle("How to edit your resume templates")
    y = H - 70
    c.setFont("Serif", 24)
    c.setFillColor(INK)
    c.drawString(60, y, "How to edit your resume")
    y -= 34
    sections = [
        ("What's inside", "5 resume designs (Classic, Modern, Two-Column, Minimal, Executive), each with a matching cover "
         "letter, in US Letter and A4 size: 20 Word files (.docx)."),
        ("Microsoft Word", "Open the file, click on any text and type over it. Delete bullet points you don't need, or press "
         "Enter at the end of a bullet to add another one. Save as PDF before you send it (File > Save As > PDF)."),
        ("Google Docs (free)", "Go to drive.google.com, click New > File upload and choose the .docx file. Right-click it "
         "and choose Open with > Google Docs. Edit, then File > Download > PDF."),
        ("Apple Pages / LibreOffice", "Both open .docx files directly. Check the layout once before exporting to PDF."),
        ("Change colours and fonts", "Select a heading and change its colour or font as usual. The designs use Arial and "
         "Georgia, which are available in Word and Google Docs, so the layout stays the same."),
        ("Tips that get interviews", "Keep it to one page if you have under 10 years of experience. Start bullets with an "
         "action verb and add a number where you can (grew sales 20%, managed 6 people). Tailor the top three bullets "
         "to each job you apply for. Always send a PDF, not the .docx."),
        ("License", "Personal use: use the templates for your own job applications as often as you like. Please don't "
         "resell or share the files."),
    ]
    for title, text in sections:
        c.setFont("Bold", 13)
        c.setFillColor(ACCENT)
        c.drawString(60, y, title)
        y -= 18
        c.setFont("Body", 11)
        c.setFillColor(INK)
        for ln in P.wrap(text, "Body", 11, W - 120):
            c.drawString(60, y, ln)
            y -= 15
        y -= 12
    c.setFont("Body", 9)
    c.setFillColor(MUTED)
    c.drawString(60, 40, "Penny & Plan · penny-and-plan.pages.dev")
    c.save()


def main():
    src = Path(sys.argv[1])
    out = Path(sys.argv[2])
    g = src / "How-to-Edit-Your-Resume.pdf"
    guide(g)
    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
        z.write(g, g.name)
        for f in sorted(src.glob("*.docx")):
            folder = "US-Letter" if "US-Letter" in f.name else "A4"
            z.write(f, f"{folder}/{f.name}")
    print("wrote", out)


if __name__ == "__main__":
    main()
