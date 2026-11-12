#!/usr/bin/env python3
"""Vertical Short (1080x1920): countdown of 5 facts, word-by-word captions, fast cuts.
usage: short.py clips | still T... | render OUT"""
import json, os, re, subprocess, sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter
ROOT = os.path.dirname(os.path.abspath(__file__)); TR = os.path.join(ROOT, '..', 'dl', 'trailers'); IMG = os.path.join(ROOT, '..', 'dl', 'img')
CL = os.path.join(ROOT, 'clips'); os.makedirs(CL, exist_ok=True)
W, H, FPS = 1080, 1920, 30
GAP, LEAD, TAIL = 0.10, 0.12, 0.35
FD = '/usr/share/fonts/opentype/inter/'
_f = {}
def F(name, s):
    if (name, s) not in _f: _f[(name, s)] = ImageFont.truetype(FD + name, s)
    return _f[(name, s)]
BLACK = lambda s: F('InterDisplay-Black.otf', s); BI = lambda s: F('InterDisplay-BlackItalic.otf', s)
PINK, YELLOW, NAVY, WHITE = (255, 62, 150), (255, 222, 40), (14, 8, 30), (255, 255, 255)
# source: file, active area (y, h) in the 3840x2160 frame
SRC = {'A': ('GTAVI_Trailer_1.mp4', 0, 2160), 'X': ('GTAVI_An_Extended_Look.mp4', 0, 2160),
       'T': ('GTAVI_Trailer_2.mp4', 216, 1728), 'L': ('GTAVI_Launch_Trailer.mp4', 120, 1920)}
U = 'ULTIMATE_EDITION_'; V = 'VINTAGE_VICE_CITY_'
def G(cue, *shots): return dict(cue=cue, shots=list(shots))
# shot = (src, start, end, cx) or ('IMG', name, cx)
PLAN = {
 'h':  [G(None, ('L', 72.8, 73.8, .42), ('T', 117.9, 118.8, .62), ('X', 841, 843.5, .5), ('X', 1131, 1134, .5), ('X', 846, 849, .5), ('L', 59.9, 61.5, .6), ('L', 26.4, 27.8, .40))],
 'f5': [G(None, ('X', 520, 523, .58), ('X', 859, 862.5, .35), ('X', 1062, 1065, .52), ('X', 1031, 1033, .5), ('X', 964, 967.5, .5), ('X', 1220, 1223, .55))],
 'f4': [G(None, ('L', 63.2, 64.0, .58), ('T', 63.1, 66.2, .52), ('A', 9.6, 10.9, .5), ('T', 111.3, 113.0, .55), ('A', 6.5, 8.5, .35), ('T', 114.0, 117.0, .52))],
 'f3': [G(None, ('A', 34.1, 35.7, .5), ('L', 45.1, 47.0, .68), ('X', 1228, 1232, .3), ('X', 1053.5, 1058, .5), ('A', 29.0, 30.0, .5))],
 'f2': [G(None, ('IMG', V + 'PACK_EXCLUSIVE_LOOKS_05', .5), ('IMG', V + 'PACK_EXCLUSIVE_LOOKS_03', .52)),
        G('револьверы', ('IMG', U + 'HAWK_AND_LITTLE_MORGAN_REVOLVERS_02', .5), ('IMG', U + 'HAWK_AND_LITTLE_MORGAN_REVOLVERS_01', .45)),
        G('раскраска', ('IMG', V + 'WEAPON_PATTERN_01', .55), ('IMG', V + 'PACK_EXCLUSIVE_LOOKS_03', .45))],
 'f1': [G(None, ('IMG', U + 'ELECTRIC_FANG_03', .55)), G('Тату', ('IMG', U + 'ELECTRIC_FANG_01', .25), ('IMG', U + 'ELECTRIC_FANG_02', .45)),
        G('салон красоты', ('IMG', U + 'SARAS_SALON_03', .42)), G('магазин', ('IMG', U + 'STOCK_305_03', .6), ('IMG', U + 'STOCK_305_01', .5)),
        G('открыты', ('IMG', 'GTAVI_FOB_UltimateEdition_Desktop_en_us', .5))],
 'o':  [G(None, ('L', 67.1, 68.5, .52), ('A', 2.7, 5.0, .5), ('L', 40.4, 42.3, .45))],
}
NUM = {'f5': '5', 'f4': '4', 'f3': '3', 'f2': '2', 'f1': '1'}

segs = json.load(open(os.path.join(ROOT, 'script.json'))); t = 0.0
for i, s in enumerate(segs):
    a = json.load(open(os.path.join(ROOT, 'tts', s['id'] + '.json'))); s['al'] = a; s['atext'] = ''.join(a['characters'])
    s['dur'] = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', os.path.join(ROOT, 'tts', s['id'] + '.mp3')]).strip())
    s['spoken'] = a['character_end_times_seconds'][-1]
    s['rs'] = t; s['t0'] = t + (LEAD if i == 0 else 0); t = s['t0'] + s['spoken'] + GAP; s['re'] = t
segs[-1]['re'] += TAIL; TOTAL = segs[-1]['re']; NF = int(TOTAL * FPS)
def cue(s, kw):
    i = s['atext'].find(kw)
    if i < 0: raise SystemExit(f'cue {kw!r} not in {s["id"]}')
    return s['t0'] + s['al']['character_start_times_seconds'][i]
groups = []
for s in segs:
    g = PLAN[s['id']]; st = [s['rs'] if x['cue'] is None else cue(s, x['cue']) - 0.08 for x in g]
    for k, x in enumerate(g): x.update(t=st[k], end=st[k + 1] if k + 1 < len(g) else s['re'], seg=s['id']); groups.append(x)

# word timings for captions (tags like [excited] removed)
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
    if cur and (w['seg'] != cur[-1]['seg'] or len(cur) >= 2 or sum(len(x['w']) for x in cur) + len(w['w']) > 13 or cur[-1]['w'][-1] in '.!?:'):
        caps.append(cur); cur = []
    cur.append(w)
if cur: caps.append(cur)

def ease(x): x = min(1, max(0, x)); return 1 - (1 - x) ** 3
def back(x):
    x = min(1, max(0, x)); c = 1.70158; return 1 + (c + 1) * (x - 1) ** 3 + c * (x - 1) ** 2
def al(c, a): return c + (int(255 * min(1, max(0, a))),)

def build_clips():
    files = []
    for gi, g in enumerate(groups):
        f0, f1 = round(g['t'] * FPS), min(NF, round(g['end'] * FPS)); need = f1 - f0
        av = [(x[2] - x[1]) if x[0] != 'IMG' else 1.6 for x in g['shots']]; tot = sum(av)
        fr = [max(10, round(need * a / tot)) for a in av]; fr[-1] += need - sum(fr)
        for j, (x, n) in enumerate(zip(g['shots'], fr)):
            out = os.path.join(CL, f'g{gi:02d}_{j}.mp4'); files.append(out); dur = n / FPS
            enc = ['-an', '-c:v', 'libx264', '-preset', 'fast', '-crf', '14', '-pix_fmt', 'yuv420p', '-r', str(FPS), '-frames:v', str(n), out]
            if x[0] == 'IMG':
                im = Image.open(os.path.join(IMG, x[1] + '.jpg')).convert('RGB'); iw, ih = im.size; cw0 = ih * 9 / 16
                p = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-'] + enc, stdin=subprocess.PIPE)
                for i in range(n):
                    z = 1.0 + 0.14 * i / max(1, n - 1); cw, chh = cw0 / z, ih / z
                    cx = min(max(x[2] * iw, cw / 2), iw - cw / 2); y0 = (ih - chh) * 0.4
                    p.stdin.write(im.transform((W, H), Image.EXTENT, (cx - cw / 2, y0, cx + cw / 2, y0 + chh), Image.BICUBIC).tobytes())
                p.stdin.close(); p.wait(); continue
            sid, a, b, cxf = x; fn, ay, ah = SRC[sid]; cw = int(ah * 9 / 16) // 2 * 2
            x0 = int(min(max(cxf * 3840 - cw / 2, 0), 3840 - cw)); use = min(b - a, dur); kf = dur / use
            if kf > 1.5: print('WARN slow x%.2f' % kf, g['seg'], x, flush=True)
            zoom = f"scale=w='2*trunc({W / 2}*(1+0.07*t/{dur:.3f}))':h='2*trunc({H / 2}*(1+0.07*t/{dur:.3f}))':eval=frame:flags=bicubic,crop={W}:{H}"
            subprocess.check_call(['ffmpeg', '-v', 'error', '-y', '-ss', f'{a:.3f}', '-t', f'{use:.3f}', '-i', os.path.join(TR, fn),
                                   '-vf', f'crop={cw}:{ah}:{x0}:{ay},scale={W}:{H}:flags=lanczos,setpts={kf:.4f}*PTS,fps={FPS},tpad=stop_mode=clone:stop_duration=1,{zoom},eq=contrast=1.07:saturation=1.18'] + enc)
        print(g['seg'], need, flush=True)
    lst = os.path.join(CL, 'list.txt'); open(lst, 'w').write(''.join(f"file '{f}'\n" for f in files))
    subprocess.check_call(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-c', 'copy', os.path.join(ROOT, 'bg.mp4')])

g_ = Image.new('L', (1, H))
for y in range(H):
    tp = max(0, 1 - y / (H * 0.30)); md = max(0, 1 - abs(y - H * 0.60) / (H * 0.16)); bt = max(0, (y - H * 0.80) / (H * 0.20))
    g_.putpixel((0, y), int(255 * min(1, 0.55 * tp ** 1.4 + 0.42 * md + 0.6 * bt)))
SHADE = Image.new('RGBA', (W, H), NAVY + (0,)); SHADE.putalpha(g_.resize((W, H)))
_lg = Image.open(os.path.join(ROOT, '..', 'full', 'logo.png')).convert('RGBA'); LOGO = _lg.resize((int(_lg.width * 150 / _lg.height), 150), Image.LANCZOS)

def text_c(d, cx, y, parts, f, sw=14):
    tw = sum(d.textlength(t, font=f) for t, _, _ in parts); x = cx - tw / 2
    for t, c, a in parts:
        d.text((x, y), t, font=f, fill=al(c, a), stroke_width=sw, stroke_fill=al(NAVY, a), anchor='ls'); x += d.textlength(t, font=f)

def overlay(tt):
    ov = Image.new('RGBA', (W, H), (0, 0, 0, 0)); ov.alpha_composite(SHADE); ov.alpha_composite(LOGO, (48, 96)); d = ImageDraw.Draw(ov)
    seg = next((s for s in segs if s['rs'] <= tt < s['re']), segs[-1]); u = tt - seg['rs']
    if seg['id'] == 'h':
        a = ease(u / 0.18); sc = 0.7 + 0.3 * back(u / 0.3)
        text_c(d, W / 2, 470, [('5 ', YELLOW, a), ('ФАКТОВ', WHITE, a)], BI(int(190 * sc)), sw=16)
        text_c(d, W / 2, 640, [('О GTA 6', WHITE, a)], BI(int(150 * sc)), sw=14)
    elif seg['id'] in NUM:
        a = ease(u / 0.15); sc = 0.55 + 0.45 * back(u / 0.32); r = int(150 * sc); cx, cy = W // 2, 430
        d.ellipse((cx - r - 14, cy - r - 14, cx + r + 14, cy + r + 14), fill=al(NAVY, a)); d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=al(YELLOW, a))
        d.text((cx, cy - 4), NUM[seg['id']], font=BLACK(int(230 * sc)), fill=al(NAVY, a), anchor='mm')
        n = 5 - int(NUM[seg['id']])
        for i in range(5):
            x = W // 2 - 2 * 70 + i * 70; d.ellipse((x - 16, 640 - 16, x + 16, 640 + 16), fill=al(PINK if i <= n else WHITE, a * (1 if i <= n else 0.45)))
    else:
        a = ease(u / 0.2); sc = 0.75 + 0.25 * back(u / 0.3)
        text_c(d, W / 2, 440, [('ПОЛНЫЙ ', WHITE, a), ('РАЗБОР', YELLOW, a)], BI(int(108 * sc)), sw=14)
        f = BLACK(70); tx = 'УЖЕ НА КАНАЛЕ'; tw = d.textlength(tx, font=f)
        d.rounded_rectangle((W / 2 - tw / 2 - 44, 492, W / 2 + tw / 2 + 44, 606), radius=26, fill=al(PINK, a)); d.text((W / 2, 549), tx, font=f, fill=al(WHITE, a), anchor='mm')
        by = 1500 + int(26 * abs(((tt * 2.2) % 1) - 0.5) * 2); d.polygon([(150, by), (290, by), (220, by + 90)], fill=al(YELLOW, a)); d.rectangle((192, by - 90, 248, by), fill=al(YELLOW, a))
    for c in caps:
        t0, t1 = c[0]['t'] - 0.04, c[-1]['e'] + 0.12
        nxt = caps[caps.index(c) + 1][0]['t'] - 0.04 if c is not caps[-1] else TOTAL
        if t0 <= tt < min(max(t1, t0 + 0.25), nxt) or (c is caps[-1] and tt >= t0):
            sc = 0.82 + 0.18 * back((tt - t0) / 0.16); size = int(138 * sc); f = BI(size)
            txt = [w['w'].upper().strip('.,:—') for w in c]
            while sum(d.textlength(x + ' ', font=f) for x in txt) > W - 90: size -= 4; f = BI(size)
            parts = [(x + (' ' if i < len(txt) - 1 else ''), YELLOW if c[i]['t'] - 0.03 <= tt else WHITE, 1.0) for i, x in enumerate(txt)]
            text_c(d, W / 2, 1210, parts, f, sw=15)
    for s in segs[1:]:
        if 0 <= tt - s['rs'] < 0.14: ov.alpha_composite(Image.new('RGBA', (W, H), al(WHITE, 0.55 * (1 - (tt - s['rs']) / 0.14))))
    return ov

if __name__ == '__main__':
    m = sys.argv[1]
    if m == 'clips':
        build_clips(); print('total', round(TOTAL, 2))
        json.dump(dict(total=TOTAL, voice=[(s['id'], s['t0']) for s in segs], hits=[s['rs'] for s in segs[1:]]), open(os.path.join(ROOT, 'timeline.json'), 'w'))
    elif m == 'still':
        for x in sys.argv[2:]:
            tt = float(x); subprocess.check_call(['ffmpeg', '-v', 'error', '-y', '-ss', f'{tt:.3f}', '-i', os.path.join(ROOT, 'bg.mp4'), '-frames:v', '1', os.path.join(ROOT, 'f.png')])
            Image.alpha_composite(Image.open(os.path.join(ROOT, 'f.png')).convert('RGBA'), overlay(tt)).convert('RGB').resize((360, 640)).save(os.path.join(ROOT, f'still_{tt:06.2f}.jpg'), quality=85)
    elif m == 'render':
        ff = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-i', os.path.join(ROOT, 'bg.mp4'), '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-', '-i', os.path.join(ROOT, 'mix.wav'),
                               '-filter_complex', '[0:v][1:v]overlay=shortest=1[v]', '-map', '[v]', '-map', '2:a', '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p',
                               '-c:a', 'aac', '-b:a', '256k', '-movflags', '+faststart', '-t', f'{TOTAL:.3f}', sys.argv[2]], stdin=subprocess.PIPE)
        for i in range(NF): ff.stdin.write(overlay(i / FPS).tobytes())
        ff.stdin.close(); ff.wait(); print('done', sys.argv[2], round(TOTAL, 2))
