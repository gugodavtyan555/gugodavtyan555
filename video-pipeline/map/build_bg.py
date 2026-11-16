#!/usr/bin/env python3
"""Background builder: fills every narration segment with never-used pictures (fresh official footage, unused official
screenshots, open-licence stock) following VIS recipes. Writes bg.mp4 + shots.json. usage: build_bg.py [dry]"""
import os, sys, json, glob, re, subprocess
from concurrent.futures import ThreadPoolExecutor
from PIL import Image
ROOT = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, ROOT)
import engine as E
from plan_map import VIS
DL = os.path.join(ROOT, '..', 'dl'); IMG = DL + '/img'; TR = DL + '/trailers'; PX = DL + '/px2/c'; WM = os.path.join(ROOT, '..', 'assets', 'pack')
REPO = '/workspace/gugodavtyan555/video-pipeline'; CL = ROOT + '/clips'; os.makedirs(CL, exist_ok=True)
W, H, FPS = 1920, 1080, 30
SRC = {'X': ('GTAVI_An_Extended_Look.mp4', 'null'), 'A': ('GTAVI_Trailer_1.mp4', 'null'), 'T': ('GTAVI_Trailer_2.mp4', 'crop=3072:1728:384:216'), 'L': ('GTAVI_Launch_Trailer.mp4', 'crop=3412:1920:214:120')}
fresh = json.load(open(ROOT + '/fresh.json')); stock = json.load(open(ROOT + '/stock.json'))
def F(*idx): return [('vid', fresh[i][0], fresh[i][1], fresh[i][2]) for i in idx]
def ST(*idx): return [('stock', stock[i]['id']) for i in idx]
def WI(*pre): return [('wimg', f) for p in pre for f in sorted(glob.glob(f'{WM}/{p}_*.jpg'))[:1]]
# official screenshots that no earlier video used
txt = ''.join(open(f, encoding='utf-8', errors='replace').read() for f in glob.glob(REPO + '/**/*.py', recursive=True) if '/map/' not in f)
def unused(prefix):
    out = []
    for f in sorted(glob.glob(f'{IMG}/{prefix}*.jpg')):
        n = os.path.basename(f)[:-4]; short = n.replace('ULTIMATE_EDITION_', '').replace('VINTAGE_VICE_CITY_', '')
        if n in txt or (short != n and f"'{short}'" in txt): continue
        out.append(n)
    return out
def IM(names, var=0): return [('img', n, var) for n in names]
vci = unused('Vice_City_')
POOLS = {
 'G': F(16, 51, 20, 63, 22, 53, 18, 64, 55, 23, 65, 68, 61, 49, 43, 31, 24, 26, 4, 5, 82, 83, 52, 54, 56, 17, 19, 21, 57, 58, 59, 50, 42, 44, 32),
 'Gn': F(73, 74, 75), 'Ga': F(80), 'Gmural': F(67), 'TV': F(14, 12, 15, 13), 'LOGO': [('vid', 'A', 82.0, 84.9)],
 'VCI': IM(vci), 'KI': IM(unused('Leonida_Keys_')) + IM(unused('Leonida_Keys_'), 1), 'GI': IM(unused('Grassrivers_')) + IM(unused('Grassrivers_'), 1),
 'PI': IM(unused('Port_Gellhorn_')) + IM(unused('Port_Gellhorn_'), 1), 'AI': IM(unused('Ambrosia_')) + IM(unused('Ambrosia_'), 1), 'MI': IM(unused('Mount_Kalaga_')) + IM(unused('Mount_Kalaga_'), 1),
 'CH': IM(unused('Jason_and_Lucia_') + unused('Jason_Duval_1') + unused('Lucia_Caminos_1')),
 'UE': IM(unused('ULTIMATE_EDITION_SQUALO') + unused('ULTIMATE_EDITION_VAPID_BUGGY') + unused('VINTAGE_VICE_CITY_PACK_VAPID_STANIER') + unused('ULTIMATE_EDITION_SAFEHOUSE') + unused('ULTIMATE_EDITION_GOODTIME') + unused('ULTIMATE_EDITION_GROTTI') + unused('ULTIMATE_EDITION_WYMAN')),
 'Wsky': WI('004', '006', '007', '002', '008'), 'Wdeco': WI('019', '024', '018', '026', '025', '023'), 'Whav': WI('037', '041', '046', '043', '044'), 'Wman': WI('054', '050', '052'),
 'Sk': ST(22, 20, 21, 23, 26, 27), 'Sreef': ST(28, 29, 33), 'Sg': ST(35, 34, 43), 'Sgat': ST(38, 39), 'Sfl': ST(40, 41), 'Sher': ST(44, 45),
 'Sship': ST(10, 13, 12), 'Smar': ST(0, 18, 19), 'Smural': ST(15), 'Snight': ST(16),
 'Sp': ST(46, 50, 51, 53), 'Sdirt': ST(56, 55), 'Sa': ST(57, 60, 66, 59, 65, 63, 67), 'Sm': ST(72, 69, 70, 71, 75, 76, 73), 'Sflat': ST(79),
}
FALLCH = {1: ['VCI', 'G', 'Wdeco', 'Whav', 'Wsky', 'Smar', 'CH'], 2: ['KI', 'Sk', 'Sreef'], 3: ['GI', 'Sg', 'Sher', 'Wman', 'Sfl', 'Sgat'], 4: ['PI', 'Sp', 'Sdirt'], 5: ['AI', 'Sa'], 6: ['MI', 'Sm', 'Sflat']}
FALL = ['VCI', 'G', 'CH', 'UE']
def draw(pool, ch=0):
    for p in [pool] + FALLCH.get(ch, FALL) + FALL + ['KI', 'GI', 'MI']:
        if POOLS.get(p): return POOLS[p].pop(0)
    raise SystemExit('out of pictures')
def nominal(it): return (it[3] - it[2]) if it[0] == 'vid' else (4.2 if it[0] == 'stock' else 3.8)

shots = []; warn = []
for s in E.segs:
    f0, f1 = round(s['rs'] * FPS), min(E.NF, round(s['re'] * FPS)); need = (f1 - f0) / FPS; items = []
    for tok in VIS[s['id']].split():
        m = re.match(r'([A-Za-z]+)(\d+)', tok)
        for _ in range(int(m.group(2))): items.append(draw(m.group(1), s['ch']))
    while sum(nominal(i) for i in items) < need - 2.5: items.append(draw('_none', s['ch']))          # fill long segments from the chapter's own pools
    while len(items) > 1 and sum(nominal(i) for i in items[:-1]) > need - 0.8: POOLS.setdefault('_back', []); items.pop()
    fixed = sum(nominal(i) for i in items if i[0] == 'vid'); flex = [i for i in items if i[0] != 'vid']
    per = (need - fixed) / len(flex) if flex else 0
    if flex and not (2.3 <= per <= 7.2): warn.append((s['id'], round(per, 1), len(items)))
    f = f0
    for k, it in enumerate(items):
        n = f1 - f if k == len(items) - 1 else round((nominal(it) if it[0] == 'vid' else per) * FPS)
        n = max(12, n); shots.append(dict(seg=s['id'], it=it, f0=f, n=n, kind='real' if it[0] in ('stock', 'wimg') else ('game' if it[0] == 'vid' else 'shot'))); f += n
    if f != f1: shots[-1]['n'] += f1 - f
for i, sh in enumerate(shots): sh['i'] = i
tot = sum(s['n'] for s in shots); print('shots', len(shots), 'frames', tot, 'of', E.NF, 'kinds', {k: round(sum(s['n'] for s in shots if s['kind'] == k) / FPS) for k in ('game', 'shot', 'real')}, 'warn', warn)
print('left', {k: len(v) for k, v in POOLS.items() if v})
json.dump([dict(t=s['f0'] / FPS, end=(s['f0'] + s['n']) / FPS, kind=s['kind'], seg=s['seg'], src=str(s['it'][1])) for s in shots], open(ROOT + '/shots.json', 'w'))
if len(sys.argv) > 1 and sys.argv[1] == 'dry': sys.exit()

ENC = ['-an', '-c:v', 'libx264', '-preset', 'fast', '-crf', '16', '-pix_fmt', 'yuv420p', '-r', str(FPS)]
def make(sh):
    import hashlib; out = f"{CL}/c{hashlib.md5(repr((sh['it'], sh['n'], sh['i'] % 2)).encode()).hexdigest()[:12]}.mp4"; n = sh['n']
    dur = n / FPS; it = sh['it']
    if os.path.exists(out) and os.path.getsize(out) > 5000: return out
    zoom = f"scale=w='2*trunc({W / 2}*(1+0.05*t/{dur:.3f}))':h='2*trunc({H / 2}*(1+0.05*t/{dur:.3f}))':eval=frame:flags=bicubic,crop={W}:{H}"
    if it[0] == 'vid':
        fn, crop = SRC[it[1]]; use = min(it[3] - it[2], dur); kf = dur / use
        subprocess.check_call(['ffmpeg', '-v', 'error', '-y', '-ss', f'{it[2]:.3f}', '-t', f'{use:.3f}', '-i', f'{TR}/{fn}', '-vf',
                               f'{crop},scale={W}:{H}:flags=lanczos,setpts={kf:.4f}*PTS,fps={FPS},tpad=stop_mode=clone:stop_duration=1,{zoom},eq=contrast=1.06:saturation=1.14'] + ENC + ['-frames:v', str(n), out])
    elif it[0] == 'stock':
        kf = max(1.0, dur / 8.2)
        subprocess.check_call(['ffmpeg', '-v', 'error', '-y', '-ss', '0.4', '-i', f'{PX}/{it[1]}.mp4', '-vf', f'setpts={kf:.4f}*PTS,fps={FPS},tpad=stop_mode=clone:stop_duration=1,{zoom},eq=saturation=1.08'] + ENC + ['-frames:v', str(n), out])
    else:
        path = f'{IMG}/{it[1]}.jpg' if it[0] == 'img' else it[1]; var = it[2] if it[0] == 'img' else sh['i'] % 2 * 2
        im = Image.open(path).convert('RGB'); iw, ih = im.size
        if iw / ih > 16 / 9: x = (iw - ih * 16 / 9) / 2; im = im.crop((int(x), 0, int(iw - x), ih))
        else: y = (ih - iw * 9 / 16) * 0.4; im = im.crop((0, int(y), iw, int(y + iw * 9 / 16)))
        im = im.resize((2688, 1512), Image.LANCZOS); p = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-'] + ENC + ['-frames:v', str(n), out], stdin=subprocess.PIPE)
        for k in range(n):
            u = k / max(1, n - 1)
            if var == 0: z = 1.03 + 0.13 * u; px, py = .5, .45                      # push in
            elif var == 1: z = 1.38; px, py = (.18 + .64 * u) if sh['i'] % 2 else (.82 - .64 * u), .5   # detail pan
            else: z = 1.17 - 0.13 * u; px, py = .5, .5                              # pull out
            cw, ch = 2688 / z, 1512 / z; x0, y0 = (2688 - cw) * px, (1512 - ch) * py
            p.stdin.write(im.transform((W, H), Image.EXTENT, (x0, y0, x0 + cw, y0 + ch), Image.BICUBIC).tobytes())
        p.stdin.close(); p.wait()
    return out
with ThreadPoolExecutor(3) as ex: files = list(ex.map(make, shots))
open(CL + '/list.txt', 'w').write(''.join(f"file '{f}'\n" for f in files))
subprocess.check_call(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', CL + '/list.txt', '-c', 'copy', ROOT + '/bg.mp4']); print('bg ok')
