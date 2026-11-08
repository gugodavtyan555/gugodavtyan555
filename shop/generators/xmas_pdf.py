"""Builds the Christmas Party Games Bundle (printable PDF, US Letter + A4).

Usage: python3 xmas_pdf.py <output_dir>
"""
import math
import random
import sys
from pathlib import Path

from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4, letter
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

import xmas_content as X

pdfmetrics.registerFont(TTFont("Body", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"))
pdfmetrics.registerFont(TTFont("Bold", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"))
pdfmetrics.registerFont(TTFont("Serif", "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"))

RED = HexColor("#B3262E")
GREEN = HexColor("#1F5E3B")
GOLD = HexColor("#C9A227")
CREAM = HexColor("#FBF6EE")
INK = HexColor("#2B2118")
MUTED = HexColor("#7A6E62")
LINE = HexColor("#D9CFC0")
FLAKE = HexColor("#E9DFCF")
SITE = "penny-and-plan.pages.dev"


def wrap(text, font, size, width):
    out = []
    for para in text.split("\n"):
        line = ""
        for w in para.split():
            t = (line + " " + w).strip()
            if pdfmetrics.stringWidth(t, font, size) <= width:
                line = t
            else:
                out.append(line)
                line = w
        out.append(line)
    return out


class Book:
    def __init__(self, path, size):
        self.W, self.H = size
        self.c = canvas.Canvas(str(path), pagesize=size)
        self.c.setTitle("Christmas Party Games Bundle")
        self.c.setAuthor("Penny & Plan")
        self.n = 0
        self.rng = random.Random(25)

    def t(self, x, y, s, size, font="Body", color=INK, anchor="l"):
        self.c.setFont(font, size)
        self.c.setFillColor(color)
        {"l": self.c.drawString, "c": self.c.drawCentredString, "r": self.c.drawRightString}[anchor](x, y, s)

    def para(self, x, y, text, size, width, font="Body", color=INK, lead=1.45, anchor="l"):
        for ln in wrap(text, font, size, width):
            self.t(x + (width / 2 if anchor == "c" else 0), y, ln, size, font, color, anchor)
            y -= size * lead
        return y

    def flake(self, x, y, r, color=FLAKE, w=1.4):
        c = self.c
        c.setStrokeColor(color)
        c.setLineWidth(w)
        c.setLineCap(1)
        for k in range(6):
            a = math.pi / 3 * k
            ex, ey = x + r * math.cos(a), y + r * math.sin(a)
            c.line(x, y, ex, ey)
            for f in (0.55, 0.8):
                bx, by = x + r * f * math.cos(a), y + r * f * math.sin(a)
                for s in (-1, 1):
                    b = a + s * math.pi / 4
                    c.line(bx, by, bx + r * 0.22 * math.cos(b), by + r * 0.22 * math.sin(b))

    def page(self, title=None, sub=None):
        c = self.c
        c.setFillColor(CREAM)
        c.rect(0, 0, self.W, self.H, stroke=0, fill=1)
        for fx, fy, fr in ((40, self.H - 40, 22), (self.W - 46, self.H - 70, 16), (self.W - 30, 60, 20), (30, 100, 12)):
            self.flake(fx, fy, fr)
        c.setFillColor(RED)
        c.rect(0, self.H - 12, self.W, 12, stroke=0, fill=1)
        c.setFillColor(GREEN)
        c.rect(0, 0, self.W, 8, stroke=0, fill=1)
        if title:
            self.t(self.W / 2, self.H - 70, title, 30, "Serif", RED, "c")
            if sub:
                self.t(self.W / 2, self.H - 96, sub, 13, "Body", MUTED, "c")

    def end(self):
        self.n += 1
        self.t(self.W / 2, 20, f"{self.n}  ·  Christmas Party Games  ·  {SITE}", 8, color=MUTED, anchor="c")
        self.c.showPage()

    def cut_cards(self, items, cols, rows, render, top_pad=120, bottom=50, gap=0):
        W, H = self.W, self.H
        cw = (W - 70) / cols
        ch = (H - top_pad - bottom) / rows
        per = cols * rows
        pages = []
        for k in range(0, len(items), per):
            pages.append(items[k:k + per])
        return cw, ch, per, pages

    def card_grid(self, title, sub, items, cols, rows, draw_card):
        W, H = self.W, self.H
        top, bottom = H - 120, 45
        cw, ch = (W - 70) / cols, (top - bottom) / rows
        for k in range(0, len(items), cols * rows):
            self.page(title, sub)
            c = self.c
            for j, item in enumerate(items[k:k + cols * rows]):
                x = 35 + (j % cols) * cw
                y = top - (j // cols) * ch
                c.setDash(4, 4)
                c.setStrokeColor(LINE)
                c.setLineWidth(0.8)
                c.rect(x, y - ch, cw, ch, stroke=1, fill=0)
                c.setDash()
                draw_card(x, y, cw, ch, item, k + j)
            self.end()

    def save(self):
        self.c.save()


def cover(b):
    c = b.c
    c.setFillColor(RED)
    c.rect(0, 0, b.W, b.H, stroke=0, fill=1)
    rng = random.Random(3)
    for _ in range(26):
        b.flake(rng.uniform(20, b.W - 20), rng.uniform(20, b.H - 20), rng.uniform(8, 26), HexColor("#C9474E"), 1.6)
    c.setFillColor(CREAM)
    c.roundRect(50, b.H * 0.28, b.W - 100, b.H * 0.46, 22, stroke=0, fill=1)
    b.t(b.W / 2, b.H * 0.64, "Christmas", 52, "Serif", RED, "c")
    b.t(b.W / 2, b.H * 0.575, "Party Games", 44, "Serif", GREEN, "c")
    b.t(b.W / 2, b.H * 0.52, "9 printable games for kids, families & friends", 15, "Body", INK, "c")
    games = ["Scavenger Hunt", "Trivia", "Bingo (30 cards)", "Who Am I?", "Charades", "Would You Rather",
             "Word Scramble", "Finish the Carol", "Left-Right Gift Game"]
    for i, g in enumerate(games):
        col, row = i % 3, i // 3
        b.t(b.W / 2 + (col - 1) * (b.W - 140) / 3, b.H * 0.45 - row * 24, "★ " + g, 12, "Bold", GREEN, "c")
    b.t(b.W / 2, b.H * 0.31, "Answer keys included · Print at home on Letter or A4", 11, "Body", MUTED, "c")
    b.t(b.W / 2, 50, "Penny & Plan", 16, "Bold", white, "c")
    c.showPage()


def contents(b):
    b.page("How to use this bundle")
    y = b.H - 140
    tips = [
        "Print only the pages you need. Card pages have dashed lines: cut along them with scissors.",
        "Card stock or thicker paper makes the cards last for next year too.",
        "Answer keys are at the end of each game. Keep them away from sharp-eyed guests!",
        "Most games work for ages 6 and up. Trivia and Would You Rather are fun for grown-ups too.",
        "Personal use only: print as many copies as you like for your own family, party or classroom.",
    ]
    for tip in tips:
        b.t(60, y, "★", 13, "Bold", GOLD)
        y = b.para(82, y, tip, 13, b.W - 150) - 12
    y -= 10
    b.t(60, y, "What's inside", 18, "Serif", GREEN)
    y -= 30
    for name, desc in [("Scavenger Hunt", "12 rhyming clues that lead around the house to a prize"),
                       ("Christmas Trivia", "40 questions with an answer key"),
                       ("Christmas Bingo", "30 different bingo cards and a caller's sheet"),
                       ("Who Am I?", "40 guessing cards"), ("Charades", "40 acting cards"),
                       ("Would You Rather", "40 silly and cosy questions"),
                       ("Word Scramble", "25 festive words to unscramble, with answers"),
                       ("Finish the Carol", "16 lines from traditional carols"),
                       ("Left-Right Gift Game", "an original story for passing presents around")]:
        b.t(70, y, name, 13, "Bold", RED)
        b.t(230, y, desc, 12)
        y -= 24
    b.end()


def rules(b, title, steps, extra=None):
    b.page(title, "How to play")
    y = b.H - 150
    for i, s in enumerate(steps, 1):
        b.c.setFillColor(GREEN)
        b.c.circle(72, y + 5, 12, stroke=0, fill=1)
        b.t(72, y, str(i), 12, "Bold", white, "c")
        y = b.para(96, y, s, 14, b.W - 160) - 14
    if extra:
        extra(y)
    b.end()


def scavenger(b):
    rules(b, "Christmas Scavenger Hunt", [
        "Cut out the 12 clue cards on the next pages.",
        "Use the hiding chart below: hide each card in the place listed BEFORE the hunt starts. Hide a small prize by the stockings (or wherever you like).",
        "Hand card 1 to the players. Each clue tells them where the next card is hidden.",
        "Kids who can't read yet can team up with an older helper who reads the clues aloud.",
    ], extra=lambda y: hiding_chart(b, y))
    def draw(x, y, w, h, item, i):
        clue, _ = item
        b.t(x + 14, y - 26, f"CLUE {i + 1}", 12, "Bold", RED)
        b.flake(x + w - 26, y - 22, 10, GOLD, 1)
        b.para(x + 14, y - 62, clue, 15, w - 28, lead=1.45)
    b.card_grid("Scavenger Hunt Clues", "Cut along the dashed lines", X.HUNT, 2, 3, draw)


def hiding_chart(b, y):
    y -= 6
    b.t(60, y, "Hiding chart (for grown-ups)", 15, "Serif", GREEN)
    y -= 24
    b.t(70, y, "Card 1", 11, "Bold")
    b.t(150, y, "Give to the players to start", 11)
    y -= 18
    for i, (_clue, place) in enumerate(X.HUNT[:-1]):
        b.t(70, y, f"Card {i + 2}", 11, "Bold")
        b.t(150, y, place, 11)
        y -= 18
    b.t(70, y, "Prize", 11, "Bold", RED)
    b.t(150, y, X.HUNT[-1][1].replace("Your prize: ", ""), 11)


def trivia(b):
    rules(b, "Christmas Trivia", [
        "Play in teams or on your own. Give each team a pen and the question sheets, or read the questions aloud.",
        "One point for each correct answer. The host has the answer key on the last page.",
        "Tie? Each team writes down a guess for: 'How many lights are on our tree?' Closest wins!",
    ])
    qs = X.TRIVIA
    for k in range(0, len(qs), 20):
        b.page("Christmas Trivia", f"Questions {k + 1}–{k + 20}")
        y = b.H - 130
        for i, (q, _a) in enumerate(qs[k:k + 20], k + 1):
            b.t(50, y, f"{i}.", 11, "Bold", RED)
            yy = b.para(72, y, q, 11, b.W - 130)
            b.c.setStrokeColor(LINE)
            b.c.line(72, yy + 2, b.W - 50, yy + 2)
            y = yy - 9
        b.end()
    b.page("Trivia Answer Key")
    y = b.H - 125
    for i, (_q, a) in enumerate(qs, 1):
        col = 0 if i <= 20 else 1
        yy = b.H - 125 - ((i - 1) % 20) * 29
        x = 50 + col * (b.W - 80) / 2
        b.t(x, yy, f"{i}.", 10.5, "Bold", RED)
        b.para(x + 22, yy, a, 10.5, (b.W - 80) / 2 - 30, lead=1.25)
    b.end()


def bingo(b):
    rng = random.Random(1225)
    cards, seen = [], set()
    while len(cards) < 30:
        pick = rng.sample(X.BINGO, 24)
        key = tuple(pick)
        if key in seen:
            continue
        seen.add(key)
        cards.append(pick[:12] + ["FREE"] + pick[12:])
    assert len({tuple(cd) for cd in cards}) == 30
    rules(b, "Christmas Bingo", [
        "Give each player a different bingo card (there are 30) and some markers: buttons, sweets or a pen.",
        "The caller cuts up the caller's sheet, mixes the words in a bowl and reads them out one by one.",
        "Players mark a word when it's called. The FREE square in the middle is already marked.",
        "First to get five in a row (across, down or diagonally) shouts BINGO! Check their card against the called words.",
    ])
    b.page("Bingo: Caller's Sheet", "Cut out the words and draw them from a bowl, or tick them off as you call them")
    cols, rows = 4, 10
    cw, ch = (b.W - 70) / cols, (b.H - 170) / rows
    for i, w in enumerate(X.BINGO):
        x = 35 + (i % cols) * cw
        y = b.H - 125 - (i // cols) * ch
        b.c.setDash(3, 3)
        b.c.setStrokeColor(LINE)
        b.c.rect(x, y - ch, cw, ch, stroke=1, fill=0)
        b.c.setDash()
        b.t(x + cw / 2, y - ch / 2 - 4, w, 11, "Bold", GREEN, "c")
    b.end()
    size = min(b.W - 110, b.H - 230)
    for k, cd in enumerate(cards):
        b.page("Christmas Bingo")
        x = (b.W - size) / 2
        top = b.H - 115
        cell = size / 5
        for i, letter in enumerate("BINGO"):
            b.c.setFillColor(RED if i % 2 == 0 else GREEN)
            b.c.rect(x + i * cell, top - 50, cell, 50, stroke=0, fill=1)
            b.t(x + (i + .5) * cell, top - 37, letter, 32, "Serif", white, "c")
        gy = top - 50
        for r in range(5):
            for col in range(5):
                w = cd[r * 5 + col]
                cx, cy = x + col * cell, gy - r * cell
                b.c.setStrokeColor(INK)
                b.c.setLineWidth(1.2)
                b.c.setFillColor(white if w != "FREE" else HexColor("#F7E9C4"))
                b.c.rect(cx, cy - cell, cell, cell, stroke=1, fill=1)
                if w == "FREE":
                    b.flake(cx + cell / 2, cy - cell / 2 + 8, cell * 0.22, GOLD, 1.6)
                    b.t(cx + cell / 2, cy - cell + 14, "FREE", 14, "Bold", RED, "c")
                    continue
                fs = 15
                while True:
                    lines = wrap(w, "Bold", fs, cell - 10)
                    if all(pdfmetrics.stringWidth(ln, "Bold", fs) <= cell - 10 for ln in lines):
                        break
                    fs -= 0.5
                lead = fs * 1.2
                y0 = cy - cell / 2 + (len(lines) - 1) * lead / 2 - fs * 0.35
                for li, ln in enumerate(lines):
                    b.t(cx + cell / 2, y0 - li * lead, ln, fs, "Bold", INK, "c")
        b.t(x + size, gy - size - 18, f"Card {k + 1} of 30", 10, color=MUTED, anchor="r")
        b.end()


def simple_cards(b, title, items, rules_steps, label, cols=2, rows=4, size=15):
    rules(b, title, rules_steps)

    def draw(x, y, w, h, item, i):
        b.t(x + 12, y - 20, label, 9, "Bold", GOLD)
        lines = wrap(item, "Bold", size, w - 30)
        start = y - h / 2 + (len(lines) - 1) * size * 0.65 - size * 0.3
        for li, ln in enumerate(lines):
            b.t(x + w / 2, start - li * size * 1.3, ln, size, "Bold", GREEN if i % 2 else RED, "c")
    b.card_grid(title, "Cut along the dashed lines", items, cols, rows, draw)


def scramble(b):
    rng = random.Random(7)
    pairs = []
    for w in X.SCRAMBLE:
        s = w
        while s == w:
            s = "".join(rng.sample(w, len(w)))
        pairs.append((s, w))
    b.page("Christmas Word Scramble", "Unscramble each festive word")
    y = b.H - 135
    for i, (s, _w) in enumerate(pairs, 1):
        col = 0 if i <= 13 else 1
        yy = b.H - 140 - ((i - 1) % 13) * 46
        x = 50 + col * (b.W - 80) / 2
        b.t(x, yy, f"{i}.", 12, "Bold", RED)
        b.t(x + 26, yy, " ".join(s), 13, "Bold", GREEN)
        b.c.setStrokeColor(LINE)
        b.c.line(x + 26, yy - 18, x + (b.W - 80) / 2 - 30, yy - 18)
    b.end()
    b.page("Word Scramble Answers")
    for i, (_s, w) in enumerate(pairs, 1):
        col = 0 if i <= 13 else 1
        yy = b.H - 140 - ((i - 1) % 13) * 30
        x = 60 + col * (b.W - 100) / 2
        b.t(x, yy, f"{i}.  {w}", 13, "Bold", GREEN)
    b.end()


def carols(b):
    b.page("Finish the Carol", "Fill in the missing word from each traditional carol")
    y = b.H - 140
    for i, (line, _a) in enumerate(X.CAROLS, 1):
        b.t(50, y, f"{i}.", 12, "Bold", RED)
        y = b.para(76, y, line, 12.5, b.W - 130) - 16
    b.end()
    b.page("Finish the Carol: Answers")
    y = b.H - 140
    for i, (line, a) in enumerate(X.CAROLS, 1):
        b.t(60, y, f"{i}.  {a}", 13, "Bold", GREEN)
        y -= 27
    b.end()


def left_right(b):
    rules(b, "Left-Right Gift Game", [
        "Everyone sits in a circle holding a wrapped gift.",
        "One person reads the story out loud, slowly.",
        "Every time you hear LEFT, pass your gift to the person on your left. Every time you hear RIGHT, pass it to the right.",
        "When the story ends, the gift in your hands is yours to keep!",
    ])
    b.page("The Night Before Christmas Game", "Read aloud: pass LEFT or RIGHT every time you hear the word")
    y = b.H - 130
    for p in X.LEFT_RIGHT.split("\n\n"):
        lines = wrap(p, "Body", 12.5, b.W - 110)
        if y - len(lines) * 18 < 50:
            b.end()
            b.page("The Night Before Christmas Game", "continued")
            y = b.H - 130
        for ln in lines:
            # draw LEFT/RIGHT in bold colour
            x = 55
            for k, word in enumerate(ln.split(" ")):
                core = word.strip('.,!?"\'')
                font, col = ("Bold", RED) if core == "LEFT" else (("Bold", GREEN) if core == "RIGHT" else ("Body", INK))
                b.t(x, y, word, 12.5, font, col)
                x += pdfmetrics.stringWidth(word + " ", font, 12.5)
            y -= 18.5
        y -= 10
    b.end()


def build(out, size, suffix):
    b = Book(out / f"Christmas-Party-Games-{suffix}.pdf", size)
    cover(b)
    contents(b)
    scavenger(b)
    trivia(b)
    bingo(b)
    simple_cards(b, "Who Am I?", X.WHO_AM_I, [
        "Cut out the cards and put them face down in a pile.",
        "One player takes a card and holds it on their forehead without looking (or tapes it to their back).",
        "They ask yes-or-no questions like 'Am I food?' or 'Do I live at the North Pole?' until they guess who or what they are.",
        "Take turns. The player who needs the fewest questions wins.",
    ], "WHO AM I?")
    simple_cards(b, "Christmas Charades", X.CHARADES, [
        "Split into two teams and put the cut-out cards in a bowl.",
        "One player draws a card and acts it out without speaking, pointing at words or making sounds.",
        "Their team has one minute to guess. One point for each correct guess.",
        "Take turns until the bowl is empty. The team with the most points wins.",
    ], "ACT IT OUT")
    simple_cards(b, "Would You Rather", X.WOULD_YOU_RATHER, [
        "Cut out the cards and take turns reading one aloud.",
        "Everyone chooses an answer and explains why. There are no wrong answers!",
        "For a twist: everyone points left or right at the same time to vote, then the minority side tells their reasons.",
    ], "WOULD YOU RATHER", cols=2, rows=5, size=12)
    scramble(b)
    carols(b)
    left_right(b)
    b.save()
    return b.n


def main():
    out = Path(sys.argv[1] if len(sys.argv) > 1 else "dist")
    out.mkdir(parents=True, exist_ok=True)
    for size, suffix in ((letter, "US-Letter"), (A4, "A4")):
        print("built", suffix, build(out, size, suffix) + 1, "pages")


if __name__ == "__main__":
    main()
