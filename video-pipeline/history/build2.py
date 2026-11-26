"""«История GTA» 10+ min 16:9. usage: python3 build2.py OUT.mp4 [only_ids...]  (needs tts/, ../../dl/hist, ../../dl/src, ../../dl/music)"""
import sys, os, subprocess as sp
from concurrent.futures import ThreadPoolExecutor
sys.path.insert(0,'../doc')
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import cover
cover.W,cover.H=1920,1080
W,H=1920,1080; HS='../../dl/hist/'; S='../../dl/src/'; T='/tmp/claude-0/hist2/'; os.makedirs(T,exist_ok=True)
OUT=sys.argv[1]; ONLY=sys.argv[2:]
run=lambda *a: sp.run(a,check=True,stderr=sp.DEVNULL)
dur=lambda f: float(sp.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',f]))
LST=[l.split()[1] for l in open('nlist.txt').read().splitlines()]   # index -> v/n_x.mp4 | i/n_x.jpg
A=S+'GTAVI_Trailer_1.mp4'; L=S+'GTAVI_Launch_Trailer.mp4'
def sh(x,w=1):
    if isinstance(x,tuple): return (x[0],x[1],w if len(x)<3 else x[2])
    return (HS+LST[x],0.5,w)
SEG=[
 ('intro',('ИСТОРИЯ GTA','ОТ 1997 ДО GTA 6'),[(A,3),80,21,(A,19.5),62,(L,39),(L,24,1.3)]),
 ('c1',('1995','ДАНДИ, ШОТЛАНДИЯ'),[142,141,90,9,123,19]),
 ('c2',('1997','ПЕРВАЯ GTA'),[19,87,66,56,109,118,149,14]),
 ('c3',('1998–2000','ROCKSTAR ПОЯВЛЯЕТСЯ'),[101,35,72,80,144]),
 ('c4',('2001','GTA III'),[71,129,49,130,1,111]),
 ('c5',('2002','VICE CITY'),[106,86,38,10,124,62,112,8]),
 ('c6',('2004','SAN ANDREAS'),[99,97,127,36,4,25,105,110,65]),
 ('c6r',(None,'РАДИО В GTA'),[20,126,131,143,92,15,108,88]),
 ('c7',('2005–2009','ПОРТАТИВНЫЕ ЧАСТИ'),[51,140,98,71,149]),
 ('c8',('2008','GTA IV'),[144,130,49,93,1,22,152,35]),
 ('c9',('2009','ДОПОЛНЕНИЯ GTA IV'),[129,111,56,109,66]),
 ('c10',('2013','GTA V'),[110,105,118,87,153,36,107]),
 ('c11',('ONLINE','ЖИВАЯ ЛЕГЕНДА'),[140,98,71,67,150,51]),
 ('c11m',(None,'СООБЩЕСТВО И МОДЫ'),[83,147,73,67,150,77,3]),
 ('c12w',(None,'КАК РОС ОТКРЫТЫЙ МИР'),[19,129,144,99,137,97,(A,19.5),(L,54)]),
 ('c12',('2021–2022','ГОДЫ ОЖИДАНИЯ'),[16,139,121,77,83,73,67]),
 ('c13',('2023','ПЕРВЫЙ ТРЕЙЛЕР'),[(A,3),(A,6.5),(A,24),(A,27),(A,36),(A,45)]),
 ('c14',('2025–2026','ПЕРЕНОСЫ И РЕЛИЗ'),[33,13,121,139,16,41,11]),
 ('outro',(None,'ПОДПИШИСЬ НА GTA ГИД'),[(L,39),(L,72),(L,18),(L,54),138,(L,78,1.8)]),
]
def vf(p):
    pre="crop=iw:ih*0.8889:0:ih*0.0556," if p==L else ""
    return pre+f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},fps=30"
FD='/usr/share/fonts/opentype/inter/InterDisplay-Black.otf'
def plate(big,sub,path):
    im=Image.new('RGBA',(W,H),(0,0,0,0))
    if big: cover.text3d(im,170,big,190,[(255,120,220),(150,90,255)]); y=345
    else: y=170
    d=ImageDraw.Draw(im); f=ImageFont.truetype(FD,74)
    s=Image.new('RGBA',(W,H),(0,0,0,0)); ImageDraw.Draw(s).text((W//2,y),sub,font=f,fill=(0,0,0,255),anchor='mm',stroke_width=12,stroke_fill=(0,0,0,255)); im.alpha_composite(s.filter(ImageFilter.GaussianBlur(6)))
    d.text((W//2,y),sub,font=f,fill=(255,255,255),anchor='mm',stroke_width=8,stroke_fill=(20,8,48)); im.save(path)
def shot(a):
    p,st,d,o=a
    if os.path.exists(o): return
    if p.endswith('.jpg'):
        n=int(d*30)+1
        run('ffmpeg','-y','-loop','1','-i',p,'-vf',f"scale=3840:2160:force_original_aspect_ratio=increase,crop=3840:2160,zoompan=z='min(1.0+0.0006*on,1.2)':d={n}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s={W}x{H}:fps=30",'-t',f'{d:.3f}','-an','-c:v','libx264','-preset','veryfast','-crf','17','-pix_fmt','yuv420p',o)
    else:
        run('ffmpeg','-y','-stream_loop','-1','-ss',str(st),'-i',p,'-t',f'{d:.3f}','-vf',vf(p),'-an','-c:v','libx264','-preset','veryfast','-crf','17','-pix_fmt','yuv420p',o)
GAP=0.3; segv=[]; sega=[]; lens={}; jobs=[]; meta=[]
for sid,(big,sub),shots in SEG:
    mp3=f'tts/{sid}.mp3'; D=dur(mp3)+GAP; lens[sid]=D; shots=[sh(s) for s in shots]; tot=sum(s[2] for s in shots); parts=[]
    for i,(p,st,w) in enumerate(shots):
        o=T+f'{sid}_{i}.mp4'; parts.append(o)
        if not ONLY or sid in ONLY: jobs.append((p,st,D*w/tot,o))
    meta.append((sid,big,sub,parts,D,mp3))
with ThreadPoolExecutor(3) as ex: list(ex.map(shot,jobs))
for sid,big,sub,parts,D,mp3 in meta:
    v=T+f'{sid}_v.mp4'; segv.append(v)
    if not ONLY or sid in ONLY:
        open(T+f'{sid}.txt','w').write(''.join(f"file '{p}'\n" for p in parts)); plate(big,sub,T+f'{sid}.png'); show=min(4.0,D-0.5)
        fin=',fade=in:d=0.4' if sid=='intro' else ''
        run('ffmpeg','-y','-f','concat','-safe','0','-i',T+f'{sid}.txt','-loop','1','-t',f'{D:.3f}','-i',T+f'{sid}.png','-filter_complex',
            f"[1:v]format=rgba,fade=in:st=0.1:d=0.3:alpha=1,fade=out:st={show-0.3:.2f}:d=0.3:alpha=1[p];[0:v][p]overlay=0:0:shortest=1{fin}[o]",'-map','[o]','-t',f'{D:.3f}','-c:v','libx264','-preset','veryfast','-crf','17','-pix_fmt','yuv420p',v)
    a=T+f'{sid}_a.wav'; run('ffmpeg','-y','-i',mp3,'-af',f'apad=whole_dur={D:.3f}','-t',f'{D:.3f}','-ar','44100','-ac','2',a); sega.append(a)
open(T+'all.txt','w').write(''.join(f"file '{p}'\n" for p in segv)); open(T+'alla.txt','w').write(''.join(f"file '{p}'\n" for p in sega))
run('ffmpeg','-y','-f','concat','-safe','0','-i',T+'alla.txt','-c','copy',T+'voice.wav'); run('ffmpeg','-y','-f','concat','-safe','0','-i',T+'all.txt','-c','copy',T+'video.mp4')
total=dur(T+'video.mp4'); tA=sum(lens[k] for k in lens if k in ('intro','c1','c2','c3','c4','c5','c6','c6r','c7','c8','c9'))
names={'intro':'Вступление','c1':'1995: Данди и DMA Design','c2':'1997: первая GTA','c3':'Рождение Rockstar','c4':'2001: GTA III','c5':'2002: Vice City','c6':'2004: San Andreas','c6r':'Радио и сатира','c7':'Портативные части','c8':'2008: GTA IV','c9':'Дополнения к GTA IV','c10':'2013: GTA V','c11':'GTA Online','c11m':'Сообщество и моды','c12w':'Как рос открытый мир','c12':'2021–2022: годы ожидания','c13':'2023: первый трейлер','c14':'2025–2026: переносы и релиз','outro':'Финал'}
t=0; ch=[]
for k in lens: ch.append(f"{int(t//60)}:{int(t%60):02d} {names[k]}"); t+=lens[k]
open('chapters.txt','w').write('\n'.join(ch))
M='../../dl/music/'
def bed(track,need,out):
    k=int(-(-(need-3)//147))+0; k=max(k,1); ins=[]; 
    for _ in range(k): ins+=['-i',M+track]
    if k==1: run('ffmpeg','-y',*ins,'-af',f'atrim=0:{need:.2f}',out); return
    chain=''; last='[0:a]'
    for i in range(1,k): chain+=f'{last}[{i}:a]acrossfade=d=3[x{i}];'; last=f'[x{i}]'
    run('ffmpeg','-y',*ins,'-filter_complex',chain+f'{last}atrim=0:{need:.2f}[o]','-map','[o]',out)
bed('retro.mp3',tA+3,T+'bedA.wav'); bed('epic.mp3',total-tA+3,T+'bedB.wav')
run('ffmpeg','-y','-i',T+'video.mp4','-i',T+'voice.wav','-i',T+'bedA.wav','-i',T+'bedB.wav','-filter_complex',
 f"[1:a]adelay=400|400,asplit[vo][sc];[2:a][3:a]acrossfade=d=3[mx];[mx]volume=0.30,afade=t=in:d=1,afade=t=out:st={total-3:.2f}:d=3[m];[m][sc]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=400[md];[vo][md]amix=inputs=2:duration=first:normalize=0[a]",
 '-map','0:v','-map','[a]','-t',f'{total:.2f}','-c:v','libx264','-preset','medium','-crf','20','-maxrate','3500k','-bufsize','7000k','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-movflags','+faststart',OUT)
print(total,ch)
