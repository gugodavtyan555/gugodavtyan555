"""«История GTA: от 1997 до GTA 6» 16:9 documentary. usage: python3 build.py OUT.mp4 [only_ids...]
Needs: tts/*.mp3, ../../dl/hist/{v,i} (fetch.py), ../../dl/src trailers (A,L), ../../dl/music/{retro,epic}.mp3"""
import sys, os, subprocess as sp
sys.path.insert(0,'../doc')
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import cover
cover.W,cover.H=1920,1080
W,H=1920,1080; HS='../../dl/hist/'; S='../../dl/src/'; T='/tmp/claude-0/hist/'; os.makedirs(T,exist_ok=True)
OUT=sys.argv[1]; ONLY=sys.argv[2:]
run=lambda *a: sp.run(a,check=True,stderr=sp.DEVNULL)
dur=lambda f: float(sp.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',f]))
A=S+'GTAVI_Trailer_1.mp4'; L=S+'GTAVI_Launch_Trailer.mp4'
V=lambda n: HS+'v/'+n+'.mp4'; I=lambda n: HS+'i/'+n+'.jpg'
# (path, start, weight)  start only for video
SEG=[
 ('intro',('ИСТОРИЯ GTA','ОТ 1997 ДО GTA 6'),[(A,3,1),(L,54,1),(A,19.5,1),(L,39,1),(L,24,1.2)]),
 ('c1',('1997','ВСЁ НАЧИНАЕТСЯ'),[(V('c1_45085'),0.5,1),(I('c1_8245177'),0,1),(V('c1_55571'),0.5,1),(V('c1_262334'),0.5,1),(I('c1_4970689'),0,1)]),
 ('c2',('2001','ТРЁХМЕРНАЯ РЕВОЛЮЦИЯ'),[(V('c2_30978'),0.5,1),(V('c2_7260'),0.5,1),(V('c2_202825'),0.5,1.1),(V('c2_6474'),0.5,1),(V('c2_30084'),0.5,1),(V('c2_205875'),0.5,1),(V('c2_7405'),0.5,1)]),
 ('c3',('2008','GTA IV'),[(V('c3_1366'),0.5,1),(V('c3_352716'),0.5,1),(V('c3_42489'),0.5,1),(I('c3_267948'),0,1),(I('c3_8081967'),0,1)]),
 ('c4',('2013','GTA V И GTA ONLINE'),[(V('c4_162670'),0.5,1.1),(V('c4_219637'),0.5,1),(V('c4_29433'),0.5,1),(I('c4_1868667'),0,1),(V('c4_32859'),0.5,1)]),
 ('c5',('2022–2026','ДОЛГИЙ ПУТЬ К GTA 6'),[(A,24,1),(A,27,1),(L,3,1),(L,18,1),(L,48,1),(A,36,1),(L,60,1)]),
 ('outro',(None,'ПОДПИШИСЬ НА GTA ГИД'),[(L,39,1),(L,72,1),(L,78,1.6)]),
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
    sh=Image.new('RGBA',(W,H),(0,0,0,0)); ImageDraw.Draw(sh).text((W//2,y),sub,font=f,fill=(0,0,0,255),anchor='mm',stroke_width=12,stroke_fill=(0,0,0,255)); im.alpha_composite(sh.filter(ImageFilter.GaussianBlur(6)))
    d.text((W//2,y),sub,font=f,fill=(255,255,255),anchor='mm',stroke_width=8,stroke_fill=(20,8,48)); im.save(path)
GAP=0.3; segv=[]; sega=[]; lens={}
for sid,(big,sub),shots in SEG:
    mp3=f'tts/{sid}.mp3'; D=dur(mp3)+GAP; lens[sid]=D; v=T+f'{sid}_v.mp4'; segv.append(v)
    if not ONLY or sid in ONLY:
        tot=sum(s[2] for s in shots); parts=[]
        for i,(p,st,w) in enumerate(shots):
            d=D*w/tot; o=T+f'{sid}_{i}.mp4'; parts.append(o)
            if p.endswith('.jpg'):
                n=int(d*30)+1
                run('ffmpeg','-y','-loop','1','-i',p,'-vf',f"scale=3840:2160:force_original_aspect_ratio=increase,crop=3840:2160,zoompan=z='min(1.0+0.0006*on,1.2)':d={n}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s={W}x{H}:fps=30",'-t',f'{d:.3f}','-an','-c:v','libx264','-preset','veryfast','-crf','16','-pix_fmt','yuv420p',o)
            else:
                run('ffmpeg','-y','-stream_loop','-1','-ss',str(st),'-i',p,'-t',f'{d:.3f}','-vf',vf(p),'-an','-c:v','libx264','-preset','veryfast','-crf','16','-pix_fmt','yuv420p',o)
        open(T+f'{sid}.txt','w').write(''.join(f"file '{p}'\n" for p in parts)); plate(big,sub,T+f'{sid}.png')
        show=min(4.0,D-0.5)
        run('ffmpeg','-y','-f','concat','-safe','0','-i',T+f'{sid}.txt','-loop','1','-t',f'{D:.3f}','-i',T+f'{sid}.png','-filter_complex',
            f"[1:v]format=rgba,fade=in:st=0.1:d=0.3:alpha=1,fade=out:st={show-0.3:.2f}:d=0.3:alpha=1[p];[0:v][p]overlay=0:0:shortest=1,fade=in:d=0.4[o]" if sid=='intro' else
            f"[1:v]format=rgba,fade=in:st=0.1:d=0.3:alpha=1,fade=out:st={show-0.3:.2f}:d=0.3:alpha=1[p];[0:v][p]overlay=0:0:shortest=1[o]",'-map','[o]','-t',f'{D:.3f}','-c:v','libx264','-preset','veryfast','-crf','16','-pix_fmt','yuv420p',v)
    a=T+f'{sid}_a.wav'; run('ffmpeg','-y','-i',mp3,'-af',f'apad=whole_dur={D:.3f}','-t',f'{D:.3f}','-ar','44100','-ac','2',a); sega.append(a)
open(T+'all.txt','w').write(''.join(f"file '{p}'\n" for p in segv)); open(T+'alla.txt','w').write(''.join(f"file '{p}'\n" for p in sega))
run('ffmpeg','-y','-f','concat','-safe','0','-i',T+'alla.txt','-c','copy',T+'voice.wav'); run('ffmpeg','-y','-f','concat','-safe','0','-i',T+'all.txt','-c','copy',T+'video.mp4')
total=dur(T+'video.mp4'); t4=sum(lens[k] for k in ('intro','c1','c2','c3'))+0.4
# chapter timestamps
t=0.4+0; ch=[]
names={'intro':'Вступление','c1':'1997–1999: с чего всё началось','c2':'2001–2004: GTA III, Vice City, San Andreas','c3':'2008: GTA IV','c4':'2013: GTA V и GTA Online','c5':'2022–2026: утечка, трейлеры и релиз','outro':'Финал'}
for k in lens: ch.append(f"{int(t//60)}:{int(t%60):02d} {names[k]}"); t+=lens[k]
open('chapters.txt','w').write('\n'.join(ch))
M='../../dl/music/'
run('ffmpeg','-y','-i',T+'video.mp4','-i',T+'voice.wav','-i',M+'retro.mp3','-i',M+'epic.mp3','-filter_complex',
 f"[1:a]adelay=400|400,asplit[vo][sc];[2:a]atrim=0:{t4+3:.2f},asetpts=N/SR/TB[r];[3:a]atrim=0:{total-t4+3:.2f},asetpts=N/SR/TB[e];[r][e]acrossfade=d=3[mx];[mx]volume=0.30,afade=t=in:d=1,afade=t=out:st={total-3:.2f}:d=3[m];[m][sc]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=400[md];[vo][md]amix=inputs=2:duration=first:normalize=0[a]",
 '-map','0:v','-map','[a]','-t',f'{total:.2f}','-c:v','libx264','-preset','medium','-crf','21','-maxrate','2300k','-bufsize','4600k','-pix_fmt','yuv420p','-c:a','aac','-b:a','160k','-movflags','+faststart',OUT)
print(total,ch)
