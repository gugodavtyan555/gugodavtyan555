#!/usr/bin/env python3
"""Top-5 hype Short renderer. usage: render.py plan | render.py seg <id> | render.py all   (K=1.3334 -> 1440x2560)"""
import json, os, subprocess, sys, random
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from tl import *
TR = HERE + '/../dl/trailers'; SRCF = TR + '/GTAVI_An_Extended_Look.mp4'
K = float(os.environ.get('K', '1.3334')); FPS = 30; W, H = int(1080 * K) // 2 * 2, int(1920 * K) // 2 * 2; S_ = lambda v: int(round(v * K))
BW, BH = int(1188 * K) // 2 * 2, int(2112 * K) // 2 * 2
_fc = {}
def BI(s):
    s = int(s * K); 
    if s not in _fc: _fc[s] = ImageFont.truetype('/usr/share/fonts/opentype/inter/InterDisplay-BlackItalic.otf', s)
    return _fc[s]
CAT = json.load(open(HERE + '/../../../workspace/gugodavtyan555/video-pipeline/footage/catalog.json'))['X']['scenes'] if False else json.load(open('/workspace/gugodavtyan555/video-pipeline/footage/catalog.json'))['X']['scenes']
def cx_at(t):
    for s in CAT:
        if s['a'] <= t < s['b']: return s['cx']
    return 0.5
# ---- shot lists: (src_start, src_len) ; pattern in beats ; style
PAT = {'n5': [2, 2, 1, 1, 2, 2, 1, 2, 2, 2, 1], 'n4': [2, 1, 1, 2, 2, 1, 1, 2, 2, 2], 'n3': [2, 1, 1, 2, 2, 1, 1, 2, 2, 2], 'n2': [2, 2, 1, 1, 2, 2, 2, 2, 2, 2], 'n1': [2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2], 'h': [2, 2, 2, 2], 'o': [8]}
SH = {
 'n5': [(483.7, 1.9), (478.9, 1.9), (1026.4, 0.9), (549.7, 1.0), (554.5, 2.2), (1027.8, 1.9), (485.7, 0.9), (481.8, 1.6), (556.7, 1.5), (486.7, 0.8), (550.75, 0.5)],
 'n4': [(1042.3, 2.4), (1045.1, 0.7), (1548.7, 0.9), (1550.9, 1.5), (1558.2, 1.0), (1045.9, 0.9), (1549.7, 0.9), (571.0, 1.7), (573.0, 1.7), (1559.3, 0.9)],
 'n3': [(568.95, 1.8), (564.9, 0.9), (686.2, 0.8), (687.5, 1.8), (694.5, 1.4), (696.2, 0.7), (697.0, 0.8), (698.2, 1.6), (565.9, 1.5), (689.4, 0.55)],
 'n2': [(1070.3, 1.8), (702.0, 1.7), (1072.2, 0.9), (703.3, 0.8), (1073.2, 0.9), (704.2, 1.4), (1070.9, 0.8), (702.6, 1.0), (1073.6, 0.5), (704.9, 0.7)],
 'n1': [(538.95, 1.4), (540.3, 1.4), (1127.4, 1.8), (1129.2, 1.8), (541.6, 1.1), (1131.0, 0.7), (1131.8, 0.7), (1133.0, 1.8), (1134.8, 1.8), (1136.6, 1.8), (1136.9, 1.0)],
 'h': [(486.0, 1.2), (1043.4, 1.1), (698.9, 0.9), (1130.4, 1.3)],
 'o': [(1135.5, 2.0)]}
FREEZE = {'n5': 4, 'n4': 3, 'n3': 4, 'n2': 1, 'n1': 7}
SLAM = {'n5': ('5', 'КАТАТЬСЯ ПО ВАЙС-СИТИ'), 'n4': ('4', 'ВЫЙТИ В МОРЕ'), 'n3': ('3', 'НАЛЁТ НА ФУРГОН'), 'n2': ('2', 'ОГРАБИТЬ ЮВЕЛИРНЫЙ'), 'n1': ('1', 'ПРЫГНУТЬ')}
BLK = {b[0]: b for b in BLOCKS}
def plan():
    shots = []; ev = dict(whoosh=[], impact=[], freeze=[])
    for bid, b0, b1 in BLOCKS:
        k = b0
        assert sum(PAT[bid]) == b1 - b0, (bid, sum(PAT[bid]), b1 - b0)
        for i, nb in enumerate(PAT[bid]):
            t0 = max(0.0, beat(k)); t1 = beat(k + nb); a, L = SH[bid][i]
            sh = dict(blk=bid, i=i, t0=t0, t1=t1, a=a, L=L, cx=cx_at(a + L / 2), style='ramp' if nb >= 2 and bid not in ('h', 'o') else 'norm', freeze=(FREEZE.get(bid) == i))
            if bid == 'h': sh['style'] = 'push'
            if bid == 'o': sh['style'] = 'push'
            shots.append(sh)
            if i > 0 or bid in ('n5',): ev['whoosh'].append(t0)
            if sh['freeze']: ev['freeze'].append(t0 + (t1 - t0) * 0.5)
            k += nb
        if bid in SLAM: ev['impact'].append(beat(b0) if bid != 'n1' else beat(b0))
    json.dump(shots, open(HERE + '/shots.json', 'w')); json.dump(ev, open(HERE + '/events.json', 'w')); print(len(shots), 'shots', round(TOTAL, 2), 's')
# ---- helpers
def ease(x): x = min(1, max(0, x)); return 1 - (1 - x) ** 3
def speed_map(n, style, F):
    """source fraction (0..1) for each of n dest frames; F freeze frames inserted at the middle."""
    m = n - F; u = (np.arange(m) + 0.5) / m
    if style == 'ramp':
        v = np.interp(u, [0, 0.2, 0.42, 0.62, 0.85, 1], [2.6, 2.4, 0.35, 0.35, 1.9, 1.9]); v = np.convolve(np.pad(v, 5, mode='edge'), np.ones(11) / 11, 'valid')
    elif style == 'push': v = np.ones(m)
    else: v = np.interp(u, [0, 1], [1.5, 0.8])
    c = np.cumsum(v); c = (c - c[0]) / (c[-1] - c[0]) if c[-1] > c[0] else u
    if F:
        h = m // 2; c = np.concatenate([c[:h], np.full(F, c[h - 1]), c[h:]])
    return c
def reader(a, L, cx):
    cw = 1214; x0 = int(min(max(cx * 3840 - cw / 2, 0), 3840 - cw))
    return subprocess.Popen(['ffmpeg', '-v', 'error', '-threads', '3', '-ss', f'{a:.3f}', '-i', SRCF, '-t', f'{L + 0.5:.2f}',
        '-vf', f'crop={cw}:2160:{x0}:0,scale={BW}:{BH}:flags=lanczos,eq=contrast=1.10:saturation=1.25:gamma=0.97', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE, stdin=subprocess.DEVNULL)
class Src:
    def __init__(self, a, L, cx): self.p = reader(a, L, cx); self.buf = {}; self.n = 0; self.eof = False; self.last = None
    def get(self, i):
        while self.n <= i and not self.eof:
            b = self.p.stdout.read(BW * BH * 3)
            if len(b) < BW * BH * 3: self.eof = True; break
            self.buf[self.n] = Image.frombuffer('RGB', (BW, BH), b, 'raw', 'RGB', 0, 1); self.last = self.buf[self.n]; self.n += 1
            for j in [j for j in self.buf if j < self.n - 3]: del self.buf[j]
        return self.buf.get(i, self.last)
    def close(self): self.p.kill()
vg = np.linspace(-1, 1, H)[:, None] ** 2 * 0.55 + np.linspace(-1, 1, W)[None, :] ** 2 * 0.45; VIG = (1 - 0.40 * np.clip(vg, 0, 1))[:, :, None].astype(np.float32)
GAIN = np.array([1.05, 1.0, 0.97], np.float32); SHAD = np.array([14, 0, 22], np.float32)
_lg = Image.open(HERE + '/logo.png').convert('RGBA')
def logo_layer(scale, sub=None):
    ov = Image.new('RGBA', (W, H), (0, 0, 0, 0)); h = int(560 * scale * K); l = _lg.resize((int(_lg.width * h / _lg.height), h), Image.BICUBIC)
    sh = Image.new('RGBA', (l.width + S_(120), l.height + S_(120)), (0, 0, 0, 0)); sh.paste((0, 0, 0, 200), (S_(60), S_(60)), l.split()[3]); ov.alpha_composite(sh.filter(ImageFilter.GaussianBlur(24 * K)), ((W - l.width) // 2 - S_(60), S_(820) - h // 2 - S_(60))); ov.alpha_composite(l, ((W - l.width) // 2, S_(820) - h // 2))
    if sub:
        d = ImageDraw.Draw(ov); d.text((W / 2, S_(1230)), sub[0], font=BI(150), fill=(255, 222, 40, 255), anchor='mm', stroke_width=S_(14), stroke_fill=(14, 8, 30, 255))
        d.text((W / 2, S_(1380)), sub[1], font=BI(70), fill=(255, 255, 255, 255), anchor='mm', stroke_width=S_(10), stroke_fill=(14, 8, 30, 255))
    return ov
def slam_layer(num, title):
    ov = Image.new('RGBA', (W, H), (0, 0, 0, 0)); f = BI(980); cx, cy = W // 2, S_(790)
    g = Image.new('RGBA', (W, H), (0, 0, 0, 0)); gd = ImageDraw.Draw(g); gd.text((cx, cy), num, font=f, fill=(255, 190, 40, 200), anchor='mm', stroke_width=S_(40), stroke_fill=(255, 120, 30, 160))
    ov.alpha_composite(g.filter(ImageFilter.GaussianBlur(S_(34))))
    d = ImageDraw.Draw(ov); d.text((cx, cy), num, font=f, fill=(14, 6, 28, 255), anchor='mm', stroke_width=S_(30), stroke_fill=(14, 6, 28, 255))
    for i in range(S_(26), 0, -1):
        t = i / S_(26); d.text((cx + i * 0.55, cy + i * 0.95), num, font=f, fill=(int(235 - 80 * (1 - t)), int(30 + 10 * t), int(150 - 40 * (1 - t)), 255), anchor='mm')
    fm = Image.new('L', (W, H), 0); ImageDraw.Draw(fm).text((cx, cy), num, font=f, fill=255, anchor='mm')
    grad = np.zeros((H, W, 3), np.uint8); yy = np.clip((np.arange(H) - (cy - S_(420))) / S_(840), 0, 1)[:, None]
    grad[:, :, 0] = 255; grad[:, :, 1] = (245 - 110 * yy).astype(np.uint8) * np.ones((1, W), np.uint8); grad[:, :, 2] = (90 - 70 * yy).astype(np.uint8) * np.ones((1, W), np.uint8)
    ov.paste(Image.fromarray(grad), (0, 0), fm)
    d = ImageDraw.Draw(ov); ft = BI(74); tw = d.textlength(title, font=ft); ty = S_(1290)
    d.rounded_rectangle((cx - tw / 2 - S_(40), ty - S_(62), cx + tw / 2 + S_(40), ty + S_(62)), radius=S_(34), fill=(255, 40, 140, 255), outline=(255, 255, 255, 255), width=S_(5))
    d.text((cx, ty), title, font=ft, fill=(255, 255, 255, 255), anchor='mm')
    return ov
def apply_slam(im, lay, u):
    """u seconds since slam start, 1.22 s long: rush in from depth, settle, hold, break through."""
    if u < 0.13: s = 0.35 + 0.8 * ease(u / 0.13); a = ease(u / 0.09)
    elif u < 0.22: s = 1.15 - 0.15 * ease((u - 0.13) / 0.09); a = 1
    elif u < 0.95: s = 1.0 + 0.02 * (u - 0.22); a = 1
    else: x = (u - 0.95) / 0.27; s = 1.0 + 1.6 * x * x; a = max(0.0, 1 - x * 1.1)
    if a <= 0: return im
    L = lay if abs(s - 1) < 1e-3 else lay.resize((int(W * s), int(H * s)), Image.BILINEAR)
    if a < 1: L = L.copy(); L.putalpha(L.split()[3].point(lambda v: int(v * a)))
    ox, oy = 0, 0
    if 0.13 <= u < 0.30: ox = int(random.uniform(-1, 1) * S_(16) * (1 - (u - .13) / .17)); oy = int(random.uniform(-1, 1) * S_(16) * (1 - (u - .13) / .17))
    px, py = int(W / 2 + ox - (W / 2) * s), int(S_(900) + oy - S_(900) * s)
    base = im.convert('RGBA'); base.paste(L, (px, py), L); return base.convert('RGB')
def caption(im, tt, ws):
    cur = [i for i, (w, a, b) in enumerate(ws) if a - 0.02 <= tt < b + 0.18]
    if not cur: return im
    i = cur[-1]; sel = ws[max(0, i - 1):i + 1] if i > 0 and ws[i][1] - ws[i - 1][2] < 0.5 else ws[i:i + 1]
    pop = 1.0 + 0.16 * max(0, 1 - (tt - ws[i][1]) / 0.12); d = ImageDraw.Draw(im); y = S_(1545)
    txt = [w.upper().strip('.,:;!?—-') for w, a, b in sel]; fs = [BI(92 * (pop if j == len(txt) - 1 else 1)) for j in range(len(txt))]
    tot = sum(d.textlength(t, font=f) for t, f in zip(txt, fs)) + S_(24) * (len(txt) - 1)
    if tot > W * 0.9:
        sc = W * 0.9 / tot; fs = [BI(92 * (pop if j == len(txt) - 1 else 1) * sc) for j in range(len(txt))]; tot = sum(d.textlength(t, font=f) for t, f in zip(txt, fs)) + S_(24) * (len(txt) - 1)
    x = W / 2 - tot / 2
    for j, (t, f) in enumerate(zip(txt, fs)):
        d.text((x, y), t, font=f, fill=(255, 222, 40) if j == len(txt) - 1 else (255, 255, 255), anchor='lm', stroke_width=S_(12), stroke_fill=(14, 8, 30)); x += d.textlength(t, font=f) + S_(24)
    return im
def render_seg(bid):
    shots = [s for s in json.load(open(HERE + '/shots.json')) if s['blk'] == bid]; _, b0, b1 = BLK[bid]
    f0 = round(beat(b0) * FPS) if b0 else 0; f1 = round(beat(b1) * FPS); out = f'{HERE}/seg_{bid}.mp4'
    ws = words(bid); lay = slam_layer(*SLAM[bid]) if bid in SLAM else None
    COVER = Image.open(HERE + '/cover.jpg').convert('RGB').resize((W, H), Image.LANCZOS) if bid == 'h' else None
    ff = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'slow', '-crf', '14', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', out], stdin=subprocess.PIPE)
    rnd = random.Random(5); random.seed(5); fi = f0; im = None; slam_t0 = beat(b0)
    for si, sh in enumerate(shots):
        s0 = max(f0, round(sh['t0'] * FPS)) if si else f0; s1 = f1 if si == len(shots) - 1 else round(shots[si + 1]['t0'] * FPS); n = s1 - s0
        if n <= 0: continue
        F = 8 if sh['freeze'] else 0; mp = speed_map(n, sh['style'], F); src = Src(sh['a'], sh['L'], sh['cx']); fh = (n - F) // 2
        for k in range(n):
            tt = (s0 + k) / FPS; u = k / FPS; fi_src = mp[k] * sh['L'] * 30; i0 = int(fi_src); fr = fi_src - i0
            A = src.get(i0); 
            if A is None: break
            if 0.1 < fr < 0.9 and sh['L'] * 30 / max(1, n) < 0.95: B = src.get(i0 + 1); im0 = Image.blend(A, B, fr) if B is not None else A
            else: im0 = A
            frozen = F and fh <= k < fh + F
            beatd = min(abs(tt - beat(j)) for j in range(max(0, b0 - 1), b1 + 2)); pb = beatd
            hot = bid not in ('h', 'o'); z = 1.0 + 0.04 * max(0, 1 - pb / 0.12) + 0.025 * u + (0.10 * max(0, 1 - u / 0.2) ** 2 if k < 6 else 0)
            if bid == 'h': z = 1.0 + 0.30 * (u / max(0.1, (sh['t1'] - sh['t0'])))
            if bid == 'o': z = 1.0 + 0.10 * (u / 4.9)
            sx = sy = 0
            if k < 5 and hot: sx = rnd.uniform(-12, 12) * K * (1 - k / 5); sy = rnd.uniform(-12, 12) * K * (1 - k / 5)
            cw, ch = W / z * BW / W, H / z * BH / H; cxp, cyp = BW / 2 + sx, BH / 2 + sy
            im = im0.transform((W, H), Image.EXTENT, (cxp - cw / 2, cyp - ch / 2, cxp + cw / 2, cyp + ch / 2), Image.BICUBIC)
            if k < 3 and si > 0: r = (6, 3, 2)[k]; im = im.resize((W // r, H), Image.BILINEAR).resize((W, H), Image.BILINEAR)
            arr = np.asarray(im).astype(np.float32)
            if frozen: arr = 255 - arr; arr = np.clip((arr - 128) * 1.25 + 128, 0, 255)
            if bid == 'o': arr *= 0.38
            elif lay is not None and tt - slam_t0 < 1.22: arr *= 0.6 + 0.4 * ease((tt - slam_t0) / 1.22)
            arr *= VIG; lum = arr.mean(2, keepdims=True) / 255; arr = arr * GAIN + (1 - lum) * SHAD
            if hot and k < 4: kk = int((12 - 3 * k) * K) + 1; arr[:, :, 0] = np.roll(arr[:, :, 0], kk, 1); arr[:, :, 2] = np.roll(arr[:, :, 2], -kk, 1)
            fl = (0.85 if (si == 0 and bid in SLAM) else (0.35 if hot else 0.0)) * max(0, 1 - u / (0.2 if si == 0 else 0.1))
            if bid == 'h' and si == 0: fl = 0
            if frozen and k == fh: fl = 0.9
            if fl > 0: arr = arr + (255 - arr) * fl
            im = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))
            if bid == 'h':
                d = ImageDraw.Draw(im); f = BI(104); t1, t2 = 'ЧЕРЕЗ ', '2 ДНЯ'; w1 = d.textlength(t1, font=f); w2 = d.textlength(t2, font=f); x = W / 2 - (w1 + w2) / 2; sc = 1 + 0.05 * max(0, 1 - pb / 0.16)
                if 0.4 < tt < 3.9: d.text((x, S_(430)), t1, font=f, fill=(255, 255, 255), anchor='lm', stroke_width=S_(12), stroke_fill=(14, 8, 30)); d.text((x + w1, S_(430)), t2, font=f, fill=(255, 222, 40), anchor='lm', stroke_width=S_(12), stroke_fill=(14, 8, 30))
                if tt < 0.35 and COVER is not None: im = COVER
            if lay is not None and tt - slam_t0 < 1.22: im = apply_slam(im, lay, tt - slam_t0)
            if bid == 'o': im = Image.alpha_composite(im.convert('RGBA'), logo_layer(1.3 - 0.3 * min(1, max(0, tt - beat(96)) / 0.16) ** 0.5, sub=('ПОДПИШИСЬ', 'GTA ГИД'))).convert('RGB')
            im = caption(im, tt, ws)
            ff.stdin.write(im.tobytes()); fi += 1
        src.close(); print(bid, 'shot', si, flush=True)
    while fi < f1 and im is not None: ff.stdin.write(im.tobytes()); fi += 1
    ff.stdin.close(); ff.wait(); print('done', bid, fi - f0, 'frames', flush=True)
if __name__ == '__main__':
    c = sys.argv[1]
    if c == 'plan': plan()
    elif c == 'seg': render_seg(sys.argv[2])
    elif c == 'all':
        for b in BLOCKS: render_seg(b[0])
