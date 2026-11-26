"""«История GTA» 10+ min 16:9 — ONLY official footage, no repeated shots, cues synced to narration. usage: python3 build4.py OUT.mp4 [plan]
Sources (scenes.json from prep.py): G1 G3 VC SA G4 G5 G5N RD2 (official trailers uploaded by user), A L T X1-3 (GTA VI official)."""
import sys, os, json, subprocess as sp
from concurrent.futures import ThreadPoolExecutor
sys.path.insert(0,'../doc')
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import cover
from cues import CUES, ORDER
cover.W,cover.H=1920,1080
W,H=1920,1080; T='/tmp/claude-0/hist5/'; os.makedirs(T,exist_ok=True)
OUT=sys.argv[1]; PLAN=len(sys.argv)>2 and sys.argv[2]=='plan'
run=lambda *a: sp.run(a,check=True,stderr=sp.DEVNULL)
dur=lambda f: float(sp.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',f]))
SC=json.load(open('scenes.json')); SC['G3d']['crop']=[1344,756,288,108]
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
 'RD2':[(0,8.0),(51.5,53.8),(57.0,69)],'T':[(0,4.0),(68.5,77),(152.5,160)],'A':[(0,2.5),(14.0,18.4),(39.0,41.8),(56.5,59.5),(76.5,90)],'L':[(0,1.6),(14.0,17.8),(21.0,25.5),(76.5,90)],
 'G3b':[(0,999)],'G3c':[(0,10.2),(14.0,17.5),(55.5,61)],'VCb':[(0,0.6),(3.5,10.8),(55.5,61)],'VCc':[(0,10.5),(55.5,61)],'SAb':[(0,8.2),(9.5,13.5),(59.5,66)],
 'SAc':[(0,11),(27.5,36),(53,60)],'G4b':[(0,6),(55.5,64)],'G4c':[(0,5.5),(69.5,78)],'LAD':[(0,14),(17,19.5),(41.5,44),(59.5,68)],'TBOGT':[(0,15.5),(77,86.2)],
 'LCS':[(0,15),(17,19.5),(62,68)],'VCS':[(0,3.8),(11.5,14),(57,65)],'CW':[(0,10),(21.5,24),(29.5,34),(47,53)],'G2':[(0,2.2),(26.5,31)],'GOL':[(0,9.5),(11.5,14),(53.5,62)],
 'G1b':[(0,9),(89.5,99)],'G2b':[(0,0.5),(5.5,9.2),(11.5,15.2),(20.5,24),(29.5,33),(41.5,45),(47.5,57),(71.5,75),(77.5,81),(86.5,90),(92.5,99.5),(110,117)],'G2c':[(0,3.5),(61.5,68)],
 'LON':[(0,3.5),(26.5,30),(32.5,37)],'G3d':[(0,3.6),(8.0,13.5),(15.8,17.5),(23.5,27.5),(31.5,43)],'G5b':[(0,0.5),(8.5,12.5),(17,21),(26,29.8),(53,61)],'G5c':[(2.5,6.5),(8.5,15.5),(20,29.2)],
 'GOLb':[(0,9.5),(17,20),(23,29.5),(44,47.5),(53,65.5)],'GOLc':[(0,3.5),(8,11.5),(50.5,60.5)],'G4d':[(0,999)]}
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
ST={k:_sub(_runs(k),EXCL.get(k,[])) for k in SC}
RES={}
for _k in ['G1','G3','SA','G4','G5','G5N']:   # footage reserved for the 'world growth' recap chapter (c12w)
    if not ST[_k]: continue
    keep=3.5; RES[_k]=[]
    while keep>0.05 and ST[_k]:
        a_,b_=ST[_k][-1]
        if b_-a_<=keep+0.9: RES[_k].insert(0,[a_,b_]); keep-=(b_-a_); ST[_k].pop()
        else: RES[_k].insert(0,[b_-keep,b_]); ST[_k][-1][1]=b_-keep-0.1; keep=0
RPTR={k:0 for k in RES}; RPOS={k:RES[k][0][0] for k in RES if RES[k]}
PTR={k:0 for k in SC}; POS={k:(ST[k][0][0] if ST[k] else 0) for k in SC}
FB=['T','A','L','G5','RD2','X1','X2','X3','G5N']
POOL={'intro':['T','A','L'],'c1':['G1b','G1'],'c2':['G1','G1b','G2b','G2c','LON'],'c3':['G2c','G2b','LON'],'c4':['G3','G3c','G3d'],'c5':['VC','VCc'],'c6':['SA','SAc','SAb'],'c6r':['G3c','SAb','VCc','G4c','VCb'],
 'c7':['VCS','CW','LCS'],'c8':['G4','G4b'],'c9':['LAD','TBOGT'],'c10':['G5b','G5c','G5'],'c11':['GOLb','GOLc','GOL'],'c11m':['G5N','GOLc','GOL','G5b','T'],'c12w':['G5','G5N','T'],'c12':['G3c','VCc','SAc','T'],
 'c13':['A'],'c14':['X1','X2','X3','L'],'outro':['L','X2','X3']}
OVR={ # (chapter, phrase) -> source
 ('intro','родилась в маленькой студии в Шотландии'):'G1',('c12w','В первой игре'):'G1',('c12w','В ГТА три'):'G3',('c12w','В Сан-Андреасе'):'SA',('c12w','В ГТА четыре'):'G4',('c12w','в ГТА пять'):'G5',
 ('c12w','следующего шага'):'T',('c13','Второй трейлер'):'T',('c13','Джейсона'):'T',('c13','штат Леониду'):'L',('c13','меняет правила'):'T',('outro','крошечных пикселей'):'G1',('outro','в Шотландии'):'G1',
 ('c11','Рокстар способна'):'RD2',('c6','Но это не помешало'):'SA',('c9','глазами других героев'):'TBOGT',('c9','несколько историй'):'TBOGT',('c7','стилем комикса'):'CW',('c7','на маленьком экране'):'VCS',('c2','например Лондон'):'LON',('c2','Позже вышли дополнения'):'LON',('c2','недалёком будущем'):'G2c',('c2','в девяносто девятом'):'G2b',('c11','две тысячи восемнадцатом'):'RD2'}
FIXED={('intro','вышла ГТА шесть'):('L',24),('c14','этот день наступил'):('L',78),('outro','новые разборы'):('L',81)}
def take_res(src,need):
    clips=[]; st=RES.get(src,[])
    while need>0.05 and RPTR.get(src,0)<len(st):
        a,b=st[RPTR[src]]; pos=max(RPOS[src],a); room=b-pos
        if room<0.5: RPTR[src]+=1; continue
        use=min(need,room); clips.append((src,pos,use)); need-=use; RPOS[src]=pos+use
        if b-RPOS[src]<0.5:
            RPTR[src]+=1
            if RPTR[src]<len(st): RPOS[src]=st[RPTR[src]][0]
    return clips,need
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
        c,need=(take_res(src,need) if sid=='c12w' and src in RES else take(src,need)); out+=c
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

# ---- main (appended to build5_head.py) ----
import numpy as np, wave
SFX='../../dl/sfx/'
def plate_png(big,sub,path):
    im=Image.new('RGBA',(W,H),(0,0,0,0)); d=ImageDraw.Draw(im); x=110
    s=152; f=ImageFont.truetype(FD,s)
    while d.textlength(big,font=f)>W-2*x and s>50: s-=4; f=ImageFont.truetype(FD,s)
    y=H-250
    sh=Image.new('RGBA',(W,H),(0,0,0,0)); ImageDraw.Draw(sh).text((x,y),big,font=f,fill=(0,0,0,255),anchor='ls',stroke_width=16,stroke_fill=(0,0,0,255)); im.alpha_composite(sh.filter(ImageFilter.GaussianBlur(8)))
    d.text((x,y),big,font=f,fill=(255,255,255),anchor='ls',stroke_width=7,stroke_fill=(20,8,48))
    if sub:
        s2=56; f2=ImageFont.truetype(FD,s2)
        while d.textlength(sub,font=f2)>W-2*x-60 and s2>26: s2-=2; f2=ImageFont.truetype(FD,s2)
        tw=d.textlength(sub,font=f2); d.rounded_rectangle((x,y+22,x+tw+60,y+22+92),radius=20,fill=(236,40,140)); d.text((x+30,y+22+46),sub,font=f2,fill=(255,255,255),anchor='lm')
    im.save(path)
def badge(path):
    im=Image.new('RGBA',(W,H),(0,0,0,0)); d=ImageDraw.Draw(im); f=ImageFont.truetype(FD,40); t='GTA ГИД'; tw=d.textlength(t,font=f)
    x1=W-60; x0=x1-tw-50; d.rounded_rectangle((x0,50,x1,120),radius=16,fill=(110,40,190,235)); d.text(((x0+x1)/2,86),t,font=f,fill=(255,255,255),anchor='mm'); im.save(path)
def filler(title,path):
    card(title,'',path)
names0={'c1':'1995','c2':'1997'}; FILL={}; GAP=0.3; MIN=1.4; PIECE=2.0; lens={}; jobs=[]; meta=[]; cutlog=[]; fills=0
badge(T+'badge.png')
for sid in ORDER:
    mp3=f'tts/{sid}.mp3'; D=dur(mp3)+GAP; lens[sid]=D
    a=json.load(open(f'tts/{sid}.json')); txt=''.join(a['characters']).lower(); stt=a['character_start_times_seconds']; times=[]; last=0
    for ph,v in CUES[sid]:
        i=txt.find(ph.lower(),last); last=i; times.append(max(0.0,stt[i]-0.12))
    times[0]=0.0
    for k in range(1,len(times)): times[k]=max(times[k],times[k-1]+MIN)
    keep=[k for k in range(len(times)) if times[k]<D-0.8]; parts=[]; events=[]; cuts=[]; tcur=0.0; pi=0; lastcard=(names0.get(sid,''),'')
    for n,k in enumerate(keep):
        t0=times[k]; t1=times[keep[n+1]] if n+1<len(keep) else D; ph,v=CUES[sid][k]
        if isinstance(v,tuple) and v[0]=='card': events.append((t0,v[1],v[2])); lastcard=(v[1],v[2])
        need=t1-t0; npc=max(1,round(need/PIECE)); pdur=need/npc
        for j in range(npc):
            o=T+f'{sid}_{k}_{j}.mp4'
            if (sid,ph) in FIXED:
                s_,t_=FIXED[(sid,ph)]; jobs.append(('clip',s_,t_,pdur,o,pi)); parts.append(o)
            else:
                pref=OVR.get((sid,ph)); clips,left=fill(sid,pref,pdur)
                if left>0.05:
                    if isinstance(v,tuple) and v[0]=='card' and events and events[-1][0]==t0: events.pop()
                    fp=T+f'{sid}_{k}_{j}_f.png'; card(lastcard[0],lastcard[1],fp); fills+=1; FILL[sid]=FILL.get(sid,0)+left
                for q,(s_,t_,l_) in enumerate(clips):
                    oo=T+f'{sid}_{k}_{j}_{q}.mp4'; jobs.append(('clip',s_,t_,l_,oo,pi)); parts.append(oo)
                if left>0.05:
                    oo=T+f'{sid}_{k}_{j}_fill.mp4'; jobs.append(('card',fp,0,left,oo,pi)); parts.append(oo)
            cuts.append(t0+j*pdur); pi+=1
    meta.append((sid,parts,D,mp3,events,cuts))
print('fillers',fills,{k:round(v,1) for k,v in FILL.items()}); import sys as _s; _s.exit() if os.environ.get('PLANONLY') else None
def render2(job):
    kind,a,b,c,o,pi=job
    if os.path.exists(o): return
    z0,z1=(1.0,1.08) if pi%2==0 else (1.08,1.0)
    zf=f"scale=w='trunc({W}*({z0}+({z1}-{z0})*t/{c:.3f})/2)*2':h=-2:eval=frame:flags=bilinear,crop={W}:{H},"
    if kind=='card':
        n=int(c*30)+1
        run('ffmpeg','-y','-loop','1','-i',a,'-vf',f"scale=3840:2160,zoompan=z='min(1.0+0.0005*on,1.2)':d={n}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s={W}x{H}:fps=30",'-t',f'{c:.3f}','-an','-c:v','libx264','-preset','veryfast','-crf','17','-pix_fmt','yuv420p',o)
    else:
        w,h,x,y=SC[a]['crop']; sharp=',unsharp=5:5:0.6' if w<700 else ''
        vf=f"crop={w}:{h}:{x}:{y},scale={W}:{H}:flags=lanczos{sharp},fps=30,"+zf.rstrip(',')
        run('ffmpeg','-y','-ss',f'{b:.2f}','-t',f'{c:.3f}','-i',SC[a]['path'],'-vf',vf,'-an','-c:v','libx264','-preset','veryfast','-crf','17','-pix_fmt','yuv420p',o)
with ThreadPoolExecutor(3) as ex: list(ex.map(render2,jobs))
segv=[];sega=[];sfx_ev=[];off=0.0
for sid,parts,D,mp3,events,cuts in meta:
    v=T+f'{sid}_v.mp4'; segv.append(v)
    open(T+f'{sid}.txt','w').write(''.join(f"file '{p}'\n" for p in parts))
    base=T+f'{sid}_b.mp4'; run('ffmpeg','-y','-f','concat','-safe','0','-i',T+f'{sid}.txt','-t',f'{D:.3f}','-c','copy',base)
    ins=['-i',base,'-loop','1','-t',f'{D:.3f}','-i',T+'badge.png']; fc='[0:v][1:v]overlay=0:0[v0];'; last='v0'
    for e,(t0,big,sub) in enumerate(events):
        pp=T+f'{sid}_pl{e}.png'; plate_png(big,sub,pp); ins+=['-loop','1','-t',f'{D:.3f}','-i',pp]
        nxt=events[e+1][0] if e+1<len(events) else D; t1=min(D-0.2,t0+3.2,nxt-0.1); fc+=f"[{last}][{e+2}:v]overlay=x=0:y='if(lt(t-{t0:.2f},0.25),70*(1-(t-{t0:.2f})/0.25),0)':enable='between(t,{t0:.2f},{t1:.2f})'[v{e+1}];"; last=f'v{e+1}'
        sfx_ev.append(('impact',off+t0))
    run('ffmpeg','-y',*ins,'-filter_complex',fc.rstrip(';'),'-map',f'[{last}]','-t',f'{D:.3f}','-c:v','libx264','-preset','veryfast','-crf','17','-pix_fmt','yuv420p',v)
    a_=T+f'{sid}_a.wav'; run('ffmpeg','-y','-i',mp3,'-af',f'apad=whole_dur={D:.3f}','-t',f'{D:.3f}','-ar','44100','-ac','2',a_); sega.append(a_)
    for c in cuts: sfx_ev.append(('whoosh',off+c))
    off+=D
open(T+'all.txt','w').write(''.join(f"file '{p}'\n" for p in segv)); open(T+'alla.txt','w').write(''.join(f"file '{p}'\n" for p in sega))
run('ffmpeg','-y','-f','concat','-safe','0','-i',T+'alla.txt','-c','copy',T+'voice.wav'); run('ffmpeg','-y','-f','concat','-safe','0','-i',T+'all.txt','-c','copy',T+'video.mp4')
total=dur(T+'video.mp4'); tA=sum(lens[k] for k in ORDER[:11])
# ---- SFX track
def load(name):
    p=T+name+'.wav'; run('ffmpeg','-y','-i',SFX+name+'.mp3','-ar','44100','-ac','1',p); w=wave.open(p); return np.frombuffer(w.readframes(w.getnframes()),np.int16).astype(float)/32768
wh=[load('whoosh1'),load('whoosh2')[::-1]]; im_=load('impact')
imf=im_.copy(); _n=int(0.02*44100); imf[:_n]*=np.linspace(0,1,_n); imf[-int(0.3*44100):]*=np.linspace(1,0,int(0.3*44100)); SR=44100; tr=np.zeros(int((total+3)*SR))
def put(x,t,g):
    i=int(max(0,t)*SR); e=min(len(tr),i+len(x)); tr[i:e]+=x[:e-i]*g
for n,(k,t) in enumerate(sorted(sfx_ev,key=lambda z:z[1])):
    if k=='whoosh': continue   # per-cut whooshes removed (heard as ticking)
    else: put(imf,t-0.05,0.5)
tr=np.clip(tr,-1,1); w=wave.open(T+'sfx.wav','wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((tr*32767).astype(np.int16).tobytes()); w.close()
names={'intro':'Вступление','c1':'1995: Данди и DMA Design','c2':'1997: первая GTA','c3':'Рождение Rockstar','c4':'2001: GTA III','c5':'2002: Vice City','c6':'2004: San Andreas','c6r':'Радио и сатира','c7':'Портативные части','c8':'2008: GTA IV','c9':'Дополнения к GTA IV','c10':'2013: GTA V','c11':'GTA Online','c11m':'Сообщество и моды','c12w':'Как рос открытый мир','c12':'2021–2022: годы ожидания','c13':'2023: первый трейлер','c14':'2025–2026: переносы и релиз','outro':'Финал'}
t=0; ch=[]
for k in ORDER: ch.append(f"{int(t//60)}:{int(t%60):02d} {names[k]}"); t+=lens[k]
open('chapters.txt','w').write('\n'.join(ch))
M='../../dl/music/'
def bed(track,need,out):
    k=max(int(-(-(need-3)//147)),1); ins=[]
    for _ in range(k): ins+=['-i',M+track]
    if k==1: run('ffmpeg','-y',*ins,'-af',f'atrim=0:{need:.2f}',out); return
    chain=''; last='[0:a]'
    for i in range(1,k): chain+=f'{last}[{i}:a]acrossfade=d=3[x{i}];'; last=f'[x{i}]'
    run('ffmpeg','-y',*ins,'-filter_complex',chain+f'{last}atrim=0:{need:.2f}[o]','-map','[o]',out)
bed('retro.mp3',tA+3,T+'bedA.wav'); bed('epic.mp3',total-tA+3,T+'bedB.wav')
run('ffmpeg','-y','-i',T+'video.mp4','-i',T+'voice.wav','-i',T+'bedA.wav','-i',T+'bedB.wav','-i',T+'sfx.wav','-filter_complex',
 f"[1:a]asplit[vo][sc];[2:a][3:a]acrossfade=d=3[mx];[mx]volume=0.30,afade=t=in:d=1,afade=t=out:st={total-3:.2f}:d=3[m];[m][sc]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=400[md];[vo][md][4:a]amix=inputs=3:duration=first:normalize=0,alimiter=limit=0.89[a]",
 '-map','0:v','-map','[a]','-t',f'{total:.2f}','-c:v','libx264','-preset','medium','-crf','20','-maxrate','3500k','-bufsize','7000k','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-movflags','+faststart',OUT)
print(total)
