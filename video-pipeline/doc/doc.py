#!/usr/bin/env python3
"""Documentary-style vertical video: narration-driven scenes (cue words), photos/official footage/AI clips, counters, plates.
usage: doc.py plan | doc.py seg <id> | doc.py still <t>..."""
import json, os, re, subprocess, sys, random
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
HERE = os.path.dirname(os.path.abspath(__file__)); SC_ROOT = os.path.abspath(HERE + '/..')
TR = SC_ROOT + '/dl/trailers'; IMG = SC_ROOT + '/dl/img'; PK = SC_ROOT + '/assets/pack'
K = float(os.environ.get('K', '1.3334')); FPS = 30; W, H = int(1080 * K) // 2 * 2, int(1920 * K) // 2 * 2; S_ = lambda v: int(round(v * K))
BW, BH = int(1188 * K) // 2 * 2, int(2112 * K) // 2 * 2
FD = '/usr/share/fonts/opentype/inter/'; _fc = {}
def BI(s, f='InterDisplay-BlackItalic.otf'):
    s = int(s * K)
    if (f, s) not in _fc: _fc[(f, s)] = ImageFont.truetype(FD + f, s)
    return _fc[(f, s)]
BK = lambda s: BI(s, 'InterDisplay-Black.otf')
NAVY = (14, 8, 30); YEL = (255, 222, 40); PINK = (255, 40, 140); WHITE = (255, 255, 255)
def ease(x): x = min(1, max(0, x)); return 1 - (1 - x) ** 3
def al(c, a): return c + (int(255 * min(1, max(0, a))),)
SEGS = json.load(open(HERE + '/script.json')); IDS = [s['id'] for s in SEGS]
LEAD, GAP, TAIL = 0.5, 0.3, 0.45
def words(seg):
    al_ = json.load(open(f'{HERE}/tts/{seg}.json')); out = []; cur = ''; a = None; inb = False
    for c, s, e in zip(al_['characters'], al_['character_start_times_seconds'], al_['character_end_times_seconds']):
        if c == '[': inb = True; continue
        if c == ']': inb = False; continue
        if inb: continue
        if c in ' \n':
            if cur: out.append((cur, a, pe)); cur = ''
            continue
        if not cur: a = s
        cur += c; pe = e
    if cur: out.append((cur, a, pe))
    return out
def vend(seg): return json.load(open(f'{HERE}/tts/{seg}.json'))['character_end_times_seconds'][-1]
START = {}; END = {}; t = LEAD
for i in IDS: START[i] = t; END[i] = t + vend(i) + TAIL; t = END[i] + GAP
TOTAL = END[IDS[-1]] + 0.2
# ------------------------------------------------------------------ scene definitions
def ph(f, fx=0.5, fy=0.5, z0=1.0, z1=1.25, d=1, dim=1.0): return dict(k='ph', f=f if f.startswith('/') else PK + '/' + f, fx=fx, fy=fy, z0=z0, z1=z1, d=d, dim=dim)
def st(f, **kw): return ph(IMG + '/' + f, **kw)
def fit(f, **kw): d = ph(IMG + '/' + f, **kw); d['mode'] = 'fit'; return d
def ai(n, a=0.0, L=6.0, fx=0.5, fy=0.5, z=1.0): return dict(k='clip', f=f'{HERE}/v{n}.mp4', a=a, L=L, fx=fx, fy=fy, z=z, dur=7.9)
def off(src, a, L, cx=0.5): return dict(k='off', src=src, a=a, L=L, cx=cx)
def pf(pre): return [f for f in os.listdir(PK) if f.startswith(pre)][0]
IMG1, IMG2, IMG3 = HERE + '/img1.jpg', HERE + '/img2.jpg', HERE + '/img3.jpg'
SC = {
 'd1': [(None, ph(IMG3, z0=1.0, z1=1.18), []), ('Но', ai(6, 1.2, 3.0), []), ('Вайс', off('A', 39.7, 1.9, 0.5), [('big', 'VICE CITY', None, 'hit')])],
 'd2': [(None, ph(pf('024'), fx=0.45, z1=1.3), [('chip', 'МАЙАМИ • 1980-е')]),
        ('Город', ph(pf('022'), z0=1.2, z1=1.0, fx=0.5), []),
        ('Сериал', ph(pf('019'), fx=0.35, z1=1.3, d=-1), [('plate', 'ПОЛИЦИЯ МАЙАМИ', 'сериал • 1984')]),
        ('фильм', ph(pf('006'), fx=0.55, z1=1.3), [('plate', 'ЛИЦО СО ШРАМОМ', 'фильм • 1983')]),
        ('эпоха', ph(pf('001'), fx=0.5, z1=1.25), [('chip', 'ЭПОХА КОКАИНОВЫХ ВОЙН')]),
        ('А', ph(pf('035'), fx=0.5, z1=1.2), [('chip', '1980 • МАРИЭЛЬ'), ('count', 125000, '', 'человек приплыли с Кубы (≈)', 'sp', 2.6, 'около')]),
        ('менялся', ph(pf('037'), fx=0.5, z0=1.25, z1=1.0), [])],
 'd3': [(None, ph(pf('022'), fx=0.5, z1=1.2), [('big', '2002', 'GTA: VICE CITY', 'hit')]),
        ('Вайс-Сити,', ph(pf('025'), fx=0.6, z1=1.3), [('big', '1986', 'ГОД ДЕЙСТВИЯ', 'hit')]),
        ('Томми', ph(pf('001'), fx=0.5, z1=1.2, dim=0.8), [('plate', 'ТОММИ ВЕРСЕТТИ', 'вышел из тюрьмы')]),
        ('Радио', ph(pf('026'), fx=0.5, z1=1.25), [('chip', 'РАДИО • ХИТЫ 80-х')]),
        ('неоновые', ph(pf('016'), fx=0.5, z1=1.2), []),
        ('по', ph(pf('018'), fx=0.5, z1=1.3), [('count', 17.5, 'млн', 'копий • по данным издателя', 'dec', 2.2, 'семнадцать')])],
 'd4': [(None, ph(pf('001'), z0=1.0, z1=1.25, dim=0.8), [('big', '24', 'ГОДА ОЖИДАНИЯ', 'hit')]),
        ('утечка', ph(pf('005'), z1=1.3, dim=0.8), [('plate', 'СЕНТЯБРЬ 2022', 'утечка: ≈90 роликов, Rockstar подтвердила взлом')]),
        ('А', off('A', 22.4, 2.4, 0.5), [('chip', 'ДЕКАБРЬ 2023 • ПЕРВЫЙ ТРЕЙЛЕР')]),
        ('за', off('A', 31.3, 2.6, 0.5), [('count', 90421491, '', 'просмотров за 24 часа', 'sp', 3.0, 'больше')]),
        ('Это', off('A', 66.4, 2.4, 0.4), [('plate', 'РЕКОРД ГИННЕССА', 'самый просматриваемый трейлер игры за 24 часа')])],
 'd5': [(None, off('L', 26.6, 3.0, 0.5), [('tl', 0)]), ('потом', off('T', 140.9, 3.0, 0.5), [('tl', 1)]), ('и', off('L', 63.6, 5.0, 0.5), [('tl', 2)])],
 'd6': [(None, st('Leonida_Keys_01.jpg', fx=0.5, z1=1.25), [('chip', 'ШТАТ ЛЕОНИДА')]),
        ('герои,', fit('Lucia_Caminos_13.jpg', z0=1.0, z1=1.0), [('plate', 'ЛУСИЯ', 'главная героиня')]),
        ('и', fit('Jason_Duval_01.jpg', z0=1.0, z1=1.0), [('plate', 'ДЖЕЙСОН', 'главный герой')]),
        ('пара,', fit('Jason_and_Lucia_14.jpg'), []),
        ('Побережье,', st('Leonida_Keys_02.jpg', fx=0.5, z1=1.25), [('chip', 'ПОБЕРЕЖЬЕ И ОСТРОВА')]),
        ('ночные', fit('Jason_and_Lucia_18.jpg'), [('chip', 'НОЧНЫЕ КЛУБЫ')]),
        ('Вайс-Сити,', st('Jason_and_Lucia_16.jpg', fx=0.5, z1=1.25), [])],
 'd7': [(None, ph(IMG1, z0=1.0, z1=1.2), [('ai',)]),
        ('Шесть', ai(1, 0.0, 6.0, fx=0.6, fy=1.0, z=1.25), [('time', '06:00', 'РАССВЕТ'), ('ai',)]),
        ('Восемь', ai(2, 0.5, 6.0), [('time', '08:00', 'КАБРИОЛЕТ'), ('ai',)]),
        ('Час', ai(3, 0.5, 6.0), [('time', '13:00', 'НАБЕРЕЖНАЯ'), ('ai',)]),
        ('Три', ai(4, 0.5, 6.0), [('time', '15:00', 'СКОРОСТЬ'), ('ai',)]),
        ('Половина', ai(5, 0.5, 6.0), [('time', '19:30', 'ВЕЧЕРИНКА'), ('ai',)]),
        ('Десять', ai(6, 0.5, 6.0), [('time', '22:00', 'НЕОН'), ('ai',)]),
        ('Половина', ai(7, 0.5, 6.0), [('flash', IMG2, 0.5), ('time', '23:30', 'ПОГОНЯ'), ('ai',)]),
        ('полночь', ai(8, 0.0, 7.5), [('time', '00:00', 'ПОЛНОЧЬ'), ('ai',)])],
 'd8': [(None, ph(IMG1, z0=1.1, z1=1.0), [('ai',)]),
        ('А', ph(IMG3, z0=1.0, z1=1.2, dim=0.6), [('logo',)]),
        ('Подпишись', ph(IMG3, z0=1.2, z1=1.1, dim=0.5), [('logo', 'sub')]),
        ('А', ph(IMG1, z0=1.0, z1=1.15), [('plate', 'КУДА ПОЕДЕШЬ', 'первым делом?')])],
}
def cue_times(seg):
    ws = words(seg); out = []; j = 0
    for cue, bg, ov in SC[seg]:
        if cue is None: out.append(0.0); continue
        while j < len(ws) and not ws[j][0].lower().startswith(cue.lower()): j += 1
        if j >= len(ws): raise SystemExit(f'cue {cue} not found in {seg}')
        out.append(ws[j][1]); j += 1
    return out
# special: 'А' appears twice in d8 / d2 — sequential search handles; d8 first 'А' = 'А настоящий', second = 'А ты'
def plan():
    ev = dict(whoosh=[], impact=[]); sc = []
    for sid in IDS:
        ct = cue_times(sid); st0 = START[sid]; en = END[sid] + GAP
        for i, (cue, bg, ov) in enumerate(SC[sid]):
            a = st0 + ct[i]; b = st0 + ct[i + 1] if i + 1 < len(ct) else en
            if i == 0: a = st0 if sid != IDS[0] else 0.0
            if sid != IDS[0] or i: ev['whoosh'].append(a)
            if any(o[0] in ('big', 'logo') or (o[0] == 'count') for o in ov): ev['impact'].append(a + (0.0))
            sc.append(dict(seg=sid, i=i, a=a, b=b))
    json.dump(sc, open(HERE + '/scenes.json', 'w')); json.dump(ev, open(HERE + '/events.json', 'w')); print(len(sc), 'scenes', round(TOTAL, 2), 's')
# ------------------------------------------------------------------ sources
class Pipe:
    def __init__(self, cmd): self.p = subprocess.Popen(cmd, stdout=subprocess.PIPE, stdin=subprocess.DEVNULL); self.last = None; self.eof = False
    def next(self):
        if self.eof: return self.last
        b = self.p.stdout.read(BW * BH * 3)
        if len(b) < BW * BH * 3: self.eof = True; return self.last
        self.last = Image.frombuffer('RGB', (BW, BH), b, 'raw', 'RGB', 0, 1); return self.last
    def close(self): self.p.kill()
EQ = 'eq=contrast=1.08:saturation=1.18'
def open_clip(bg, dur):
    if bg['k'] == 'clip':
        L = min(bg['L'], bg['dur'] - bg['a'] - 0.05); z = bg.get('z', 1.0); fx, fy = bg.get('fx', .5), bg.get('fy', .5)
        cw = f'iw/{z}'; ch = f'ih/{z}'
        vf = f"crop={cw}:{ch}:(iw-{cw})*{fx}:(ih-{ch})*{fy},scale={BW}:{BH}:flags=lanczos,setpts=PTS*{dur / L:.4f},fps={FPS},{EQ}"
        return Pipe(['ffmpeg', '-v', 'error', '-ss', f'{bg["a"]:.3f}', '-t', f'{L:.3f}', '-i', bg['f'], '-vf', vf, '-t', f'{dur + 0.2:.2f}', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'])
    src = bg['src']; fn, (ox, oy, wf, hf) = {'A': ('GTAVI_Trailer_1.mp4', (0, 0, 3840, 2160)), 'T': ('GTAVI_Trailer_2.mp4', (384, 216, 3072, 1728)), 'L': ('GTAVI_Launch_Trailer.mp4', (214, 120, 3412, 1920))}[src]
    cw = int(hf * 9 / 16) // 2 * 2; x0 = int(min(max(ox + bg['cx'] * wf - cw / 2, ox), ox + wf - cw))
    L = bg['L']; vf = f"crop={cw}:{hf}:{x0}:{oy},scale={BW}:{BH}:flags=lanczos,setpts=PTS*{dur / L:.4f},fps={FPS},{EQ}"
    return Pipe(['ffmpeg', '-v', 'error', '-threads', '3', '-ss', f'{bg["a"]:.3f}', '-t', f'{L:.3f}', '-i', f'{TR}/{fn}', '-vf', vf, '-t', f'{dur + 0.2:.2f}', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'])
_ic = {}; _fitc = {}
def load_img(f):
    if f not in _ic:
        im = Image.open(f).convert('RGB'); s = max(im.size)
        if s > 3600: im = im.resize((int(im.width * 3600 / s), int(im.height * 3600 / s)), Image.LANCZOS)
        _ic.clear(); _ic[f] = im
    return _ic[f]
def photo_frame(bg, u, dur):
    im = load_img(bg['f']); iw, ih = im.size; x = min(1, u / max(dur, 0.1)); z = bg['z0'] + (bg['z1'] - bg['z0']) * x
    if bg.get('mode') == 'fit':
        if bg['f'] not in _fitc:
            ww = ih * 9 / 16; b = im.crop((iw / 2 - ww / 2, 0, iw / 2 + ww / 2, ih)).resize((BW // 4, BH // 4), Image.BILINEAR).filter(ImageFilter.GaussianBlur(14)).resize((BW, BH), Image.BILINEAR)
            _fitc.clear(); _fitc[bg['f']] = Image.eval(b, lambda v: int(v * 0.45))
        out = _fitc[bg['f']].copy(); sw = int(BW * (0.98 + 0.05 * x)); sh = int(sw * ih / iw); out.paste(im.resize((sw, sh), Image.LANCZOS), ((BW - sw) // 2, int(BH * 0.375 - sh / 2))); return out
    wh = ih / z; ww = wh * 9 / 16
    if ww > iw: ww = iw; wh = ww * 16 / 9
    fx = bg['fx'] + 0.08 * bg['d'] * (x - 0.5) if bg['d'] else bg['fx']
    cx = min(max(fx * iw, ww / 2), iw - ww / 2); cy = min(max(bg['fy'] * ih, wh / 2), ih - wh / 2)
    out = im.transform((BW, BH), Image.EXTENT, (cx - ww / 2, cy - wh / 2, cx + ww / 2, cy + wh / 2), Image.BICUBIC)
    return out
# ------------------------------------------------------------------ overlays
def pill(d, cx, cy, text, f, fg, bg, pad=S_(36), ph_=S_(24), a=1.0):
    tw = d.textlength(text, font=f); h = f.size + ph_
    d.rounded_rectangle((cx - tw / 2 - pad, cy - h / 2, cx + tw / 2 + pad, cy + h / 2), radius=int(h / 2), fill=al(bg, 0.86 * a), outline=al(WHITE, a), width=S_(4))
    d.text((cx, cy), text, font=f, fill=al(fg, a), anchor='mm')
def fitfont(d, text, size, maxw, name='InterDisplay-BlackItalic.otf'):
    while d.textlength(text, font=BI(size, name)) > maxw and size > 30: size -= 4
    return BI(size, name)
_b3 = {}
def big3d(text, sub):
    key = (text, sub)
    if key in _b3: return _b3[key]
    ov = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d0 = ImageDraw.Draw(ov); size = 1000 if len(text) <= 2 else 560 if len(text) <= 4 else 520
    f = fitfont(d0, text, size, W * 0.86); cx, cy = W // 2, S_(840)
    g = Image.new('RGBA', (W, H), (0, 0, 0, 0)); ImageDraw.Draw(g).text((cx, cy), text, font=f, fill=(255, 190, 40, 200), anchor='mm', stroke_width=S_(36), stroke_fill=(255, 120, 30, 150))
    ov.alpha_composite(g.filter(ImageFilter.GaussianBlur(S_(30)))); d = ImageDraw.Draw(ov)
    d.text((cx, cy), text, font=f, fill=NAVY + (255,), anchor='mm', stroke_width=S_(28), stroke_fill=NAVY + (255,))
    n = S_(24)
    for i in range(n, 0, -1):
        t = i / n; d.text((cx + i * .55, cy + i * .95), text, font=f, fill=(int(235 - 80 * (1 - t)), int(30 + 10 * t), int(150 - 40 * (1 - t)), 255), anchor='mm')
    fm = Image.new('L', (W, H), 0); ImageDraw.Draw(fm).text((cx, cy), text, font=f, fill=255, anchor='mm')
    yy = np.clip((np.arange(H) - (cy - S_(300))) / S_(600), 0, 1)[:, None]; grad = np.zeros((H, W, 3), np.uint8)
    grad[:, :, 0] = 255; grad[:, :, 1] = ((245 - 110 * yy) * np.ones((1, W))).astype(np.uint8); grad[:, :, 2] = ((90 - 70 * yy) * np.ones((1, W))).astype(np.uint8)
    ov.paste(Image.fromarray(grad), (0, 0), fm)
    if sub:
        d = ImageDraw.Draw(ov); ft = fitfont(d, sub, 74, W * 0.8); tw = d.textlength(sub, font=ft); ty = S_(1240)
        d.rounded_rectangle((cx - tw / 2 - S_(40), ty - S_(62), cx + tw / 2 + S_(40), ty + S_(62)), radius=S_(34), fill=PINK + (255,), outline=WHITE + (255,), width=S_(5)); d.text((cx, ty), sub, font=ft, fill=WHITE + (255,), anchor='mm')
    _b3.clear(); _b3[key] = ov; return ov
def draw_overlays(im, ovs, u, dur, tt):
    out = im; d = None
    fade = min(1, max(0, (dur - u) / 0.2))
    for o in ovs:
        k = o[0]
        if k == 'chip':
            a = ease((u - 0.12) / 0.2) * fade; d = ImageDraw.Draw(out, 'RGBA') if d is None else d; pill(d, W / 2, S_(380), o[1], fitfont(d, o[1], 64, W * 0.78), WHITE, PINK, a=a)
        elif k == 'time':
            a = ease((u - 0.08) / 0.18); sc = 1 + 0.2 * (1 - ease((u - 0.08) / 0.25)); d = ImageDraw.Draw(out, 'RGBA'); f = BI(130 * sc)
            d.rounded_rectangle((W / 2 - S_(260), S_(300), W / 2 + S_(260), S_(520)), radius=S_(44), fill=al(NAVY, 0.72 * a), outline=al(YEL, a), width=S_(5))
            d.text((W / 2, S_(395)), o[1], font=f, fill=al(YEL, a), anchor='mm', stroke_width=S_(6), stroke_fill=al(NAVY, a)); d.text((W / 2, S_(480)), o[2], font=BI(46), fill=al(WHITE, a), anchor='mm')
        elif k == 'ai':
            d = ImageDraw.Draw(out, 'RGBA'); pill(d, W / 2, S_(580), 'КАДРЫ СОЗДАНЫ ИИ', BI(34), WHITE, NAVY, pad=S_(24), ph_=S_(16), a=0.9 * fade)
        elif k == 'plate':
            a = ease((u - 0.1) / 0.22) * fade; d = ImageDraw.Draw(out, 'RGBA'); f1 = fitfont(d, o[1], 96, W * 0.86); f2 = fitfont(d, o[2], 46, W * 0.84, 'InterDisplay-Black.otf')
            y0 = S_(1190) + int(S_(40) * (1 - ease((u - 0.1) / 0.3))); d.rounded_rectangle((S_(60), y0 - S_(120), W - S_(60), y0 + S_(120)), radius=S_(40), fill=al(NAVY, 0.78 * a), outline=al(PINK, a), width=S_(6))
            d.text((W / 2, y0 - S_(30)), o[1], font=f1, fill=al(YEL, a), anchor='mm', stroke_width=S_(4), stroke_fill=al(NAVY, a)); d.text((W / 2, y0 + S_(62)), o[2], font=f2, fill=al(WHITE, a), anchor='mm')
        elif k == 'count':
            _, val, unit, label, mode, T, _c = o; x = ease((u - 0.1) / T); v = val * x; d = ImageDraw.Draw(out, 'RGBA'); a = ease((u - 0.05) / 0.2) * fade
            txt = (f'{v:.1f}'.replace('.', ',') if mode == 'dec' else f'{int(v):,}'.replace(',', ' ')) + (' ' + unit if unit else '')
            f = fitfont(d, txt, 190, W * 0.9); y0 = S_(1030)
            d.rounded_rectangle((S_(50), y0 - S_(150), W - S_(50), y0 + S_(190)), radius=S_(44), fill=al(NAVY, 0.74 * a), outline=al(YEL, a), width=S_(6))
            d.text((W / 2, y0), txt, font=f, fill=al(YEL, a), anchor='mm', stroke_width=S_(8), stroke_fill=al(NAVY, a)); f2 = fitfont(d, label, 52, W * 0.84, 'InterDisplay-Black.otf'); d.text((W / 2, y0 + S_(120)), label, font=f2, fill=al(WHITE, a), anchor='mm')
        elif k == 'big':
            lay = big3d(o[1], o[2]); uu = u
            if uu < 0.13: s = 0.4 + 0.75 * ease(uu / 0.13); a = ease(uu / 0.09)
            elif uu < 0.24: s = 1.15 - 0.15 * ease((uu - 0.13) / 0.11); a = 1
            else: s = 1.0 + 0.015 * (uu - 0.24); a = 1
            a *= fade
            if a > 0:
                L = lay if abs(s - 1) < 1e-3 else lay.resize((int(W * s), int(H * s)), Image.BILINEAR)
                if a < 1: L = L.copy(); L.putalpha(L.split()[3].point(lambda v: int(v * a)))
                base = out.convert('RGBA'); base.paste(L, (int(W / 2 - W * s / 2), int(S_(900) - S_(900) * s)), L); out = base.convert('RGB'); d = None
        elif k == 'tl':
            d = ImageDraw.Draw(out, 'RGBA'); n = o[1]; items = [('ОСЕНЬ 2025', 'первоначальный срок', 0), ('26 МАЯ 2026', 'перенос №1', 1), ('19 НОЯБРЯ 2026', 'перенос №2 — ФИНАЛ', 2)]
            for j, (t1, t2, _) in enumerate(items):
                if j > n: break
                born = ease((u - (0.1 if j == n else -9)) / 0.3) if j == n else 1.0; y0 = S_(760 + 250 * j); last = (j == 2); crossed = j < n or (j == n and False)
                col = YEL if last else (150, 150, 170); a = born * fade
                d.rounded_rectangle((S_(60), y0 - S_(100), W - S_(60), y0 + S_(100)), radius=S_(36), fill=al(NAVY, 0.8 * a), outline=al(PINK if last else (120, 120, 140), a), width=S_(6 if last else 4))
                f = fitfont(d, t1, 92 if last else 78, W * 0.82); d.text((W / 2, y0 - S_(22)), t1, font=f, fill=al(col, a), anchor='mm', stroke_width=S_(4), stroke_fill=al(NAVY, a)); d.text((W / 2, y0 + S_(52)), t2, font=BI(42, 'InterDisplay-Black.otf'), fill=al(WHITE, a * (1 if last else .7)), anchor='mm')
                if crossed:
                    sw = ease((u + 5) / 1.0); tw = d.textlength(t1, font=f); d.line((W / 2 - tw / 2 - S_(10), y0 - S_(22), W / 2 + tw / 2 + S_(10), y0 - S_(22)), fill=al(RED, a), width=S_(9))
        elif k == 'logo':
            from_logo = Image.open(HERE + '/logo.png').convert('RGBA'); a = ease((u - 0.05) / 0.2) * fade
            ov = Image.new('RGBA', (W, H), (0, 0, 0, 0)); h = int(560 * K * (1.2 - 0.2 * ease(u / 0.3))); l = from_logo.resize((int(from_logo.width * h / from_logo.height), h), Image.BICUBIC)
            ov.alpha_composite(l, ((W - l.width) // 2, S_(760) - h // 2)); dd = ImageDraw.Draw(ov)
            dd.text((W / 2, S_(1130)), '19 НОЯБРЯ', font=BI(150), fill=YEL + (255,), anchor='mm', stroke_width=S_(14), stroke_fill=NAVY + (255,))
            if len(o) > 1: dd.text((W / 2, S_(1300)), 'ПОДПИШИСЬ • GTA ГИД', font=BI(70), fill=WHITE + (255,), anchor='mm', stroke_width=S_(10), stroke_fill=NAVY + (255,))
            if a < 1: ov.putalpha(ov.split()[3].point(lambda v: int(v * a)))
            out = Image.alpha_composite(out.convert('RGBA'), ov).convert('RGB'); d = None
        elif k == 'flash':
            if 0.2 < u < 0.2 + o[2]:
                f = Image.open(o[1]).convert('RGB').resize((W, H), Image.LANCZOS); x = (u - 0.2) / o[2]; arr = np.asarray(f).astype(np.float32)
                kk = int(10 * K); arr[:, :, 0] = np.roll(arr[:, :, 0], kk, 1); arr[:, :, 2] = np.roll(arr[:, :, 2], -kk, 1)
                out = Image.fromarray(np.clip(arr * (0.7 + 0.3 * np.sin(x * 6)), 0, 255).astype(np.uint8)); d = None
    return out
RED = (235, 30, 40)
def caption(im, tt, ws):
    cur = [i for i, (w, a, b) in enumerate(ws) if a - 0.02 <= tt < b + 0.18]
    if not cur: return im
    i = cur[-1]; sel = ws[max(0, i - 1):i + 1] if i > 0 and ws[i][1] - ws[i - 1][2] < 0.5 else ws[i:i + 1]
    pop = 1.0 + 0.14 * max(0, 1 - (tt - ws[i][1]) / 0.12); d = ImageDraw.Draw(im); y = S_(1560)
    txt = [w.upper().strip('.,:;!?—-«»') for w, a, b in sel]; fs = [BI(86 * (pop if j == len(txt) - 1 else 1)) for j in range(len(txt))]
    tot = sum(d.textlength(t, font=f) for t, f in zip(txt, fs)) + S_(24) * (len(txt) - 1)
    if tot > W * 0.9:
        sc = W * 0.9 / tot; fs = [BI(86 * (pop if j == len(txt) - 1 else 1) * sc) for j in range(len(txt))]; tot = sum(d.textlength(t, font=f) for t, f in zip(txt, fs)) + S_(24) * (len(txt) - 1)
    x = W / 2 - tot / 2
    for j, (t, f) in enumerate(zip(txt, fs)):
        d.text((x, y), t, font=f, fill=YEL if j == len(txt) - 1 else WHITE, anchor='lm', stroke_width=S_(12), stroke_fill=NAVY); x += d.textlength(t, font=f) + S_(24)
    return im
vg = np.linspace(-1, 1, H)[:, None] ** 2 * 0.55 + np.linspace(-1, 1, W)[None, :] ** 2 * 0.45; VIG = (1 - 0.38 * np.clip(vg, 0, 1))[:, :, None].astype(np.float32)
bot = np.clip((np.arange(H) - H * 0.70) / (H * 0.22), 0, 1)[:, None, None].astype(np.float32); BOT = 1 - 0.55 * bot
GAIN = np.array([1.04, 1.0, 0.98], np.float32); SHAD = np.array([12, 0, 20], np.float32)
def render_seg(sid, only=None):
    sc = [s for s in json.load(open(HERE + '/scenes.json')) if s['seg'] == sid]; ws = [(w, a + START[sid], b + START[sid]) for w, a, b in words(sid)]
    f0 = 0 if sid == IDS[0] else round(START[sid] * FPS - 0)  # segments abut: previous segment ends where this scene starts
    f0 = round(sc[0]['a'] * FPS) ; nxt = IDS.index(sid) + 1; f1 = round(TOTAL * FPS) if nxt >= len(IDS) else round(START[IDS[nxt]] * FPS)
    out = f'{HERE}/seg_{sid}.mp4'
    COVER = Image.open(HERE + '/cover.jpg').convert('RGB').resize((W, H), Image.LANCZOS) if sid == IDS[0] else None
    ff = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '12', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', out], stdin=subprocess.PIPE)
    rnd = random.Random(9); nrng = np.random.default_rng(3); fi = f0; im = None
    for si, s in enumerate(sc):
        defn = SC[sid][si]; bg, ovs = defn[1], defn[2]; s0 = f0 if si == 0 else round(s['a'] * FPS); s1 = f1 if si == len(sc) - 1 else round(sc[si + 1]['a'] * FPS); n = s1 - s0
        if n <= 0: continue
        dur = n / FPS; pipe = open_clip(bg, dur) if bg['k'] in ('clip', 'off') else None; hot = sid == 'd7'
        for k in range(n):
            tt = (s0 + k) / FPS; u = k / FPS
            if pipe is not None: A = pipe.next(); base = A
            else: base = photo_frame(bg, u, dur)
            if base is None: base = im if im is not None else Image.new('RGB', (BW, BH))
            z = 1.0 + (0.08 * max(0, 1 - u / 0.22) ** 2 if k < 7 else 0) + (0.02 * u if pipe is not None else 0)
            cw, ch = BW / z, BH / z; cxp, cyp = BW / 2, BH / 2
            fr = base if (base.size == (BW, BH)) else base.resize((BW, BH))
            im = fr.transform((W, H), Image.EXTENT, (cxp - cw / 2, cyp - ch / 2, cxp + cw / 2, cyp + ch / 2), Image.BICUBIC) if pipe is not None or z > 1.0 else fr.resize((W, H), Image.LANCZOS)
            if k < 3 and si > 0: r = (6, 3, 2)[k]; im = im.resize((W // r, H), Image.BILINEAR).resize((W, H), Image.BILINEAR)
            arr = np.asarray(im).astype(np.float32)
            if isinstance(bg, dict) and bg.get('dim'): arr *= bg['dim']
            arr *= VIG * BOT; lum = arr.mean(2, keepdims=True) / 255; arr = arr * GAIN + (1 - lum) * SHAD
            arr += nrng.standard_normal((H, W, 1)).astype(np.float32) * 3.0
            if k < 4 and si > 0: kk = int((8 - 2 * k) * K * (1.4 if hot else 1)) + 1; arr[:, :, 0] = np.roll(arr[:, :, 0], kk, 1); arr[:, :, 2] = np.roll(arr[:, :, 2], -kk, 1)
            fl = (0.32 if hot else 0.20) * max(0, 1 - u / 0.12) if si > 0 else 0
            if fl > 0: arr = arr + (255 - arr) * fl
            im = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))
            im = draw_overlays(im, ovs, u, dur, tt); im = caption(im, tt, ws)
            if COVER is not None and tt < 0.4: im = COVER
            ff.stdin.write(im.tobytes()); fi += 1
        if pipe is not None: pipe.close()
        print(sid, 'scene', si, flush=True)
    while fi < f1 and im is not None: ff.stdin.write(im.tobytes()); fi += 1
    ff.stdin.close(); ff.wait(); print('done', sid, fi - f0, flush=True)
if __name__ == '__main__':
    c = sys.argv[1]
    if c == 'plan': plan()
    elif c == 'seg': render_seg(sys.argv[2])
