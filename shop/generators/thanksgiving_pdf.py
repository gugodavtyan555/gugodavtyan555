"""Builds the Thanksgiving Party Games Bundle by reusing xmas_pdf.py with an autumn theme.

Usage: python3 thanksgiving_pdf.py <output_dir>
"""
import math
import sys
from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4, letter

import thanksgiving_content as C
import xmas_pdf as P

# Autumn palette: pumpkin orange, deep brown-red, mustard
P.RED = HexColor("#C2571A")
P.GREEN = HexColor("#6B3E26")
P.GOLD = HexColor("#D9A21B")
P.CREAM = HexColor("#FBF4E8")
P.FLAKE = HexColor("#EED9C0")
P.X = C
P.T.update({
    "name": "Thanksgiving",
    "file": "Thanksgiving-Party-Games",
    "cover_top": "Thanksgiving",
    "cover_fleck": "#D46B2E",
    "games": ["Scavenger Hunt", "Trivia", "Bingo (30 cards)", "Who Am I?", "Charades", "Would You Rather",
              "Word Scramble", "Table Talk Cards", "Pass the Pie Game"],
    "inside": [("Scavenger Hunt", "12 rhyming clues that lead around the house to a prize"),
               ("Thanksgiving Trivia", "40 questions with an answer key"),
               ("Thanksgiving Bingo", "30 different bingo cards and a caller's sheet"),
               ("Who Am I?", "40 guessing cards"), ("Charades", "40 acting cards"),
               ("Would You Rather", "40 silly and cosy questions"),
               ("Word Scramble", "25 autumn words to unscramble, with answers"),
               ("Table Talk Cards", "40 gratitude questions for the dinner table"),
               ("Pass the Pie Game", "an original Left-Right story")],
    "prize_spot": "by the pies or the dessert table",
    "tie_break": "'How many pieces of pie will be eaten tonight?'",
    "whoami_hint": "'Am I food?' or 'Do I have feathers?'",
    "lr_title": "Pass the Pie Game",
    "lr_story_title": "The Thanksgiving Left-Right Story",
    "lr_rules": ["Everyone sits in a circle. Give a few people a pie, a small treat or a wrapped prize.",
                 "One person reads the story out loud, slowly.",
                 "Every time you hear LEFT, pass the treat to the person on your left. Every time you hear RIGHT, pass it to the right.",
                 "When the story ends, whoever is holding a treat gets to keep it!"],
    "extra": lambda b: P.simple_cards(b, "Table Talk Cards", C.TABLE_TALK, [
        "Cut out the cards and put them in a bowl or basket in the middle of the table.",
        "Between courses, take turns drawing a card and answering the question.",
        "Everyone can add their own answer. There are no wrong answers, just good stories!",
    ], "TABLE TALK", cols=2, rows=5, size=12),
})


def leaf(self, x, y, r, color=None, w=1.4):
    """Simple maple-style leaf outline instead of a snowflake."""
    c = self.c
    c.setStrokeColor(color or P.FLAKE)
    c.setLineWidth(w)
    c.setLineCap(1)
    c.setLineJoin(1)
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
    c.drawPath(p, stroke=1, fill=0)
    c.line(x, y, x, y - r * 1.3)  # stem


P.Book.flake = leaf


def main():
    out = Path(sys.argv[1] if len(sys.argv) > 1 else "dist")
    out.mkdir(parents=True, exist_ok=True)
    for size, suffix in ((letter, "US-Letter"), (A4, "A4")):
        print("built", suffix, P.build(out, size, suffix) + 1, "pages")


if __name__ == "__main__":
    main()
