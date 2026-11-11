"""Builds the Valentine's Day Party Games bundle by reusing xmas_pdf.py with a raspberry-and-pink theme.

Usage: python3 valentine_pdf.py <output_dir>
"""
import sys
from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4, letter

import valentine_content as C
import xmas_pdf as P
from bridal_pdf import heart

P.RED = HexColor("#B5345A")    # raspberry
P.GREEN = HexColor("#7A2E4C")  # plum
P.GOLD = HexColor("#D98BA3")
P.CREAM = HexColor("#FDF5F6")
P.FLAKE = HexColor("#F4D9E0")
P.X = C
P.T.update({
    "name": "Valentine's Day",
    "file": "Valentines-Day-Party-Games",
    "cover_top": "Valentine's Day",
    "cover_fleck": "#C9577A",
    "cover_sub": "9 printable games for kids, classrooms & families",
    "tips": ["Print only the pages you need. Card pages have dashed lines: cut along them with scissors.",
             "Card stock or thicker paper makes the cards easier to hold and reuse.",
             "Answer keys are at the end of each game.",
             "Teachers: bingo, trivia, word scramble and kindness cards work well for a whole class.",
             "Personal and classroom use: print as many copies as you need for your own party or class."],
    "games": ["Love Note Hunt", "Trivia", "Bingo (30 cards)", "Who Am I?", "Charades", "Would You Rather",
              "Word Scramble", "Kindness Cards", "Left-Right Game"],
    "inside": [("Love Note Hunt", "12 rhyming clues that lead around the house to a prize"),
               ("Valentine's Trivia", "40 questions on love, legends and traditions, with answers"),
               ("Valentine's Bingo", "30 different bingo cards and a caller's sheet"),
               ("Who Am I?", "40 guessing cards"), ("Charades", "40 acting cards"),
               ("Would You Rather", "40 sweet and silly questions"),
               ("Word Scramble", "25 Valentine words to unscramble, with answers"),
               ("Kindness Cards", "40 compliment prompts to finish and give away"),
               ("Left-Right Game", "an original class-party story")],
    "prize_spot": "with the crayons and art supplies",
    "hunt": P.scavenger,
    "tie_break": "'How many candy hearts are in the jar?'",
    "whoami_hint": "'Can I be eaten?' or 'Am I a person?'",
    "lr_title": "Left-Right Valentine Game",
    "lr_story_title": "The Valentine's Party: Left-Right Story",
    "lr_rules": ["Everyone sits in a circle. Give a few people a small wrapped treat.",
                 "One person reads the story out loud, slowly.",
                 "Every time you hear LEFT, pass the treat to the person on your left. Every time you hear RIGHT, pass it to the right.",
                 "When the story ends, whoever is holding a treat gets to keep it!"],
    "extra": lambda b: P.simple_cards(b, "Kindness & Compliment Cards", C.KIND, [
        "Cut out the cards and put them in a bowl.",
        "Each player draws a card, finishes the sentence for someone in the room and gives them the card.",
        "In a classroom, each child can draw a name and write a card for that classmate.",
    ], "FROM THE HEART", cols=2, rows=5, size=12),
})
P.Book.flake = heart


def main():
    out = Path(sys.argv[1] if len(sys.argv) > 1 else "dist")
    out.mkdir(parents=True, exist_ok=True)
    for size, suffix in ((letter, "US-Letter"), (A4, "A4")):
        print("built", suffix, P.build(out, size, suffix) + 1, "pages")


if __name__ == "__main__":
    main()
