"""Builds the Bridal Shower Games bundle by reusing xmas_pdf.py with a blush-and-sage theme.

Usage: python3 bridal_pdf.py <output_dir>
"""
import math
import sys
from pathlib import Path

from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4, letter

import bridal_content as C
import xmas_pdf as P

P.RED = HexColor("#9C5B6B")    # dusty rose
P.GREEN = HexColor("#6F7F63")  # sage
P.GOLD = HexColor("#C2A26A")
P.CREAM = HexColor("#FCF7F4")
P.FLAKE = HexColor("#F1E1E2")
P.X = C


def purse_hunt(b):
    b.page("Purse Hunt", "Players score points for every item they have in their bag")
    y = b.H - 130
    y = b.para(55, y, "The host reads each item aloud. If you have it in your bag, add the points to your score. "
               "The guest with the most points wins a prize!", 12.5, b.W - 110) - 14
    cols = 2
    colw = (b.W - 110) / cols
    per = math.ceil(len(C.PURSE) / cols)
    for i, (item, pts) in enumerate(C.PURSE):
        x = 55 + (i // per) * colw
        yy = y - (i % per) * 34
        b.c.setStrokeColor(P.LINE)
        b.c.rect(x, yy - 6, 16, 16, stroke=1, fill=0)
        b.t(x + 26, yy, item, 11)
        b.t(x + colw - 26, yy, f"{pts} pts", 11, "Bold", P.RED, "r")
    yy = y - per * 34 - 20
    b.t(55, yy, "My total score:", 14, "Bold", P.GREEN)
    b.c.setStrokeColor(P.INK)
    b.c.line(185, yy - 3, 320, yy - 3)
    b.end()


def know_and_advice(b):
    for title in ("How Well Do You Know the Bride?",):
        b.page(title, "Guests write their answers. The bride reads the real answers at the end!")
        y = b.H - 128
        b.t(55, y, "Your name:", 12, "Bold")
        b.c.setStrokeColor(P.LINE)
        b.c.line(130, y - 3, 330, y - 3)
        y -= 28
        for i, q in enumerate(C.KNOW_THE_BRIDE, 1):
            b.t(55, y, f"{i}.", 11, "Bold", P.RED)
            b.t(76, y, q, 11)
            b.c.line(76, y - 14, b.W - 55, y - 14)
            y -= 31
        b.end()
    P.simple_cards(b, "Advice & Wishes for the Bride", C.ADVICE, [
        "Cut out the cards and put a few on each table with pens.",
        "Each guest finishes one or more sentences with their best advice or a sweet wish.",
        "Collect the cards in a box or jar for the bride to keep and read on her first anniversary.",
    ], "ADVICE & WISHES", cols=2, rows=5, size=12)


P.T.update({
    "name": "Bridal Shower",
    "file": "Bridal-Shower-Games",
    "cover_top": "Bridal Shower",
    "cover_fleck": "#B57A89",
    "cover_sub": "9 printable games for the bride-to-be and her guests",
    "tips": ["Print only the pages you need. Card pages have dashed lines: cut along them with scissors.",
             "Card stock or thicker paper makes the cards feel special and easy to hold.",
             "Answer keys are at the end of each game. The bride fills in her own answers for 'Know the Bride'.",
             "Mix quieter games (Advice cards, Know the Bride) with lively ones (Charades, Purse Hunt).",
             "Personal use only: print as many copies as you like for your own shower or party."],
    "games": ["Know the Bride", "Wedding Trivia", "Gift Bingo (30)", "Who Am I?", "Charades", "Would You Rather",
              "Word Scramble", "Advice Cards", "Purse Hunt & Left-Right"],
    "inside": [("Purse Hunt", "20 items with points: who has the most in their bag?"),
               ("Wedding Trivia", "40 questions on wedding traditions around the world, with answers"),
               ("Gift Bingo", "30 different bingo cards to play while the bride opens gifts"),
               ("Who Am I?", "40 guessing cards"), ("Charades", "40 acting cards"),
               ("Would You Rather", "40 fun wedding and marriage questions"),
               ("Word Scramble", "25 wedding words to unscramble, with answers"),
               ("Know the Bride", "20-question quiz plus 40 Advice & Wishes cards"),
               ("Left-Right Gift Game", "an original story about the bride's big day")],
    "tie_break": "'How many years will the couple have been together on the wedding day?'",
    "whoami_hint": "'Am I something you wear?' or 'Am I a person?'",
    "lr_title": "Left-Right Gift Game",
    "lr_story_title": "The Bride's Big Day: Left-Right Story",
    "lr_rules": ["Everyone sits in a circle. Give a few guests a small wrapped gift.",
                 "One person reads the story out loud, slowly.",
                 "Every time you hear LEFT, pass the gift to the person on your left. Every time you hear RIGHT, pass it to the right.",
                 "When the story ends, whoever is holding a gift gets to keep it!"],
    "hunt": purse_hunt,
    "extra": know_and_advice,
})


def heart(self, x, y, r, color=None, w=1.4):
    """Heart outline instead of a snowflake."""
    c = self.c
    c.setStrokeColor(color or P.FLAKE)
    c.setLineWidth(w)
    c.setLineJoin(1)
    p = c.beginPath()
    p.moveTo(x, y - r * 0.9)
    p.curveTo(x - r * 1.2, y - r * 0.1, x - r * 0.7, y + r * 0.95, x, y + r * 0.35)
    p.curveTo(x + r * 0.7, y + r * 0.95, x + r * 1.2, y - r * 0.1, x, y - r * 0.9)
    p.close()
    c.drawPath(p, stroke=1, fill=0)


P.Book.flake = heart


def main():
    out = Path(sys.argv[1] if len(sys.argv) > 1 else "dist")
    out.mkdir(parents=True, exist_ok=True)
    for size, suffix in ((letter, "US-Letter"), (A4, "A4")):
        print("built", suffix, P.build(out, size, suffix) + 1, "pages")


if __name__ == "__main__":
    main()
