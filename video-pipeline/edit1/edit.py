#!/usr/bin/env python3
"""Beat-synced hype edit (1080x1920): cuts land on the detected beats of the track; zoom punches, flashes, RGB split,
shake, logo hit on the drop, countdown text. usage: edit.py OUT.mp4   (needs music.mp3 + beats.json)"""
import json, os, subprocess, sys, random
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
ROOT = os.path.dirname(os.path.abspath(__file__)); TR = os.path.join(ROOT, '..', 'dl', 'trailers'); K = float(os.environ.get('K', '1')); FPS = int(os.environ.get('FPS', '30')); W, H = int(1080 * K) // 2 * 2, int(1920 * K) // 2 * 2; S_ = lambda v: int(round(v * K))
BI = lambda s: ImageFont.truetype('/usr/share/fonts/opentype/inter/InterDisplay-BlackItalic.otf', int(s * K))
SRC = {'A': ('GTAVI_Trailer_1.mp4', 0, 2160), 'X': ('GTAVI_An_Extended_Look.mp4', 0, 2160), 'T': ('GTAVI_Trailer_2.mp4', 216, 1728), 'L': ('GTAVI_Launch_Trailer.mp4', 120, 1920)}
TEXT = ('ОСТАЛОСЬ ', '2 ДНЯ'); END = ('19 НОЯБРЯ', 'GTA ГИД')
INTRO = [('L', 63.3, .58), ('L', 67.3, .52), ('T', 23.6, .5), ('A', 3.0, .5), ('L', 26.5, .40), ('A', 31.1, .5), ('T', 114.4, .52), ('A', 39.9, .45), ('L', 40.5, .45), ('A', 74.8, .5)]
MAIN = [('T', 117.95, .62), ('X', 847.4, .5), ('L', 72.85, .42), ('X', 1063.0, .55), ('A', 66.25, .5), ('T', 140.95, .5), ('X', 1130.0, .45), ('A', 24.1, .5),
        ('X', 965.0, .42), ('L', 60.0, .6), ('X', 1116.4, .5), ('A', 14.8, .5), ('T', 142.9, .5), ('A', 36.6, .5), ('X', 1134.2, .5), ('A', 71.6, .45),
        ('X', 1065.0, .55), ('A', 22.6, .5), ('T', 147.9, .5), ('X', 848.8, .5), ('L', 21.4, .54), ('X', 1031.2, .5), ('A', 53.2, .5), ('T', 36.6, .5), ('X', 1118.2, .6), ('L', 55.4, .5), ('A', 68.9, .5), ('X', 1137.0, .5)]
bj = json.load(open(ROOT + '/beats.json')); beats = bj['beats']; drop = bj['drop']; per = 60 / bj['bpm']; TOTAL = min(bj['dur'] - 1.9, 22.0)
pre = [b for b in beats if b < drop - 0.01]; cuts = [0.0] + pre[1::2][1:] if len(pre) > 3 else [0.0]
cuts = [c for c in cuts if drop - c > per * 1.2]
plan = [dict(t=c, kind='intro') for c in cuts]; plan.append(dict(t=drop, kind='logo'))
t = drop + 2 * per; n = 0
while t < TOTAL - 2.6:
    step = per / 2 if 8 <= n < 16 else per; plan.append(dict(t=t, kind='main')); t += step; n += 1
plan.append(dict(t=t, kind='end'))
for a, b in zip(plan, plan[1:]): a['end'] = b['t']
plan[-1]['end'] = TOTAL; ii = mi = 0
for p in plan:
    if p['kind'] == 'intro': p['shot'] = INTRO[ii % len(INTRO)]; ii += 1
    elif p['kind'] == 'main': p['shot'] = MAIN[mi % len(MAIN)]; mi += 1
    else: p['shot'] = MAIN[0] if p['kind'] == 'logo' else ('A', 3.2, .5)
print('shots', len(plan), 'intro', ii, 'main', mi, 'drop', drop, 'total', round(TOTAL, 2))
_lg = Image.open(ROOT + '/logo.png').convert('RGBA')
COVER = Image.open(ROOT + '/cover.jpg').convert('RGB').resize((W, H), Image.LANCZOS) if os.path.exists(ROOT + '/cover.jpg') else None
vg = np.linspace(-1, 1, H)[:, None] ** 2 * 0.55 + np.linspace(-1, 1, W)[None, :] ** 2 * 0.45; VIG = (1 - 0.42 * np.clip(vg, 0, 1))[:, :, None].astype(np.float32)
BW, BH = int(1188 * K) // 2 * 2, int(2112 * K) // 2 * 2
def reader(shot, nfr, speed):
    src, st, cx = shot; fn, ay, ah = SRC[src]; cw = int(ah * 9 / 16) // 2 * 2; x0 = int(min(max(cx * 3840 - cw / 2, 0), 3840 - cw))
    return subprocess.Popen(['ffmpeg', '-v', 'error', '-ss', f'{st:.3f}', '-i', f'{TR}/{fn}', '-vf', f'crop={cw}:{ah}:{x0}:{ay},scale={BW}:{BH}:flags=lanczos,setpts=PTS/{speed},fps={FPS},eq=contrast=1.12:saturation=1.28:gamma=0.97',
                             '-frames:v', str(nfr + 2), '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
def logo_layer(scale, a=1.0, sub=None):
    ov = Image.new('RGBA', (W, H), (0, 0, 0, 0)); h = int(560 * scale * K); l = _lg.resize((int(_lg.width * h / _lg.height), h), Image.BICUBIC)
    sh = Image.new('RGBA', (l.width + S_(120), l.height + S_(120)), (0, 0, 0, 0)); sh.paste((0, 0, 0, 200), (S_(60), S_(60)), l.split()[3]); ov.alpha_composite(sh.filter(ImageFilter.GaussianBlur(24 * K)), ((W - l.width) // 2 - S_(60), S_(820) - h // 2 - S_(60))); ov.alpha_composite(l, ((W - l.width) // 2, S_(820) - h // 2))
    if sub:
        d = ImageDraw.Draw(ov); d.text((W / 2, S_(1230)), sub[0], font=BI(150), fill=(255, 222, 40, 255), anchor='mm', stroke_width=S_(14), stroke_fill=(14, 8, 30, 255))
        d.text((W / 2, S_(1380)), sub[1], font=BI(70), fill=(255, 255, 255, 255), anchor='mm', stroke_width=S_(10), stroke_fill=(14, 8, 30, 255))
    return ov
out = sys.argv[1]; NF = int(TOTAL * FPS)
ff = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-', '-i', ROOT + '/music.mp3', '-map', '0:v', '-map', '1:a',
                       '-af', f'afade=t=out:st={TOTAL - 0.5:.2f}:d=0.5,loudnorm=I=-13:TP=-1.2', '-c:v', 'libx264', '-preset', 'slow', '-crf', os.environ.get('CRF', '17'), '-maxrate', '19M', '-bufsize', '38M', '-profile:v', 'high', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '320k', '-movflags', '+faststart', '-t', f'{TOTAL:.3f}', out], stdin=subprocess.PIPE)
rnd = random.Random(3); fi = 0
for p in plan:
    f0, f1 = round(p['t'] * FPS), min(NF, round(p['end'] * FPS)); n = f1 - f0
    if n <= 0: continue
    rd = reader(p['shot'], n, 1.0 if p['kind'] in ('intro', 'end') else (0.55 if p['kind'] == 'logo' else 1.35)); last = None
    for k in range(n):
        tt = (f0 + k) / FPS; buf = rd.stdout.read(BW * BH * 3)
        if len(buf) == BW * BH * 3: last = Image.frombuffer('RGB', (BW, BH), buf, 'raw', 'RGB', 0, 1)
        u = k / FPS; hot = p['kind'] != 'intro'; pb = min((tt - b) for b in beats if b <= tt + 1e-6) if tt >= beats[0] else 9
        z = 1.0 + (0.13 if hot else 0.06) * max(0, 1 - u / 0.2) ** 2 + (0.035 * max(0, 1 - pb / 0.14) if hot else 0) + 0.02 * u
        sx = sy = 0
        if hot and u < 0.16: sx = rnd.uniform(-14, 14) * K * (1 - u / 0.16); sy = rnd.uniform(-14, 14) * K * (1 - u / 0.16)
        cw, ch = W / z * 1.0, H / z * 1.0; cxp, cyp = BW / 2 + sx, BH / 2 + sy
        im = last.transform((W, H), Image.EXTENT, (cxp - cw / 2 * BW / W / 1.0, cyp - ch / 2 * BH / H, cxp + cw / 2 * BW / W, cyp + ch / 2 * BH / H), Image.BICUBIC)
        arr = np.asarray(im).astype(np.float32)
        if p['kind'] in ('logo', 'end'): arr *= 0.38
        arr *= VIG
        if hot and u < 0.12: kk = int(20 * K * (1 - u / 0.12)) + 1; arr[:, :, 0] = np.roll(arr[:, :, 0], kk, axis=1); arr[:, :, 2] = np.roll(arr[:, :, 2], -kk, axis=1)
        fl = (0.75 if p['kind'] == 'logo' else 0.45) * max(0, 1 - u / 0.13) if hot else 0.18 * max(0, 1 - u / 0.1)
        if fl > 0: arr = arr + (255 - arr) * fl
        im = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))
        if p['kind'] == 'intro' or tt < drop:
            d = ImageDraw.Draw(im); sc = 1 + 0.05 * max(0, 1 - pb / 0.16); f = BI(int(118 * sc)); w1 = d.textlength(TEXT[0], font=f); w2 = d.textlength(TEXT[1], font=f); x = W / 2 - (w1 + w2) / 2
            d.text((x, S_(960)), TEXT[0], font=f, fill=(255, 255, 255), anchor='lm', stroke_width=S_(12), stroke_fill=(14, 8, 30)); d.text((x + w1, S_(960)), TEXT[1], font=f, fill=(255, 222, 40), anchor='lm', stroke_width=S_(12), stroke_fill=(14, 8, 30))
        elif p['kind'] == 'logo': im = Image.alpha_composite(im.convert('RGBA'), logo_layer(1.55 - 0.55 * min(1, u / 0.16) ** 0.5 + 0.03 * u)).convert('RGB')
        elif p['kind'] == 'end': im = Image.alpha_composite(im.convert('RGBA'), logo_layer(1.3 - 0.3 * min(1, u / 0.16) ** 0.5, sub=END)).convert('RGB')
        if COVER is not None and tt < 0.3: im = COVER
        ff.stdin.write(im.tobytes()); fi += 1
    rd.kill()
while fi < NF: ff.stdin.write(im.tobytes()); fi += 1
ff.stdin.close(); ff.wait(); print('done', out, fi, 'frames')
