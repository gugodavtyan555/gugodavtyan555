"""'5 вещей в GTA 6, которых не было в GTA 5' vertical Short builder. usage: python3 build.py OUT.mp4 [music.mp3]
Needs ../../dl/src/{GTAVI_Trailer_1,GTAVI_Launch_Trailer}.mp4 (A, L) and X_1028/X_1048/X_1100.mp4 chunks; tts/*.mp3 from script.json."""
import sys, os, json, subprocess as sp
sys.path.insert(0,'../doc')
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import cover
W,H=1080,1920; S='../../dl/src/'; T='/tmp/claude-0/five/'; os.makedirs(T,exist_ok=True)
OUT=sys.argv[1]; MUSIC=sys.argv[2] if len(sys.argv)>2 else None
run=lambda *a: sp.run(a,check=True,stderr=sp.DEVNULL)
dur=lambda f: float(sp.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',f]))
SRC={'A':(S+'GTAVI_Trailer_1.mp4',0),'L':(S+'GTAVI_Launch_Trailer.mp4',0),'X1':(S+'X_1028.mp4',1028),'X2':(S+'X_1048.mp4',1048),'X3':(S+'X_1100.mp4',1100)}
def vf(k,cx):
    if k=='L': return f"crop=iw:ih*0.8889:0:ih*0.0556,crop=ih*9/16:ih:(iw-ih*9/16)*{cx}:0,scale={W}:{H}:flags=lanczos,fps=30"
    return f"crop=ih*9/16:ih:(iw-ih*9/16)*{cx}:0,scale={W}:{H}:flags=lanczos,fps=30"
# segment: id, (num,title), shots [(src, abs_start, weight, cx)]
SEG=[
 ('intro',(None,'5 ВЕЩЕЙ'),[('A',10.8,1,.5),('L',54,1,.5),('A',18.4,1,.5),('L',24,1,.5)]),
 ('n1',('1','ГЕРОИНЯ'),[('A',6.5,1,.55),('A',9,1.2,.5),('A',24,1,.5),('L',72,1,.5),('A',72,1,.45)]),
 ('n2',('2','ДУЭТ'),[('L',39,1.2,.5),('L',64.9,.55,.5),('A',74,1,.5),('L',18,1.1,.5),('L',11,1,.5)]),
 ('n3',('3','СОЦСЕТИ'),[('A',57,1,.5),('X3',1104,1.2,.5),('A',51,1,.5),('A',42,1,.5)]),
 ('n4',('4','БОЛОТА ЛЕОНИДЫ'),[('L',27,.8,.5),('A',18.4,.8,.5),('X1',1029.8,1,.5),('X2',1048.2,1,.5)]),
 ('n5',('5','ЖИЗНЬ МЕЖДУ МИССИЯМИ'),[('X1',1039,1,.5),('L',57,1,.5),('X3',1108,1.1,.5),('X2',1062,1,.5)]),
 ('outro',(None,'А ТЫ ЧТО ВЫБЕРЕШЬ?'),[('L',63,1,.5),('L',69,1,.5),('L',78,1.6,.5)]),
]
FD='/usr/share/fonts/opentype/inter/InterDisplay-Black.otf'
def plate(num,title,path):
    im=Image.new('RGBA',(W,H),(0,0,0,0))
    if num: cover.text3d(im,370,num,250,[(255,120,220),(150,90,255)])
    d=ImageDraw.Draw(im); size=104
    while True:
        f=ImageFont.truetype(FD,size)
        if d.textlength(title,font=f)<W-80 or size<50: break
        size-=4
    y=560 if num else 420
    sh=Image.new('RGBA',(W,H),(0,0,0,0)); ImageDraw.Draw(sh).text((W//2,y),title,font=f,fill=(0,0,0,255),anchor='mm',stroke_width=14,stroke_fill=(0,0,0,255)); im.alpha_composite(sh.filter(ImageFilter.GaussianBlur(6)))
    d.text((W//2,y),title,font=f,fill=(255,255,255),anchor='mm',stroke_width=9,stroke_fill=(20,8,48)); im.save(path)
GAP=0.25; segv=[]; sega=[]
for sid,(num,title),shots in SEG:
    a=S.replace('dl/src/','')  # placeholder
    mp3=f'tts/{sid}.mp3'; D=dur(mp3)+GAP; tot=sum(s[2] for s in shots); parts=[]
    for i,(k,st,w,cx) in enumerate(shots):
        d=D*w/tot; f,off=SRC[k]; p=T+f'{sid}_{i}.mp4'
        run('ffmpeg','-y','-ss',f'{st-off:.2f}','-t',f'{d:.3f}','-i',f,'-vf',vf(k,cx),'-an','-c:v','libx264','-preset','veryfast','-crf','14','-pix_fmt','yuv420p',p); parts.append(p)
    open(T+f'{sid}.txt','w').write(''.join(f"file '{p}'\n" for p in parts))
    plate(num,title,T+f'{sid}.png'); v=T+f'{sid}_v.mp4'; show=min(3.4,D-0.3) if num else min(D-0.3,4.0)
    run('ffmpeg','-y','-f','concat','-safe','0','-i',T+f'{sid}.txt','-loop','1','-t',f'{D:.3f}','-i',T+f'{sid}.png','-filter_complex',
        f"[1:v]format=rgba,fade=in:st=0.1:d=0.25:alpha=1,fade=out:st={show-0.3:.2f}:d=0.3:alpha=1[p];[0:v][p]overlay=0:0:shortest=1[o]",'-map','[o]','-t',f'{D:.3f}','-c:v','libx264','-preset','veryfast','-crf','14','-pix_fmt','yuv420p',v)
    a=T+f'{sid}_a.wav'; run('ffmpeg','-y','-i',mp3,'-af',f'apad=whole_dur={D:.3f}','-t',f'{D:.3f}','-ar','44100','-ac','2',a); segv.append(v); sega.append(a)
# cover 0.4 s
run('ffmpeg','-y','-ss','12','-i',S+'GTAVI_Trailer_1.mp4','-frames:v','1','-vf',vf('A',.5).replace(',fps=30',''),T+'f.png')
im=Image.open(T+'f.png').convert('RGB').filter(ImageFilter.GaussianBlur(3)); im=Image.blend(im,Image.new('RGB',(W,H),(60,10,110)),0.35).convert('RGBA')
cover.text3d(im,640,'5 ВЕЩЕЙ',230,[(255,255,255),(200,200,210)]); cover.text3d(im,900,'КОТОРЫХ НЕ БЫЛО',112,[(255,240,120),(255,150,40)]); cover.text3d(im,1130,'В GTA 5',230,[(255,120,220),(150,90,255)])
im.convert('RGB').save('cover.png')
run('ffmpeg','-y','-loop','1','-t','0.4','-i','cover.png','-vf','fps=30','-c:v','libx264','-preset','veryfast','-crf','14','-pix_fmt','yuv420p',T+'cov.mp4')
open(T+'all.txt','w').write(''.join(f"file '{p}'\n" for p in [T+'cov.mp4']+segv)); open(T+'alla.txt','w').write(''.join(f"file '{p}'\n" for p in sega))
run('ffmpeg','-y','-f','concat','-safe','0','-i',T+'alla.txt','-c','copy',T+'voice.wav')
run('ffmpeg','-y','-f','concat','-safe','0','-i',T+'all.txt','-c','copy',T+'video.mp4')
total=dur(T+'video.mp4')
if MUSIC:
    run('ffmpeg','-y','-i',T+'video.mp4','-i',T+'voice.wav','-stream_loop','-1','-i',MUSIC,'-filter_complex',
        f"[1:a]adelay=400|400,asplit[v][sc];[2:a]volume=0.22,afade=t=in:d=0.5,afade=t=out:st={total-1.5:.2f}:d=1.5[m];[m][sc]sidechaincompress=threshold=0.04:ratio=8:attack=20:release=300[md];[v][md]amix=inputs=2:duration=first:normalize=0[a]",
        '-map','0:v','-map','[a]','-t',f'{total:.2f}','-c:v','libx264','-preset','medium','-crf','21','-maxrate','4800k','-bufsize','9600k','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-movflags','+faststart',OUT)
else:
    run('ffmpeg','-y','-i',T+'video.mp4','-i',T+'voice.wav','-filter_complex','[1:a]adelay=400|400[a]','-map','0:v','-map','[a]','-t',f'{total:.2f}','-c:v','libx264','-preset','medium','-crf','21','-maxrate','4800k','-bufsize','9600k','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-movflags','+faststart',OUT)
print(total)
