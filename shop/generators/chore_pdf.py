"""Kids Chore & Reward Chart Pack: colourful printable charts for ages 3-12.

Pages: weekly chore charts (blank + ready-filled for 3 age groups), morning / after-school / bedtime
routine checklists, reward (sticker) charts of 10/20/30 stars, a chore money tracker and reward coupons.
Usage: python3 chore_pdf.py <output_dir>
"""
import sys
from pathlib import Path

from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4, letter
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

pdfmetrics.registerFont(TTFont("Body", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"))
pdfmetrics.registerFont(TTFont("Bold", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"))

INK = HexColor("#24324A")
MUTED = HexColor("#7B8494")
COLORS = [HexColor(x) for x in ("#FF8A80", "#FFC857", "#7BD389", "#5BC0EB", "#B388EB", "#FF9F68", "#4DD0C4")]
SOFT = [HexColor(x) for x in ("#FFE3E0", "#FFF2D1", "#E2F6E6", "#DDF2FB", "#EFE5FB", "#FFE8DA", "#DDF7F4")]
DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
CHORES = {
    "Ages 3–5": ["Make my bed", "Put toys away", "Brush teeth (morning)", "Get dressed", "Feed the pet",
                 "Put clothes in the hamper", "Help set the table", "Brush teeth (night)"],
    "Ages 6–8": ["Make my bed", "Tidy my room", "Pack my school bag", "Set the table", "Clear my plate",
                 "Feed the pet", "Water the plants", "Read for 20 minutes", "Put laundry away"],
    "Ages 9–12": ["Make my bed", "Tidy my room", "Homework done", "Load / unload dishwasher", "Take out the trash",
                  "Fold and put away laundry", "Help cook dinner", "Vacuum one room", "Practice instrument / sport",
                  "Screen-free hour"],
}
ROUTINES = {
    "Morning Routine": ["Wake up", "Use the toilet", "Wash face", "Brush teeth", "Get dressed", "Eat breakfast",
                        "Brush hair", "Pack school bag", "Shoes and coat on"],
    "After-School Routine": ["Hang up coat and bag", "Wash hands", "Have a snack", "Homework", "Read",
                             "Tidy up", "Play time", "Help with dinner"],
    "Bedtime Routine": ["Tidy toys", "Bath or shower", "Pajamas on", "Brush teeth", "Pick clothes for tomorrow",
                        "Story time", "Hugs and goodnight", "Lights out"],
}
COUPONS = ["Stay up 15 minutes later", "Pick what's for dinner", "Movie night pick", "Extra story at bedtime",
           "Bake something together", "Trip to the park", "30 minutes of game time", "Skip one chore",
           "Friend sleepover", "Breakfast in bed", "Choose the weekend activity", "Ice cream treat"]


def star(c, x, y, r, fill=None, stroke=INK, lw=1.4):
    import math
    p = c.beginPath()
    for k in range(10):
        a = math.pi / 2 + k * math.pi / 5
        rr = r if k % 2 == 0 else r * 0.45
        pt = (x + rr * math.cos(a), y + rr * math.sin(a))
        p.moveTo(*pt) if k == 0 else p.lineTo(*pt)
    p.close()
    c.setLineWidth(lw)
    c.setStrokeColor(stroke)
    if fill is not None:
        c.setFillColor(fill)
    c.drawPath(p, stroke=1, fill=1 if fill is not None else 0)


class Book:
    def __init__(self, path, size):
        self.W, self.H = size
        self.c = canvas.Canvas(str(path), pagesize=size)
        self.c.setTitle("Kids Chore & Reward Charts")
        self.c.setAuthor("Penny & Plan")
        self.n = 0

    def header(self, title, sub, color_i=0):
        c, W, H = self.c, self.W, self.H
        c.setFillColor(SOFT[color_i % 7])
        c.rect(0, 0, W, H, stroke=0, fill=1)
        c.setFillColor(white)
        c.roundRect(24, 24, W - 48, H - 48, 18, stroke=0, fill=1)
        for k in range(7):   # bunting
            c.setFillColor(COLORS[k])
            x = 40 + k * (W - 80) / 7
            p = c.beginPath()
            p.moveTo(x + 6, H - 24)
            p.lineTo(x + (W - 80) / 7 - 6, H - 24)
            p.lineTo(x + (W - 80) / 14, H - 54)
            p.close()
            c.drawPath(p, stroke=0, fill=1)
        size = 30
        while pdfmetrics.stringWidth(title, "Bold", size) > W - 120:
            size -= 1
        c.setFillColor(INK)
        c.setFont("Bold", size)
        c.drawCentredString(W / 2, H - 100, title)
        if sub:
            c.setFont("Body", 12)
            c.setFillColor(MUTED)
            c.drawCentredString(W / 2, H - 122, sub)
        c.setFont("Body", 12)
        c.setFillColor(INK)
        c.drawString(56, H - 150, "Name: ____________________")
        c.drawRightString(W - 56, H - 150, "Week of: ______________")

    def end(self):
        self.n += 1
        self.c.setFont("Body", 7.5)
        self.c.setFillColor(MUTED)
        self.c.drawCentredString(self.W / 2, 32, f"{self.n} · Kids Chore & Reward Charts · penny-and-plan.pages.dev")
        self.c.showPage()

    def grid(self, title, sub, rows, color_i, blank_rows=0):
        c, W, H = self.c, self.W, self.H
        self.header(title, sub, color_i)
        items = rows + [""] * blank_rows
        left, top, bottom = 50, H - 175, 90
        first = 170
        cw = (W - 2 * left - first) / 7
        rh = min(44, (top - bottom - 34) / len(items))
        for d, day in enumerate(DAYS):
            x = left + first + d * cw
            c.setFillColor(COLORS[d])
            c.roundRect(x + 2, top - 30, cw - 4, 28, 8, stroke=0, fill=1)
            c.setFillColor(white)
            c.setFont("Bold", 12)
            c.drawCentredString(x + cw / 2, top - 21, day)
        y = top - 36
        for i, it in enumerate(items):
            c.setFillColor(SOFT[i % 7])
            c.roundRect(left, y - rh + 3, first - 6, rh - 4, 8, stroke=0, fill=1)
            c.setFillColor(INK)
            fs = 11.5
            while it and pdfmetrics.stringWidth(it, "Bold", fs) > first - 20:
                fs -= 0.5
            c.setFont("Bold", fs)
            c.drawString(left + 10, y - rh / 2 - 3, it)
            for d in range(7):
                x = left + first + d * cw
                c.setStrokeColor(HexColor("#D5DBE5"))
                c.setLineWidth(1)
                c.roundRect(x + 4, y - rh + 5, cw - 8, rh - 8, 6, stroke=1, fill=0)
            y -= rh
        c.setFont("Bold", 12)
        c.setFillColor(INK)
        c.drawString(left, 66, "This week I earned:  ______  stars")
        c.drawRightString(W - left, 66, "My reward: ____________________")
        self.end()

    def routine(self, title, steps, color_i):
        c, W, H = self.c, self.W, self.H
        self.header(title, "Tick each step as you do it", color_i)
        top, bottom = H - 180, 80
        rh = min(62, (top - bottom) / len(steps))
        for i, s in enumerate(steps):
            y = top - i * rh
            c.setFillColor(COLORS[i % 7])
            c.circle(78, y - rh / 2 + 4, 16, stroke=0, fill=1)
            c.setFillColor(white)
            c.setFont("Bold", 15)
            c.drawCentredString(78, y - rh / 2 - 1, str(i + 1))
            c.setFillColor(SOFT[i % 7])
            c.roundRect(104, y - rh + 10, W - 230, rh - 12, 12, stroke=0, fill=1)
            c.setFillColor(INK)
            c.setFont("Bold", 17)
            c.drawString(122, y - rh / 2 - 2, s)
            c.setStrokeColor(COLORS[i % 7])
            c.setLineWidth(2.5)
            c.roundRect(W - 112, y - rh + 12, rh - 16, rh - 16, 8, stroke=1, fill=0)
        self.end()

    def stars(self, n, color_i):
        c, W, H = self.c, self.W, self.H
        self.header(f"My {n}-Star Reward Chart", "Colour in a star every time you do a great job!", color_i)
        cols = 5
        rows = (n + cols - 1) // cols
        top, bottom = H - 190, 150
        cell = min((W - 120) / cols, (top - bottom) / rows)
        x0 = (W - cell * cols) / 2
        for k in range(n):
            r, col = divmod(k, cols)
            cx = x0 + col * cell + cell / 2
            cy = top - r * cell - cell / 2
            star(self.c, cx, cy, cell * 0.38, None, COLORS[k % 7], 2.2)
            c.setFont("Bold", 10)
            c.setFillColor(MUTED)
            c.drawCentredString(cx, cy - 4, str(k + 1))
        c.setFillColor(SOFT[(color_i + 3) % 7])
        c.roundRect(60, 70, W - 120, 60, 14, stroke=0, fill=1)
        c.setFillColor(INK)
        c.setFont("Bold", 15)
        c.drawString(80, 94, "When I fill every star, I get: ______________________")
        self.end()

    def money(self):
        c, W, H = self.c, self.W, self.H
        self.header("Chore Money Tracker", "Earn, save, spend and share", 3)
        cols = ["Date", "Chore", "Earned", "Save", "Spend", "Share"]
        widths = [70, W - 112 - 70 - 4 * 64, 64, 64, 64, 64]
        y = H - 180
        x = 56
        for i, (h, w) in enumerate(zip(cols, widths)):
            c.setFillColor(COLORS[i % 7])
            c.roundRect(x + 2, y - 26, w - 4, 26, 6, stroke=0, fill=1)
            c.setFillColor(white)
            c.setFont("Bold", 11)
            c.drawCentredString(x + w / 2, y - 18, h)
            x += w
        y -= 30
        c.setStrokeColor(HexColor("#D5DBE5"))
        while y > 110:
            x = 56
            for w in widths:
                c.rect(x + 2, y - 24, w - 4, 24, stroke=1, fill=0)
                x += w
            y -= 26
        c.setFillColor(INK)
        c.setFont("Bold", 12)
        c.drawString(56, 80, "Totals:   Save $______    Spend $______    Share $______")
        self.end()

    def coupons(self):
        c, W, H = self.c, self.W, self.H
        self.header("Reward Coupons", "Cut out and give when a chart is full", 4)
        cols, rows = 2, 6
        top, bottom = H - 170, 60
        cw, ch = (W - 100) / cols, (top - bottom) / rows
        for k, t in enumerate(COUPONS):
            r, col = divmod(k, cols)
            x, y = 50 + col * cw, top - r * ch
            c.setDash(4, 4)
            c.setStrokeColor(MUTED)
            c.rect(x + 4, y - ch + 4, cw - 8, ch - 8, stroke=1, fill=0)
            c.setDash()
            c.setFillColor(SOFT[k % 7])
            c.roundRect(x + 12, y - ch + 12, cw - 24, ch - 24, 10, stroke=0, fill=1)
            star(c, x + 36, y - ch / 2, 14, COLORS[k % 7], COLORS[k % 7], 1)
            c.setFillColor(INK)
            c.setFont("Bold", 12)
            c.drawString(x + 60, y - ch / 2 + 2, t)
            c.setFont("Body", 9)
            c.setFillColor(MUTED)
            c.drawString(x + 60, y - ch / 2 - 13, "REWARD COUPON")
        self.end()

    def cover(self):
        c, W, H = self.c, self.W, self.H
        c.setFillColor(HexColor("#FFF7E8"))
        c.rect(0, 0, W, H, stroke=0, fill=1)
        for k in range(12):
            star(c, 60 + (k * 97) % (W - 100), 80 + (k * 151) % (H - 180), 14 + (k % 3) * 6, COLORS[k % 7], COLORS[k % 7], 1)
        c.setFillColor(white)
        c.roundRect(50, H * 0.38, W - 100, H * 0.36, 24, stroke=0, fill=1)
        c.setFillColor(INK)
        c.setFont("Bold", 38)
        c.drawCentredString(W / 2, H * 0.64, "Kids Chore &")
        c.drawCentredString(W / 2, H * 0.64 - 46, "Reward Charts")
        c.setFont("Body", 14)
        c.setFillColor(MUTED)
        c.drawCentredString(W / 2, H * 0.64 - 84, "Chore charts · routines · sticker charts · coupons")
        c.drawCentredString(W / 2, H * 0.64 - 106, "Ages 3–12 · print at home")
        c.setFont("Bold", 12)
        c.setFillColor(INK)
        c.drawCentredString(W / 2, 50, "Penny & Plan")
        c.showPage()

    def howto(self):
        c, W, H = self.c, self.W, self.H
        c.setFillColor(INK)
        c.setFont("Bold", 26)
        c.drawString(56, H - 90, "How to use these charts")
        tips = ["Pick the chart for your child's age, or use the blank chart and write your own chores.",
                "Put the chart on the fridge at your child's eye level. Use stickers, stamps or a marker.",
                "Start small: 3–5 chores are plenty for young kids. Add more when it becomes a habit.",
                "Agree on the reward together before you start, and write it on the chart.",
                "Routine checklists help with busy mornings and calm bedtimes: no more nagging.",
                "Slip charts into a plastic sleeve and use a dry-erase marker to reuse them every week.",
                "Personal and classroom use: print as many copies as you need."]
        y = H - 140
        for i, t in enumerate(tips):
            star(c, 66, y + 4, 8, COLORS[i % 7], COLORS[i % 7], 1)
            c.setFillColor(INK)
            c.setFont("Body", 12.5)
            line = ""
            for w in t.split():
                if pdfmetrics.stringWidth((line + " " + w).strip(), "Body", 12.5) > W - 140:
                    c.drawString(84, y, line)
                    y -= 17
                    line = w
                else:
                    line = (line + " " + w).strip()
            c.drawString(84, y, line)
            y -= 30
        self.end()

    def save(self):
        self.c.save()


def build(out, size, suffix):
    path = out / f"Kids-Chore-Reward-Charts-{suffix}.pdf"
    b = Book(path, size)
    b.cover()
    b.howto()
    for i, (age, rows) in enumerate(CHORES.items()):
        b.grid(f"My Chore Chart · {age}", "Colour, tick or put a sticker in the box when it's done", rows, i)
    b.grid("My Chore Chart", "Write your own chores", [], 3, blank_rows=10)
    b.grid("Family Chore Chart", "Write a name and a chore on each line", [], 5, blank_rows=10)
    for i, (t, steps) in enumerate(ROUTINES.items()):
        b.routine(t, steps, i + 1)
    for i, n in enumerate((10, 20, 30)):
        b.stars(n, i + 2)
    b.money()
    b.coupons()
    b.save()
    return path, b.n + 1


def main():
    out = Path(sys.argv[1] if len(sys.argv) > 1 else "dist")
    for size, suffix in ((letter, "US-Letter"), (A4, "A4")):
        print(*build(out, size, suffix))


if __name__ == "__main__":
    main()
