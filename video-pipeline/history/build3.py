"""«История GTA» 10+ min 16:9, visuals synced to narration cues (cues.py). usage: python3 build3.py OUT.mp4 [only_ids...]"""
import sys, os, json, subprocess as sp
from concurrent.futures import ThreadPoolExecutor
sys.path.insert(0,'../doc')
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import cover
from cues import CUES, ORDER
cover.W,cover.H=1920,1080
W,H=1920,1080; HS='../../dl/hist/'; S='../../dl/src/'; T='/tmp/claude-0/hist3/'; os.makedirs(T,exist_ok=True)
OUT=sys.argv[1]; ONLY=sys.argv[2:]
run=lambda *a: sp.run(a,check=True,stderr=sp.DEVNULL)
dur=lambda f: float(sp.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',f]))
LST=[l.split()[1] for l in open('nlist.txt').read().splitlines()]
SRC={'A':S+'GTAVI_Trailer_1.mp4','L':S+'GTAVI_Launch_Trailer.mp4'}
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
def resolve(v,tag):
    if isinstance(v,int): return ('s',HS+LST[v],0.5)
    if v[0] in ('A','L'): return ('s',SRC[v[0]],v[1])
    if v[0]=='H': return ('s',HS+v[1],0.5)
    cp=T+f'{tag}.png'; card(v[1],v[2],cp); return ('s',cp,0)
def vf(p):
    pre="crop=iw:ih*0.8889:0:ih*0.0556," if p==SRC['L'] else ""
    return pre+f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},fps=30"
def shot(a):
    p,st,d,o=a
    if os.path.exists(o): return
    if p.endswith('.jpg') or p.endswith('.png'):
        n=int(d*30)+1; z='0.0006' if p.endswith('.jpg') else '0.0004'
        run('ffmpeg','-y','-loop','1','-i',p,'-vf',f"scale=3840:2160:force_original_aspect_ratio=increase,crop=3840:2160,zoompan=z='min(1.0+{z}*on,1.2)':d={n}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s={W}x{H}:fps=30",'-t',f'{d:.3f}','-an','-c:v','libx264','-preset','veryfast','-crf','17','-pix_fmt','yuv420p',o)
    else:
        run('ffmpeg','-y','-stream_loop','-1','-ss',str(st),'-i',p,'-t',f'{d:.3f}','-vf',vf(p),'-an','-c:v','libx264','-preset','veryfast','-crf','17','-pix_fmt','yuv420p',o)
GAP=0.3; MIN=1.4; lens={}; jobs=[]; meta=[]
for sid in ORDER:
    mp3=f'tts/{sid}.mp3'; D=dur(mp3)+GAP; lens[sid]=D
    a=json.load(open(f'tts/{sid}.json')); txt=''.join(a['characters']).lower(); st=a['character_start_times_seconds']; times=[]; last=0
    for ph,v in CUES[sid]:
        i=txt.find(ph.lower(),last); last=i; times.append(max(0.0,st[i]-0.12))
    times[0]=0.0
    for k in range(1,len(times)): times[k]=max(times[k],times[k-1]+MIN)
    keep=[k for k in range(len(times)) if times[k]<D-0.8]; 
    parts=[]
    for n,k in enumerate(keep):
        t0=times[k]; t1=times[keep[n+1]] if n+1<len(keep) else D; d=t1-t0
        kind,p,s=resolve(CUES[sid][k][1],f'{sid}_{k}'); o=T+f'{sid}_{k}.mp4'; parts.append(o)
        if not ONLY or sid in ONLY: jobs.append((p,s,d,o))
    meta.append((sid,parts,D,mp3))
with ThreadPoolExecutor(3) as ex: list(ex.map(shot,jobs))
segv=[];sega=[]
for sid,parts,D,mp3 in meta:
    v=T+f'{sid}_v.mp4'; segv.append(v)
    if not ONLY or sid in ONLY:
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
