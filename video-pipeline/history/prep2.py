"""Add new official sources to scenes.json (path/crop/dur) and recompute lums.json with per-frame lum, sd, dark fraction, bright fraction (4 fps)."""
import json,subprocess as sp,re,collections,numpy as np
D='../../dl/off/'
NEW=['G3b','G3c','VCb','VCc','SAb','SAc','G4b','G4c','LAD','TBOGT','LCS','VCS','CW','G2','GOL']
SC=json.load(open('scenes.json')); LU=json.load(open('lums.json'))
def crop_of(p):
    out=sp.run(['ffmpeg','-hide_banner','-i',p,'-vf','fps=1,cropdetect=24:2:0','-f','null','-'],capture_output=True,text=True).stderr
    c=collections.Counter(re.findall(r'crop=(\d+:\d+:\d+:\d+)',out)); return [int(v) for v in c.most_common(1)[0][0].split(':')]
for k in NEW:
    p=D+k+'.mp4'; w,h,x,y=crop_of(p); ww=min(w,int(h*16/9)); hh=int(ww*9/16)
    if hh>h: hh=h; ww=int(hh*16/9)
    dur=float(sp.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',p]))
    SC[k]={'path':p,'crop':[ww,hh,x+(w-ww)//2,y+(h-hh)//2],'dur':dur,'scenes':[]}; print(k,SC[k]['crop'],flush=True)
for k,v in SC.items():
    w,h,x,y=v['crop']
    raw=sp.run(['ffmpeg','-v','error','-i',v['path'],'-vf',f'crop={w}:{h}:{x}:{y},scale=160:90,fps=4,format=gray','-f','rawvideo','-'],capture_output=True).stdout
    fr=np.frombuffer(raw,np.uint8).reshape(-1,160*90).astype(float)
    LU[k]={'lum':[round(float(a),1) for a in fr.mean(1)],'sd':[round(float(a),1) for a in fr.std(1)],'dk':[round(float((r<26).mean()),3) for r in fr],'br':[round(float((r>150).mean()),4) for r in fr]}
    print('lum',k,len(fr),flush=True)
json.dump(SC,open('scenes.json','w')); json.dump(LU,open('lums.json','w'))
