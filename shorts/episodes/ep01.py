"""Эпизод 1 «Два билета» (часть 1). Оригинальная история."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from engine import *

GY = int(H * 0.68)

def night_bg(seed=3, top="#14122b", bot="#3a2a4d"):
    def f():
        img = gradient(top, bot); d = ImageDraw.Draw(img)
        r = random.Random(seed)
        for _ in range(40):
            x, y = r.randint(0, W), r.randint(0, int(H * 0.3)); d.ellipse([x, y, x + 5, y + 5], fill=(230, 230, 255))
        city(d, GY, "#1d1a38", seed)
        d.rectangle([0, GY, W, H], fill=(24, 22, 40))
        d.rectangle([0, GY, W, GY + 14], fill=(70, 66, 96))
        lamp(d, int(W * 0.12), GY); lamp(d, int(W * 0.88), GY)
        return img
    return f

def d_walkin(d, t, D, img):
    x = lerp(-150, W * 0.5, ease(t / D))
    man(d, x, GY, "#8aa0c8", 1.7, 1, walk=t * 7, hat=True, bob=-abs(math.sin(t * 7)) * 10)

def d_window(d, t, D, img):
    d.rectangle([W * 0.55, GY - 720, W * 0.95, GY - 120], fill=(60, 52, 80))
    d.rectangle([W * 0.58, GY - 660, W * 0.92, GY - 480], fill=(250, 215, 140))
    man(d, W * 0.35, GY, "#8aa0c8", 1.7, 1, arm=(1.3 if t > 0.4 else 0.2, 0.1), hat=True)
    p = ease((t - 0.5) / 0.5)
    for i in range(2):
        ticket(d, lerp(W * 0.75, W * 0.52, p) + i * 40, GY - 580 + i * 30 + (1 - p) * 40, 1.2)

def d_bench(d, t, D, img):
    bench(d, W * 0.5, GY, 700)
    man(d, W * 0.4, GY - 90, "#8aa0c8", 1.6, 1, sit=True, arm=(0.9, 0.2), hat=True, bob=math.sin(t * 2) * 3)
    p = ease(t / 1.2)
    ticket(d, lerp(W * 0.52, W * 0.66, p), GY - 280 + (1 - p) * -70, 1.1)

def d_train(d, t, D, img):
    p = ease(t / (D * 0.7))
    train(d, lerp(-1700, -60, p), GY, n=3)
    man(d, W * 0.52, GY, "#8aa0c8", 1.6, -1, arm=(0.15, -0.15), hat=True)

def d_laugh(d, t, D, img):
    man(d, W * 0.55, GY, "#8aa0c8", 1.6, -1, hat=True, arm=(0.05, -0.05))
    for i, (x, c) in enumerate(((W * 0.15, "#e07a5f"), (W * 0.3, "#81b29a"), (W * 0.85, "#f2cc8f"))):
        man(d, x, GY, c, 1.4, 1 if x < W * 0.5 else -1, arm=(1.6, 0.2) , bob=math.sin(t * 9 + i) * 8)

def d_girl(d, t, D, img):
    bench(d, W * 0.5, GY, 700)
    man(d, W * 0.37, GY - 90, "#8aa0c8", 1.6, 1, sit=True, arm=(0.9, 0.2), hat=True)
    x = lerp(W * 1.2, W * 0.66, ease(t / (D * 0.85)))
    walking = t < D * 0.85
    man(d, x, GY - (90 if not walking else 0), "#e56b8f", 1.6, -1, walk=t * 7 if walking else None,
        sit=not walking, arm=(0.4, 0.1), hair=True)
    suitcase(d, x + 190, GY, 1.0)

def d_read(d, t, D, img):
    bench(d, W * 0.5, GY, 700)
    man(d, W * 0.37, GY - 90, "#8aa0c8", 1.6, 1, sit=True, arm=(0.9, 0.2), hat=True)
    man(d, W * 0.66, GY - 90, "#e56b8f", 1.6, -1, sit=True, arm=(-1.3, 0.2), hair=True)
    ticket(d, W * 0.52, GY - 900 - math.sin(t * 3) * 6, 2.0)
    suitcase(d, W * 0.84, GY, 1.0)

def d_shock(d, t, D, img):
    bench(d, W * 0.5, GY, 700)
    man(d, W * 0.37, GY - 90, "#8aa0c8", 1.6, 1, sit=True, arm=(1.0, 0.4), hat=True, bob=math.sin(t * 25) * 3)
    man(d, W * 0.66, GY - 90, "#e56b8f", 1.6, -1, sit=True, arm=(-1.3, 0.2), hair=True, bob=math.sin(t * 25 + 1) * 3)
    ticket(d, W * 0.52, GY - 900, 2.4 + math.sin(t * 6) * 0.1)
    d.text((W * 0.5 - 50, GY - 1300), "!", font=font(220), fill=(255, 80, 80), stroke_width=6, stroke_fill=(0, 0, 0))

def d_end(d, t, D, img):
    clock(d, W * 0.5, GY - 600, 330, 9 + t * 0.4)

HOOK = [("19 ЛЕТ", True), ("ДВА БИЛЕТА", False)]
SCENES = [
 dict(say="Девятнадцать лет старик покупает *два билета*. И ни разу не уезжает.", bg=night_bg(), draw=d_walkin),
 dict(say="Каждый вечер в девять сорок Пётр приходит на вокзал.", bg=night_bg(4), draw=d_walkin),
 dict(say="Берёт два билета до станции *Сосновка*.", bg=night_bg(5), draw=d_window),
 dict(say="Садится на лавку. Один билет кладёт *рядом*.", bg=night_bg(6), draw=d_bench),
 dict(say="Поезд приходит. Все уезжают. Пётр *остаётся*.", bg=night_bg(7), draw=d_train),
 dict(say="Над ним смеются. Говорят — *сумасшедший*.", bg=night_bg(8), draw=d_laugh),
 dict(say="Но сегодня на пустое место села *девушка* с чемоданом.", bg=night_bg(9), draw=d_girl),
 dict(say="Она взяла билет, прочитала — и *побледнела*.", bg=night_bg(10), draw=d_read),
 dict(say="Это был *её почерк*. Хотя она никогда здесь не была.", bg=night_bg(11), draw=d_shock),
 dict(say="Что было в письме — во *второй части*.", bg=night_bg(12, "#2a1a3a", "#5a3a4d"), draw=d_end),
]
