"""«История GTA» 10+ min 16:9 — ONLY official footage, no repeated shots, cues synced to narration. usage: python3 build4.py OUT.mp4 [plan]
Sources (scenes.json from prep.py): G1 G3 VC SA G4 G5 G5N RD2 (official trailers uploaded by user), A L T X1-3 (GTA VI official)."""
import sys, os, json, subprocess as sp
from concurrent.futures import ThreadPoolExecutor
sys.path.insert(0,'../doc')
from PIL import Image, ImageDraw, ImageFont
import cover
from cues import CUES, ORDER
cover.W,cover.H=1920,1080
W,H=1920,1080; T='/tmp/claude-0/hist4/'; os.makedirs(T,exist_ok=True)
OUT=sys.argv[1]; PLAN=len(sys.argv)>2 and sys.argv[2]=='plan'
run=lambda *a: sp.run(a,check=True,stderr=sp.DEVNULL)
dur=lambda f: float(sp.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',f]))
SC=json.load(open('scenes.json'))
# scene pointers (mutable copies)
def _merge(sc):
    out=[]
    for a,b,l,sd in sc:
        if l<32 or sd<11 or b-a<1.0: continue
        a2,b2=a+0.15,b-0.2
        if out and abs(out[-1][1]+0.35-a2)<0.05+0.35: out[-1][1]=b2
        else: out.append([a2,b2])
    return out
ST={k:_merge(v['scenes']) for k,v in SC.items()}
PTR={k:0 for k in SC}; POS={k:(ST[k][0][0] if ST[k] else 0) for k in SC}
FB=['T','A','L','G5','RD2','X1','X2','X3','G5N']
POOL={'intro':['T','A','L'],'c1':['G1'],'c2':['G1'],'c3':['T'],'c4':['G3'],'c5':['VC'],'c6':['SA'],'c6r':['VC','SA','G3'],'c7':['VC','SA','G3','G1'],'c8':['G4'],'c9':['G4','G5'],
 'c10':['G5'],'c11':['G5N','G5'],'c11m':['G5N','RD2','G5'],'c12w':['G5N','RD2'],'c12':['G3','VC','SA','T'],'c13':['A'],'c14':['X1','X2','X3','L'],'outro':['L','X1','X2','X3']}
OVR={ # (chapter, phrase) -> source
 ('intro','родилась в маленькой студии в Шотландии'):'G1',('c12w','В первой игре'):'G1',('c12w','В ГТА три'):'G3',('c12w','В Сан-Андреасе'):'SA',('c12w','В ГТА четыре'):'G4',('c12w','в ГТА пять'):'G5',
 ('c12w','следующего шага'):'T',('c13','Второй трейлер'):'T',('c13','Джейсона'):'T',('c13','штат Леониду'):'L',('c13','меняет правила'):'T',('outro','крошечных пикселей'):'G1',('outro','в Шотландии'):'G1',
 ('c11','Рокстар способна'):'RD2',('c6','Но это не помешало'):'SA'}
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
def fill(sid,pref,need):
    out=[]
    for src in ([pref] if pref else [])+POOL[sid]+FB:
        c,need=take(src,need); out+=c
        if need<=0.05: break
    return out,need
def crop_vf(src):
    w,h,x,y=SC[src]['crop']; sharp=',unsharp=5:5:0.6' if src in('G1','SA') else ''
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
GAP=0.3; MIN=1.4; lens={}; jobs=[]; meta=[]; short=[]
for sid in ORDER:
    mp3=f'tts/{sid}.mp3'; D=dur(mp3)+GAP; lens[sid]=D
    a=json.load(open(f'tts/{sid}.json')); txt=''.join(a['characters']).lower(); stt=a['character_start_times_seconds']; times=[]; last=0
    for ph,v in CUES[sid]:
        i=txt.find(ph.lower(),last); last=i; times.append(max(0.0,stt[i]-0.12))
    times[0]=0.0
    for k in range(1,len(times)): times[k]=max(times[k],times[k-1]+MIN)
    keep=[k for k in range(len(times)) if times[k]<D-0.8]; parts=[]
    for n,k in enumerate(keep):
        t0=times[k]; t1=times[keep[n+1]] if n+1<len(keep) else D; d=t1-t0; ph,v=CUES[sid][k]
        if isinstance(v,tuple) and v[0]=='card':
            cp=T+f'{sid}_{k}.png'; card(v[1],v[2],cp); o=T+f'{sid}_{k}.mp4'; parts.append(o); jobs.append(('card',cp,0,d,o)); continue
        if (sid,ph) in FIXED:
            s,t=FIXED[(sid,ph)]; clips=[(s,t,d)]; ST_=None
            o=T+f'{sid}_{k}.mp4'; parts.append(o); jobs.append(('clip',s,t,d,o)); print(sid,ph,'FIXED',s,t) if PLAN else None; continue
        pref=OVR.get((sid,ph)); clips,left=fill(sid,pref,d)
        if left>0.05: short.append((sid,ph,round(left,1)))
        for j,(s,t,l) in enumerate(clips):
            o=T+f'{sid}_{k}_{j}.mp4'; parts.append(o); jobs.append(('clip',s,t,l,o))
        if PLAN: print(sid,ph[:28],'|',' + '.join(f'{s}@{t:.1f}x{l:.1f}' for s,t,l in clips))
    meta.append((sid,parts,D,mp3))
if PLAN:
    print('SHORT',short); print({k:(PTR[k],len(ST[k])) for k in ST}); sys.exit()
with ThreadPoolExecutor(3) as ex: list(ex.map(render,jobs))
segv=[];sega=[]
for sid,parts,D,mp3 in meta:
    v=T+f'{sid}_v.mp4'; segv.append(v)
    open(T+f'{sid}.txt','w').write(''.join(f"file '{p}'\n" for p in parts))
    run('ffmpeg','-y','-f','concat','-safe','0','-i',T+f'{sid}.txt','-t',f'{D:.3f}','-c','copy',v)
    a=T+f'{sid}_a.wav'; run('ffmpeg','-y','-i',mp3,'-af',f'apad=whole_dur={D:.3f}','-t',f'{D:.3f}','-ar','44100','-ac','2',a); sega.append(a)
open(T+'all.txt','w').write(''.join(f"file '{p}'\n" for p in segv)); open(T+'alla.txt','w').write(''.join(f"file '{p}'\n" for p in sega))
run('ffmpeg','-y','-f','concat','-safe','0','-i',T+'alla.txt','-c','copy',T+'voice.wav'); run('ffmpeg','-y','-f','concat','-safe','0','-i',T+'all.txt','-c','copy',T+'video.mp4')
total=dur(T+'video.mp4'); tA=sum(lens[k] for k in ORDER[:11])
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
run('ffmpeg','-y','-i',T+'video.mp4','-i',T+'voice.wav','-i',T+'bedA.wav','-i',T+'bedB.wav','-filter_complex',
 f"[1:a]asplit[vo][sc];[2:a][3:a]acrossfade=d=3[mx];[mx]volume=0.30,afade=t=in:d=1,afade=t=out:st={total-3:.2f}:d=3[m];[m][sc]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=400[md];[vo][md]amix=inputs=2:duration=first:normalize=0[a]",
 '-map','0:v','-map','[a]','-t',f'{total:.2f}','-c:v','libx264','-preset','medium','-crf','20','-maxrate','3500k','-bufsize','7000k','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-movflags','+faststart',OUT)
print(total)
