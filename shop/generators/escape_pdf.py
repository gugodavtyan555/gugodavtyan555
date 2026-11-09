"""Builds 'Escape the Clockwork Lab', a printable escape room for kids aged 7-12 (US Letter + A4).

Six puzzles, each giving one digit of the final code. Every puzzle is generated
from a fixed seed and checked by code so its answer is the only possible one.
Usage: python3 escape_pdf.py <output_dir>
"""
import itertools
import math
import random
import sys
from collections import deque
from pathlib import Path

from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4, letter
from reportlab.pdfbase import pdfmetrics

import xmas_pdf as P
from puzzles_pdf import make_maze, draw_maze

P.RED = HexColor("#1F6F78")    # teal
P.GREEN = HexColor("#D9622B")  # copper orange
P.GOLD = HexColor("#E0A526")
P.CREAM = HexColor("#F5F7F4")
P.FLAKE = HexColor("#DCE5E2")
INK = P.INK
TITLE = "Escape the Clockwork Lab"
wrap = P.wrap

# The answers. The final code is these six digits in order.
CODE = {"symbols": 6, "cipher": 7, "maze": 2, "stars": 9, "sudoku": 3, "morse": 5}
FINAL = "".join(str(v) for v in CODE.values())

MORSE = {"A": ".-", "B": "-...", "C": "-.-.", "D": "-..", "E": ".", "F": "..-.", "G": "--.", "H": "....", "I": "..",
         "J": ".---", "K": "-.-", "L": ".-..", "M": "--", "N": "-.", "O": "---", "P": ".--.", "Q": "--.-", "R": ".-.",
         "S": "...", "T": "-", "U": "..-", "V": "...-", "W": ".--", "X": "-..-", "Y": "-.--", "Z": "--.."}
WORDS = {0: "ZERO", 1: "ONE", 2: "TWO", 3: "THREE", 4: "FOUR", 5: "FIVE", 6: "SIX", 7: "SEVEN", 8: "EIGHT", 9: "NINE"}


class Kit(P.Book):
    def __init__(self, path, size):
        super().__init__(path, size)
        self.c.setTitle(TITLE)

    def end(self):
        self.n += 1
        self.t(self.W / 2, 20, f"{self.n}  ·  {TITLE}  ·  {P.SITE}", 8, color=P.MUTED, anchor="c")
        self.c.showPage()

    def gear(self, x, y, r, color, w=1.6):
        c = self.c
        c.setStrokeColor(color)
        c.setLineWidth(w)
        c.circle(x, y, r * 0.62, stroke=1, fill=0)
        c.circle(x, y, r * 0.22, stroke=1, fill=0)
        for k in range(8):
            a = k * math.pi / 4
            c.line(x + r * 0.62 * math.cos(a), y + r * 0.62 * math.sin(a), x + r * math.cos(a), y + r * math.sin(a))

    def shape(self, kind, x, y, r, color, fill=True):
        c = self.c
        c.setFillColor(color)
        c.setStrokeColor(color)
        c.setLineWidth(1.6)
        if kind == "circle":
            c.circle(x, y, r, stroke=1, fill=1 if fill else 0)
            return
        if kind == "square":
            c.rect(x - r * 0.85, y - r * 0.85, r * 1.7, r * 1.7, stroke=1, fill=1 if fill else 0)
            return
        if kind == "triangle":
            pts = [(x, y + r), (x - r * 0.95, y - r * 0.75), (x + r * 0.95, y - r * 0.75)]
        else:  # star
            pts = []
            for k in range(10):
                a = math.pi / 2 + k * math.pi / 5
                rr = r if k % 2 == 0 else r * 0.45
                pts.append((x + rr * math.cos(a), y + rr * math.sin(a)))
        p = c.beginPath()
        p.moveTo(*pts[0])
        for pt in pts[1:]:
            p.lineTo(*pt)
        p.close()
        c.drawPath(p, stroke=1, fill=1 if fill else 0)


def page_header(k, num, title, story):
    k.page(f"Puzzle {num}: {title}", "Solve it to find one number of the secret code")
    k.gear(k.W - 40, k.H - 110, 16, P.GOLD)
    return k.para(55, k.H - 130, story, 12.5, k.W - 110, color=P.MUTED) - 10


def answer_box(k, y, label="Your number:"):
    k.t(k.W / 2 - 60, y, label, 14, "Bold", P.RED, "r")
    k.c.setStrokeColor(P.RED)
    k.c.setLineWidth(2)
    k.c.roundRect(k.W / 2 - 40, y - 18, 60, 48, 8, stroke=1, fill=0)


# ------------------------------------------------------------- puzzle 1: symbol maths
SYM = {"circle": 2, "triangle": 4, "square": 3}
EQUATIONS = [(["circle", "circle", "circle"], 6), (["circle", "triangle"], 6), (["triangle", "square", "circle"], 9)]
QUESTION = ["square", "square"]  # = 6


def check_symbols():
    sols = []
    for a, b, c in itertools.product(range(1, 10), repeat=3):
        val = {"circle": a, "triangle": b, "square": c}
        if all(sum(val[s] for s in lhs) == rhs for lhs, rhs in EQUATIONS):
            sols.append(sum(val[s] for s in QUESTION))
    assert sols == [CODE["symbols"]], sols


def puzzle_symbols(k):
    y = page_header(k, 1, "The Gear Machine", "Professor Penny's machine runs on shapes. Each shape stands for a "
                    "number. The same shape always means the same number. Work out what each shape is worth, then "
                    "answer the last question.")
    colors = {"circle": P.GREEN, "triangle": P.RED, "square": P.GOLD}
    for lhs, rhs in EQUATIONS + [(QUESTION, None)]:
        x = 90
        y -= 70
        for i, sname in enumerate(lhs):
            if i:
                k.t(x - 34, y - 9, "+", 28, "Bold", INK, "c")
            k.shape(sname, x + 10, y, 22, colors[sname])
            x += 92
        k.t(x - 26, y - 9, "=", 28, "Bold", INK, "c")
        k.t(x + 22, y - 10, str(rhs) if rhs is not None else "?", 30, "Serif", INK if rhs is not None else P.GREEN, "c")
    y -= 70
    k.para(55, y, "Tip: start with the first line. If three circles make 6, what is one circle?", 12, k.W - 110, color=P.MUTED)
    answer_box(k, 110)
    k.end()


# ------------------------------------------------------------- puzzle 2: shift cipher
SHIFT = 3
PLAIN = f"THE SECRET NUMBER IS {WORDS[CODE['cipher']]}"


def shift(text, n):
    return "".join(chr((ord(ch) - 65 + n) % 26 + 65) if ch.isalpha() else ch for ch in text)


def puzzle_cipher(k):
    secret = shift(PLAIN, SHIFT)
    assert shift(secret, -SHIFT) == PLAIN
    y = page_header(k, 2, "The Scrambled Note", f"A note from the Professor has been scrambled! Every letter was moved "
                    f"{SHIFT} places forward in the alphabet (A became D, B became E…). Move each letter {SHIFT} places "
                    "BACK to read it. Use the alphabet strip to help.")
    y -= 30
    k.t(k.W / 2, y, secret, 22, "Serif", P.RED, "c")
    y -= 60
    cell = (k.W - 110) / 26
    for row, (label, letters) in enumerate((("Secret", [chr(65 + (i + SHIFT) % 26) for i in range(26)]),
                                            ("Real", [chr(65 + i) for i in range(26)]))):
        yy = y - row * 34
        for i, ch in enumerate(letters):
            k.c.setStrokeColor(P.LINE)
            k.c.setFillColor(white if row else HexColor("#E3EFEF"))
            k.c.rect(55 + i * cell, yy - 26, cell, 26, stroke=1, fill=1)
            k.t(55 + (i + .5) * cell, yy - 18, ch, 11, "Bold", P.RED if row == 0 else INK, "c")
    y -= 100
    k.t(55, y, "Write the real message here:", 12, "Bold")
    for i in range(2):
        k.c.setStrokeColor(P.LINE)
        k.c.line(55, y - 34 - i * 34, k.W - 55, y - 34 - i * 34)
    answer_box(k, 110)
    k.end()


# ------------------------------------------------------------- puzzle 3: maze with numbers
def build_maze():
    rng = random.Random(77)
    cols, rows = 12, 14
    walls, path = make_maze(cols, rows, rng)
    on_path = set(path)
    cells = [(r, c) for r in range(rows) for c in range(cols)]
    target = path[len(path) // 2]
    decoys = rng.sample([cl for cl in cells if cl not in on_path], 6)
    numbers = {target: CODE["maze"]}
    choices = [d for d in range(10) if d != CODE["maze"]]
    for d in decoys:
        numbers[d] = rng.choice(choices)
    assert [numbers[cl] for cl in path if cl in numbers] == [CODE["maze"]]
    return walls, path, numbers, cols, rows


def puzzle_maze(k):
    y = page_header(k, 3, "The Lost Cable", "The Professor's power cable runs through a maze of pipes. Follow the only "
                    "path from START to FINISH without crossing a wall. You will pass over exactly ONE number on the "
                    "right path. The other numbers are traps!")
    walls, path, numbers, cols, rows = build_maze()
    cell = min((k.W - 140) / cols, (y - 190) / rows)
    x0 = (k.W - cell * cols) / 2
    top = y - 30
    draw_maze(k, x0, top, cell, walls, lw=2)
    for (r, c), d in numbers.items():
        k.c.setFillColor(HexColor("#FBE3D3"))
        k.c.circle(x0 + (c + .5) * cell, top - (r + .5) * cell, cell * 0.32, stroke=0, fill=1)
        k.t(x0 + (c + .5) * cell, top - (r + .5) * cell - 6, str(d), 16, "Bold", P.GREEN, "c")
    k.t(x0 + cell / 2, top + 12, "START ↓", 10, "Bold", P.RED, "c")
    k.t(x0 + (cols - .5) * cell, top - rows * cell - 18, "FINISH ↓", 10, "Bold", P.RED, "c")
    answer_box(k, 80)
    k.end()
    return walls, path, numbers, cols, rows


# ------------------------------------------------------------- puzzle 4: count the stars
def build_shapes():
    rng = random.Random(4)
    kinds = ["star"] * CODE["stars"] + rng.choices(["circle", "square", "triangle"], k=36 - CODE["stars"])
    rng.shuffle(kinds)
    assert kinds.count("star") == CODE["stars"]
    return kinds


def puzzle_stars(k):
    y = page_header(k, 4, "The Star Power Cells", "The machine needs star power! Count ONLY the stars on this page. "
                    "Careful: some shapes are tricky. Cross each star out as you count it.")
    kinds = build_shapes()
    rng = random.Random(41)
    cols = 6
    cw = (k.W - 140) / cols
    ch = min(cw, (y - 200) / 6)
    palette = [P.RED, P.GREEN, P.GOLD, HexColor("#6B5CA5")]
    for i, kind in enumerate(kinds):
        r, c = divmod(i, cols)
        cx = 70 + (c + .5) * cw + rng.uniform(-8, 8)
        cy = y - 30 - (r + .5) * ch + rng.uniform(-6, 6)
        k.shape(kind, cx, cy, min(cw, ch) * 0.32 * rng.uniform(0.75, 1.1), rng.choice(palette), fill=rng.random() < 0.7)
    answer_box(k, 90, "Number of stars:")
    k.end()


# ------------------------------------------------------------- puzzle 5: mini sudoku
def solve4(g, limit=2):
    sols = []

    def ok(i, v):
        r, c = divmod(i, 4)
        if v in g[r * 4:r * 4 + 4] or v in g[c::4]:
            return False
        br, bc = r // 2 * 2, c // 2 * 2
        return all(g[rr * 4 + cc] != v for rr in range(br, br + 2) for cc in range(bc, bc + 2))

    def rec():
        if len(sols) >= limit:
            return
        try:
            i = g.index(0)
        except ValueError:
            sols.append(g[:])
            return
        for v in range(1, 5):
            if ok(i, v):
                g[i] = v
                rec()
                g[i] = 0
    rec()
    return sols


SUDOKU_SOL = [1, 2, 3, 4,
              3, 4, 1, 2,
              2, 1, 4, 3,
              4, 3, 2, 1]
SUDOKU_GIVEN = [1, 0, 0, 0,
                3, 4, 1, 0,
                2, 0, 0, 3,
                4, 0, 0, 0]
GOLD_CELL = 2  # row 0, col 2 -> 3


def check_sudoku():
    sols = solve4(SUDOKU_GIVEN[:])
    assert len(sols) == 1 and sols[0] == SUDOKU_SOL, sols
    assert SUDOKU_SOL[GOLD_CELL] == CODE["sudoku"] and SUDOKU_GIVEN[GOLD_CELL] == 0


def puzzle_sudoku(k):
    check_sudoku()
    y = page_header(k, 5, "The Number Grid", "Fill the grid so that every row, every column and every 2 x 2 box has "
                    "the numbers 1, 2, 3 and 4 exactly once. The number that belongs in the GOLD square is your code number.")
    size = min(k.W - 260, y - 220)
    x0 = (k.W - size) / 2
    top = y - 30
    cell = size / 4
    for i in range(16):
        r, c = divmod(i, 4)
        k.c.setFillColor(HexColor("#F6DE9C") if i == GOLD_CELL else white)
        k.c.rect(x0 + c * cell, top - (r + 1) * cell, cell, cell, stroke=0, fill=1)
        if SUDOKU_GIVEN[i]:
            k.t(x0 + (c + .5) * cell, top - (r + .5) * cell - 12, str(SUDOKU_GIVEN[i]), 34, "Serif", INK, "c")
    for i in range(5):
        k.c.setStrokeColor(INK)
        k.c.setLineWidth(3 if i % 2 == 0 else 1)
        k.c.line(x0 + i * cell, top, x0 + i * cell, top - size)
        k.c.line(x0, top - i * cell, x0 + size, top - i * cell)
    answer_box(k, 110)
    k.end()


# ------------------------------------------------------------- puzzle 6: morse code
def puzzle_morse(k):
    word = WORDS[CODE["morse"]]
    y = page_header(k, 6, "The Beeping Radio", "The lab radio is beeping a secret word in Morse code. A dot (•) is a "
                    "short beep and a dash (—) is a long beep. Each group of beeps is one letter. Use the key to "
                    "decode the word, then write it as a number.")
    y -= 40
    groups = [MORSE[ch] for ch in word]
    gx = (k.W - 110) / len(groups)
    for i, g in enumerate(groups):
        cx = 55 + (i + .5) * gx
        txt = "  ".join("•" if s == "." else "—" for s in g)
        k.t(cx, y, txt, 22, "Bold", P.RED, "c")
        k.c.setStrokeColor(P.LINE)
        k.c.line(cx - 30, y - 40, cx + 30, y - 40)
    decoded = "".join(next(ch for ch, code in MORSE.items() if code == g) for g in groups)
    assert decoded == word
    y -= 80
    k.t(55, y, "Morse code key", 14, "Serif", P.GREEN)
    y -= 22
    letters = sorted(MORSE)
    cols = 4
    per = math.ceil(len(letters) / cols)
    colw = (k.W - 110) / cols
    for i, ch in enumerate(letters):
        x = 55 + (i // per) * colw
        yy = y - (i % per) * 20
        k.t(x, yy, ch, 12, "Bold", INK)
        k.t(x + 22, yy, " ".join("•" if s == "." else "—" for s in MORSE[ch]), 12, "Body", P.RED)
    answer_box(k, 80, "The word as a number:")
    k.end()


# ------------------------------------------------------------- the rest of the kit
def cover(k):
    c = k.c
    c.setFillColor(P.RED)
    c.rect(0, 0, k.W, k.H, stroke=0, fill=1)
    rng = random.Random(2)
    for _ in range(18):
        k.gear(rng.uniform(30, k.W - 30), rng.uniform(30, k.H - 30), rng.uniform(14, 40), HexColor("#2C8590"), 2)
    c.setFillColor(P.CREAM)
    c.roundRect(50, k.H * 0.30, k.W - 100, k.H * 0.42, 22, stroke=0, fill=1)
    k.t(k.W / 2, k.H * 0.665, "PRINTABLE ESCAPE ROOM · AGES 7–12", 12, "Bold", P.GREEN, "c")
    k.t(k.W / 2, k.H * 0.60, "Escape the", 34, "Serif", INK, "c")
    k.t(k.W / 2, k.H * 0.54, "Clockwork Lab", 44, "Serif", P.RED, "c")
    k.t(k.W / 2, k.H * 0.48, "6 puzzles · 1 secret code · 45 minutes", 15, "Body", INK, "c")
    k.t(k.W / 2, k.H * 0.43, "Parent guide · hint cards · answer key · certificate", 12, "Body", P.MUTED, "c")
    k.t(k.W / 2, k.H * 0.36, "Print at home on Letter or A4 · 1–6 players", 11, "Body", P.MUTED, "c")
    k.t(k.W / 2, 50, "Penny & Plan", 16, "Bold", white, "c")
    c.showPage()


def parent_guide(k):
    k.page("Parent Guide", "Set-up takes about 15 minutes")
    y = k.H - 130
    for i, s in enumerate([
        "Print the puzzle pages, the hint cards, the envelope labels, the code sheet and the certificate. Keep the answer key for yourself.",
        "Put each puzzle in its own envelope and stick on the matching label (Envelope 1 to 6). Optional: hide the envelopes around the room.",
        "Hide a small prize (a treat, a toy or a 'treasure box') and keep it closed until the final code is cracked.",
        "Read the story aloud, start a 45-minute timer and hand over Envelope 1 and the code sheet.",
        "When the players solve a puzzle, they tell you their number. If it's right, they write it on the code sheet and get the next envelope. Answers are on the last page.",
        "Stuck for more than 5 minutes? Give them the hint card for that puzzle.",
        "When all six numbers are on the code sheet, they say the full code to open the prize. Then hand out the certificates!",
    ], 1):
        k.c.setFillColor(P.RED)
        k.c.circle(70, y + 5, 12, stroke=0, fill=1)
        k.t(70, y, str(i), 12, "Bold", white, "c")
        y = k.para(94, y, s, 12.5, k.W - 150) - 12
    y -= 6
    k.para(55, y, "Younger players (6–7) can play with a grown-up reading the instructions. Older kids (10–12) can try "
           "without hints or with a 30-minute timer.", 11.5, k.W - 110, color=P.MUTED)
    k.end()


def story(k):
    k.page("The Story", "Read this aloud to start the game")
    y = k.para(60, k.H - 140, "Welcome, young scientists! You are visiting the famous laboratory of Professor Penny, "
               "the greatest inventor in the world. Tick… tock… tick… Suddenly, every clock in the lab stops. The "
               "Professor's newest invention, the Time Gear, has jammed, and time is frozen everywhere!\n\nThe "
               "Professor left a message: 'To restart the Time Gear, enter the 6-number secret code into the "
               "machine. I hid one number in each of my six puzzles. Solve them all, and time will start again. "
               "But hurry: the Time Gear only waits for 45 minutes!'\n\nAre you ready? Start the timer, open "
               "Envelope 1, and good luck!", 15, k.W - 120, lead=1.6)
    k.gear(k.W / 2, y - 80, 50, P.GOLD, 3)
    k.end()


def code_sheet(k):
    k.page("The Time Gear Code", "Write each number here when it's correct")
    box = (k.W - 140) / 6
    y = k.H - 220
    for i in range(6):
        x = 70 + i * box
        k.c.setStrokeColor(P.RED)
        k.c.setLineWidth(2.5)
        k.c.roundRect(x + 6, y - box + 12, box - 12, box - 12, 10, stroke=1, fill=0)
        k.t(x + box / 2, y + 14, f"Puzzle {i + 1}", 11, "Bold", P.MUTED, "c")
    k.gear(k.W / 2, y - box - 120, 80, P.GOLD, 3)
    k.t(k.W / 2, y - box - 260, "Say the full code out loud to restart time!", 16, "Serif", P.GREEN, "c")
    k.end()


HINTS = [
    "Look at the first line: three circles make 6. So one circle is 6 ÷ 3. Use that in the second line to find the triangle.",
    "The first secret word is WKH. Move each letter 3 back: W→T, K→H, H→E. So WKH means THE!",
    "Use a pencil and start from FINISH, working backwards. Dead ends are traps: the right path never needs to go back.",
    "Cross out each star with a pencil as you count, row by row from left to right. Only five-pointed stars count.",
    "Each 2 x 2 box needs 1, 2, 3 and 4. The top-left box already has 1, 3 and 4, so its empty square must be 2. Keep going box by box!",
    "The first letter is • • — •. Find it in the key: it is F! Decode the other letters the same way, then think: which number word is it?",
]


def hint_cards(k):
    def draw(x, y, w, h, item, i):
        k.t(x + 14, y - 26, f"HINT · PUZZLE {i + 1}", 11, "Bold", P.GREEN)
        k.para(x + 14, y - 52, item, 12, w - 28, lead=1.4)
    k.card_grid("Hint Cards", "Cut out and give one only when players are stuck", HINTS, 2, 3, draw)


def labels(k):
    names = ["The Gear Machine", "The Scrambled Note", "The Lost Cable", "The Star Power Cells", "The Number Grid", "The Beeping Radio"]

    def draw(x, y, w, h, item, i):
        k.gear(x + w / 2, y - h / 2 + 22, 26, P.GOLD, 2)
        k.t(x + w / 2, y - h / 2 - 22, f"ENVELOPE {i + 1}", 18, "Serif", P.RED, "c")
        k.t(x + w / 2, y - h / 2 - 42, item, 11, "Body", P.MUTED, "c")
    k.card_grid("Envelope Labels", "Cut out and stick one on each envelope", names, 2, 3, draw)


def certificate(k):
    k.page()
    k.c.setStrokeColor(P.GOLD)
    k.c.setLineWidth(4)
    k.c.roundRect(40, 60, k.W - 80, k.H - 120, 20, stroke=1, fill=0)
    for gx, gy in ((80, k.H - 100), (k.W - 80, k.H - 100), (80, 100), (k.W - 80, 100)):
        k.gear(gx, gy, 24, P.RED, 2)
    k.t(k.W / 2, k.H - 200, "Certificate of", 18, "Body", P.MUTED, "c")
    k.t(k.W / 2, k.H - 250, "Master Escaper", 42, "Serif", P.RED, "c")
    k.t(k.W / 2, k.H - 300, "This certifies that", 14, "Body", INK, "c")
    k.c.setStrokeColor(INK)
    k.c.setLineWidth(1)
    k.c.line(k.W / 2 - 170, k.H - 360, k.W / 2 + 170, k.H - 360)
    k.para(80, k.H - 400, "cracked the secret code, restarted the Time Gear and escaped the Clockwork Lab!",
           15, k.W - 160, anchor="c")
    k.t(k.W / 2, k.H - 480, "Escape time: ______ minutes", 14, "Bold", P.GREEN, "c")
    k.t(k.W / 2, 140, "Signed, Professor Penny", 13, "Serif", INK, "c")
    k.end()


def answer_key(k, maze):
    walls, path, numbers, cols, rows = maze
    k.page("Answer Key", "For grown-ups only")
    y = k.H - 130
    rows_txt = [
        ("Puzzle 1", f"Circle = {SYM['circle']}, triangle = {SYM['triangle']}, square = {SYM['square']}. Square + square = {CODE['symbols']}."),
        ("Puzzle 2", f"The message: {PLAIN}. Number: {CODE['cipher']}."),
        ("Puzzle 3", f"The only number on the path is {CODE['maze']} (solution drawn below)."),
        ("Puzzle 4", f"There are {CODE['stars']} stars."),
        ("Puzzle 5", f"The gold square is {CODE['sudoku']}. Full grid: " + " / ".join("".join(map(str, SUDOKU_SOL[r * 4:r * 4 + 4])) for r in range(4)) + "."),
        ("Puzzle 6", f"The word is {WORDS[CODE['morse']]}: {CODE['morse']}."),
    ]
    for t, a in rows_txt:
        k.t(55, y, t, 12, "Bold", P.RED)
        y = k.para(130, y, a, 12, k.W - 185) - 8
    y -= 6
    k.t(55, y, f"THE FINAL CODE:  {'  '.join(FINAL)}", 20, "Serif", P.GREEN)
    y -= 30
    cell = min((k.W - 220) / cols, (y - 60) / rows)
    x0 = (k.W - cell * cols) / 2
    draw_maze(k, x0, y, cell, walls, path, lw=1.2)
    for (r, c), d in numbers.items():
        k.t(x0 + (c + .5) * cell, y - (r + .5) * cell - 4, str(d), 10, "Bold", P.GREEN, "c")
    k.end()


def build(out, size, suffix):
    check_symbols()
    k = Kit(out / f"Escape-Room-Clockwork-Lab-{suffix}.pdf", size)
    cover(k)
    parent_guide(k)
    story(k)
    code_sheet(k)
    puzzle_symbols(k)
    puzzle_cipher(k)
    maze = puzzle_maze(k)
    puzzle_stars(k)
    puzzle_sudoku(k)
    puzzle_morse(k)
    hint_cards(k)
    labels(k)
    certificate(k)
    answer_key(k, maze)
    k.save()
    return k.n + 1


def main():
    out = Path(sys.argv[1] if len(sys.argv) > 1 else "dist")
    out.mkdir(parents=True, exist_ok=True)
    for size, suffix in ((letter, "US-Letter"), (A4, "A4")):
        print("built", suffix, build(out, size, suffix), "pages, final code", FINAL)


if __name__ == "__main__":
    main()
