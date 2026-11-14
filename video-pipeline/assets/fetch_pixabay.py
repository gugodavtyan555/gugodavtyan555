#!/usr/bin/env python3
"""Download Pixabay videos/images (Pixabay Content License) -> dl/pixabay, write assets/CREDITS-pixabay.md.
usage: fetch_pixabay.py   (needs PIXABAY_KEY). Skips items whose tags mention people/faces/brands."""
import os, json, urllib.parse, subprocess
KEY = os.environ['PIXABAY_KEY']; HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.abspath(os.path.join(HERE, '..', '..', 'dl', 'pixabay')); os.makedirs(OUT + '/v', exist_ok=True); os.makedirs(OUT + '/i', exist_ok=True)
BAD = {'people','man','woman','girl','boy','person','portrait','face','couple','child','children','model','crowd','selfie','logo','brand','tesla','ferrari','lamborghini','bmw','mercedes','porsche','ford','chevrolet','audi','mustang','corvette','harley','rolex','nike','coca cola','sign','advertising','tourist','tourists','swimmer','surfer','family','friends','dj','dancing','party'}
VQ = ['miami','miami beach','miami skyline','south beach','florida','florida beach','everglades','swamp','mangrove','alligator','airboat','neon','neon lights','neon city night','palm trees','sports car night','car night city','vintage car','speedboat','yacht','boat ocean','marina','ocean drive','tropical sunset','hurricane','thunderstorm florida']
IQ = ['miami','miami beach','florida','everglades','neon','palm trees sunset','sports car','speedboat','miami skyline','swamp','art deco miami','tropical sunset']
def api(kind, q, **kw):
    u = f"https://pixabay.com/api/{'videos/' if kind == 'v' else ''}?key={KEY}&q={urllib.parse.quote(q)}&per_page=20&safesearch=true&" + urllib.parse.urlencode(kw)
    return json.loads(subprocess.check_output(['curl', '-sS', '-m', '40', u]))['hits']
def ok(h): return not (BAD & {t.strip().lower() for t in h['tags'].split(',')})
def dl(url, path):
    if not os.path.exists(path): subprocess.check_call(['curl', '-sS', '-m', '300', '-L', '-o', path, url])
seen = set(); rows = []
for q in VQ:
    n = 0
    for h in api('v', q):
        if h['id'] in seen or not ok(h) or h['duration'] < 5: continue
        v = h['videos'].get('medium') or h['videos']['small']
        p = f"{OUT}/v/{h['id']}.mp4"; dl(v['url'], p); seen.add(h['id']); n += 1
        rows.append(('video', h['id'], q, h['tags'], h['user'], h['pageURL'], f"{v['width']}x{v['height']}, {h['duration']}s"))
        if n >= 2: break
for q in IQ:
    n = 0
    for h in api('i', q, image_type='photo', orientation='vertical', min_width=1080):
        if h['id'] in seen or not ok(h): continue
        p = f"{OUT}/i/{h['id']}.jpg"; dl(h['largeImageURL'], p); seen.add(h['id']); n += 1
        rows.append(('image', h['id'], q, h['tags'], h['user'], h['pageURL'], f"{h['imageWidth']}x{h['imageHeight']}"))
        if n >= 2: break
with open(f'{HERE}/CREDITS-pixabay.md', 'w') as f:
    f.write('# Credits (Pixabay Content License)\n\nFree for commercial use and edits, no attribution required (credited anyway). Files: dl/pixabay/{v,i}/<id>.*\n'
            'Tags were screened for people/faces/brands; incidental figures possible — see check log in short9/.\n\n')
    for k, i, q, t, u, pg, info in rows: f.write(f"- `{'v' if k=='video' else 'i'}/{i}` ({k}, {info}) — by **{u}** — {pg} — query: {q} — tags: {t}\n")
print(len(rows), 'items')
