"""Builds the Armenian Alphabet printable pack for kids (Eastern Armenian, 39 letters), US Letter + A4.

Usage: python3 armenian_pdf.py <output_dir>
"""
import sys
from pathlib import Path

from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4, letter
from reportlab.pdfbase import pdfmetrics

import xmas_pdf as P

P.RED = HexColor("#C1272D")    # flag red
P.GREEN = HexColor("#1F4E9A")  # flag blue
P.GOLD = HexColor("#F2A800")   # flag orange
P.CREAM = HexColor("#FFFBF3")
P.FLAKE = HexColor("#F3E6CC")
TITLE = "Armenian Alphabet for Kids"
TRACE = HexColor("#D5D9E0")
INK = P.INK
wrap = P.wrap

# upper, lower, letter name, sound, example word, transliteration, meaning, note
LETTERS = [
    ("Ա", "ա", "Այբ", "a", "Արև", "arev", "sun", ""),
    ("Բ", "բ", "Բեն", "b", "Բու", "bu", "owl", ""),
    ("Գ", "գ", "Գիմ", "g", "Գիրք", "girk", "book", ""),
    ("Դ", "դ", "Դա", "d", "Դուռ", "dur", "door", ""),
    ("Ե", "ե", "Եչ", "ye / e", "Եղնիկ", "yeghnik", "deer", ""),
    ("Զ", "զ", "Զա", "z", "Զատիկ", "zatik", "ladybug", ""),
    ("Է", "է", "Է", "e", "Էշ", "esh", "donkey", ""),
    ("Ը", "ը", "Ըթ", "ə (as in 'about')", "Ընկույզ", "ənkuyz", "walnut", ""),
    ("Թ", "թ", "Թո", "t (with a puff of air)", "Թիթեռ", "titer", "butterfly", ""),
    ("Ժ", "ժ", "Ժե", "zh (as in 'measure')", "Ժամացույց", "zhamatsuyts", "clock", ""),
    ("Ի", "ի", "Ինի", "i", "Ինքնաթիռ", "inknatir", "airplane", ""),
    ("Լ", "լ", "Լյուն", "l", "Լուսին", "lusin", "moon", ""),
    ("Խ", "խ", "Խե", "kh (as in 'Bach')", "Խնձոր", "khndzor", "apple", ""),
    ("Ծ", "ծ", "Ծա", "ts", "Ծաղիկ", "tsaghik", "flower", ""),
    ("Կ", "կ", "Կեն", "k", "Կատու", "katu", "cat", ""),
    ("Հ", "հ", "Հո", "h", "Հաց", "hats", "bread", ""),
    ("Ձ", "ձ", "Ձա", "dz", "Ձուկ", "dzuk", "fish", ""),
    ("Ղ", "ղ", "Ղատ", "gh (a soft throat 'r')", "Ղեկ", "ghek", "steering wheel", ""),
    ("Ճ", "ճ", "Ճե", "ch", "Ճնճղուկ", "chnchghuk", "sparrow", ""),
    ("Մ", "մ", "Մեն", "m", "Մուկ", "muk", "mouse", ""),
    ("Յ", "յ", "Յի", "y", "Յոթ", "yot", "seven", ""),
    ("Ն", "ն", "Նու", "n", "Նուռ", "nur", "pomegranate", ""),
    ("Շ", "շ", "Շա", "sh", "Շուն", "shun", "dog", ""),
    ("Ո", "ո", "Ո", "vo / o", "Ոզնի", "vozni", "hedgehog", ""),
    ("Չ", "չ", "Չա", "ch (with a puff of air)", "Չամիչ", "chamich", "raisins", ""),
    ("Պ", "պ", "Պե", "p", "Պանիր", "panir", "cheese", ""),
    ("Ջ", "ջ", "Ջե", "j", "Ջուր", "jur", "water", ""),
    ("Ռ", "ռ", "Ռա", "rr (rolled r)", "Ռետին", "retin", "eraser", ""),
    ("Ս", "ս", "Սե", "s", "Սեղան", "seghan", "table", ""),
    ("Վ", "վ", "Վեվ", "v", "Վարդ", "vard", "rose", ""),
    ("Տ", "տ", "Տյուն", "t", "Տուն", "tun", "house", ""),
    ("Ր", "ր", "Րե", "r (soft r)", "Ծիրան", "tsiran", "apricot", "Ր never starts a word, so look for it in the middle!"),
    ("Ց", "ց", "Ցո", "ts (with a puff of air)", "Ցուլ", "tsul", "bull", ""),
    ("Ու", "ու", "Ու", "u (as in 'moon')", "Ուղտ", "ught", "camel", "Ու is written with two signs, but it is one sound."),
    ("Փ", "փ", "Փյուր", "p (with a puff of air)", "Փիղ", "pigh", "elephant", ""),
    ("Ք", "ք", "Քե", "k (with a puff of air)", "Քար", "kar", "stone", ""),
    ("և", "և", "Եվ", "yev", "Երևան", "Yerevan", "Yerevan, the capital of Armenia", "և also means 'and'. It has no capital letter."),
    ("Օ", "օ", "Օ", "o", "Օձ", "odz", "snake", ""),
    ("Ֆ", "ֆ", "Ֆե", "f", "Ֆուտբոլ", "futbol", "football (soccer)", ""),
]
assert len(LETTERS) == 39


class Kit(P.Book):
    def __init__(self, path, size):
        super().__init__(path, size)
        self.c.setTitle(TITLE)

    def end(self):
        self.n += 1
        self.t(self.W / 2, 20, f"{self.n}  ·  {TITLE}  ·  {P.SITE}", 8, color=P.MUTED, anchor="c")
        self.c.showPage()

    def outline(self, x, y, text, size, color, anchor="c", width=2.2):
        c = self.c
        c.saveState()
        tobj = c.beginText()
        tobj.setTextRenderMode(1)  # stroke only: a hollow letter to colour in
        tobj.setFont("Bold", size)
        c.setStrokeColor(color)
        c.setLineWidth(width)
        w = pdfmetrics.stringWidth(text, "Bold", size)
        tobj.setTextOrigin(x - (w / 2 if anchor == "c" else 0), y)
        tobj.textOut(text)
        c.drawText(tobj)
        c.restoreState()

    def guide_row(self, x, y, w, h, sample, reps):
        """A handwriting row: top line, dashed midline, baseline, with light letters to trace."""
        c = self.c
        c.setStrokeColor(HexColor("#9AA5B5"))
        c.setLineWidth(0.8)
        c.line(x, y, x + w, y)
        c.line(x, y - h, x + w, y - h)
        c.setDash(3, 3)
        c.setStrokeColor(HexColor("#C3CBD6"))
        c.line(x, y - h * 0.45, x + w, y - h * 0.45)
        c.setDash()
        fs = h * 0.98
        reps = max(1, min(reps, int(w // (pdfmetrics.stringWidth(sample, "Body", fs) + fs * 0.6))))
        gap = w / reps
        for i in range(reps):
            color = INK if i == 0 else TRACE
            self.t(x + gap * (i + .5), y - h + 2, sample, fs, "Body", color, "c")


def cover(k):
    c = k.c
    for i, col in enumerate((P.RED, P.GREEN, P.GOLD)):
        c.setFillColor(col)
        c.rect(0, k.H - (i + 1) * k.H / 3, k.W, k.H / 3, stroke=0, fill=1)
    c.setFillColor(P.CREAM)
    c.roundRect(45, k.H * 0.22, k.W - 90, k.H * 0.56, 24, stroke=0, fill=1)
    k.t(k.W / 2, k.H * 0.70, "Ա Բ Գ", 64, "Bold", P.RED, "c")
    k.t(k.W / 2, k.H * 0.60, "Հայոց այբուբեն", 34, "Bold", P.GREEN, "c")
    k.t(k.W / 2, k.H * 0.53, "Armenian Alphabet for Kids", 26, "Serif", INK, "c")
    k.t(k.W / 2, k.H * 0.47, "Tracing · colouring · flashcards · alphabet poster", 14, "Body", P.MUTED, "c")
    k.t(k.W / 2, k.H * 0.42, "All 39 letters · Eastern Armenian · ages 3–8", 13, "Bold", P.RED, "c")
    k.t(k.W / 2, k.H * 0.27, "Print at home on Letter or A4", 11, "Body", P.MUTED, "c")
    k.t(k.W / 2, 40, "Penny & Plan", 15, "Bold", white, "c")
    c.showPage()


def parents(k):
    k.page("For Parents", "How to use this pack")
    y = k.H - 130
    for i, s in enumerate([
        "This pack follows the Eastern Armenian alphabet taught in Armenia today: 39 letters, including Ու and և.",
        "Start with the alphabet poster. Say each letter's name and sound together, then look for it in the example word.",
        "Use one letter page a day: colour the big letter, say the word, then trace the light grey letters. The first letter in each row is the example.",
        "Cut out the flashcards for games: find the letter, match capital and small letters, or 'what sound does it make?'.",
        "Pronunciation in this pack uses simple English spelling. Letters 'with a puff of air' (Թ, Չ, Փ, Ք, Ց) are breathier than their partners (Տ, Ճ, Պ, Կ, Ծ).",
        "Print as many copies as you like for your own family or classroom. Practice makes perfect!",
    ], 1):
        k.c.setFillColor(P.GREEN)
        k.c.circle(70, y + 5, 12, stroke=0, fill=1)
        k.t(70, y, str(i), 12, "Bold", white, "c")
        y = k.para(94, y, s, 12.5, k.W - 150) - 12
    k.end()


def poster(k):
    k.page("Հայոց այբուբեն", "The Armenian alphabet")
    cols, rows = 5, 8
    top, bottom = k.H - 115, 45
    cw, ch = (k.W - 70) / cols, (top - bottom) / rows
    palette = [P.RED, P.GREEN, P.GOLD]
    for i, (up, lo, name, *_rest) in enumerate(LETTERS):
        r, cc = divmod(i, cols)
        x, y = 35 + cc * cw, top - r * ch
        k.c.setFillColor(HexColor("#FFFFFF"))
        k.c.setStrokeColor(HexColor("#EADFCB"))
        k.c.roundRect(x + 3, y - ch + 3, cw - 6, ch - 6, 8, stroke=1, fill=1)
        k.t(x + cw / 2, y - ch * 0.55, f"{up} {lo}" if up != lo else lo, ch * 0.36, "Bold", palette[i % 3], "c")
        k.t(x + cw / 2, y - ch * 0.85, name, ch * 0.16, "Body", P.MUTED, "c")
    k.end()


def letter_page(k, i, row):
    up, lo, name, sound, word, tr, meaning, note = row
    k.page()
    color = [P.RED, P.GREEN, P.GOLD][i % 3]
    k.t(55, k.H - 60, f"{i + 1} / 39", 11, "Bold", P.MUTED)
    big = min(k.W, k.H) * 0.30
    label = f"{up}{lo}" if up != lo else lo
    while pdfmetrics.stringWidth(label, "Bold", big) > k.W - 140:
        big -= 4
    k.outline(k.W / 2, k.H - 80 - big * 0.85, label, big, color, width=2.6)
    y = k.H - 125 - big * 0.95
    k.t(k.W / 2, y, f"Letter name: {name}", 18, "Bold", INK, "c")
    k.t(k.W / 2, y - 24, f"Sound: {sound}", 14, "Body", P.MUTED, "c")
    y -= 62
    k.t(k.W / 2, y, word, 30, "Bold", color, "c")
    k.t(k.W / 2, y - 24, f"{tr}  ·  {meaning}", 13, "Body", INK, "c")
    if note:
        k.t(k.W / 2, y - 44, note, 11, "Body", P.MUTED, "c")
    y -= 70
    h = 44
    w = k.W - 110
    samples = [(up, 7), (lo, 8), (word, 3)] if up != lo else [(lo, 8), (lo, 8), (word, 3)]
    samples += [("", 1), ("", 1)]  # free practice lines
    for sample, reps in samples:
        k.guide_row(55, y, w, h, sample, reps)
        y -= h + 26
    k.end()


def flashcards(k):
    def draw(x, y, w, h, row, i):
        up, lo, name, sound, word, tr, meaning, _ = row
        color = [P.RED, P.GREEN, P.GOLD][i % 3]
        label = f"{up} {lo}" if up != lo else lo
        k.t(x + w / 2, y - h * 0.48, label, h * 0.34, "Bold", color, "c")
        k.t(x + w / 2, y - h * 0.68, word, h * 0.11, "Bold", INK, "c")
        k.t(x + w / 2, y - h * 0.84, f"{tr} · {meaning}", h * 0.065, "Body", P.MUTED, "c")
    k.card_grid("Flashcards", "Cut along the dashed lines", LETTERS, 2, 4, draw)


def certificate(k):
    k.page()
    k.c.setStrokeColor(P.GOLD)
    k.c.setLineWidth(4)
    k.c.roundRect(40, 60, k.W - 80, k.H - 120, 20, stroke=1, fill=0)
    k.t(k.W / 2, k.H - 180, "Շնորհավորո՛ւմ ենք", 30, "Bold", P.RED, "c")
    k.t(k.W / 2, k.H - 215, "Congratulations!", 18, "Body", P.MUTED, "c")
    k.t(k.W / 2, k.H - 290, "Alphabet Star", 40, "Serif", P.GREEN, "c")
    k.t(k.W / 2, k.H - 340, "This certifies that", 14, "Body", INK, "c")
    k.c.setStrokeColor(INK)
    k.c.setLineWidth(1)
    k.c.line(k.W / 2 - 170, k.H - 400, k.W / 2 + 170, k.H - 400)
    k.t(k.W / 2, k.H - 440, "knows all 39 letters of the Armenian alphabet!", 15, "Body", INK, "c")
    k.t(k.W / 2, k.H - 470, "Ա Բ Գ Դ Ե Զ Է Ը Թ Ժ Ի Լ Խ", 18, "Bold", P.GOLD, "c")
    k.t(k.W / 2, 150, "Date: ________________", 13, "Body", INK, "c")
    k.end()


def build(out, size, suffix):
    k = Kit(out / f"Armenian-Alphabet-for-Kids-{suffix}.pdf", size)
    cover(k)
    parents(k)
    poster(k)
    for i, row in enumerate(LETTERS):
        letter_page(k, i, row)
    flashcards(k)
    certificate(k)
    k.save()
    return k.n + 1


def main():
    out = Path(sys.argv[1] if len(sys.argv) > 1 else "dist")
    out.mkdir(parents=True, exist_ok=True)
    for size, suffix in ((letter, "US-Letter"), (A4, "A4")):
        print("built", suffix, build(out, size, suffix), "pages")


if __name__ == "__main__":
    main()
