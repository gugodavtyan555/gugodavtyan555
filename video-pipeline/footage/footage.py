#!/usr/bin/env python3
"""Shot library for the official GTA VI footage: catalog scenes, scan which source seconds were already used in
earlier videos, and pick FRESH shots so videos do not repeat the same footage.

  python3 footage.py catalog X A T L            build catalog.json (needs the *_1080.mp4 proxies; set FOOTAGE_DIR)
  python3 footage.py used                       how much of each source is already used
  python3 footage.py pick X 12 [--len 3] [--seed 1] [--min-luma 55] [--after S] [--before S]
        -> prints ready-to-paste shots  V(X, a, b, cx)  that overlap earlier videos by < 15 %
Sources: X = An Extended Look (27 min gameplay), A = Trailer 1, T = Trailer 2, L = Launch Trailer.
"""
import sys, os, re, json, glob, random, subprocess
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
CAT = os.path.join(HERE, 'catalog.json')
PROXY = {'X': 'GTAVI_An_Extended_Look_1080.mp4', 'A': 'GTAVI_Trailer_1_1080.mp4', 'T': 'GTAVI_Trailer_2_1080.mp4', 'L': 'GTAVI_Launch_Trailer_1080.mp4'}
# letterbox crop filter, analysis size, width fraction of a 9:16 window
GEO = {'X': ('', 480, 270, 0.3164), 'A': ('', 480, 270, 0.3164), 'T': ('crop=iw:ih*0.8:0:ih*0.1,', 480, 216, 0.253), 'L': ('crop=iw:ih*0.8889:0:ih*0.0556,', 480, 240, 0.281)}

def folder(): return os.environ.get('FOOTAGE_DIR') or sys.exit('set FOOTAGE_DIR to the folder with the *_1080.mp4 proxies')

def catalog(src):
    path = os.path.join(folder(), PROXY[src]); crop, W, H, frac = GEO[src]
    dur = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path]).strip())
    out = subprocess.run(['ffmpeg', '-hide_banner', '-i', path, '-vf', f"{crop}scale={W}:{H},select='gt(scene,0.25)',showinfo", '-f', 'null', '-'], capture_output=True, text=True).stderr
    cuts = [float(x) for x in re.findall(r'pts_time:([0-9.]+)', out)]
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', path, '-vf', f'fps=1,{crop}scale={W}:{H},format=gray', '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], stdout=subprocess.PIPE)
    luma, motion, cols = [], [], []; prev = None
    while True:
        buf = p.stdout.read(W * H)
        if len(buf) < W * H: break
        g = np.frombuffer(buf, np.uint8).reshape(H, W).astype(np.float32)
        e = (np.abs(np.diff(g, axis=1))[:-1, :] + np.abs(np.diff(g, axis=0))[:, :-1]).sum(0)
        luma.append(float(g.mean())); motion.append(float(np.abs(g - prev).mean()) if prev is not None else 0.0); cols.append(e); prev = g
    p.wait(); win = max(8, int(W * frac)); scenes = []
    bounds = [0.0] + cuts + [dur]
    for a, b in zip(bounds, bounds[1:]):
        if b - a < 0.8: continue
        i0, i1 = int(a), max(int(a) + 1, int(b))
        i1 = min(i1, len(luma)); i0 = min(i0, i1 - 1) if i1 > 0 else 0
        e = np.sum(cols[i0:i1], axis=0); c = np.convolve(e, np.ones(win), 'valid'); cx = (int(np.argmax(c)) + win / 2) / W
        scenes.append({'a': round(a, 2), 'b': round(b, 2), 'luma': round(float(np.mean(luma[i0:i1])), 1), 'motion': round(float(np.mean(motion[i0:i1])), 2), 'cx': round(float(cx), 2)})
    return {'duration': round(dur, 1), 'scenes': scenes}

def load(): return json.load(open(CAT)) if os.path.exists(CAT) else {}

PAT = re.compile(r"(?<![A-Za-z_])['\"]?([ATLX])['\"]?\s*,\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)")
def used_ranges():
    used = {k: [] for k in PROXY}
    for f in glob.glob(os.path.join(ROOT, '**', '*.py'), recursive=True):
        if os.path.abspath(f) == os.path.abspath(__file__): continue
        for m in PAT.finditer(open(f, encoding='utf-8', errors='replace').read()):
            s, a, b = m.group(1), float(m.group(2)), float(m.group(3))
            if 0 < b - a <= 60: used[s].append((a, b))
    return used

def merge(rs):
    out = []
    for a, b in sorted(rs):
        if out and a <= out[-1][1]: out[-1][1] = max(out[-1][1], b)
        else: out.append([a, b])
    return out

def overlap(a, b, rs):
    return sum(max(0.0, min(b, y) - max(a, x)) for x, y in rs) / max(1e-6, b - a)

def pick(src, seconds, length=3.0, seed=1, min_luma=55.0, after=0.0, before=1e9):
    cat = load().get(src); used = merge(used_ranges()[src]); rnd = random.Random(seed)
    if not cat: sys.exit(f'no catalog for {src}: run catalog first')
    cand = []
    for s in cat['scenes']:
        if s['luma'] < min_luma or s['a'] < after or s['b'] > before: continue
        t = s['a'] + 0.15
        while t + length * 0.8 <= s['b'] - 0.1 and len(cand) < 100000:
            b = min(t + length, s['b'] - 0.1)
            if overlap(t, b, used) < 0.15:
                cand.append((0.5 * s['motion'] / 6 + 0.3 * s['luma'] / 255 + 0.4 * rnd.random(), round(t, 2), round(b, 2), s['cx']))
            t += length + 0.3
            break                              # one window per scene keeps variety
    cand.sort(reverse=True); got = 0.0; res = []
    for sc, a, b, cx in cand:
        if got >= seconds: break
        res.append((a, b, cx)); got += b - a
    return res, sum(b - a for a, b in merge(used_ranges()[src])), cat['duration']

if __name__ == '__main__':
    m = sys.argv[1]
    if m == 'catalog':
        cat = load()
        for s in (sys.argv[2:] or list(PROXY)): cat[s] = catalog(s); print(s, len(cat[s]['scenes']), 'scenes', flush=True)
        json.dump(cat, open(CAT, 'w')); print('saved', CAT)
    elif m == 'used':
        cat = load()
        for s, rs in used_ranges().items(): print(s, round(sum(b - a for a, b in merge(rs)), 1), 's used of', cat.get(s, {}).get('duration', '?'))
    elif m == 'pick':
        a = sys.argv; src = a[2]; secs = float(a[3]); kw = {}
        for i, x in enumerate(a):
            if x == '--len': kw['length'] = float(a[i + 1])
            if x == '--seed': kw['seed'] = int(a[i + 1])
            if x == '--min-luma': kw['min_luma'] = float(a[i + 1])
            if x == '--after': kw['after'] = float(a[i + 1])
            if x == '--before': kw['before'] = float(a[i + 1])
        res, used_s, tot = pick(src, secs, **kw)
        print(f'# {src}: {used_s:.0f}s of {tot:.0f}s already used; {len(res)} fresh shots')
        for x, y, cx in res: print(f'V({src}, {x}, {y}, {cx})')
