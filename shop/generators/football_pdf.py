"""Builds the Big Game Football Party Games bundle by reusing xmas_pdf.py with a turf-and-navy theme.

The scavenger hunt is replaced by a 100-square pool and a prediction sheet; the carols by a
second prediction page for kids. Usage: python3 football_pdf.py <output_dir>
"""
import sys
from pathlib import Path

from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4, letter

import football_content as C
import xmas_pdf as P

P.RED = HexColor("#1B3A6B")    # navy
P.GREEN = HexColor("#2E6B34")  # turf green
P.GOLD = HexColor("#C99A2E")
P.CREAM = HexColor("#F6F7F2")
P.FLAKE = HexColor("#E2E6DA")
P.X = C


def squares(b):
    P.rules(b, "Football Squares", [
        "Write the two team names on the grid: one across the top (Team A), one down the side (Team B).",
        "Guests write their initials in the squares they want. Fill all 100 squares (people can take several).",
        "When the grid is full, draw the numbers 0–9 from a hat and write them in the top row, then again down the side.",
        "At the end of each quarter, look at the LAST DIGIT of each team's score. The square where they meet wins!",
        "Example: Team A 17, Team B 10 → the square at A = 7, B = 0 wins that quarter.",
    ])
    b.page("Football Squares", "Last digit of each team's score at the end of every quarter")
    W, H = b.W, b.H
    cell = min((W - 120) / 11, (H - 300) / 11)
    gx = (W - cell * 11) / 2 + cell
    gy = H - 160
    c = b.c
    b.t(gx + cell * 5, gy + 22, "TEAM A: ____________________", 13, "Bold", P.RED, "c")
    c.saveState()
    c.translate(gx - cell - 18, gy - cell * 6)
    c.rotate(90)
    b.t(0, 0, "TEAM B: ____________________", 13, "Bold", P.RED, "c")
    c.restoreState()
    c.setLineWidth(0.8)
    for r in range(11):
        for col in range(11):
            x = gx + (col - 1) * cell
            y = gy - r * cell
            if r == 0 and col == 0:
                continue
            head = r == 0 or col == 0
            c.setFillColor(HexColor("#DCEBD9") if head else white)
            c.setStrokeColor(P.GREEN if head else P.LINE)
            c.rect(x, y - cell, cell, cell, stroke=1, fill=1)
    y = gy - 11 * cell - 30
    for k, q in enumerate(["1st quarter", "2nd quarter (halftime)", "3rd quarter", "Final score"]):
        yy = y - k * 22
        b.t(gx - cell, yy, f"{q}:", 11, "Bold", P.RED)
        b.t(gx + cell * 3, yy, "A ______   B ______    Winner: ________________", 11, "Body", P.INK)
    b.end()


def predictions(b):
    P.rules(b, "Big Game Predictions", [
        "Give every guest a prediction sheet and a pen before kickoff. No changes after the game starts!",
        "Circle one answer for each question.",
        "During the game, mark each answer right or wrong. One point for every correct prediction.",
        "Most points wins. Tie? Closest guess of the exact final score wins.",
    ])
    b.page("Big Game Predictions", "Circle your answers before kickoff")
    W, H = b.W, b.H
    b.t(55, H - 128, "Name: ______________________", 12, "Bold")
    b.t(W - 55, H - 128, "Score: ______ / 18", 12, "Bold", anchor="r")
    y = H - 165
    step = (y - 70) / len(C.PREDICTIONS)
    for i, (q, opts) in enumerate(C.PREDICTIONS, 1):
        b.t(55, y, f"{i}.", 11, "Bold", P.RED)
        b.t(78, y, q, 11)
        b.t(W - 55, y, opts, 10.5, "Bold", P.GREEN, "r")
        b.c.setStrokeColor(P.LINE)
        b.c.line(78, y - 8, W - 55, y - 8)
        y -= step
    b.end()


def pool(b):
    squares(b)
    predictions(b)


def commercial_bingo_note(b):
    """Extra: a scorekeeper sheet for trivia nights and a party checklist."""
    b.page("Game Day Party Checklist", "Plan the party in the week before kickoff")
    W, H = b.W, b.H
    groups = [("A week before", ["Invite guests and ask who is bringing what", "Print the games and cut out the cards",
                                 "Check the kickoff time in your time zone", "Plan the menu"]),
              ("The day before", ["Shop for snacks, drinks, plates and napkins", "Make dips and chili ahead",
                                  "Fill in the team names on the squares grid", "Charge the remote and test the TV"]),
              ("Game day", ["Set up the snack table away from the TV", "Hand out prediction sheets before kickoff",
                            "Draw the squares numbers once the grid is full", "Keep small prizes ready for each quarter"])]
    y = H - 140
    for name, items in groups:
        b.t(55, y, name, 14, "Bold", P.RED)
        y -= 26
        for it in items:
            b.c.setStrokeColor(P.GREEN)
            b.c.rect(57, y - 3, 12, 12, stroke=1, fill=0)
            b.t(80, y, it, 12)
            y -= 26
        y -= 12
    b.end()


P.T.update({
    "name": "Big Game",
    "file": "Big-Game-Football-Party-Games",
    "cover_top": "Big Game",
    "cover_fleck": "#2F4F86",
    "cover_sub": "9 printable football party games for families & friends",
    "tips": ["Print only the pages you need. Card pages have dashed lines: cut along them with scissors.",
             "Print one Squares grid for the room and one Prediction sheet per guest.",
             "Answer keys are at the end of each game.",
             "Play Who Am I?, Charades and Would You Rather during halftime or the slow parts of the game.",
             "Personal use only: print as many copies as you like for your own party."],
    "games": ["Football Squares", "Predictions", "Trivia", "Bingo (30 cards)", "Who Am I?", "Charades",
              "Would You Rather", "Word Scramble", "Left-Right Game"],
    "inside": [("Football Squares", "100-square grid for the whole room, with quarter-by-quarter winners"),
               ("Predictions", "18 questions to answer before kickoff, plus a tie-breaker"),
               ("Football Trivia", "40 questions on the rules and the big game, with answers"),
               ("Game Day Bingo", "30 different cards: plays, ads and party moments"),
               ("Who Am I?", "40 guessing cards"), ("Charades", "40 acting cards"),
               ("Would You Rather", "40 game-day questions"),
               ("Word Scramble", "25 football words to unscramble, with answers"),
               ("Left-Right Game", "an original game-day story, plus a party checklist")],
    "tie_break": "'How many total points will be scored in the game?'",
    "whoami_hint": "'Can I be eaten?' or 'Am I on the field?'",
    "lr_title": "Left-Right Prize Game",
    "lr_story_title": "Game Day: Left-Right Story",
    "lr_rules": ["Everyone sits in a circle. Give a few people a small wrapped prize.",
                 "One person reads the story out loud, slowly (halftime is perfect).",
                 "Every time you hear LEFT, pass the prize to the person on your left. Every time you hear RIGHT, pass it to the right.",
                 "When the story ends, whoever is holding a prize gets to keep it!"],
    "hunt": pool,
    "extra": commercial_bingo_note,
})


def football(self, x, y, r, color=None, w=1.4):
    """Football outline with laces instead of a snowflake."""
    c = self.c
    c.setStrokeColor(color or P.FLAKE)
    c.setLineWidth(w)
    c.ellipse(x - r, y - r * 0.6, x + r, y + r * 0.6, stroke=1, fill=0)
    c.line(x - r * 0.45, y, x + r * 0.45, y)
    for k in range(-2, 3):
        c.line(x + k * r * 0.18, y - r * 0.14, x + k * r * 0.18, y + r * 0.14)


P.Book.flake = football


def main():
    out = Path(sys.argv[1] if len(sys.argv) > 1 else "dist")
    out.mkdir(parents=True, exist_ok=True)
    for size, suffix in ((letter, "US-Letter"), (A4, "A4")):
        print("built", suffix, P.build(out, size, suffix) + 1, "pages")


if __name__ == "__main__":
    main()
