#!/usr/bin/env python3
"""'Details you missed' vertical video (1080x1920): each detail = real-time wide shot -> real-time punch-in -> freeze frame with
circle + arrow. One narration segment per detail. usage: detail.py clips | still T... | render OUT"""
import json, os, re, subprocess, sys
from PIL import Image, ImageDraw, ImageFont
ROOT = os.path.dirname(os.path.abspath(__file__)); TR = os.path.join(ROOT, '..', 'dl', 'trailers')
CL = os.path.join(ROOT, 'clips'); os.makedirs(CL, exist_ok=True)
W, H, FPS = 1080, 1920, 30
GAP, LEAD, TAIL, COVER_T = 0.18, 0.5, 0.4, 0.4
FD = '/usr/share/fonts/opentype/inter/'
_f = {}
def F(n, s):
    if (n, s) not in _f: _f[(n, s)] = ImageFont.truetype(FD + n, s)
    return _f[(n, s)]
BLACK = lambda s: F('InterDisplay-Black.otf', s); BI = lambda s: F('InterDisplay-BlackItalic.otf', s)
PINK, YELLOW, NAVY, WHITE, RED = (255, 62, 150), (255, 222, 40), (14, 8, 30), (255, 255, 255), (235, 30, 40)
SRC = {'A': ('GTAVI_Trailer_1.mp4', 0, 2160), 'X': ('GTAVI_An_Extended_Look.mp4', 0, 2160), 'T': ('GTAVI_Trailer_2.mp4', 216, 1728), 'L': ('GTAVI_Launch_Trailer.mp4', 120, 1920)}
def V(src, a, b, cx=.5, zoom=1.0, cy=.5, g=1.0): return dict(k='V', src=src, a=a, b=b, cx=cx, zoom=zoom, cy=cy, g=g)
def FRZ(src, t, cx, cy, zoom, hold=2.0, target=None, g=1.0): return dict(k='F', src=src, a=t, cx=cx, cy=cy, zoom=zoom, hold=hold, target=target or (cx, cy), g=g)
X = 'X'
PLAN = {
 'h':  [V(X, 733.0, 733.55, .455, 1.3, .45), V(X, 849.0, 850.0, .52, 1.5, .55), V(X, 725.0, 726.2, .5), V(X, 438.6, 439.6, .58, 1.4, .55), V(X, 63.4, 64.6, .505, 1.6, .33, g=1.4),
        V(X, 1105, 1106.5, .82), V(X, 964.5, 966.5, .42), V(X, 1127.7, 1129.5, .45)],
 'd1': [V(X, 59.6, 62.0, .52, 1.4, .36, g=1.4), FRZ(X, 62.0, .525, .315, 2.0, g=1.4), V(X, 62.0, 64.3, .515, 1.8, .33, g=1.4), FRZ(X, 64.1, .505, .325, 2.0, g=1.4)],
 'd2': [V(X, 436.6, 438.4, .55), V(X, 438.4, 439.6, .60, 1.4, .55), FRZ(X, 439.1, .56, .53, 1.7)],
 'd3': [V(X, 706.5, 708.5, .5), V(X, 713.0, 715.5, .45), V(X, 716.0, 718.0, .5), V(X, 724.0, 726.3, .48)],
 'd4': [V(X, 731.6, 733.55, .46), FRZ(X, 733.2, .456, .38, 1.7), V(X, 733.6, 735.9, .6)],
 'd5': [V(X, 846.1, 848.6, .55), V(X, 848.6, 850.0, .52, 1.5, .55), FRZ(X, 849.5, .52, .55, 1.6, target=(.54, .56))],
 'd6': [V(X, 1104.2, 1108.3, .82), FRZ(X, 1106.0, .86, .42, 1.25, target=(.84, .27))],
 'o':  [V(X, 1140, 1145, .5), V('L', 67.1, 68.5, .52), V('L', 40.4, 42.3, .45)],
}
ND = 6
HOOK = ('6 ДЕТАЛЕЙ', 'GTA 6')

segs = json.load(open(os.path.join(ROOT, 'script.json'))); t = 0.0
for i, s in enumerate(segs):
    a = json.load(open(os.path.join(ROOT, 'tts', s['id'] + '.json'))); s['al'] = a; s['atext'] = ''.join(a['characters'])
    s['spoken'] = a['character_end_times_seconds'][-1]
    s['rs'] = t; s['t0'] = t + (LEAD if i == 0 else 0.05); t = s['t0'] + s['spoken'] + GAP; s['re'] = t
segs[-1]['re'] += TAIL; TOTAL = segs[-1]['re']; NF = int(TOTAL * FPS)

# frame allocation: videos play in real time; freeze frames take the remaining time of the segment
shots = []
for s in segs:
    sh = PLAN[s['id']]; f0, f1 = round(s['rs'] * FPS), min(NF, round(s['re'] * FPS)); need = f1 - f0
    vid = [round((x['b'] - x['a']) * FPS) if x['k'] == 'V' else 0 for x in sh]; nfz = sum(1 for x in sh if x['k'] == 'F')
    minfz = sum(round(0.9 * FPS) for x in sh if x['k'] == 'F'); sv = sum(vid)
    if nfz and sv + minfz <= need:
        rest = need - sv; hold = sum(x['hold'] for x in sh if x['k'] == 'F')
        fr = [v if x['k'] == 'V' else round(rest * x['hold'] / hold) for x, v in zip(sh, vid)]
    else:
        w = [v if x['k'] == 'V' else round(0.9 * FPS) for x, v in zip(sh, vid)]; tw = sum(w); fr = [max(8, round(need * a / tw)) for a in w]
    fr[-1] += need - sum(fr); f = f0
    for x, n in zip(sh, fr):
        x.update(seg=s['id'], f0=f, n=n, t=f / FPS, end=(f + n) / FPS); shots.append(x); f += n
        if x['k'] == 'V' and n / FPS > (x['b'] - x['a']) * 1.25: print('WARN slow x%.2f' % (n / FPS / (x['b'] - x['a'])), s['id'], x['a'])

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

def crop_of(x):
    fn, ay, ah0 = SRC[x['src']]; ah = int(ah0 / x['zoom']) // 2 * 2; cw = int(ah * 9 / 16) // 2 * 2
    y0 = ay + int(min(max(x['cy'] * ah0 - ah / 2, 0), ah0 - ah)); x0 = int(min(max(x['cx'] * 3840 - cw / 2, 0), 3840 - cw))
    return fn, cw, ah, x0, y0

def build_clips():
    files = []
    for i, x in enumerate(shots):
        out = os.path.join(CL, f's{i:03d}.mp4'); files.append(out); n = x['n']; dur = n / FPS; fn, cw, ah, x0, y0 = crop_of(x)
        enc = ['-an', '-c:v', 'libx264', '-preset', 'fast', '-crf', '14', '-pix_fmt', 'yuv420p', '-r', str(FPS), '-frames:v', str(n), out]
        grade = f"eq=contrast=1.07:saturation=1.18:gamma={x['g']}"
        if x['k'] == 'F':
            png = os.path.join(CL, f's{i:03d}.png')
            subprocess.check_call(['ffmpeg', '-v', 'error', '-y', '-ss', f"{x['a']:.3f}", '-i', os.path.join(TR, fn), '-frames:v', '1',
                                   '-vf', f'crop={cw}:{ah}:{x0}:{y0},scale=1296:2304:flags=lanczos,{grade},unsharp=5:5:0.6', png])
            im = Image.open(png).convert('RGB')
            p = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-'] + enc, stdin=subprocess.PIPE)
            for k in range(n):
                z = 1.0 + 0.10 * ease(k / max(1, n - 1) * 1.0); cw2, ch2 = 1296 / 1.2 / z * 1.2 / 1.0, 2304 / z
                cw2 = 1296 / z; p.stdin.write(im.transform((W, H), Image.EXTENT, ((1296 - cw2) / 2, (2304 - ch2) / 2, (1296 + cw2) / 2, (2304 + ch2) / 2), Image.BICUBIC).tobytes())
            p.stdin.close(); p.wait()
        else:
            use = min(x['b'] - x['a'], dur); kf = dur / use
            zoom = f"scale=w='2*trunc({W / 2}*(1+0.05*t/{dur:.3f}))':h='2*trunc({H / 2}*(1+0.05*t/{dur:.3f}))':eval=frame:flags=bicubic,crop={W}:{H}"
            subprocess.check_call(['ffmpeg', '-v', 'error', '-y', '-ss', f"{x['a']:.3f}", '-t', f'{use:.3f}', '-i', os.path.join(TR, fn),
                                   '-vf', f'crop={cw}:{ah}:{x0}:{y0},scale={W}:{H}:flags=lanczos,setpts={kf:.4f}*PTS,fps={FPS},tpad=stop_mode=clone:stop_duration=1,{zoom},{grade}'] + enc)
    lst = os.path.join(CL, 'list.txt'); open(lst, 'w').write(''.join(f"file '{f}'\n" for f in files))
    subprocess.check_call(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-c', 'copy', os.path.join(ROOT, 'bg.mp4')])

g_ = Image.new('L', (1, H))
for y in range(H):
    tp = max(0, 1 - y / (H * 0.24)); md = max(0, 1 - abs(y - H * 0.655) / (H * 0.12)); bt = max(0, (y - H * 0.82) / (H * 0.18))
    g_.putpixel((0, y), int(255 * min(1, 0.5 * tp ** 1.4 + 0.38 * md + 0.6 * bt)))
SHADE = Image.new('RGBA', (W, H), NAVY + (0,)); SHADE.putalpha(g_.resize((W, H)))
_lg = Image.open(os.path.join(ROOT, '..', 'full', 'logo.png')).convert('RGBA'); LOGO = _lg.resize((int(_lg.width * 140 / _lg.height), 140), Image.LANCZOS)
COVER = Image.open(os.path.join(ROOT, 'cover.jpg')).convert('RGBA') if os.path.exists(os.path.join(ROOT, 'cover.jpg')) else None
DET = [s['id'] for s in segs if s['id'].startswith('d')]

def text_c(d, cx, y, parts, f, sw=14):
    tw = sum(d.textlength(t, font=f) for t, _, _ in parts); x = cx - tw / 2
    for t, c, a in parts:
        d.text((x, y), t, font=f, fill=al(c, a), stroke_width=sw, stroke_fill=al(NAVY, a), anchor='ls'); x += d.textlength(t, font=f)

def overlay(tt):
    if COVER is not None and tt < COVER_T: return COVER
    ov = Image.new('RGBA', (W, H), (0, 0, 0, 0)); ov.alpha_composite(SHADE); ov.alpha_composite(LOGO, (48, 250)); d = ImageDraw.Draw(ov)
    seg = next((s for s in segs if s['rs'] <= tt < s['re']), segs[-1]); u = tt - seg['rs']
    if seg['id'] == 'h':
        u = max(0, u - COVER_T); a = ease(u / 0.18); sc = 0.7 + 0.3 * back(u / 0.3)
        text_c(d, W / 2, 620, [(HOOK[0].split()[0] + ' ', YELLOW, a), (' '.join(HOOK[0].split()[1:]), WHITE, a)], BI(int(170 * sc)), sw=16)
        text_c(d, W / 2, 780, [(HOOK[1], WHITE, a)], BI(int(150 * sc)), sw=14)
    elif seg['id'] in DET:
        a = ease(u / 0.2); k = DET.index(seg['id']) + 1; f = BLACK(64); tx = f'{k}/{ND}'; tw = d.textlength(tx, font=f); x1 = W - 48
        d.rounded_rectangle((x1 - tw - 56, 270, x1, 372), radius=26, fill=al(YELLOW, a)); d.text((x1 - 28 - tw / 2, 321), tx, font=f, fill=al(NAVY, a), anchor='mm')
    else:
        a = ease(u / 0.2); sc = 0.75 + 0.25 * back(u / 0.3)
        text_c(d, W / 2, 640, [('ПОЛНЫЙ ', WHITE, a), ('РАЗБОР', YELLOW, a)], BI(int(108 * sc)), sw=14)
        f = BLACK(70); tx = 'УЖЕ НА КАНАЛЕ'; tw = d.textlength(tx, font=f)
        d.rounded_rectangle((W / 2 - tw / 2 - 44, 692, W / 2 + tw / 2 + 44, 806), radius=26, fill=al(PINK, a)); d.text((W / 2, 749), tx, font=f, fill=al(WHITE, a), anchor='mm')
    sh = next((x for x in shots if x['t'] <= tt < x['end']), None)
    if sh and sh['k'] == 'F':                                  # circle + arrow on the frozen detail (target is at the frame centre)
        ua = tt - sh['t']; a = ease(ua / 0.18); r = int(150 + 60 * (1 - back(ua / 0.3))); fn_, cw_, ah_, x0_, y0_ = crop_of(sh); zz = 1.0 + 0.10 * ease(ua / max(0.01, sh['end'] - sh['t']))
        cx = int(W / 2 + ((sh['target'][0] * 3840 - x0_) / cw_ * W - W / 2) * zz); cy = int(H / 2 + ((sh['target'][1] * 2160 - y0_) / ah_ * H - H / 2) * zz)
        d.ellipse((cx - r - 7, cy - r - 7, cx + r + 7, cy + r + 7), outline=al(WHITE, a), width=26); d.ellipse((cx - r, cy - r, cx + r, cy + r), outline=al(RED, a), width=14)
        b = int(20 * abs(((tt * 2.4) % 1) - 0.5) * 2); x1, y1 = cx - 112 - b, cy - 112 - b; x0, y0 = x1 - 210, y1 - 210
        for wd, col, e in ((50, WHITE, 9), (32, RED, 0)):
            d.line((x0, y0, x1 - 34, y1 - 34), fill=al(col, a), width=wd); d.polygon([(x1 + 30 + e, y1 + 30 + e), (x1 - 86 - e, y1 + 6 + e), (x1 + 6 + e, y1 - 86 - e)], fill=al(col, a))
    for i, c in enumerate(caps):
        t0 = c[0]['t'] - 0.04; nxt = caps[i + 1][0]['t'] - 0.04 if i + 1 < len(caps) else TOTAL; t1 = min(max(c[-1]['e'] + 0.12, t0 + 0.25), nxt)
        if t0 <= tt < t1 or (i == len(caps) - 1 and tt >= t0):
            sc = 0.82 + 0.18 * back((tt - t0) / 0.16); size = int(132 * sc); f = BI(size); txt = [w['w'].upper().strip('.,:—') for w in c]
            while sum(d.textlength(x + ' ', font=f) for x in txt) > W - 90: size -= 4; f = BI(size)
            text_c(d, W / 2, 1300, [(x + (' ' if j < len(txt) - 1 else ''), YELLOW if c[j]['t'] - 0.03 <= tt else WHITE, 1.0) for j, x in enumerate(txt)], f, sw=15)
    for hit in [COVER_T] + [s['rs'] for s in segs[1:]]:
        if 0 <= tt - hit < 0.14: ov.alpha_composite(Image.new('RGBA', (W, H), al(WHITE, 0.5 * (1 - (tt - hit) / 0.14))))
    return ov

if __name__ == '__main__':
    m = sys.argv[1]
    if m == 'clips':
        build_clips(); print('total', round(TOTAL, 2))
        json.dump(dict(total=TOTAL, voice=[(s['id'], s['t0']) for s in segs], hits=[s['rs'] for s in segs[1:]], pops=[x['t'] for x in shots if x['k'] == 'F']), open(os.path.join(ROOT, 'timeline.json'), 'w'))
    elif m == 'still':
        for a in sys.argv[2:]:
            tt = float(a); subprocess.check_call(['ffmpeg', '-v', 'error', '-y', '-ss', f'{tt:.3f}', '-i', os.path.join(ROOT, 'bg.mp4'), '-frames:v', '1', os.path.join(ROOT, 'f.png')])
            Image.alpha_composite(Image.open(os.path.join(ROOT, 'f.png')).convert('RGBA'), overlay(tt)).convert('RGB').resize((360, 640)).save(os.path.join(ROOT, f'still_{tt:06.2f}.jpg'), quality=85)
    elif m == 'render':
        ff = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-i', os.path.join(ROOT, 'bg.mp4'), '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-', '-i', os.path.join(ROOT, 'mix.wav'),
                               '-filter_complex', '[0:v][1:v]overlay=shortest=1[v]', '-map', '[v]', '-map', '2:a', '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p',
                               '-c:a', 'aac', '-b:a', '256k', '-movflags', '+faststart', '-t', f'{TOTAL:.3f}', sys.argv[2]], stdin=subprocess.PIPE)
        for i in range(NF): ff.stdin.write(overlay(i / FPS).tobytes())
        ff.stdin.close(); ff.wait(); print('done', sys.argv[2], round(TOTAL, 2))
