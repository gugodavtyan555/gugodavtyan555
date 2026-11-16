"""Vertical background from never-used official screenshots (slow pans) + a few unused gameplay shots."""
import os, sys, json, glob, subprocess
from concurrent.futures import ThreadPoolExecutor
from PIL import Image
ROOT = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, ROOT); sys.argv = ['x', 'none']
import detail as D
S = os.path.join(ROOT, '..'); IMG = S + '/dl/img'; REPO = '/workspace/gugodavtyan555/video-pipeline'; W, H, FPS = 1080, 1920, 30
txt = ''.join(open(f, encoding='utf-8', errors='replace').read() for f in glob.glob(REPO + '/**/*.py', recursive=True))
usedmap = {os.path.basename(x['src']) for x in json.load(open(S + '/map/shots.json'))}
def unused(p): return [os.path.basename(f)[:-4] for f in sorted(glob.glob(f'{IMG}/{p}*.jpg')) if os.path.basename(f)[:-4] not in txt and os.path.basename(f)[:-4] not in usedmap]
imgs = unused('Jason_and_Lucia_') + unused('Jason_Duval_') + unused('Lucia_Caminos_') + unused('Vice_City_') + unused('Leonida_Keys_') + unused('Grassrivers_')
fresh = json.load(open(S + '/map/fresh.json')); game = [fresh[i] for i in (58, 59, 50)]
print('unused screenshots', len(imgs)); os.makedirs(ROOT + '/clips', exist_ok=True)
jobs = []; gi = 0; ii = 0
for s in D.segs:
    f0, f1 = round(s['rs'] * FPS), min(D.NF, round(s['re'] * FPS)); n = max(1, round((f1 - f0) / FPS / 3.3)); base = (f1 - f0) // n; f = f0
    for k in range(n):
        m = (f1 - f) if k == n - 1 else base
        if s['id'] in ('h', 'o') and k == 1 and gi < len(game): jobs.append(('vid', game[gi], m)); gi += 1
        else: jobs.append(('img', imgs[ii % len(imgs)], m)); ii += 1
        f += m
print('shots', len(jobs), 'images used', ii, 'repeat' if ii > len(imgs) else 'no repeats')
ENC = ['-an', '-c:v', 'libx264', '-preset', 'fast', '-crf', '15', '-pix_fmt', 'yuv420p', '-r', str(FPS)]
def make(a):
    i, (kind, it, n) = a; out = f'{ROOT}/clips/s{i:03d}.mp4'
    if kind == 'vid':
        src, x, y, cx = it; dur = n / FPS; use = min(y - x, dur); cw = 1214; x0 = int(min(max(cx * 3840 - cw / 2, 0), 3840 - cw))
        subprocess.check_call(['ffmpeg', '-v', 'error', '-y', '-ss', f'{x:.3f}', '-t', f'{use:.3f}', '-i', f'{S}/dl/trailers/GTAVI_An_Extended_Look.mp4', '-vf',
                               f'crop={cw}:2160:{x0}:0,scale={W}:{H}:flags=lanczos,setpts={dur / use:.4f}*PTS,fps={FPS},tpad=stop_mode=clone:stop_duration=1,eq=contrast=1.07:saturation=1.16'] + ENC + ['-frames:v', str(n), out]); return out
    im = Image.open(f'{IMG}/{it}.jpg').convert('RGB'); im = im.resize((int(im.width * 2304 / im.height), 2304), Image.LANCZOS); iw = im.width
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-'] + ENC + ['-frames:v', str(n), out], stdin=subprocess.PIPE)
    span = min(900, iw - 1296 - 40); c0 = iw / 2 - span / 2; c1 = iw / 2 + span / 2
    if i % 2: c0, c1 = c1, c0
    for k in range(n):
        u = k / max(1, n - 1); z = 1.0 + 0.08 * u; cw, ch = 1296 / z, 2304 / z; cx = c0 + (c1 - c0) * u
        p.stdin.write(im.transform((W, H), Image.EXTENT, (cx - cw / 2, (2304 - ch) / 2, cx + cw / 2, (2304 + ch) / 2), Image.BICUBIC).tobytes())
    p.stdin.close(); p.wait(); return out
with ThreadPoolExecutor(3) as ex: files = list(ex.map(make, enumerate(jobs)))
open(ROOT + '/clips/list.txt', 'w').write(''.join(f"file '{f}'\n" for f in files))
subprocess.check_call(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', ROOT + '/clips/list.txt', '-c', 'copy', ROOT + '/bg.mp4'])
json.dump(dict(total=D.TOTAL, voice=[(s['id'], s['t0']) for s in D.segs], hits=[s['rs'] for s in D.segs[1:]]), open(ROOT + '/timeline.json', 'w')); print('bg ok', round(D.TOTAL, 2), jobs[0][1], imgs[:3])
