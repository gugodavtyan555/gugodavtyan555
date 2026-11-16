#!/usr/bin/env python3
"""Story-format vertical video (1080x1920) made only of original motion graphics: animated synthwave background,
timeline, calendar, forum/chat/statement mock-ups, counters, a drawn hotel-room scene, glitch hits, word captions.
Beats (what is on screen, synced to narration words) live in beats.py. usage: story.py still T... | render OUT"""
import json, os, re, subprocess, sys, random
import numpy as np
from PIL import Image, ImageDraw, ImageFont
ROOT = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, ROOT)
from beats import BEATS, PART, SERIES
W, H, FPS = 1080, 1920, 30
GAP, LEAD, TAIL, COVER_T = 0.22, 0.5, 0.7, 0.4
FD = '/usr/share/fonts/opentype/inter/'; MONO = '/usr/share/fonts/truetype/liberation/LiberationMono-Bold.ttf'
_f = {}
def F(n, s):
    if (n, s) not in _f: _f[(n, s)] = ImageFont.truetype(n if n.startswith('/') else FD + n, s)
    return _f[(n, s)]
BK = lambda s: F('InterDisplay-Black.otf', s); BI = lambda s: F('InterDisplay-BlackItalic.otf', s); XB = lambda s: F('InterDisplay-ExtraBold.otf', s); MN = lambda s: F(MONO, s)
PINK, YELLOW, NAVY, WHITE, RED, GREEN, GREY = (255, 62, 150), (255, 222, 40), (14, 8, 30), (255, 255, 255), (235, 30, 40), (60, 255, 120), (150, 150, 170)
def ease(x): x = min(1, max(0, x)); return 1 - (1 - x) ** 3
def back(x):
    x = min(1, max(0, x)); c = 1.70158; return 1 + (c + 1) * (x - 1) ** 3 + c * (x - 1) ** 2
def al(c, a): return c + (int(255 * min(1, max(0, a))),)
_dd = ImageDraw.Draw(Image.new('L', (8, 8)))
def fit(text, size, maxw=W - 110, fn=BI):
    while _dd.textlength(text, font=fn(size)) > maxw and size > 36: size -= 4
    return fn(size)
def text_c(d, cx, y, parts, f, sw=14):
    tw = sum(d.textlength(t, font=f) for t, _, _ in parts); x = cx - tw / 2
    for t, c, a in parts:
        d.text((x, y), t, font=f, fill=al(c, a), stroke_width=sw, stroke_fill=al(NAVY, a), anchor='ls'); x += d.textlength(t, font=f)
def wrap(text, font, maxw):
    out = []; cur = ''
    for w in text.split(' '):
        if cur and _dd.textlength(cur + ' ' + w, font=font) > maxw: out.append(cur); cur = w
        else: cur = (cur + ' ' + w).strip()
    return out + ([cur] if cur else [])
def typed(text, u, cps=34): return text[:max(0, int(u * cps))]
def pill(d, cx, y, tx, bg, fg, a=1.0, size=52, pad=38):
    f = BK(size); tw = d.textlength(tx, font=f); d.rounded_rectangle((cx - tw / 2 - pad, y, cx + tw / 2 + pad, y + size + 44), radius=24, fill=al(bg, a)); d.text((cx, y + (size + 44) / 2), tx, font=f, fill=al(fg, a), anchor='mm')

# ---------------- timeline from narration
segs = json.load(open(ROOT + '/script.json')); t = 0.0
for i, s in enumerate(segs):
    a = json.load(open(f"{ROOT}/tts/{s['id']}.json")); s['al'] = a; s['atext'] = ''.join(a['characters']); s['spoken'] = a['character_end_times_seconds'][-1]
    s['rs'] = t; s['t0'] = t + (LEAD if i == 0 else 0.05); t = s['t0'] + s['spoken'] + GAP; s['re'] = t
segs[-1]['re'] += TAIL; TOTAL = segs[-1]['re']; NF = int(TOTAL * FPS)
def cue(s, kw):
    i = s['atext'].find(kw)
    if i < 0: raise SystemExit(f"cue {kw!r} not in {s['id']}")
    return s['t0'] + s['al']['character_start_times_seconds'][i]
beats = []
for s in segs:
    bl = BEATS[s['id']]; st = [s['rs'] if b[0] is None else cue(s, b[0]) - 0.08 for b in bl]
    for k, b in enumerate(bl): beats.append(dict(t=st[k], end=st[k + 1] if k + 1 < len(bl) else s['re'], kind=b[1], p=b[2] if len(b) > 2 else {}, seg=s['id']))
words = []
for s in segs:
    ch, st, en = s['al']['characters'], s['al']['character_start_times_seconds'], s['al']['character_end_times_seconds']
    skip = [False] * len(ch)
    for m in re.finditer(r'\[[a-z ]+\]', s['atext']):
        for i in range(m.start(), m.end()): skip[i] = True
    cur = ''; a = None
    for i, c in enumerate(ch + [' ']):
        if i < len(ch) and skip[i]: continue
        if c.isspace():
            if cur.strip('—-–'): words.append(dict(w=cur, t=s['t0'] + a, e=s['t0'] + en[i - 1], seg=s['id']))
            cur = ''; a = None
        else:
            if a is None: a = st[i]
            cur += c
caps = []; cur = []
for w in words:
    if cur and (w['seg'] != cur[-1]['seg'] or len(cur) >= 2 or sum(len(x['w']) for x in cur) + len(w['w']) > 13 or cur[-1]['w'][-1] in '.!?:'): caps.append(cur); cur = []
    cur.append(w)
if cur: caps.append(cur)

# ---------------- animated background loop (half resolution)
def make_bg(N=48, w=540, h=960):
    yy = np.linspace(0, 1, h)[:, None, None]; top, mid, bot = np.array([8, 5, 22.]), np.array([40, 12, 66.]), np.array([12, 7, 26.])
    g = np.where(yy < 0.56, top + (mid - top) * (yy / 0.56), mid + (bot - mid) * ((yy - 0.56) / 0.44)); base = np.repeat(g, w, axis=1).astype(np.uint8)
    out = []; hz = int(h * 0.56)
    for k in range(N):
        im = Image.fromarray(base).convert('RGB'); d = ImageDraw.Draw(im, 'RGBA'); ph = k / N
        for i in range(14):
            z = (i + ph) / 14; y = hz + (h - hz) * z ** 2.2; d.line((0, y, w, y), fill=(255, 62, 150, int(20 + 70 * z)), width=1)
        for i in range(-12, 13): d.line((w / 2 + i * 16, hz, w / 2 + i * 150, h), fill=(255, 62, 150, 46), width=1)
        d.rectangle((0, hz - 1, w, hz + 1), fill=(255, 62, 150, 120)); out.append(np.asarray(im))
    return out
BG = make_bg()
_lg = Image.open(ROOT + '/logo.png').convert('RGBA'); LOGO = _lg.resize((int(_lg.width * 130 / _lg.height), 130), Image.LANCZOS)
COVER = Image.open(ROOT + '/cover.jpg').convert('RGB') if os.path.exists(ROOT + '/cover.jpg') else None
rnd = random.Random(5); HEX = [' '.join(''.join(rnd.choice('0123456789ABCDEF') for _ in range(4)) for _ in range(6)) for _ in range(60)]
_img = {}

# ---------------- beat renderers (ov = RGBA layer, d = its draw, u = seconds since the beat started)
def k_big(ov, d, p, u):
    a = ease(u / .18); sc = .72 + .28 * back(u / .3); l1 = p['l1']; f1 = fit(l1, int(p.get('size', 210) * sc))
    text_c(d, W / 2, 860, [(l1, p.get('c1', YELLOW), a)], f1, sw=16)
    if p.get('l2'): text_c(d, W / 2, 1000, [(p['l2'], WHITE, a)], fit(p['l2'], 84), sw=12)
    if p.get('stamp') and u > .35:
        ua = u - .35; s2 = 1.6 - .6 * ease(ua / .18); st = Image.new('RGBA', (760, 220), (0, 0, 0, 0)); ds = ImageDraw.Draw(st)
        ds.rounded_rectangle((8, 8, 752, 212), radius=26, outline=RED + (255,), width=14); ds.text((380, 110), p['stamp'], font=fit(p['stamp'], 120, 660, BK), fill=RED + (255,), anchor='mm')
        st = st.rotate(-10, expand=True, resample=Image.BICUBIC); st = st.resize((int(st.width * s2), int(st.height * s2)), Image.BICUBIC); ov.alpha_composite(st, (W // 2 - st.width // 2, 1160 - st.height // 2))
def k_count(ov, d, p, u):
    a = ease(u / .18); v = p['a'] + (p['b'] - p['a']) * ease(u / 1.3); tx = f"{int(round(v))}"
    text_c(d, W / 2, 900, [(tx, YELLOW, a), (' ' + p['unit'], WHITE, a)], fit(tx + ' ' + p['unit'], 250), sw=18); text_c(d, W / 2, 1010, [(p['label'], WHITE, a)], fit(p['label'], 62, W - 140, BK), sw=10)
def k_date(ov, d, p, u):
    a = ease(u / .2); dy = int(80 * (1 - back(u / .35))); x0, x1, y0 = 270, 810, 470 + dy
    d.rounded_rectangle((x0 - 10, y0 - 10, x1 + 10, y0 + 600), radius=50, fill=al(NAVY, a)); d.rounded_rectangle((x0, y0, x1, y0 + 590), radius=42, fill=al(WHITE, a))
    d.rounded_rectangle((x0, y0, x1, y0 + 150), radius=42, fill=al(PINK, a)); d.rectangle((x0, y0 + 100, x1, y0 + 150), fill=al(PINK, a))
    d.text((W / 2, y0 + 78), p['month'], font=BK(74), fill=al(WHITE, a), anchor='mm'); d.text((W / 2, y0 + 330), p['day'], font=BK(300), fill=al(NAVY, a), anchor='mm'); d.text((W / 2, y0 + 520), p['year'], font=BK(86), fill=al(PINK, a), anchor='mm')
def window(d, a, title, y0=420, y1=1250, light=False):
    d.rounded_rectangle((70, y0, W - 70, y1), radius=40, fill=al(WHITE if light else (24, 16, 48), .97 * a), outline=al(PINK, a), width=6)
    d.rounded_rectangle((70, y0, W - 70, y0 + 96), radius=40, fill=al(NAVY if light else (48, 30, 86), a)); d.rectangle((76, y0 + 60, W - 76, y0 + 96), fill=al(NAVY if light else (48, 30, 86), a))
    for i, c in enumerate((RED, YELLOW, GREEN)): d.ellipse((104 + i * 46, y0 + 34, 132 + i * 46, y0 + 62), fill=al(c, a))
    d.text((270, y0 + 48), title, font=BK(40), fill=al(WHITE, a), anchor='lm')
def k_forum(ov, d, p, u):
    a = ease(u / .2); window(d, a, 'ФАНАТСКИЙ ФОРУМ')
    d.ellipse((110, 548, 190, 628), fill=al(GREY, a)); d.text((214, 572), 'аноним', font=BK(40), fill=al(WHITE, a), anchor='lm'); d.text((214, 616), '18 сентября 2022', font=XB(30), fill=al(GREY, a), anchor='lm')
    d.text((110, 690), typed('Здесь 90 видео из GTA 6', u - .3), font=BK(58), fill=al(YELLOW, a), anchor='lm')
    n = int(max(0, u - 1.0) * 7) if p.get('thumbs') else int(max(0, u - 1.2) * 3)
    for i in range(min(9, n)):
        x = 110 + (i % 3) * 292; y = 760 + (i // 3) * 156
        d.rounded_rectangle((x, y, x + 272, y + 138), radius=16, fill=al((70, 70, 86), a)); d.polygon([(x + 118, y + 44), (x + 118, y + 94), (x + 162, y + 69)], fill=al(WHITE, .9 * a))
        if p.get('thumbs'): d.text((x + 12, y + 16), 'DEV BUILD', font=MN(22), fill=al(GREEN, a), anchor='lm')
def k_stmt(ov, d, p, u):
    a = ease(u / .2); window(d, a, p['title'], 470, 1200, light=True); f = XB(48); y = 610
    for ln in wrap(typed(p['text'], u - .3, 42), f, W - 250): d.text((120, y), ln, font=f, fill=al(NAVY, a), anchor='lm'); y += 66
    d.text((120, 1150), p.get('note', ''), font=XB(30), fill=al((110, 110, 130), a), anchor='lm')
def k_chat(ov, d, p, u):
    a = ease(u / .2); window(d, a, '# рабочий чат', 500, 1160); d.ellipse((110, 640, 180, 710), fill=al(RED, a)); d.text((204, 675), p['name'], font=BK(42), fill=al(WHITE, a), anchor='lm')
    f = XB(50); y = 780; tx = typed(p['text'], u - .35, 30)
    for ln in wrap(tx, f, W - 250): d.text((120, y), ln, font=f, fill=al(YELLOW, a), anchor='lm'); y += 70
    if int(u * 3) % 2 == 0 and len(tx) < len(p['text']): d.rectangle((120, y - 24, 146, y + 24), fill=al(YELLOW, a))
    d.text((120, 1110), 'пересказ сообщения', font=XB(30), fill=al(GREY, a), anchor='lm')
def k_hotel(ov, d, p, u):
    a = ease(u / .2); n = p.get('n', 3); pill(d, W / 2, 404, 'ГОСТИНИЧНЫЙ НОМЕР', PINK, WHITE, a, 44)
    d.rounded_rectangle((170, 520, 910, 950), radius=26, fill=al((6, 10, 14), a), outline=al(GREY, a), width=10); d.rectangle((500, 950, 580, 990), fill=al(GREY, a)); d.rounded_rectangle((380, 986, 700, 1004), radius=8, fill=al(GREY, a))
    off = int(u * 9)
    for i in range(9): d.text((200, 560 + i * 42), HEX[(i + off) % len(HEX)][:27], font=MN(34), fill=al(GREEN, a * (0.35 + 0.65 * ((i + off) % 3 == 0))), anchor='lm')
    items = [('ТЕЛЕВИЗОР', 0), ('FIRE STICK', 1), ('ТЕЛЕФОН', 2)]
    for tx, i in items:
        on = i < n; x = 90 + i * 310; aa = a * (1.0 if on else 0.28); pop = int(14 * (1 - back(u / .3))) if i == n - 1 else 0
        d.rounded_rectangle((x, 1060 - pop, x + 280, 1250 - pop), radius=28, fill=al(YELLOW if on else (60, 50, 90), aa))
        c = NAVY if on else WHITE
        if i == 0: d.rounded_rectangle((x + 80, 1084 - pop, x + 200, 1160 - pop), radius=8, outline=al(c, aa), width=8); d.rectangle((x + 124, 1160 - pop, x + 156, 1174 - pop), fill=al(c, aa))
        if i == 1: d.rounded_rectangle((x + 60, 1108 - pop, x + 200, 1150 - pop), radius=10, fill=al(c, aa)); d.rectangle((x + 200, 1118 - pop, x + 226, 1140 - pop), fill=al(c, aa))
        if i == 2: d.rounded_rectangle((x + 108, 1078 - pop, x + 172, 1170 - pop), radius=12, outline=al(c, aa), width=8)
        d.text((x + 140, 1212 - pop), tx, font=BK(36), fill=al(c, aa), anchor='mm')
def k_shot(ov, d, p, u):
    a = ease(u / .25)
    if p['img'] not in _img:
        im = Image.open(p['img']).convert('RGB'); s = 1000 / im.height; _img[p['img']] = im.resize((int(im.width * s), 1000), Image.LANCZOS)
    im = _img[p['img']]; z = 1.0 + 0.06 * min(1, u / 4); cw = 900 / z; ch = 900 / z; cx = im.width * p.get('cx', .5); x0 = min(max(cx - cw / 2, 0), im.width - cw)
    pic = im.transform((900, 900), Image.EXTENT, (x0, (1000 - ch) / 2, x0 + cw, (1000 + ch) / 2), Image.BICUBIC)
    m = Image.new('L', (900, 900), 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, 899, 899), radius=44, fill=int(255 * a)); d.rounded_rectangle((82, 392, 998, 1308), radius=52, fill=al(PINK, a)); ov.paste(pic, (90, 400), m)
    pill(ImageDraw.Draw(ov), W / 2, 1210, p['cap'], YELLOW, NAVY, a, 58)
def k_tl(ov, d, p, u):
    a = ease(u / .2); y = 980; x0, x1 = 110, W - 110; d.rounded_rectangle((x0, y - 6, x1, y + 6), radius=6, fill=al(WHITE, .5 * a)); yrs = list(range(2013, 2027))
    v = 2026 - (2026 - p['year']) * ease((u - .25) / 1.1)
    for yr in yrs:
        x = x0 + (x1 - x0) * (yr - 2013) / 13; d.rectangle((x - 3, y - 22, x + 3, y + 22), fill=al(WHITE, .7 * a))
        if yr in (2013, 2026, p['year']): d.text((x, y + 62), str(yr), font=BK(36), fill=al(WHITE, a), anchor='mm')
    xm = x0 + (x1 - x0) * (v - 2013) / 13; d.ellipse((xm - 26, y - 26, xm + 26, y + 26), fill=al(PINK, a), outline=al(WHITE, a), width=6)
    text_c(d, W / 2, 800, [(str(int(round(v))), YELLOW, a)], BI(300), sw=18); pill(d, W / 2, 420, '◀◀  ПЕРЕМОТКА', WHITE, NAVY, a, 40)
def k_sub(ov, d, p, u):
    a = ease(u / .2); sc = .7 + .3 * back(u / .35); bw, bh = int(760 * sc), int(170 * sc); d.rounded_rectangle((W / 2 - bw / 2, 760 - bh / 2, W / 2 + bw / 2, 760 + bh / 2), radius=int(84 * sc), fill=al(RED, a))
    d.text((W / 2, 760), 'ПОДПИСАТЬСЯ', font=BK(int(84 * sc)), fill=al(WHITE, a), anchor='mm'); text_c(d, W / 2, 1010, [(p.get('l2', ''), WHITE, a)], fit(p.get('l2', ' '), 80), sw=12)
KIND = dict(big=k_big, count=k_count, date=k_date, forum=k_forum, stmt=k_stmt, chat=k_chat, hotel=k_hotel, shot=k_shot, tl=k_tl, sub=k_sub)

def frame(tt, cover=True):
    if cover and COVER is not None and tt < COVER_T: return COVER
    base = Image.fromarray(BG[int(tt * 12) % len(BG)]).resize((W, H), Image.BILINEAR).convert('RGBA'); ov = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(ov)
    b = next((x for x in beats if x['t'] <= tt < x['end']), beats[-1]); u = tt - b['t']; KIND[b['kind']](ov, d, b['p'], u); d = ImageDraw.Draw(ov)
    ov.alpha_composite(LOGO, (48, 250)); f = BK(40); tx = PART; tw = d.textlength(tx, font=f); d.rounded_rectangle((W - 48 - tw - 52, 274, W - 48, 354), radius=22, fill=YELLOW + (255,)); d.text((W - 74 - tw, 314), tx, font=f, fill=NAVY + (255,), anchor='lm')
    d.text((W - 48, 384), SERIES, font=XB(30), fill=WHITE + (220,), anchor='rm')
    for i, c in enumerate(caps):
        t0 = c[0]['t'] - .04; nxt = caps[i + 1][0]['t'] - .04 if i + 1 < len(caps) else TOTAL; t1 = min(max(c[-1]['e'] + .12, t0 + .25), nxt)
        if t0 <= tt < t1 or (i == len(caps) - 1 and tt >= t0):
            sc = .82 + .18 * back((tt - t0) / .16); txt = [w['w'].upper().strip('.,:—«»') for w in c]; f = fit(' '.join(txt), int(118 * sc), W - 90)
            text_c(d, W / 2, 1530, [(x + (' ' if j < len(txt) - 1 else ''), YELLOW if c[j]['t'] - .03 <= tt else WHITE, 1.0) for j, x in enumerate(txt)], f, sw=14)
    im = Image.alpha_composite(base, ov).convert('RGB')
    if b['p'].get('g') and u < .4:                                  # glitch hit: RGB split + shifted slices
        arr = np.asarray(im).copy(); k = int(26 * (1 - u / .4)) + 2; arr[:, :, 0] = np.roll(arr[:, :, 0], k, axis=1); arr[:, :, 2] = np.roll(arr[:, :, 2], -k, axis=1)
        r = random.Random(int(tt * 30))
        for _ in range(5):
            y = r.randrange(300, 1500); hh = r.randrange(14, 60); arr[y:y + hh] = np.roll(arr[y:y + hh], r.randrange(-90, 90), axis=1)
        im = Image.fromarray(arr)
    for hit in [COVER_T] + [s['rs'] for s in segs[1:]]:
        if 0 <= tt - hit < .12: im = Image.blend(im, Image.new('RGB', (W, H), WHITE), .45 * (1 - (tt - hit) / .12))
    return im

if __name__ == '__main__':
    m = sys.argv[1]
    json.dump(dict(total=TOTAL, voice=[(s['id'], s['t0']) for s in segs], hits=sorted([s['rs'] for s in segs[1:]] + [b['t'] for b in beats if b['p'].get('g')])), open(ROOT + '/timeline.json', 'w'))
    if m == 'still':
        for a in sys.argv[2:]: frame(float(a), cover=False).save(f'{ROOT}/still_{float(a):06.2f}.png')
        print('total', round(TOTAL, 2), 'beats', len(beats))
    elif m == 'render':
        ff = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-', '-i', ROOT + '/mix.wav', '-map', '0:v', '-map', '1:a',
                               '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', '-t', f'{TOTAL:.3f}', sys.argv[2]], stdin=subprocess.PIPE)
        for i in range(NF): ff.stdin.write(frame(i / FPS).tobytes())
        ff.stdin.close(); ff.wait(); print('done', sys.argv[2], round(TOTAL, 2))
