"""Builds the New Year's Eve Party Games Bundle by reusing xmas_pdf.py with a navy-and-gold theme.

Usage: python3 newyear_pdf.py <output_dir>
"""
import math
import sys
from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4, letter

import newyear_content as C
import xmas_pdf as P

P.RED = HexColor("#1D2B53")    # navy
P.GREEN = HexColor("#8A6A12")  # deep gold
P.GOLD = HexColor("#C9A227")
P.CREAM = HexColor("#F8F6F1")
P.FLAKE = HexColor("#E6E0D2")
P.X = C
P.T.update({
    "name": "New Year's Eve",
    "file": "New-Years-Eve-Party-Games",
    "cover_top": "New Year's Eve",
    "cover_fleck": "#2E3F72",
    "games": ["Countdown Hunt", "Trivia", "Bingo (30 cards)", "Who Am I?", "Charades", "Would You Rather",
              "Word Scramble", "Year in Review", "Left-Right Prize Game"],
    "inside": [("Countdown Hunt", "12 rhyming clues that lead around the house to a prize"),
               ("New Year Trivia", "40 questions on traditions around the world, with answers"),
               ("New Year Bingo", "30 different bingo cards and a caller's sheet"),
               ("Who Am I?", "40 guessing cards"), ("Charades", "40 acting cards"),
               ("Would You Rather", "40 fun questions about the year ahead"),
               ("Word Scramble", "25 party words to unscramble, with answers"),
               ("Year in Review", "40 cards to look back and dream ahead"),
               ("Left-Right Prize Game", "an original story to play before midnight")],
    "prize_spot": "with the party hats",
    "tie_break": "'How many seconds after midnight will the first firework go off?'",
    "whoami_hint": "'Can I be eaten?' or 'Do I make a noise?'",
    "lr_title": "Left-Right Prize Game",
    "lr_story_title": "The New Year's Eve Left-Right Story",
    "lr_rules": ["Everyone sits in a circle. Give a few people a small wrapped prize.",
                 "One person reads the story out loud, slowly.",
                 "Every time you hear LEFT, pass the prize to the person on your left. Every time you hear RIGHT, pass it to the right.",
                 "When the story ends, whoever is holding a prize gets to keep it. Then it's almost midnight!"],
    "extra": lambda b: P.simple_cards(b, "Year in Review & 2027 Wishes", C.REFLECT, [
        "Cut out the cards and put them in a hat or a bowl.",
        "Take turns drawing a card and answering it. Everyone can join in.",
        "Keep your favourite answers: write them on the back of a card and open them next New Year's Eve!",
    ], "LOOK BACK · DREAM AHEAD", cols=2, rows=5, size=12),
})


def star(self, x, y, r, color=None, w=1.4):
    """Five-pointed star outline instead of a snowflake."""
    c = self.c
    c.setStrokeColor(color or P.FLAKE)
    c.setLineWidth(w)
    c.setLineJoin(1)
    pts = []
    for k in range(10):
        a = math.pi / 2 + k * math.pi / 5
        rr = r if k % 2 == 0 else r * 0.42
        pts.append((x + rr * math.cos(a), y + rr * math.sin(a)))
    p = c.beginPath()
    p.moveTo(*pts[0])
    for pt in pts[1:]:
        p.lineTo(*pt)
    p.close()
    c.drawPath(p, stroke=1, fill=0)


P.Book.flake = star


def main():
    out = Path(sys.argv[1] if len(sys.argv) > 1 else "dist")
    out.mkdir(parents=True, exist_ok=True)
    for size, suffix in ((letter, "US-Letter"), (A4, "A4")):
        print("built", suffix, P.build(out, size, suffix) + 1, "pages")


if __name__ == "__main__":
    main()
