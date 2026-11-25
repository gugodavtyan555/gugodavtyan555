"""Pixabay b-roll for the history documentary (16:9). -> ../../dl/hist/{v,i}, credits.md"""
import os, json, urllib.parse, subprocess, sys
KEY=os.environ['PIXABAY_KEY']; OUT=os.path.abspath('../../dl/hist'); os.makedirs(OUT+'/v',exist_ok=True); os.makedirs(OUT+'/i',exist_ok=True)
BAD={'people','man','woman','girl','boy','person','portrait','face','couple','child','children','model','crowd','selfie','logo','brand','tesla','ferrari','lamborghini','bmw','mercedes','porsche'}
Q={'c1':['retro arcade','vintage computer','old video game','scotland city','retro gaming'],'c2':['new york skyline','brooklyn bridge','miami beach','las vegas strip','san francisco bridge'],
   'c3':['new york night','statue of liberty','manhattan'],'c4':['los angeles skyline','hollywood','santa monica','sports car city night']}
def api(kind,q):
    u=f"https://pixabay.com/api/{'videos/' if kind=='v' else ''}?key={KEY}&q={urllib.parse.quote(q)}&per_page=15&safesearch=true"+('&orientation=horizontal&min_width=1920' if kind=='i' else '')
    return json.loads(subprocess.check_output(['curl','-sS','-m','40',u]))['hits']
ok=lambda h: not (BAD & {t.strip().lower() for t in h['tags'].split(',')})
rows=[]
for ch,qs in Q.items():
    for q in qs:
        n=0
        for h in api('v',q):
            if not ok(h) or h['duration']<5: continue
            v=h['videos'].get('large') if h['videos'].get('large',{}).get('url') else h['videos']['medium']
            if v['width']<1280: continue
            p=f"{OUT}/v/{ch}_{h['id']}.mp4"
            if not os.path.exists(p): subprocess.check_call(['curl','-sS','-m','300','-L','-o',p,v['url']])
            rows.append((ch,'video',h['id'],q,h['user'],h['pageURL'])); n+=1
            if n>=2: break
        n=0
        for h in api('i',q):
            if not ok(h): continue
            p=f"{OUT}/i/{ch}_{h['id']}.jpg"
            if not os.path.exists(p): subprocess.check_call(['curl','-sS','-m','120','-L','-o',p,h['largeImageURL']])
            rows.append((ch,'image',h['id'],q,h['user'],h['pageURL'])); n+=1
            if n>=1: break
open('credits.md','w').write('# Pixabay credits (Pixabay Content License)\n'+''.join(f'- {r[0]} {r[1]} {r[2]} "{r[3]}" by {r[4]} — {r[5]}\n' for r in rows)); print(len(rows))
