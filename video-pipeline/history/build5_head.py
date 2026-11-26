"""«История GTA» 10+ min 16:9 — ONLY official footage, no repeated shots, cues synced to narration. usage: python3 build4.py OUT.mp4 [plan]
Sources (scenes.json from prep.py): G1 G3 VC SA G4 G5 G5N RD2 (official trailers uploaded by user), A L T X1-3 (GTA VI official)."""
import sys, os, json, subprocess as sp
from concurrent.futures import ThreadPoolExecutor
sys.path.insert(0,'../doc')
from PIL import Image, ImageDraw, ImageFont
import cover
from cues import CUES, ORDER
cover.W,cover.H=1920,1080
W,H=1920,1080; T='/tmp/claude-0/hist5/'; os.makedirs(T,exist_ok=True)
OUT=sys.argv[1]; PLAN=len(sys.argv)>2 and sys.argv[2]=='plan'
run=lambda *a: sp.run(a,check=True,stderr=sp.DEVNULL)
dur=lambda f: float(sp.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',f]))
SC=json.load(open('scenes.json'))
# scene pointers (mutable copies)
LU=json.load(open('lums.json'))
def _runs(k):
    l,sd=LU[k]['lum'],LU[k]['sd']; dk=LU[k].get('dk'); br=LU[k].get('br'); ok=[l[i]>=17 and sd[i]>=8 and (i==0 or abs(l[i]-l[i-1])<18) and not (dk and dk[i]>0.55 and br[i]>0.003) for i in range(len(l))]
    out=[]; i=0
    while i<len(ok):
        if ok[i]:
            j=i
            while j+1<len(ok) and ok[j+1]: j+=1
            a,b=i*0.25+0.2,(j+1)*0.25-0.25
            if b-a>=0.9: out.append([a,b])
            i=j+1
        else: i+=1
    return out
EXCL={'G1':[(0,1.6),(19.5,24.2),(34.4,40.6),(50.9,55.6),(61.4,67.6),(84,99)],'G3':[(0,8.7),(18.0,22.5),(43.4,44.8),(52.4,54.2),(58.4,73)],
 'VC':[(0,7.4),(9.0,13.4),(14.8,16.2),(19.4,24.0),(64.4,75)],'SA':[(0,7.6),(9.0,13.6),(61.4,66)],'G4':[(0,1.6),(4.0,5.4),(11.5,13.5),(32.4,34.2),(47.0,63)],
 'G5':[(0,6.6),(11.5,16.2),(27.0,31.6),(71.4,85)],'G5N':[(0,7.6),(11.9,13.6),(19.4,22.5),(29.9,31.5),(32.9,36.5),(39.4,43.5),(49.4,56.0),(67.4,71)],
 'RD2':[(0,8.0),(51.5,53.8),(57.0,69)],'T':[(0,4.0),(68.5,77),(152.5,160)],'A':[(0,2.5),(14.0,18.4),(39.0,41.8),(56.5,59.5),(76.5,90)],'L':[(0,1.6),(14.0,17.8),(21.0,25.5),(76.5,90)]}
def _sub(runs,ex):
    out=[]
    for a,b in runs:
        segs=[(a,b)]
        for x0,x1 in ex:
            nxt=[]
            for p,q in segs:
                if x1<=p or x0>=q: nxt.append((p,q))
                else:
                    if x0-p>=0.9: nxt.append((p,x0-0.1))
                    if q-x1>=0.9: nxt.append((x1+0.1,q))
            segs=nxt
        out+=[list(t) for t in segs]
    return out
AUTO={k:[(0,6.0),(SC[k]['dur']-7.0,SC[k]['dur'])] for k in ['G3b','G3c','VCb','VCc','SAb','SAc','G4b','G4c','LAD','TBOGT','LCS','VCS','CW','G2','GOL']}
ST={k:_sub(_runs(k),EXCL.get(k,[])+AUTO.get(k,[])) for k in SC}
PTR={k:0 for k in SC}; POS={k:(ST[k][0][0] if ST[k] else 0) for k in SC}
FB=['T','A','L','G5','RD2','X1','X2','X3','G5N']
POOL={'intro':['T','A','L'],'c1':['G1'],'c2':['G1','G2'],'c3':['T'],'c4':['G3','G3b','G3c'],'c5':['VC','VCb','VCc'],'c6':['SA','SAb','SAc'],'c6r':['VCc','SAc','G3c','VCb'],
 'c7':['LCS','VCS','CW'],'c8':['G4','G4b','G4c'],'c9':['LAD','TBOGT'],'c10':['G5'],'c11':['GOL','G5N'],'c11m':['G5N','RD2','GOL'],'c12w':['G5N','RD2'],'c12':['G3c','VCc','SAc','T'],
 'c13':['A'],'c14':['X1','X2','X3','L'],'outro':['L','X2','X3']}
OVR={ # (chapter, phrase) -> source
 ('intro','родилась в маленькой студии в Шотландии'):'G1',('c12w','В первой игре'):'G1',('c12w','В ГТА три'):'G3',('c12w','В Сан-Андреасе'):'SA',('c12w','В ГТА четыре'):'G4',('c12w','в ГТА пять'):'G5',
 ('c12w','следующего шага'):'T',('c13','Второй трейлер'):'T',('c13','Джейсона'):'T',('c13','штат Леониду'):'L',('c13','меняет правила'):'T',('outro','крошечных пикселей'):'G1',('outro','в Шотландии'):'G1',
 ('c11','Рокстар способна'):'RD2',('c6','Но это не помешало'):'SA',('c2','недалёком будущем'):'G2',('c2','в девяносто девятом'):'G2',('c9','глазами других героев'):'TBOGT',('c9','несколько историй'):'TBOGT',('c7','стилем комикса'):'CW',('c7','на маленьком экране'):'VCS'}
FIXED={('intro','вышла ГТА шесть'):('L',24),('c14','этот день наступил'):('L',78),('outro','новые разборы'):('L',81)}
def take(src,need):
    clips=[]; st=ST[src]
    while need>0.05 and PTR[src]<len(st):
        a,b=st[PTR[src]]; pos=max(POS[src],a); room=b-pos
        if room<0.8: PTR[src]+=1; 
        else:
            use=min(need,room); clips.append((src,pos,use)); need-=use; POS[src]=pos+use
            if b-POS[src]<0.8: PTR[src]+=1
        if PTR[src]<len(st): POS[src]=max(POS[src],st[PTR[src]][0])
    return clips,need
OLD={'c1','c2','c4','c5','c6','c6r','c7','c8','c9','c10','c11'}
def fill(sid,pref,need):
    out=[]
    for src in ([pref] if pref else [])+POOL[sid]+([] if sid in OLD else FB):
        c,need=take(src,need); out+=c
        if need<=0.05: break
    return out,need
def crop_vf(src):
    w,h,x,y=SC[src]['crop']; sharp=',unsharp=5:5:0.6' if w<700 else ''
    return f"crop={w}:{h}:{x}:{y},scale={W}:{H}:flags=lanczos{sharp},fps=30"
FD='/usr/share/fonts/opentype/inter/InterDisplay-Black.otf'
def card(big,sub,path):
    im=cover.vgrad((W,H),[(22,8,52),(96,34,150),(235,80,160)]).convert('RGBA'); d=ImageDraw.Draw(im)
    for r,a in ((330,40),(250,60),(190,90)): d.ellipse((W//2-r,700-r,W//2+r,700+r),fill=(255,170,60,a))
    for i in range(-12,13): d.line((W//2+i*40,760,W//2+i*260,H),fill=(255,120,220,90),width=2)
    for k in range(8): y=760+int((k/8)**2*320); d.line((0,y,W,y),fill=(255,120,220,80),width=2)
    cover.text3d(im,470,big,240,[(255,255,255),(225,215,255),(150,130,235)],maxw=W-160)
    if sub:
        s=62; f=ImageFont.truetype(FD,s)
        while d.textlength(sub,font=f)>W-160 and s>30: s-=2; f=ImageFont.truetype(FD,s)
        d.text((W//2,720),sub,font=f,fill=(255,235,120),anchor='mm',stroke_width=8,stroke_fill=(20,8,48))
    im.convert('RGB').save(path)
def render(job):
    kind,a,b,c,o=job
    if os.path.exists(o): return
    if kind=='card':
        n=int(c*30)+1
        run('ffmpeg','-y','-loop','1','-i',a,'-vf',f"scale=3840:2160,zoompan=z='min(1.0+0.0004*on,1.2)':d={n}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s={W}x{H}:fps=30",'-t',f'{c:.3f}','-an','-c:v','libx264','-preset','veryfast','-crf','17','-pix_fmt','yuv420p',o)
    else:
        run('ffmpeg','-y','-ss',f'{b:.2f}','-t',f'{c:.3f}','-i',SC[a]['path'],'-vf',crop_vf(a),'-an','-c:v','libx264','-preset','veryfast','-crf','17','-pix_fmt','yuv420p',o)
