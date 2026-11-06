"""Builds the 2027 hyperlinked planner PDF.

Three page sizes from one layout: iPad (digital, GoodNotes/Notability),
US Letter and A4 (printable). All coordinates are relative to the page.

Usage: python3 planner_pdf.py <output_dir> [year]
"""
import calendar
import sys
from datetime import date, timedelta
from pathlib import Path

from reportlab.lib.colors import HexColor, white
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

INK = HexColor("#1F2A37")
MUTED = HexColor("#8A94A3")
LINE = HexColor("#D9DEE3")
SOFT = HexColor("#F3F6F4")
ACCENT = HexColor("#2F7D5B")
ACCENT_LIGHT = HexColor("#E3F1EA")
MONTHS = list(calendar.month_name)[1:]
DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

SIZES = {
    "iPad-Digital": (1024, 768),
    "US-Letter": (792, 612),
    "A4": (842, 595),
}


def register_fonts():
    try:
        pdfmetrics.registerFont(TTFont("Body", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"))
        pdfmetrics.registerFont(TTFont("Bold", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"))
        return "Body", "Bold"
    except Exception:
        return "Helvetica", "Helvetica-Bold"


BODY, BOLD = register_fonts()


class Planner:
    def __init__(self, path, size, year):
        self.W, self.H = size
        self.year = year
        self.c = canvas.Canvas(str(path), pagesize=size)
        self.c.setTitle(f"{year} Planner · Penny & Plan")
        self.c.setAuthor("Penny & Plan")
        self.u = self.H / 100  # relative unit
        self.tab_w = self.W * 0.055
        self.left = self.u * 5
        self.right = self.W - self.tab_w - self.u * 4
        self.top = self.H - self.u * 5
        self.bottom = self.u * 5
        # ISO-ish weeks starting Monday, covering every day of the year
        d = date(year, 1, 1)
        d -= timedelta(days=d.weekday())
        self.weeks = []
        while d.year <= year and not (d.year == year and d > date(year, 12, 31)):
            self.weeks.append(d)
            d += timedelta(days=7)

    # ---- helpers
    def text(self, x, y, s, size, font=None, color=INK, anchor="l"):
        c = self.c
        c.setFont(font or BODY, size)
        c.setFillColor(color)
        if anchor == "c":
            c.drawCentredString(x, y, s)
        elif anchor == "r":
            c.drawRightString(x, y, s)
        else:
            c.drawString(x, y, s)

    def link(self, dest, x1, y1, x2, y2):
        self.c.linkAbsolute("", dest, (x1, y1, x2, y2), Border="[0 0 0]")

    def week_of(self, d):
        for i, w in enumerate(self.weeks):
            if w <= d < w + timedelta(days=7):
                return i
        return 0

    def page(self, dest, active_month=None):
        c = self.c
        c.bookmarkPage(dest)
        c.setFillColor(white)
        c.rect(0, 0, self.W, self.H, stroke=0, fill=1)
        # side tabs: Year + 12 months + Notes
        tabs = [("Year", "year")] + [(m[:3], f"m{i+1}") for i, m in enumerate(MONTHS)] + [("Notes", "notes")]
        th = (self.H - self.u * 6) / len(tabs)
        x = self.W - self.tab_w
        for i, (label, d) in enumerate(tabs):
            y = self.H - self.u * 3 - (i + 1) * th
            on = d == (f"m{active_month}" if active_month else dest)
            c.setFillColor(ACCENT if on else SOFT)
            c.setStrokeColor(white)
            c.rect(x, y, self.tab_w, th, stroke=1, fill=1)
            self.text(x + self.tab_w / 2, y + th / 2 - self.u * 0.6, label, self.u * 1.7,
                      BOLD if on else BODY, white if on else INK, "c")
            self.link(d, x, y, x + self.tab_w, y + th)

    def lines(self, x1, x2, y_top, y_bottom, step):
        c = self.c
        c.setStrokeColor(LINE)
        c.setLineWidth(0.5)
        y = y_top
        while y >= y_bottom:
            c.line(x1, y, x2, y)
            y -= step

    def heading(self, title, sub=None):
        self.text(self.left, self.top - self.u * 4, title, self.u * 4.6, BOLD)
        if sub:
            self.text(self.left, self.top - self.u * 7.5, sub, self.u * 1.8, BODY, MUTED)

    def mini_month(self, x, y, w, month, link_days=True):
        """Small calendar. (x, y) is top-left."""
        u = self.u
        self.text(x, y - u * 2.2, MONTHS[month - 1], u * 2.1, BOLD, ACCENT)
        self.link(f"m{month}", x, y - u * 3, x + w, y)
        cw = w / 7
        for i, d in enumerate(DOW):
            self.text(x + cw * i + cw / 2, y - u * 4.6, d[0], u * 1.3, BODY, MUTED, "c")
        weeks = calendar.Calendar(0).monthdatescalendar(self.year, month)
        for r, wk in enumerate(weeks):
            yy = y - u * 6.9 - r * u * 2.3
            for i, d in enumerate(wk):
                if d.month != month:
                    continue
                self.text(x + cw * i + cw / 2, yy, str(d.day), u * 1.4, BODY, INK, "c")
            if link_days:
                wi = self.week_of(wk[0] if wk[0].year == self.year else date(self.year, 1, 1))
                self.link(f"w{wi}", x, yy - u * 0.6, x + w, yy + u * 1.7)

    # ---- pages
    def cover(self):
        c = self.c
        c.bookmarkPage("cover")
        c.setFillColor(ACCENT)
        c.rect(0, 0, self.W, self.H, stroke=0, fill=1)
        u = self.u
        self.text(self.W / 2, self.H * 0.55, str(self.year), u * 18, BOLD, white, "c")
        self.text(self.W / 2, self.H * 0.44, "PLANNER", u * 4, BOLD, white, "c")
        self.text(self.W / 2, self.H * 0.38, "Year · Months · Weeks · Habits · Notes", u * 2, BODY, ACCENT_LIGHT, "c")
        self.text(self.W / 2, u * 6, "Penny & Plan", u * 1.8, BODY, ACCENT_LIGHT, "c")
        self.link("year", 0, 0, self.W, self.H)
        c.showPage()

    def year_page(self):
        self.page("year")
        self.heading(f"{self.year} at a glance", "Tap a month name to open it, or a week to jump to that week.")
        cols, rows = 4, 3
        gx = (self.right - self.left) / cols
        gy = (self.top - self.u * 11 - self.bottom) / rows
        for i in range(12):
            r, cc = divmod(i, cols)
            x = self.left + cc * gx
            y = self.top - self.u * 11 - r * gy
            self.mini_month(x + self.u, y, gx - self.u * 4, i + 1)
        self.c.showPage()

    def month_page(self, m):
        u = self.u
        self.page(f"m{m}", m)
        self.heading(f"{MONTHS[m-1]} {self.year}")
        self.text(self.right, self.top - u * 4, "Habits →", u * 1.8, BOLD, ACCENT, "r")
        self.link(f"h{m}", self.right - u * 10, self.top - u * 5, self.right, self.top - u * 1.5)
        # calendar grid on the left ~72%, side panel on the right
        gx0 = self.left
        gx1 = self.left + (self.right - self.left) * 0.74
        gtop = self.top - u * 9
        weeks = calendar.Calendar(0).monthdatescalendar(self.year, m)
        cw = (gx1 - gx0) / 7
        rh = (gtop - u * 3 - self.bottom) / len(weeks)
        c = self.c
        for i, d in enumerate(DOW):
            self.text(gx0 + cw * i + u * 0.8, gtop - u * 2.2, d.upper(), u * 1.4, BOLD, MUTED)
        c.setStrokeColor(LINE)
        c.setLineWidth(0.6)
        for r, wk in enumerate(weeks):
            y = gtop - u * 3 - (r + 1) * rh
            for i, d in enumerate(wk):
                x = gx0 + cw * i
                if d.month != m:
                    c.setFillColor(SOFT)
                    c.rect(x, y, cw, rh, stroke=1, fill=1)
                    continue
                c.rect(x, y, cw, rh, stroke=1, fill=0)
                self.text(x + u * 0.8, y + rh - u * 2.2, str(d.day), u * 1.6, BOLD)
            wi = self.week_of(max(wk[0], date(self.year, 1, 1)) if wk[0].year < self.year else wk[0])
            if wk[0].year <= self.year:
                # small "week" link chip at the left of each row
                c.setFillColor(ACCENT_LIGHT)
                c.roundRect(gx0 + cw * 7 - u * 4.2, y + rh - u * 2.6, u * 3.8, u * 2, u * 0.6, stroke=0, fill=1)
                self.text(gx0 + cw * 7 - u * 2.3, y + rh - u * 2.1, f"W{wi+1}", u * 1.2, BOLD, ACCENT, "c")
                self.link(f"w{wi}", gx0 + cw * 7 - u * 4.2, y + rh - u * 2.6, gx0 + cw * 7 - u * 0.4, y + rh - u * 0.6)
        # side panel
        px = gx1 + u * 3
        for label, frac in (("Goals", 0.0), ("Priorities", 0.36), ("Notes", 0.7)):
            y = gtop - (gtop - self.bottom) * frac
            self.text(px, y - u * 2, label.upper(), u * 1.5, BOLD, ACCENT)
            self.lines(px, self.right, y - u * 5, y - (gtop - self.bottom) * 0.3 + u * 1, u * 3)
        c.showPage()

    def week_page(self, wi):
        u = self.u
        start = self.weeks[wi]
        mid = start + timedelta(days=3)
        m = mid.month if mid.year == self.year else (1 if mid.year < self.year else 12)
        self.page(f"w{wi}", m)
        end = start + timedelta(days=6)
        self.heading(f"Week {wi+1}", f"{start.strftime('%b %d')} – {end.strftime('%b %d, %Y')}")
        # prev / next
        if wi > 0:
            self.text(self.right - u * 14, self.top - u * 4, "‹ Prev", u * 1.8, BOLD, ACCENT)
            self.link(f"w{wi-1}", self.right - u * 14, self.top - u * 5, self.right - u * 8, self.top - u * 1.5)
        if wi < len(self.weeks) - 1:
            self.text(self.right, self.top - u * 4, "Next ›", u * 1.8, BOLD, ACCENT, "r")
            self.link(f"w{wi+1}", self.right - u * 6, self.top - u * 5, self.right, self.top - u * 1.5)
        c = self.c
        gtop = self.top - u * 10
        cols = 4
        cw = (self.right - self.left) / cols
        rh = (gtop - self.bottom) / 2
        boxes = [start + timedelta(days=i) for i in range(7)] + [None]
        for i, d in enumerate(boxes):
            r, cc = divmod(i, cols)
            x = self.left + cc * cw
            y = gtop - (r + 1) * rh
            c.setStrokeColor(LINE)
            c.setLineWidth(0.6)
            c.setFillColor(SOFT if d is None else white)
            c.rect(x, y, cw, rh, stroke=1, fill=1)
            if d is None:
                self.text(x + u, y + rh - u * 2.5, "TO-DO THIS WEEK", u * 1.5, BOLD, ACCENT)
                yy = y + rh - u * 5.5
                while yy > y + u * 1.5:
                    c.setStrokeColor(MUTED)
                    c.rect(x + u, yy, u * 1.3, u * 1.3, stroke=1, fill=0)
                    c.setStrokeColor(LINE)
                    c.line(x + u * 3.2, yy, x + cw - u, yy)
                    yy -= u * 3
                continue
            other = d.month != m or d.year != self.year
            self.text(x + u, y + rh - u * 2.5, DOW[d.weekday()].upper(), u * 1.4, BOLD, MUTED)
            self.text(x + cw - u, y + rh - u * 2.7, str(d.day), u * 2.6, BOLD, MUTED if other else INK, "r")
            self.lines(x + u, x + cw - u, y + rh - u * 6, y + u * 1.5, u * 2.9)
        c.showPage()

    def habit_page(self, m):
        u = self.u
        self.page(f"h{m}", m)
        self.heading(f"{MONTHS[m-1]} habits", "Write a habit on each line and tick off every day you do it.")
        days = calendar.monthrange(self.year, m)[1]
        c = self.c
        name_w = (self.right - self.left) * 0.22
        gx0 = self.left + name_w
        cw = (self.right - gx0) / days
        gtop = self.top - u * 11
        rows = 14
        rh = (gtop - self.bottom - u * 3) / rows
        for d in range(days):
            wd = date(self.year, m, d + 1).weekday()
            self.text(gx0 + cw * d + cw / 2, gtop + u * 0.8, str(d + 1), u * 1.2, BOLD, ACCENT if wd >= 5 else MUTED, "c")
        c.setLineWidth(0.5)
        for r in range(rows):
            y = gtop - (r + 1) * rh
            c.setStrokeColor(LINE)
            c.line(self.left, y, gx0 - u, y)
            c.setStrokeColor(HexColor("#B8C0CA"))
            for d in range(days):
                cx = gx0 + cw * d + cw / 2
                c.circle(cx, y + rh / 2, min(cw, rh) * 0.32, stroke=1, fill=0)
        c.showPage()

    def notes_pages(self, n=6):
        for i in range(n):
            self.page("notes" if i == 0 else f"notes{i}")
            self.heading("Notes")
            c = self.c
            c.setFillColor(LINE)
            step = self.u * 3
            y = self.top - self.u * 10
            while y > self.bottom:
                x = self.left
                while x < self.right:
                    c.circle(x, y, 0.7, stroke=0, fill=1)
                    x += step
                y -= step
            c.showPage()

    def build(self):
        self.cover()
        self.year_page()
        for m in range(1, 13):
            self.month_page(m)
            self.habit_page(m)
            for wi, ws in enumerate(self.weeks):
                mid = ws + timedelta(days=3)
                wm = mid.month if mid.year == self.year else (1 if mid.year < self.year else 12)
                if wm == m:
                    self.week_page(wi)
        self.notes_pages()
        self.c.save()


def main():
    out = Path(sys.argv[1] if len(sys.argv) > 1 else "dist")
    year = int(sys.argv[2]) if len(sys.argv) > 2 else 2027
    out.mkdir(parents=True, exist_ok=True)
    for name, size in SIZES.items():
        p = out / f"{year}-Planner-{name}.pdf"
        Planner(p, size, year).build()
        print("wrote", p)


if __name__ == "__main__":
    main()
