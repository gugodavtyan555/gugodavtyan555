# ---- main (appended to build5_head.py) ----
import numpy as np, wave
SFX='../../dl/sfx/'
def plate_png(big,sub,path):
    im=Image.new('RGBA',(W,H),(0,0,0,0)); d=ImageDraw.Draw(im); x=110
    s=118; f=ImageFont.truetype(FD,s)
    while d.textlength(big,font=f)>W-2*x and s>50: s-=4; f=ImageFont.truetype(FD,s)
    y=H-300
    sh=Image.new('RGBA',(W,H),(0,0,0,0)); ImageDraw.Draw(sh).text((x,y),big,font=f,fill=(0,0,0,255),anchor='ls',stroke_width=16,stroke_fill=(0,0,0,255)); im.alpha_composite(sh.filter(ImageFilter.GaussianBlur(8)))
    d.text((x,y),big,font=f,fill=(255,255,255),anchor='ls',stroke_width=7,stroke_fill=(20,8,48))
    if sub:
        s2=46; f2=ImageFont.truetype(FD,s2)
        while d.textlength(sub,font=f2)>W-2*x-60 and s2>26: s2-=2; f2=ImageFont.truetype(FD,s2)
        tw=d.textlength(sub,font=f2); d.rounded_rectangle((x,y+22,x+tw+60,y+22+76),radius=18,fill=(236,40,140)); d.text((x+30,y+22+38),sub,font=f2,fill=(255,255,255),anchor='lm')
    im.save(path)
def badge(path):
    im=Image.new('RGBA',(W,H),(0,0,0,0)); d=ImageDraw.Draw(im); f=ImageFont.truetype(FD,40); t='GTA ГИД'; tw=d.textlength(t,font=f)
    x1=W-60; x0=x1-tw-50; d.rounded_rectangle((x0,50,x1,120),radius=16,fill=(110,40,190,235)); d.text(((x0+x1)/2,86),t,font=f,fill=(255,255,255),anchor='mm'); im.save(path)
def filler(title,path):
    card(title,'',path)
GAP=0.3; MIN=1.4; PIECE=2.0; lens={}; jobs=[]; meta=[]; cutlog=[]; fills=0
badge(T+'badge.png')
for sid in ORDER:
    mp3=f'tts/{sid}.mp3'; D=dur(mp3)+GAP; lens[sid]=D
    a=json.load(open(f'tts/{sid}.json')); txt=''.join(a['characters']).lower(); stt=a['character_start_times_seconds']; times=[]; last=0
    for ph,v in CUES[sid]:
        i=txt.find(ph.lower(),last); last=i; times.append(max(0.0,stt[i]-0.12))
    times[0]=0.0
    for k in range(1,len(times)): times[k]=max(times[k],times[k-1]+MIN)
    keep=[k for k in range(len(times)) if times[k]<D-0.8]; parts=[]; events=[]; cuts=[]; tcur=0.0; pi=0
    for n,k in enumerate(keep):
        t0=times[k]; t1=times[keep[n+1]] if n+1<len(keep) else D; ph,v=CUES[sid][k]
        if isinstance(v,tuple) and v[0]=='card': events.append((t0,v[1],v[2]))
        need=t1-t0; npc=max(1,round(need/PIECE)); pdur=need/npc
        for j in range(npc):
            o=T+f'{sid}_{k}_{j}.mp4'
            if (sid,ph) in FIXED:
                s_,t_=FIXED[(sid,ph)]; jobs.append(('clip',s_,t_,pdur,o,pi)); parts.append(o)
            else:
                pref=OVR.get((sid,ph)); clips,left=fill(sid,pref if not (isinstance(v,tuple) and v[0]=='card') else None,pdur)
                if left>0.05:
                    fp=T+f'{sid}_{k}_{j}_f.png'; filler(CHAP_TITLE.get(sid,'') if False else '',fp); fills+=1
                for q,(s_,t_,l_) in enumerate(clips):
                    oo=T+f'{sid}_{k}_{j}_{q}.mp4'; jobs.append(('clip',s_,t_,l_,oo,pi)); parts.append(oo)
                if left>0.05:
                    oo=T+f'{sid}_{k}_{j}_fill.mp4'; jobs.append(('card',fp,0,left,oo,pi)); parts.append(oo)
            cuts.append(t0+j*pdur); pi+=1
    meta.append((sid,parts,D,mp3,events,cuts))
print('fillers',fills)
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
        t1=min(D-0.2,t0+3.2); fc+=f"[{last}][{e+2}:v]overlay=x=0:y='if(lt(t-{t0:.2f},0.25),70*(1-(t-{t0:.2f})/0.25),0)':enable='between(t,{t0:.2f},{t1:.2f})'[v{e+1}];"; last=f'v{e+1}'
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
SR=44100; tr=np.zeros(int((total+3)*SR))
def put(x,t,g):
    i=int(max(0,t)*SR); e=min(len(tr),i+len(x)); tr[i:e]+=x[:e-i]*g
for n,(k,t) in enumerate(sorted(sfx_ev,key=lambda z:z[1])):
    if k=='whoosh': put(wh[n%2],t-0.18,0.30)
    else: put(im_,t-0.05,0.65)
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
 f"[1:a]asplit[vo][sc];[2:a][3:a]acrossfade=d=3[mx];[mx]volume=0.30,afade=t=in:d=1,afade=t=out:st={total-3:.2f}:d=3[m];[m][sc]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=400[md];[vo][md][4:a]amix=inputs=3:duration=first:normalize=0[a]",
 '-map','0:v','-map','[a]','-t',f'{total:.2f}','-c:v','libx264','-preset','medium','-crf','20','-maxrate','3500k','-bufsize','7000k','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-movflags','+faststart',OUT)
print(total)
