#!/usr/bin/env python3
"""Split-screen Short 'GTA 6 vs real Miami' (1080x1920): top = official GTA VI footage (fresh shots from footage.py pick),
bottom = open-licence Pixabay clips/photos (dl/pixabay, see assets/CREDITS-pixabay.md). usage: make.py clips | audio | still T... | render OUT"""
import json, os, re, subprocess, sys, wave
import numpy as np
from PIL import Image, ImageDraw, ImageFont
ROOT = os.path.dirname(os.path.abspath(__file__)); DL = os.path.join(ROOT, '..', '..', 'dl'); TR = DL + '/trailers'; PX = DL + '/pixabay'
CL = ROOT + '/clips'; os.makedirs(CL, exist_ok=True)
W, H, HH, FPS, GAP, LEAD, TAIL = 1080, 1920, 960, 30, 0.18, 0.5, 0.5
FD = '/usr/share/fonts/opentype/inter/'; _f = {}
def BI(s): return _f.setdefault(('bi', s), ImageFont.truetype(FD + 'InterDisplay-BlackItalic.otf', s))
def BK(s): return _f.setdefault(('bk', s), ImageFont.truetype(FD + 'InterDisplay-Black.otf', s))
PINK, YELLOW, NAVY, WHITE = (255, 62, 150), (255, 222, 40), (14, 8, 30), (255, 255, 255)
SRC = {'A': ('GTAVI_Trailer_1.mp4', 0, 2160), 'X': ('GTAVI_An_Extended_Look.mp4', 0, 2160), 'T': ('GTAVI_Trailer_2.mp4', 216, 1512), 'L': ('GTAVI_Launch_Trailer.mp4', 120, 1800)}
# GTA shots: ALL from `footage.py pick` (fresh, <15 % overlap with earlier videos). (src, a, b, cx)
G = [('X', 478.82, 481.32, .16), ('X', 1017.35, 1019.57, .21), ('X', 1083.52, 1086.02, .58), ('X', 1067.62, 1069.87, .6), ('X', 729.28, 731.53, .16),
     ('X', 1026.38, 1028.88, .58), ('X', 686.18, 688.68, .67), ('X', 564.95, 567.45, .16), ('X', 1147.48, 1149.98, .84),
     ('T', 76.82, 79.02, .49), ('T', 66.35, 68.55, .83), ('T', 99.82, 102.02, .78), ('T', 129.52, 131.72, .67),
     ('L', 21.32, 23.52, .54), ('L', 15.32, 17.52, .47), ('L', 73.95, 76.15, .5),
     ('A', 50.05, 52.07, .44), ('A', 11.08, 13.28, .54), ('A', 70.42, 72.62, .16), ('A', 57.48, 59.43, .5),
     ('X', 1088.72, 1091.02, 0.58), ('X', 688.78, 691.08, 0.67), ('X', 691.38, 693.68, 0.67), ('X', 1560.42, 1562.72, 0.16), ('X', 932.42, 934.72, 0.46), ('X', 919.42, 921.72, 0.46), ('X', 1151.32, 1153.62, 0.39), ('X', 853.22, 855.52, 0.49), ('X', 935.02, 937.32, 0.46), ('X', 698.75, 701.05, 0.82), ('X', 1080.15, 1082.45, 0.84), ('X', 929.82, 932.12, 0.46), ('X', 868.82, 871.12, 0.49), ('X', 708.45, 710.75, 0.77)]
# real-world clips per segment (Pixabay ids; v = video, i = photo)
R = {'h': ['v205873', 'v144820', 'v137425'], 's1': ['i979238', 'v6474', 'v169443', 'v144820'], 's2': ['v81359', 'v216720', 'v83831', 'v47336'],
     's3': ['v6474', 'v42410', 'i979238', 'v137425'], 's4': ['v205225', 'v114445', 'v223461', 'v206272'], 's5': ['i979238', 'v137425', 'v6474', 'v42410'], 's6': ['v205225', 'v114445', 'v206272', 'v144820'], 'o': ['v206272', 'v183960', 'v169443']}
CARDS = {'s1': ('НЕОН И ПАЛЬМЫ', 'ВАЙС-СИТИ vs МАЙАМИ'), 's2': ('БОЛОТА', 'ГРАССРИВЕР vs ЭВЕРГЛЕЙДС'), 's3': ('МАШИНЫ', 'ПРОБКИ, СПОРТКАРЫ, РЕТРО'), 's4': ('ЛОДКИ', 'АЭРОЛОДКИ, КАТЕРА, ЯХТЫ'), 's5': ('ОУШЕН-БИЧ', 'АРТ-ДЕКО vs САУТ-БИЧ'), 's6': ('ЛЕОНИДА-КИС', 'МОСТЫ И ОСТРОВА vs ФЛОРИДА-КИС')}
HOOK = ('GTA 6', 'vs РЕАЛЬНЫЙ МАЙАМИ')
segs = json.load(open(ROOT + '/script.json')); t = 0.0
for i, s in enumerate(segs):
    a = json.load(open(f'{ROOT}/tts/{s["id"]}.json')); s['al'] = a; s['atext'] = ''.join(a['characters']); s['spoken'] = a['character_end_times_seconds'][-1]
    s['rs'] = t; s['t0'] = t + (LEAD if i == 0 else 0.05); t = s['t0'] + s['spoken'] + GAP; s['re'] = t
segs[-1]['re'] += TAIL; TOTAL = segs[-1]['re']; NF = int(TOTAL * FPS)
shots = []; gi = 0
for s in segs:
    f0, f1 = round(s['rs'] * FPS), min(NF, round(s['re'] * FPS)); n = max(2, round((f1 - f0) / FPS / 2.6)); base = (f1 - f0) // n; f = f0
    for k in range(n):
        m = (f1 - f) if k == n - 1 else base; g = G[gi]; gi += 1
        shots.append(dict(seg=s['id'], f0=f, n=m, g=g, r=R[s['id']][k % len(R[s['id']])], k=k)); f += m
assert gi <= len(G)

def build_clips():
    files = []
    for i, x in enumerate(shots):
        out = f'{CL}/s{i:03d}.mp4'; files.append(out); dur = x['n'] / FPS; src, a, b, cx = x['g']; fn, ay, ah0 = SRC[src]
        cw = int(ah0 * 9 / 8) // 2 * 2; x0 = int(min(max(cx * 3840 - cw / 2, 0), 3840 - cw)); sp = (b - a) / dur
        top = f'[0:v]crop={cw}:{ah0}:{x0}:{ay},scale={W}:{HH}:flags=lanczos,setpts={sp:.4f}*PTS,fps={FPS},eq=contrast=1.07:saturation=1.15,trim=end={dur:.3f},setpts=PTS-STARTPTS[t]'
        rin = []; kind, rid = x['r'][0], x['r'][1:]
        if kind == 'v':
            p = f'{PX}/v/{rid}.mp4'; d = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p])); ss = min(max(0, d - dur - .2), (x['k'] * 3.1) % max(.1, d))
            rin = ['-ss', f'{ss:.2f}', '-i', p]
            bot = f'[1:v]scale={W}:{HH}:force_original_aspect_ratio=increase,crop={W}:{HH},fps={FPS},eq=saturation=1.12,trim=end={dur:.3f},setpts=PTS-STARTPTS[b]'
        else:
            rin = ['-loop', '1', '-framerate', str(FPS), '-t', f'{dur:.3f}', '-i', f'{PX}/i/{rid}.jpg']
            bot = f"[1:v]scale=1620:-1,crop=1620:1440:0:(ih-1440)/2,zoompan=z='1+0.12*on/{x['n']}':d=1:s={W}x{HH}:fps={FPS},eq=saturation=1.12,trim=end={dur:.3f},setpts=PTS-STARTPTS[b]"
        subprocess.check_call(['ffmpeg', '-v', 'error', '-y', '-ss', f'{a:.3f}', '-t', f'{b - a:.3f}', '-i', f'{TR}/{fn}'] + rin +
                              ['-filter_complex', f'{top};{bot};[t][b]vstack[v]', '-map', '[v]', '-an', '-c:v', 'libx264', '-preset', 'fast', '-crf', '15', '-pix_fmt', 'yuv420p', '-frames:v', str(x['n']), out])
    open(f'{CL}/list.txt', 'w').write(''.join(f"file '{f}'\n" for f in files))
    subprocess.check_call(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', f'{CL}/list.txt', '-c', 'copy', ROOT + '/bg.mp4'])

def build_audio():
    SR = 44100; N = int(TOTAL * SR); v = np.zeros((N, 2))
    for s in segs:
        raw = subprocess.check_output(['ffmpeg', '-v', 'error', '-i', f'{ROOT}/tts/{s["id"]}.mp3', '-f', 's16le', '-ac', '2', '-ar', str(SR), '-'])
        x = np.frombuffer(raw, '<i2').reshape(-1, 2) / 32768; i = int(s['t0'] * SR); n = min(len(x), N - i); v[i:i + n] += x[:n]
    tt = np.arange(N) / SR; m = np.zeros(N); beat = 60 / 108
    for ci, ch in enumerate([(220, 261.6, 329.6), (174.6, 220, 261.6), (196, 246.9, 293.7), (164.8, 207.7, 246.9)] * 20):
        a, b = int(ci * 4 * beat * SR), int((ci + 1) * 4 * beat * SR)
        if a >= N: break
        b = min(b, N); u = tt[a:b] - tt[a]; env = np.minimum(1, u / .3) * np.minimum(1, (tt[b - 1] - tt[a:b] + .3) / .3)
        for fr in ch: m[a:b] += np.sin(2 * np.pi * fr * u) * .5 * env + np.sin(2 * np.pi * fr * 2.003 * u) * .15 * env
    k = np.zeros(N)
    for bt in np.arange(0, TOTAL, beat):
        i = int(bt * SR); u = np.arange(min(int(.25 * SR), N - i)) / SR; k[i:i + len(u)] += np.sin(2 * np.pi * (50 + 90 * np.exp(-u * 30)) * u) * np.exp(-u * 12)
    m = (m / max(1e-6, np.abs(m).max()) * .5 + k * .6); env = np.abs(v).max(1); duck = 1 - .6 * np.convolve(env > .03, np.ones(2205) / 2205, 'same')
    mix = v * 1.0 + np.stack([m * duck * .16] * 2, 1); mix = np.tanh(mix * 1.1) * .92
    with wave.open(ROOT + '/mix.wav', 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype('<i2').tobytes())

words = []
for s in segs:
    ch, st, en = s['al']['characters'], s['al']['character_start_times_seconds'], s['al']['character_end_times_seconds']; skip = [False] * len(ch)
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
def ease(x): x = min(1, max(0, x)); return 1 - (1 - x) ** 3
def back(x): x = min(1, max(0, x)); c = 1.70158; return 1 + (c + 1) * (x - 1) ** 3 + c * (x - 1) ** 2
def al(c, a): return c + (int(255 * min(1, max(0, a))),)
def text_c(d, cx, y, parts, f, sw=14):
    tw = sum(d.textlength(t, font=f) for t, _, _ in parts); x = cx - tw / 2
    for t, c, a in parts: d.text((x, y), t, font=f, fill=al(c, a), stroke_width=sw, stroke_fill=al(NAVY, a), anchor='ls'); x += d.textlength(t, font=f)
def pill(d, x, y, tx, bg, fg, a=1.0, size=46):
    f = BK(size); tw = d.textlength(tx, font=f); d.rounded_rectangle((x, y, x + tw + 44, y + size + 36), radius=22, fill=al(bg, a)); d.text((x + 22, y + (size + 36) / 2), tx, font=f, fill=al(fg, a), anchor='lm')
def fit(d, tx, size, wmax, fn=BI):
    while d.textlength(tx, font=fn(size)) > wmax and size > 30: size -= 4
    return fn(size)
def overlay(tt):
    ov = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(ov); seg = next((s for s in segs if s['rs'] <= tt < s['re']), segs[-1]); u = tt - seg['rs']
    d.rectangle((0, HH - 5, W, HH + 5), fill=al(PINK, 1)); pill(d, 36, 40, 'GTA 6', PINK, WHITE); pill(d, 36, HH + 96, 'РЕАЛЬНЫЙ КАДР', YELLOW, NAVY, 1.0, 34)
    def bar(l1, l2, a, sc=1.0):
        f1 = fit(d, l1, int(78 * sc), W - 90, BI); f2 = fit(d, l2, 44, W - 130, BK); w1 = d.textlength(l1, font=f1); w2 = d.textlength(l2, font=f2); ww = max(w1, w2) + 80
        d.rounded_rectangle((W / 2 - ww / 2, HH - 78, W / 2 + ww / 2, HH + 78), radius=30, fill=al(NAVY, .86 * a), outline=al(PINK, a), width=6)
        d.text((W / 2, HH - 22), l1, font=f1, fill=al(YELLOW, a), anchor='mm'); d.text((W / 2, HH + 44), l2, font=f2, fill=al(WHITE, a), anchor='mm')
    a_ = ease(u / .2)
    if seg['id'] == 'h': bar('GTA 6', 'vs РЕАЛЬНЫЙ МАЙАМИ', a_, 1.25)
    elif seg['id'] in CARDS: bar(*CARDS[seg['id']], a_)
    else: bar('ПОЛНЫЙ РАЗБОР', 'УЖЕ НА КАНАЛЕ', a_)
    for i, c in enumerate(caps):
        t0 = c[0]['t'] - .04; nxt = caps[i + 1][0]['t'] - .04 if i + 1 < len(caps) else TOTAL; t1 = min(max(c[-1]['e'] + .12, t0 + .25), nxt)
        if t0 <= tt < t1 or (i == len(caps) - 1 and tt >= t0):
            sc = .82 + .18 * back((tt - t0) / .16); f = fit(d, ' '.join(w['w'].upper() for w in c), int(120 * sc), W - 90); txt = [w['w'].upper().strip('.,:—') for w in c]
            text_c(d, W / 2, H - 205, [(x + (' ' if j < len(txt) - 1 else ''), YELLOW if c[j]['t'] - .03 <= tt else WHITE, 1.0) for j, x in enumerate(txt)], f, sw=14)
    for hit in [s['rs'] for s in segs[1:]]:
        if 0 <= tt - hit < .14: ov.alpha_composite(Image.new('RGBA', (W, H), al(WHITE, .5 * (1 - (tt - hit) / .14))))
    return ov
if __name__ == '__main__':
    m = sys.argv[1]
    if m == 'clips': build_clips(); print('total', round(TOTAL, 2), 'shots', len(shots))
    elif m == 'audio': build_audio()
    elif m == 'still':
        for a in sys.argv[2:]:
            tt = float(a); subprocess.check_call(['ffmpeg', '-v', 'error', '-y', '-ss', f'{tt:.3f}', '-i', ROOT + '/bg.mp4', '-frames:v', '1', ROOT + '/f.png'])
            Image.alpha_composite(Image.open(ROOT + '/f.png').convert('RGBA'), overlay(tt)).convert('RGB').resize((360, 640)).save(f'{ROOT}/still_{tt:06.2f}.jpg', quality=85)
    elif m == 'render':
        ff = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-i', ROOT + '/bg.mp4', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-', '-i', ROOT + '/mix.wav',
                               '-filter_complex', '[0:v][1:v]overlay=shortest=1[v]', '-map', '[v]', '-map', '2:a', '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p',
                               '-c:a', 'aac', '-b:a', '256k', '-movflags', '+faststart', '-t', f'{TOTAL:.3f}', sys.argv[2]], stdin=subprocess.PIPE)
        for i in range(NF): ff.stdin.write(overlay(i / FPS).tobytes())
        ff.stdin.close(); ff.wait(); print('done', sys.argv[2], round(TOTAL, 2))
