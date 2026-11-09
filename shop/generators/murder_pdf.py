"""Builds 'Murder at Mistletoe Manor', a printable murder mystery party kit (US Letter + A4).

Reuses the page helpers from xmas_pdf.py with a darker 'mystery' palette.
Usage: python3 murder_pdf.py <output_dir>
"""
import sys
from pathlib import Path

from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4, letter
from reportlab.pdfbase import pdfmetrics

import murder_content as M
import xmas_pdf as P

P.RED = HexColor("#7A1E2C")    # burgundy
P.GREEN = HexColor("#1E3D33")  # dark pine
P.GOLD = HexColor("#B8892B")
P.CREAM = HexColor("#FAF5EC")
P.FLAKE = HexColor("#EADFCB")
P.T["name"] = "Murder at Mistletoe Manor"
wrap = P.wrap


class Kit(P.Book):
    def __init__(self, path, size):
        super().__init__(path, size)
        self.c.setTitle(M.TITLE)

    def end(self):
        self.n += 1
        self.t(self.W / 2, 20, f"{self.n}  ·  {M.TITLE}  ·  {P.SITE}", 8, color=P.MUTED, anchor="c")
        self.c.showPage()

    def heading(self, y, text, size=16, color=None):
        self.t(55, y, text, size, "Serif", color or P.GREEN)
        return y - size - 10

    def box(self, x, y, w, h, fill, stroke=None):
        self.c.setFillColor(fill)
        self.c.setStrokeColor(stroke or fill)
        self.c.roundRect(x, y - h, w, h, 10, stroke=1 if stroke else 0, fill=1)

    def dashed(self, x, y, w, h):
        self.c.setDash(4, 4)
        self.c.setStrokeColor(P.LINE)
        self.c.setLineWidth(0.8)
        self.c.rect(x, y - h, w, h, stroke=1, fill=0)
        self.c.setDash()


def cover(k):
    c = k.c
    c.setFillColor(HexColor("#1B1416"))
    c.rect(0, 0, k.W, k.H, stroke=0, fill=1)
    import random
    rng = random.Random(9)
    for _ in range(30):
        k.flake(rng.uniform(20, k.W - 20), rng.uniform(20, k.H - 20), rng.uniform(6, 20), HexColor("#3A2B2E"), 1.4)
    k.t(k.W / 2, k.H * 0.74, "A CHRISTMAS MURDER MYSTERY PARTY", 13, "Bold", P.GOLD, "c")
    k.t(k.W / 2, k.H * 0.64, "Murder at", 40, "Serif", white, "c")
    k.t(k.W / 2, k.H * 0.57, "Mistletoe Manor", 46, "Serif", HexColor("#E0B04F"), "c")
    k.t(k.W / 2, k.H * 0.50, "8 suspects · 3 rounds · 1 killer", 16, "Body", white, "c")
    items = ["Host guide & opening script", "8 character booklets", "20 evidence cards", "Invitations & name tags",
             "Accusation ballots & awards", "Full solution & timeline"]
    for i, it in enumerate(items):
        col, row = i % 2, i // 2
        k.t(k.W / 2 + (col - 0.5) * 230, k.H * 0.40 - row * 24, "✦ " + it, 12, "Body", HexColor("#E8DCCB"), "c")
    k.t(k.W / 2, k.H * 0.22, "Printable kit for 6–8 players · 2–3 hours of play · Letter & A4", 11, "Body", HexColor("#BFAF9B"), "c")
    k.t(k.W / 2, 50, "Penny & Plan", 15, "Bold", white, "c")
    c.showPage()


def welcome(k):
    k.page("Welcome, Host!")
    y = k.para(55, k.H - 135, M.SETTING, 13, k.W - 110) - 18
    y = k.heading(y, "What's in this kit")
    for item in ["How to host (this section): timings, setup and the opening script",
                 "Cast list and invitations to send to your guests",
                 "8 character booklets: give one to each guest, sealed in an envelope",
                 "20 evidence cards, sorted by round, each marked with who reads it",
                 "Name tags, accusation ballots and awards for the end of the night",
                 "The solution and full timeline: keep these pages hidden until the end!"]:
        k.t(62, y, "✦", 12, "Bold", P.GOLD)
        y = k.para(82, y, item, 12.5, k.W - 140) - 8
    y -= 12
    y = k.heading(y, "Players")
    y = k.para(55, y, "The game is written for 8 players. For 6 players, leave out Dr. Casey Hollins AND Quinn Carroll "
               "together (they are each other's alibi) and set their evidence cards aside. The host can play a "
               "character too: just don't read the solution first!", 12.5, k.W - 110)
    k.end()


def host_guide(k):
    k.page("How to Host", "Read this a week before the party")
    y = k.H - 130
    y = k.heading(y, "Before the party")
    for i, s in enumerate([
        "One or two weeks before: decide who plays whom (any character can be played by anyone) and send each guest their invitation from this kit with their character and costume idea.",
        "Print one character booklet per guest and seal each in an envelope with the guest's name. Don't let anyone see another booklet, especially Taylor Snow's.",
        "Cut out the evidence cards and sort them into three envelopes: Round 1, Round 2 and Round 3. Each card says who reads it.",
        "Print the name tags, a few accusation ballots and the awards. Keep the solution pages for yourself.",
    ], 1):
        k.t(58, y, f"{i}.", 12, "Bold", P.RED)
        y = k.para(78, y, s, 12, k.W - 135) - 8
    y -= 6
    y = k.heading(y, "On the night (about 2–3 hours)")
    for t, s in [("Arrival", "Hand out name tags and sealed booklets. Guests read only the 'Who you are' page for now."),
                 ("Opening", "Gather everyone and read the opening script aloud (next page)."),
                 ("Round 1", "With drinks or starters: Secrets. Hand out the Round 1 cards to the named players."),
                 ("Round 2", "Over the main course: Where Were You? Hand out the Round 2 cards."),
                 ("Round 3", "With dessert: The Evidence. Hand out the Round 3 cards."),
                 ("Accuse!", "Everyone fills in a ballot. Then the murderer may confess, or the host reads the solution."),
                 ("Awards", "Give out Best Detective and Best Costume.")]:
        k.t(62, y, t, 12, "Bold", P.RED)
        y = k.para(150, y, s, 12, k.W - 205) - 6
    y -= 6
    k.para(55, y, "Tip: the murderer is the only player allowed to lie about the facts. Everyone else may hide their "
           "secret, but must tell the truth about where they were.", 11.5, k.W - 110, color=P.MUTED)
    k.end()


def script(k):
    k.page("Host Script", "Read these aloud")
    y = k.heading(k.H - 130, "Opening")
    y = k.para(55, y, M.OPENING, 12.5, k.W - 110) - 14
    for title, text in M.ROUND_INTROS:
        y = k.heading(y, title, 15, P.RED)
        y = k.para(55, y, text, 12, k.W - 110) - 12
    k.end()
    k.page("Evidence Cards: Who Reads What", "Hand each card to the player named, at the start of each round")
    y = k.H - 125
    for rnd in (1, 2, 3):
        y = k.heading(y, f"Round {rnd}", 14, P.RED)
        for _r, who, title, _text in [e for e in M.EVIDENCE if e[0] == rnd]:
            k.t(62, y, who, 11, "Bold")
            k.t(200, y, title, 11)
            y -= 16
        y -= 8
    k.end()


def cast_and_invites(k):
    k.page("The Cast", "Share this list with your guests")
    y = k.H - 125
    for ch in M.CHARACTERS:
        k.t(55, y, ch["name"], 13, "Serif", P.RED)
        k.t(k.W - 55, y, ch["role"], 9.5, "Body", P.MUTED, "r")
        y = k.para(55, y - 16, ch["public"], 11, k.W - 110)
        y = k.para(55, y, "Costume idea: " + ch["costume"], 10, k.W - 110, color=P.GREEN) - 8
    k.end()
    for i in range(0, 8, 2):
        k.page("Invitations", "Cut along the dashed line, fill in the details and give one to each guest")
        for j, ch in enumerate(M.CHARACTERS[i:i + 2]):
            top = k.H - 120 - j * (k.H - 165) / 2
            h = (k.H - 175) / 2
            x, w = 45, k.W - 90
            k.dashed(x, top, w, h)
            k.t(k.W / 2, top - 32, "You are invited to", 12, "Body", P.MUTED, "c")
            k.t(k.W / 2, top - 62, M.TITLE, 24, "Serif", P.RED, "c")
            k.t(k.W / 2, top - 84, "a Christmas murder mystery party", 11, "Body", P.MUTED, "c")
            k.t(x + 25, top - 116, "You will play:", 11, "Bold")
            k.t(x + 125, top - 116, ch["name"], 14, "Serif", P.GREEN)
            yy = k.para(x + 25, top - 136, ch["public"], 10.5, w - 50)
            yy = k.para(x + 25, yy, "Dress as: " + ch["costume"], 10.5, w - 50, color=P.GREEN) - 6
            for label in ("Date & time", "Place", "RSVP"):
                k.t(x + 25, yy, label, 10.5, "Bold")
                k.c.setStrokeColor(P.LINE)
                k.c.line(x + 115, yy - 2, x + w - 25, yy - 2)
                yy -= 20
        k.end()


def booklet(k, ch):
    k.page(ch["name"], "CHARACTER BOOKLET · Keep it secret!")
    y = k.H - 125
    k.t(k.W / 2, y, ch["role"], 12.5, "Body", P.MUTED, "c")
    y -= 30
    y = k.heading(y, "Who you are")
    y = k.para(55, y, ch["public"], 12.5, k.W - 110) - 4
    y = k.para(55, y, "Costume idea: " + ch["costume"], 11.5, k.W - 110, color=P.GREEN) - 14
    y = k.heading(y, "Your secret")
    y = k.para(55, y, ch["secret"], 12.5, k.W - 110) - 6
    y = k.para(55, y, "If your secret comes out: " + ch["admit"], 11.5, k.W - 110, color=P.MUTED) - 14
    y = k.heading(y, "The setting")
    k.para(55, y, M.SETTING, 11, k.W - 110, color=P.MUTED)
    k.end()

    k.page(ch["name"], "CHARACTER BOOKLET · Page 2")
    y = k.H - 130
    for title, text in (("Round 1: Secrets", "Introduce yourself in character. Then share this rumour: " + ch["rumour"]),
                        ("Round 2: Where were you?", "Tell everyone: " + ch["alibi"]),
                        ("Round 3: The evidence", ch["r3"])):
        y = k.heading(y, title, 15, P.RED)
        y = k.para(55, y, text, 12, k.W - 110) - 14
    h = 150 if ch["murderer"] else 72
    k.box(45, y, k.W - 90, h, HexColor("#2A1D20") if ch["murderer"] else HexColor("#EFE6D6"))
    if ch["murderer"]:
        k.t(65, y - 26, "YOU ARE THE MURDERER", 15, "Serif", HexColor("#E0B04F"))
        k.para(65, y - 46, M.MURDERER_NOTE, 10, k.W - 130, color=white, lead=1.4)
    else:
        k.t(65, y - 26, "You are NOT the murderer.", 14, "Serif", P.GREEN)
        k.para(65, y - 46, "You may hide or bend the truth about your secret, but everything else in this booklet is true. Find the killer!", 10.5, k.W - 130)
    k.end()


def evidence_cards(k):
    cards = M.EVIDENCE
    cols, rows = 2, 3
    for start in range(0, len(cards), cols * rows):
        k.page("Evidence Cards", "Cut along the dashed lines and sort into Round 1, 2 and 3 envelopes")
        top, bottom = k.H - 120, 45
        cw, ch = (k.W - 70) / cols, (top - bottom) / rows
        for j, (rnd, who, title, text) in enumerate(cards[start:start + cols * rows]):
            x = 35 + (j % cols) * cw
            y = top - (j // cols) * ch
            k.dashed(x, y, cw, ch)
            k.c.setFillColor(P.RED)
            k.c.roundRect(x + 12, y - 30, 70, 20, 6, stroke=0, fill=1)
            k.t(x + 47, y - 24, f"ROUND {rnd}", 9, "Bold", white, "c")
            k.t(x + cw - 12, y - 24, "read by " + who, 8.5, "Body", P.MUTED, "r")
            yy = k.para(x + 14, y - 56, title, 14, cw - 28, "Serif", P.GREEN, lead=1.3)
            k.para(x + 14, yy - 6, text, 12, cw - 28, lead=1.45)
        k.end()


def tags_ballots_awards(k):
    k.page("Name Tags", "Cut out and pin on")
    cols, rows = 2, 4
    top, bottom = k.H - 120, 45
    cw, ch = (k.W - 70) / cols, (top - bottom) / rows
    for j, c in enumerate(M.CHARACTERS):
        x = 35 + (j % cols) * cw
        y = top - (j // cols) * ch
        k.dashed(x, y, cw, ch)
        k.t(x + cw / 2, y - ch / 2 + 6, c["name"], 17, "Serif", P.RED, "c")
        lines = wrap(c["role"], "Body", 9, cw - 30)
        for li, ln in enumerate(lines[:2]):
            k.t(x + cw / 2, y - ch / 2 - 14 - li * 12, ln, 9, "Body", P.MUTED, "c")
    k.end()
    k.page("Accusation Ballots", "Everyone fills one in before the solution is read")
    rows = 4
    for j in range(8):
        x = 35 + (j % 2) * cw
        y = top - (j // 2) * ch
        k.dashed(x, y, cw, ch)
        k.t(x + 14, y - 24, "I ACCUSE", 13, "Serif", P.RED)
        for li, label in enumerate(("Suspect:", "Because:", "", "My name:")):
            yy = y - 50 - li * 24
            k.t(x + 14, yy, label, 10, "Bold")
            k.c.setStrokeColor(P.LINE)
            k.c.line(x + 75, yy - 2, x + cw - 14, yy - 2)
    k.end()
    k.page("Awards")
    for j, (award, sub) in enumerate((("Best Detective", "for brilliant deductions at Mistletoe Manor"),
                                      ("Best Costume", "for outstanding style on a deadly night"))):
        top2 = k.H - 110 - j * (k.H - 150) / 2
        h = (k.H - 170) / 2
        k.box(50, top2, k.W - 100, h - 10, HexColor("#EFE6D6"), P.GOLD)
        k.t(k.W / 2, top2 - 60, "Certificate of", 14, "Body", P.MUTED, "c")
        k.t(k.W / 2, top2 - 100, award, 34, "Serif", P.RED, "c")
        k.t(k.W / 2, top2 - 130, sub, 12, "Body", P.MUTED, "c")
        k.c.setStrokeColor(P.INK)
        k.c.line(k.W / 2 - 140, top2 - 190, k.W / 2 + 140, top2 - 190)
        k.t(k.W / 2, top2 - 206, "awarded to", 10, "Body", P.MUTED, "c")
    k.end()


def solution(k):
    k.page("THE SOLUTION", "Host only · Read aloud after the accusations")
    y = k.para(55, k.H - 135, M.SOLUTION, 12.5, k.W - 110) - 18
    y = k.heading(y, "Timeline of the night", 15, P.RED)
    for t, e in [("8:00", "Dinner. Taylor is the only guest wearing a red scarf."),
                 ("9:00", "Jordan locks the downstairs restroom: OUT OF ORDER."),
                 ("9:05", "Taylor picks foxglove in the conservatory wearing the gardening gloves."),
                 ("9:30", "Casey and Quinn start performing (filmed). Avery starts the recorded investor call."),
                 ("9:35", "Robin starts the bank call in the front hall."),
                 ("9:38", "Morgan tastes the cocoa and pours Nicholas's mug."),
                 ("9:40", "Jordan delivers the mug. Nicholas: 'Perfect cocoa, Jordan!' Riley goes out to the terrace."),
                 ("9:45", "Taylor leaves the ballroom 'for the restroom'."),
                 ("9:50", "Nicholas phones the kitchen for marshmallows. Morgan and Jordan answer."),
                 ("9:52", "Riley's photos: a red scarf at Nicholas's desk; Robin on the phone in the hall."),
                 ("9:58", "Taylor returns to the ballroom after hiding the gloves in the cloakroom."),
                 ("10:00", "Performance ends. Nicholas drinks the rest of his cocoa."),
                 ("10:05", "Jordan finds Nicholas dead. Robin ends the bank call and runs in.")]:
        k.t(62, y, t, 11, "Bold", P.RED)
        y = k.para(110, y, e, 11, k.W - 170) - 4
    k.end()


def build(out, size, suffix):
    k = Kit(out / f"Murder-Mystery-Mistletoe-Manor-{suffix}.pdf", size)
    cover(k)
    welcome(k)
    host_guide(k)
    script(k)
    cast_and_invites(k)
    for ch in M.CHARACTERS:
        booklet(k, ch)
    evidence_cards(k)
    tags_ballots_awards(k)
    solution(k)
    k.save()
    return k.n + 1


def main():
    out = Path(sys.argv[1] if len(sys.argv) > 1 else "dist")
    out.mkdir(parents=True, exist_ok=True)
    for size, suffix in ((letter, "US-Letter"), (A4, "A4")):
        print("built", suffix, build(out, size, suffix), "pages")


if __name__ == "__main__":
    main()
