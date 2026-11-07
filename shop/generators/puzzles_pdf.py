"""Builds the puzzle books: Large Print Word Search, Sudoku and Mazes for Kids.

Every puzzle is generated from a fixed seed and checked by code: word search
words are placed and verified, each sudoku is proven to have exactly one
solution, and each maze is a perfect maze (exactly one path).

Usage: python3 puzzles_pdf.py <output_dir>
"""
import random
import sys
from collections import deque
from pathlib import Path

from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4, letter
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

from wordlists import THEMES

pdfmetrics.registerFont(TTFont("Body", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"))
pdfmetrics.registerFont(TTFont("Bold", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"))
pdfmetrics.registerFont(TTFont("Mono", "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf"))

INK = HexColor("#1F2A37")
MUTED = HexColor("#6B7280")
LINE = HexColor("#C9D1CC")
ACCENT = HexColor("#2F7D5B")
SOFT = HexColor("#E3F1EA")
HILITE = HexColor("#F6C76B")
BRAND = "Penny & Plan"
SITE = "penny-and-plan.pages.dev"

BAD = {"FUCK", "SHIT", "CUNT", "DICK", "COCK", "PISS", "SLUT", "TWAT", "FAG", "NIGG", "RAPE", "KILL", "DAMN", "HELL", "SEX", "ASS"}


class Book:
    def __init__(self, path, size, title):
        self.W, self.H = size
        self.c = canvas.Canvas(str(path), pagesize=size)
        self.c.setTitle(title)
        self.c.setAuthor(BRAND)
        self.page_no = 0
        self.title = title

    def text(self, x, y, s, size, font="Body", color=INK, anchor="l"):
        self.c.setFont(font, size)
        self.c.setFillColor(color)
        {"l": self.c.drawString, "c": self.c.drawCentredString, "r": self.c.drawRightString}[anchor](x, y, s)

    def end_page(self, footer=True):
        self.page_no += 1
        if footer:
            self.text(self.W / 2, 28, f"{self.page_no}", 10, color=MUTED, anchor="c")
        self.c.showPage()

    def cover(self, subtitle, lines):
        c = self.c
        c.setFillColor(ACCENT)
        c.rect(0, 0, self.W, self.H, stroke=0, fill=1)
        main = self.title.split(":")[0]
        fs = 46
        while pdfmetrics.stringWidth(main, "Bold", fs) > self.W - 80:
            fs -= 1
        self.text(self.W / 2, self.H * 0.66, main, fs, "Bold", white, "c")
        if ":" in self.title:
            self.text(self.W / 2, self.H * 0.66 - 52, self.title.split(":")[1].strip(), 26, "Bold", white, "c")
        self.text(self.W / 2, self.H * 0.52, subtitle, 18, "Body", SOFT, "c")
        for i, ln in enumerate(lines):
            self.text(self.W / 2, self.H * 0.40 - i * 26, ln, 15, "Body", white, "c")
        self.text(self.W / 2, 60, BRAND, 16, "Bold", white, "c")
        self.end_page(footer=False)

    def intro(self, heading, paras):
        self.text(60, self.H - 90, heading, 26, "Bold")
        y = self.H - 140
        for p in paras:
            words, line = p.split(), ""
            for w in words:
                if pdfmetrics.stringWidth(line + " " + w, "Body", 14) > self.W - 120:
                    self.text(60, y, line.strip(), 14)
                    y -= 22
                    line = ""
                line += " " + w
            self.text(60, y, line.strip(), 14)
            y -= 36
        self.text(60, 70, f"Personal use only. More printables at {SITE}", 10, color=MUTED)
        self.end_page()

    def section(self, title, sub=""):
        self.text(self.W / 2, self.H / 2 + 10, title, 34, "Bold", ACCENT, "c")
        if sub:
            self.text(self.W / 2, self.H / 2 - 28, sub, 15, color=MUTED, anchor="c")
        self.end_page()

    def save(self):
        self.c.save()


# ------------------------------------------------------------ word search

DIRS_EASY = [(0, 1), (1, 0), (1, 1), (-1, 1)]  # right, down, diagonal down, diagonal up (never backwards)


def make_wordsearch(words, n, rng):
    for _attempt in range(200):
        grid = [[""] * n for _ in range(n)]
        placed = {}
        ok = True
        for w in sorted(words, key=len, reverse=True):
            spots = []
            for dr, dc in DIRS_EASY:
                for r in range(n):
                    for c in range(n):
                        er, ec = r + dr * (len(w) - 1), c + dc * (len(w) - 1)
                        if not (0 <= er < n and 0 <= ec < n):
                            continue
                        cells = [(r + dr * i, c + dc * i) for i in range(len(w))]
                        if all(grid[a][b] in ("", w[i]) for i, (a, b) in enumerate(cells)):
                            overlap = sum(grid[a][b] == w[i] for i, (a, b) in enumerate(cells))
                            spots.append((overlap, rng.random(), cells))
            if not spots:
                ok = False
                break
            spots.sort(key=lambda s: (-s[0] * (rng.random() < 0.5), s[1]))
            cells = spots[0][2]
            for i, (a, b) in enumerate(cells):
                grid[a][b] = w[i]
            placed[w] = cells
        if not ok:
            continue
        letters = "".join(words)
        for r in range(n):
            for c in range(n):
                if not grid[r][c]:
                    grid[r][c] = rng.choice(letters)
        lines = ["".join(row) for row in grid] + ["".join(grid[r][c] for r in range(n)) for c in range(n)]
        if any(b in ln or b in ln[::-1] for ln in lines for b in BAD):
            continue
        # every word must be findable exactly where we put it
        assert all("".join(grid[a][b] for a, b in cells) == w for w, cells in placed.items())
        return grid, placed
    raise RuntimeError("could not place words: " + " ".join(words))


def draw_wordsearch(book, title, number, grid, words, placed=None, box=None, big=True):
    n = len(grid)
    W, H = book.W, book.H
    if box is None:
        # leave room below the grid for a 4-row word list and the page number
        cell = min((W - 110) / n, (H - 110 - 40 - 4 * 26 - 60) / n)
        gx = (W - cell * n) / 2
        gy_top = H - 110
        book.text(W / 2, H - 70, f"{number}. {title}", 24, "Bold", anchor="c")
    else:
        x0, y0, size = box
        cell = size / n
        gx, gy_top = x0, y0
        book.text(x0 + size / 2, y0 + 10, f"{number}. {title}", 10, "Bold", anchor="c")
    c = book.c
    c.setStrokeColor(LINE)
    c.setLineWidth(1)
    c.roundRect(gx - 8, gy_top - cell * n - 8, cell * n + 16, cell * n + 16, 10, stroke=1, fill=0)
    if placed:
        c.setStrokeColor(HILITE)
        c.setLineCap(1)
        c.setLineWidth(cell * 0.7)
        for cells in placed.values():
            (r0, c0), (r1, c1) = cells[0], cells[-1]
            c.line(gx + (c0 + .5) * cell, gy_top - (r0 + .5) * cell, gx + (c1 + .5) * cell, gy_top - (r1 + .5) * cell)
        c.setLineWidth(1)
    fs = cell * 0.62
    for r in range(n):
        for col in range(n):
            book.text(gx + (col + .5) * cell, gy_top - (r + .5) * cell - fs * 0.36, grid[r][col], fs, "Mono", anchor="c")
    if box is None:
        # word list in 3 columns
        top = gy_top - cell * n - 40
        cols = 4
        colw = (W - 100) / cols
        per = (len(words) + cols - 1) // cols
        for i, w in enumerate(sorted(words)):
            x = 50 + (i // per) * colw
            y = top - (i % per) * 26
            assert y > 50, "word list would run into the page number"
            fs = 14
            while pdfmetrics.stringWidth(w, "Bold", fs) > colw - 30:
                fs -= 0.5
            c.setStrokeColor(MUTED)
            c.rect(x, y - 2, 12, 12, stroke=1, fill=0)
            book.text(x + 20, y, w, fs, "Bold")


def wordsearch_book(out, size, suffix):
    rng = random.Random(2027)
    book = Book(out / f"Large-Print-Word-Search-{suffix}.pdf", size, "Large Print Word Search: 50 Themed Puzzles")
    book.cover("Big, easy-to-read letters · Answers included", ["50 themed puzzles", "Words go across, down and diagonally", "No backwards words"])
    book.intro("How to play", [
        "Each puzzle has a theme and a list of 15 words hidden in the grid.",
        "Words run left to right, top to bottom, or diagonally. They never run backwards, which keeps the puzzles relaxing.",
        "Tick each word on the list as you find it. Answers start after the last puzzle.",
        "Print as many copies as you like for your own use.",
    ])
    sols = []
    for i, (theme, ws) in enumerate(THEMES.items(), 1):
        words = ws.split()
        assert len(words) == 15 and len(set(words)) == 15, theme
        grid, placed = make_wordsearch(words, 15, rng)
        draw_wordsearch(book, theme, i, grid, words)
        book.end_page()
        sols.append((theme, i, grid, placed))
    book.section("Answers")
    W, H = book.W, book.H
    size = (W - 150) / 2
    for k in range(0, len(sols), 4):
        for j, (theme, i, grid, placed) in enumerate(sols[k:k + 4]):
            x = 60 + (j % 2) * (size + 30)
            y = H - 80 - (j // 2) * (size + 70)
            draw_wordsearch(book, theme, i, grid, None, placed, box=(x, y - 16, size))
        book.end_page()
    book.save()


# ------------------------------------------------------------ sudoku

def sudoku_candidates(g, i):
    r, c = divmod(i, 9)
    used = set(g[r * 9:r * 9 + 9]) | set(g[c::9])
    br, bc = r // 3 * 3, c // 3 * 3
    for rr in range(br, br + 3):
        used |= set(g[rr * 9 + bc: rr * 9 + bc + 3])
    return [v for v in range(1, 10) if v not in used]


def count_solutions(g, limit=2):
    g = g[:]
    count = 0

    def rec():
        nonlocal count
        best, best_c = -1, None
        for i in range(81):
            if g[i] == 0:
                cs = sudoku_candidates(g, i)
                if not cs:
                    return
                if best_c is None or len(cs) < len(best_c):
                    best, best_c = i, cs
                    if len(cs) == 1:
                        break
        if best == -1:
            count += 1
            return
        for v in best_c:
            g[best] = v
            rec()
            if count >= limit:
                break
        g[best] = 0

    rec()
    return count


def full_grid(rng):
    g = [0] * 81

    def rec(i):
        if i == 81:
            return True
        cs = sudoku_candidates(g, i)
        rng.shuffle(cs)
        for v in cs:
            g[i] = v
            if rec(i + 1):
                return True
        g[i] = 0
        return False

    rec(0)
    return g


def make_sudoku(rng, target_clues):
    sol = full_grid(rng)
    g = sol[:]
    cells = list(range(81))
    rng.shuffle(cells)
    clues = 81
    for i in cells:
        if clues <= target_clues:
            break
        j = 80 - i  # remove in symmetric pairs
        saved = (g[i], g[j])
        g[i] = g[j] = 0
        removed = 1 if i == j else 2
        if saved[0] == 0 and saved[1] == 0:
            continue
        if count_solutions(g) == 1:
            clues -= removed if saved[0] and saved[1] else 1
        else:
            g[i], g[j] = saved
    assert count_solutions(g) == 1
    assert all(g[k] in (0, sol[k]) for k in range(81))
    return g, sol


def draw_sudoku(book, x, y, size, g, sol=None, label=""):
    c = book.c
    cell = size / 9
    if label:
        book.text(x, y + 12, label, 14 if size > 300 else 10, "Bold")
    for i in range(10):
        c.setStrokeColor(INK if i % 3 == 0 else LINE)
        c.setLineWidth(2.2 if i % 3 == 0 else 0.8)
        c.line(x + i * cell, y, x + i * cell, y - size)
        c.line(x, y - i * cell, x + size, y - i * cell)
    fs = cell * 0.6
    for k in range(81):
        r, col = divmod(k, 9)
        v = g[k] or (sol[k] if sol else 0)
        if v:
            book.text(x + (col + .5) * cell, y - (r + .5) * cell - fs * 0.36, str(v), fs,
                      "Bold" if g[k] else "Body", INK if g[k] else ACCENT, "c")


def sudoku_book(out, size, suffix):
    rng = random.Random(9)
    book = Book(out / f"Sudoku-Puzzle-Book-{suffix}.pdf", size, "Sudoku: 120 Puzzles, Easy to Expert")
    book.cover("Large print · One puzzle per half page · Answers included", ["30 Easy · 30 Medium", "30 Hard · 30 Expert", "Every puzzle has exactly one solution"])
    book.intro("How to play", [
        "Fill every empty square with a number from 1 to 9.",
        "Each row, each column and each 3 x 3 box must contain every number from 1 to 9 exactly once.",
        "Every puzzle in this book was checked by computer to have exactly one solution, so you never need to guess.",
        "The puzzles get harder as you go: Easy, Medium, Hard, then Expert. Answers are at the back.",
    ])
    levels = [("Easy", 40), ("Medium", 33), ("Hard", 28), ("Expert", 25)]
    W, H = book.W, book.H
    gsize = min(W - 160, (H - 170) / 2 - 30)
    allp = []
    n = 0
    for name, clues in levels:
        book.section(name, f"Puzzles {n + 1}–{n + 30}")
        for k in range(15):
            for j in range(2):
                n += 1
                for _try in range(40):  # keep only puzzles that really reach the level's clue count
                    g, sol = make_sudoku(rng, clues)
                    if sum(1 for v in g if v) <= clues + 1:
                        break
                allp.append((n, name, g, sol))
                draw_sudoku(book, (W - gsize) / 2, H - 90 - j * (gsize + 70), gsize, g, label=f"#{n} · {name}")
            book.end_page()
    book.section("Answers")
    small = (W - 160) / 3
    per = 9
    for k in range(0, len(allp), per):
        for j, (num, name, g, sol) in enumerate(allp[k:k + per]):
            x = 60 + (j % 3) * (small + 20)
            y = H - 80 - (j // 3) * (small + 50)
            draw_sudoku(book, x, y, small, g, sol, label=f"#{num} · {name}")
        book.end_page()
    book.save()


# ------------------------------------------------------------ mazes

def make_maze(w, h, rng):
    """Perfect maze by randomized depth-first search. walls[r][c] = {N,S,E,W} still standing."""
    walls = [[{"N", "S", "E", "W"} for _ in range(w)] for _ in range(h)]
    seen = [[False] * w for _ in range(h)]
    stack = [(0, 0)]
    seen[0][0] = True
    moves = {"N": (-1, 0, "S"), "S": (1, 0, "N"), "E": (0, 1, "W"), "W": (0, -1, "E")}
    while stack:
        r, c = stack[-1]
        opts = [(d, r + dr, c + dc, back) for d, (dr, dc, back) in moves.items()
                if 0 <= r + dr < h and 0 <= c + dc < w and not seen[r + dr][c + dc]]
        if not opts:
            stack.pop()
            continue
        d, nr, nc, back = rng.choice(opts)
        walls[r][c].discard(d)
        walls[nr][nc].discard(back)
        seen[nr][nc] = True
        stack.append((nr, nc))
    walls[0][0].discard("N")          # entrance
    walls[h - 1][w - 1].discard("S")  # exit
    # shortest (and only) path
    prev = {(0, 0): None}
    q = deque([(0, 0)])
    while q:
        r, c = q.popleft()
        for d, (dr, dc, _b) in moves.items():
            nr, nc = r + dr, c + dc
            if d not in walls[r][c] and 0 <= nr < h and 0 <= nc < w and (nr, nc) not in prev:
                prev[(nr, nc)] = (r, c)
                q.append((nr, nc))
    assert len(prev) == w * h  # every cell reachable: a perfect maze
    path, cur = [], (h - 1, w - 1)
    while cur:
        path.append(cur)
        cur = prev[cur]
    return walls, path[::-1]


def draw_maze(book, x, y, cell, walls, path=None, lw=2.4):
    c = book.c
    h, w = len(walls), len(walls[0])
    if path:
        c.setStrokeColor(HexColor("#E2574C"))
        c.setLineWidth(max(1.2, cell * 0.28))
        c.setLineCap(1)
        pts = [(x + (cc + .5) * cell, y - (r + .5) * cell) for r, cc in path]
        pts = [(pts[0][0], y + cell * 0.4)] + pts + [(pts[-1][0], y - h * cell - cell * 0.4)]
        p = c.beginPath()
        p.moveTo(*pts[0])
        for pt in pts[1:]:
            p.lineTo(*pt)
        c.drawPath(p, stroke=1, fill=0)
    c.setStrokeColor(INK)
    c.setLineWidth(lw)
    c.setLineCap(2)
    for r in range(h):
        for cc in range(w):
            x0, y0 = x + cc * cell, y - r * cell
            ws = walls[r][cc]
            if "N" in ws:
                c.line(x0, y0, x0 + cell, y0)
            if "W" in ws:
                c.line(x0, y0, x0, y0 - cell)
            if cc == w - 1 and "E" in ws:
                c.line(x0 + cell, y0, x0 + cell, y0 - cell)
            if r == h - 1 and "S" in ws:
                c.line(x0, y0 - cell, x0 + cell, y0 - cell)


def maze_book(out, size, suffix):
    rng = random.Random(5)
    book = Book(out / f"Mazes-for-Kids-{suffix}.pdf", size, "Mazes for Kids: 60 Mazes, Easy to Hard")
    book.cover("Ages 5–10 · Solutions included", ["20 Easy · 20 Medium · 20 Hard", "Start at the top, finish at the bottom", "Every maze has exactly one path"])
    book.intro("How to play", [
        "Start at the arrow at the top and find your way to the arrow at the bottom without crossing a wall.",
        "Use a pencil so you can erase wrong turns. Every maze has exactly one correct path.",
        "The mazes get bigger and trickier as you go. Solutions are at the back of the book.",
        "Grown-ups: print as many copies as you like for your own family or classroom.",
    ])
    W, H = book.W, book.H
    levels = [("Easy", range(8, 13)), ("Medium", range(14, 19)), ("Hard", range(20, 27))]
    sols = []
    n = 0
    for name, sizes in levels:
        book.section(name)
        for k in range(20):
            n += 1
            m = list(sizes)[k * len(sizes) // 20]
            cols, rows = m, int(m * 1.25)
            walls, path = make_maze(cols, rows, rng)
            cell = min((W - 120) / cols, (H - 200) / rows)
            x = (W - cell * cols) / 2
            y = H - 120
            book.text(W / 2, H - 70, f"Maze {n} · {name}", 22, "Bold", anchor="c")
            draw_maze(book, x, y, cell, walls, lw=max(1.6, cell * 0.08))
            book.text(x + cell / 2, y + 14, "START ↓", 11, "Bold", ACCENT, "c")
            book.text(x + (cols - .5) * cell, y - rows * cell - 24, "FINISH ↓", 11, "Bold", ACCENT, "c")
            book.end_page()
            sols.append((n, name, walls, path, cols, rows))
    book.section("Solutions")
    for k in range(0, len(sols), 4):
        for j, (num, name, walls, path, cols, rows) in enumerate(sols[k:k + 4]):
            bw, bh = (W - 150) / 2, (H - 200) / 2
            cell = min(bw / cols, (bh - 30) / rows)
            x = 60 + (j % 2) * (bw + 30)
            y = H - 90 - (j // 2) * (bh + 30)
            book.text(x, y + 12, f"Maze {num} · {name}", 10, "Bold")
            draw_maze(book, x, y, cell, walls, path, lw=1)
        book.end_page()
    book.save()


def main():
    out = Path(sys.argv[1] if len(sys.argv) > 1 else "dist")
    out.mkdir(parents=True, exist_ok=True)
    for size, suffix in ((letter, "US-Letter"), (A4, "A4")):
        wordsearch_book(out, size, suffix)
        maze_book(out, size, suffix)
        sudoku_book(out, size, suffix)
        print("built", suffix)


if __name__ == "__main__":
    main()
