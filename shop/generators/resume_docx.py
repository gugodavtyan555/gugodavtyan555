"""Builds 5 editable resume + cover letter templates (.docx, US Letter and A4).

Layouts use paragraphs and tables only (no text boxes or shapes) and fonts that
exist in both Word and Google Docs (Arial, Georgia), so the files stay editable
everywhere. Usage: python3 resume_docx.py <output_dir>
"""
import sys
from pathlib import Path

from docx import Document
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Mm, Pt, RGBColor

PERSON = {
    "name": "Alex Morgan",
    "title": "Marketing Manager",
    "email": "alex.morgan@email.com", "phone": "(555) 123-4567", "city": "Chicago, IL",
    "web": "linkedin.com/in/alexmorgan",
    "summary": "Marketing manager with 7 years of experience growing consumer brands through data-driven campaigns. "
               "Led teams of up to 6, managed $1.2M annual budgets and increased online revenue by 38% in two years. "
               "Known for clear communication, fast testing and turning insights into results.",
    "jobs": [
        ("Marketing Manager", "Brightside Home Goods", "Chicago, IL", "2022 – Present", [
            "Lead a team of 6 across email, paid social and content; grew online revenue 38% in two years.",
            "Launched a loyalty programme that reached 45,000 members and raised repeat purchases by 22%.",
            "Cut customer acquisition cost by 18% by rebuilding the paid social testing process.",
        ]),
        ("Senior Marketing Specialist", "Northwind Outdoor Co.", "Denver, CO", "2019 – 2022", [
            "Planned and ran seasonal campaigns across 5 channels for a $1.2M annual budget.",
            "Introduced A/B testing for email, lifting click-through rate from 2.1% to 3.4%.",
            "Partnered with sales to create product guides that shortened the sales cycle by 2 weeks.",
        ]),
        ("Marketing Coordinator", "Lumen Studio", "Denver, CO", "2017 – 2019", [
            "Managed the social media calendar and grew Instagram followers from 8,000 to 41,000.",
            "Coordinated 12 trade show events per year, from logistics to follow-up emails.",
        ]),
    ],
    "education": [("B.A. in Communications", "University of Colorado", "2017")],
    "skills": ["Campaign strategy", "Email marketing", "Paid social", "Google Analytics", "SEO", "A/B testing",
               "Budget management", "Team leadership"],
    "extras": [("Certifications", "Google Analytics Certification · HubSpot Inbound Marketing"),
               ("Languages", "English (native) · Spanish (conversational)")],
}

LETTER_BODY = [
    "Dear Hiring Manager,",
    "I am excited to apply for the Marketing Manager position at [Company Name]. With seven years of experience "
    "building campaigns that grow revenue and customer loyalty, I would love to bring that same energy to your team.",
    "At Brightside Home Goods I lead a team of six and grew online revenue by 38% in two years. I launched a loyalty "
    "programme that reached 45,000 members and rebuilt our paid social testing process, cutting acquisition cost by 18%. "
    "I enjoy turning data into clear decisions and helping a team move quickly without losing quality.",
    "What draws me to [Company Name] is [one specific reason: a product, a value or a recent project]. I believe my "
    "experience in [relevant skill] would help you [a goal the company has].",
    "Thank you for your time and consideration. I would welcome the chance to talk about how I can contribute.",
    "Sincerely,",
    "Alex Morgan",
]

DESIGNS = {
    "Classic": dict(font="Georgia", head="Georgia", accent="2B2B2B", rule="999999"),
    "Modern": dict(font="Arial", head="Arial", accent="2F7D5B", rule="2F7D5B"),
    "Two-Column": dict(font="Arial", head="Arial", accent="1F4E79", rule="1F4E79", side="EAF0F6"),
    "Minimal": dict(font="Arial", head="Arial", accent="555555", rule="DDDDDD"),
    "Executive": dict(font="Georgia", head="Georgia", accent="7A1E2C", rule="7A1E2C", band="7A1E2C"),
}


def rgb(hexstr):
    return RGBColor.from_string(hexstr)


def shade(cell, hexstr):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear")
    shd.set(qn("w:color"), "auto")
    shd.set(qn("w:fill"), hexstr)
    tcPr.append(shd)


def no_borders(table):
    tbl = table._tbl
    tblPr = tbl.tblPr
    borders = OxmlElement("w:tblBorders")
    for b in ("top", "left", "bottom", "right", "insideH", "insideV"):
        el = OxmlElement(f"w:{b}")
        el.set(qn("w:val"), "nil")
        borders.append(el)
    tblPr.append(borders)


def cell_margins(cell, top=80, left=140, bottom=80, right=140):
    tcPr = cell._tc.get_or_add_tcPr()
    mar = OxmlElement("w:tcMar")
    for side, v in (("top", top), ("left", left), ("bottom", bottom), ("right", right)):
        el = OxmlElement(f"w:{side}")
        el.set(qn("w:w"), str(v))
        el.set(qn("w:type"), "dxa")
        mar.append(el)
    tcPr.append(mar)


def bottom_rule(par, hexstr, size=6):
    pPr = par._p.get_or_add_pPr()
    pbdr = OxmlElement("w:pBdr")
    b = OxmlElement("w:bottom")
    b.set(qn("w:val"), "single")
    b.set(qn("w:sz"), str(size))
    b.set(qn("w:space"), "2")
    b.set(qn("w:color"), hexstr)
    pbdr.append(b)
    pPr.append(pbdr)


class Doc:
    def __init__(self, design, page):
        self.d = Document()
        self.s = DESIGNS[design]
        self.design = design
        sec = self.d.sections[0]
        if page == "A4":
            sec.page_width, sec.page_height = Mm(210), Mm(297)
        else:
            sec.page_width, sec.page_height = Inches(8.5), Inches(11)
        m = Inches(0.6) if design in ("Two-Column", "Executive") else Inches(0.7)
        sec.left_margin = sec.right_margin = m
        sec.top_margin = Inches(0.35) if design == "Executive" else Inches(0.6)
        sec.bottom_margin = Inches(0.5)
        st = self.d.styles["Normal"]
        st.font.name = self.s["font"]
        st.element.rPr.rFonts.set(qn("w:eastAsia"), self.s["font"])
        st.font.size = Pt(10.5)
        st.paragraph_format.space_after = Pt(2)
        st.paragraph_format.line_spacing = 1.2
        self.width = sec.page_width - sec.left_margin - sec.right_margin

    def p(self, text="", size=10.5, bold=False, italic=False, color=None, align=None, after=2, before=0, font=None, container=None):
        par = (container or self.d).add_paragraph()
        par.paragraph_format.space_after = Pt(after)
        par.paragraph_format.space_before = Pt(before)
        if align == "center":
            par.alignment = WD_ALIGN_PARAGRAPH.CENTER
        elif align == "right":
            par.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        if text:
            self.run(par, text, size, bold, italic, color, font)
        return par

    def run(self, par, text, size=10.5, bold=False, italic=False, color=None, font=None):
        r = par.add_run(text)
        r.font.size = Pt(size)
        r.bold = bold
        r.italic = italic
        if font:
            r.font.name = font
        if color:
            r.font.color.rgb = rgb(color)
        return r

    def heading(self, text, container=None):
        s = self.s
        txt = text.upper() if self.design in ("Modern", "Minimal", "Two-Column") else text
        par = self.p(txt, 11.5 if self.design != "Classic" else 12.5, bold=True, color=s["accent"], before=14, after=5,
                     font=s["head"], container=container)
        if self.design != "Minimal":
            bottom_rule(par, s["rule"], 6 if self.design != "Classic" else 4)
        else:
            par.runs[0].font.color.rgb = rgb("888888")
        return par

    def bullet(self, text, container=None):
        par = self.p("", container=container, after=2)
        par.paragraph_format.left_indent = Inches(0.18)
        par.paragraph_format.first_line_indent = Inches(-0.14)
        self.run(par, "•  ", 10.5, color=self.s["accent"])
        self.run(par, text, 10.5)
        return par

    def job(self, j, container=None):
        role, org, place, dates, bullets = j
        par = self.p("", container=container, before=7, after=0)
        self.run(par, role, 11.5, bold=True)
        self.run(par, f"  ·  {org}", 11.5, color=self.s["accent"] if self.design != "Classic" else None)
        meta = self.p(f"{place}  |  {dates}", 9.5, italic=True, color="666666", container=container, after=3)
        for b in bullets:
            self.bullet(b, container)

    def save(self, path):
        self.d.save(path)


def contact_line(P):
    return f"{P['email']}  ·  {P['phone']}  ·  {P['city']}  ·  {P['web']}"


def header(doc, P, letter=False):
    s, dsn = doc.s, doc.design
    if dsn == "Classic":
        doc.p(P["name"].upper(), 24, color=s["accent"], align="center", after=0, font="Georgia")
        doc.p(P["title"], 11.5, italic=True, color="555555", align="center", after=2)
        par = doc.p(contact_line(P), 9, color="555555", align="center", after=6)
        bottom_rule(par, s["rule"], 4)
    elif dsn == "Modern":
        doc.p(P["name"], 26, bold=True, color="1F2A37", after=0)
        doc.p(P["title"].upper(), 11, bold=True, color=s["accent"], after=2)
        doc.p(contact_line(P), 9, color="555555", after=4)
    elif dsn == "Minimal":
        doc.p(P["name"], 22, color="222222", after=0)
        doc.p(P["title"], 11, color="888888", after=2)
        doc.p(contact_line(P), 9, color="888888", after=6)
    elif dsn == "Executive":
        t = doc.d.add_table(rows=1, cols=1)
        no_borders(t)
        c = t.cell(0, 0)
        t.autofit = False
        c.width = doc.width
        shade(c, s["band"])
        cell_margins(c, 240, 300, 240, 300)
        c.paragraphs[0].text = ""
        r = c.paragraphs[0].add_run(P["name"].upper())
        r.font.size, r.font.color.rgb, r.font.name = Pt(24), rgb("FFFFFF"), "Georgia"
        doc.p(P["title"], 11.5, italic=True, color="F3E3E6", container=c, after=2)
        doc.p(contact_line(P), 9, color="FFFFFF", container=c, after=0)
        doc.p("", after=4)
    elif dsn == "Two-Column" and letter:
        doc.p(P["name"], 24, bold=True, color=s["accent"], after=0)
        doc.p(P["title"].upper(), 10.5, bold=True, color="555555", after=2)
        par = doc.p(contact_line(P), 9, color="555555", after=6)
        bottom_rule(par, s["rule"], 8)


def resume(design, page, out):
    P = PERSON
    doc = Doc(design, page)
    if design == "Two-Column":
        t = doc.d.add_table(rows=1, cols=2)
        t.alignment = WD_TABLE_ALIGNMENT.CENTER
        no_borders(t)
        left, right = t.cell(0, 0), t.cell(0, 1)
        lw = int(doc.width * 0.33)
        left.width, right.width = lw, doc.width - lw
        shade(left, doc.s["side"])
        cell_margins(left, 200, 200, 200, 200)
        cell_margins(right, 120, 240, 120, 80)
        left.paragraphs[0].text = ""
        r = left.paragraphs[0].add_run(P["name"])
        r.font.size, r.bold, r.font.color.rgb = Pt(20), True, rgb(doc.s["accent"])
        doc.p(P["title"].upper(), 10, bold=True, color="555555", container=left, after=8)
        doc.heading("Contact", left)
        for v in (P["email"], P["phone"], P["city"], P["web"]):
            doc.p(v, 9, container=left, after=2)
        doc.heading("Skills", left)
        for sk in P["skills"]:
            doc.bullet(sk, left)
        doc.heading("Education", left)
        for deg, sch, yr in P["education"]:
            doc.p(deg, 9.5, bold=True, container=left, after=0)
            doc.p(f"{sch}, {yr}", 9, color="555555", container=left, after=4)
        for title, text in P["extras"]:
            doc.heading(title, left)
            doc.p(text.replace(" · ", "\n"), 9, container=left, after=2)
        right.paragraphs[0].text = ""
        doc.heading("Profile", right)
        doc.p(P["summary"], 10, container=right, after=2)
        doc.heading("Experience", right)
        for j in P["jobs"]:
            doc.job(j, right)
    else:
        header(doc, P)
        doc.heading("Profile" if design != "Executive" else "Executive Summary")
        doc.p(P["summary"], 10)
        doc.heading("Experience" if design != "Executive" else "Professional Experience")
        for j in P["jobs"]:
            doc.job(j)
        doc.heading("Education")
        for deg, sch, yr in P["education"]:
            par = doc.p("", after=2)
            doc.run(par, deg, 10.5, bold=True)
            doc.run(par, f"  ·  {sch}  ·  {yr}", 10, color="555555")
        doc.heading("Skills")
        doc.p("  ·  ".join(P["skills"]), 10)
        for title, text in P["extras"]:
            doc.heading(title)
            doc.p(text, 10)
    path = out / f"Resume-{design}-{page}.docx"
    doc.save(path)
    return path


def cover_letter(design, page, out):
    P = PERSON
    doc = Doc(design, page)
    header(doc, P, letter=True)
    doc.p("[Date]", 10.5, after=10, before=12)
    for ln in ("[Hiring Manager Name]", "[Company Name]", "[Company Address]"):
        doc.p(ln, 10.5, after=0)
    doc.p("", after=8)
    for para in LETTER_BODY:
        doc.p(para, 10.5, after=10)
    path = out / f"Cover-Letter-{design}-{page}.docx"
    doc.save(path)
    return path


def main():
    out = Path(sys.argv[1] if len(sys.argv) > 1 else "dist/resume")
    out.mkdir(parents=True, exist_ok=True)
    files = []
    for design in DESIGNS:
        for page in ("US-Letter", "A4"):
            files += [resume(design, page, out), cover_letter(design, page, out)]
    print(f"wrote {len(files)} files to {out}")


if __name__ == "__main__":
    main()
