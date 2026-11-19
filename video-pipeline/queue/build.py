"""Queue Short: GTA V vs GTA VI kiosks. usage: python3 build.py A.mp4 B.mp4 C.mp4 OUT.mp4"""
import sys, subprocess as sp, os
sys.path.insert(0,'../doc')
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import cover
A,B,C,OUT=sys.argv[1:5]; W,H=1080,1920; T='/tmp/claude-0/q/'; os.makedirs(T,exist_ok=True)
run=lambda *a: sp.run(a,check=True,stderr=sp.DEVNULL)
# (src, start, dur, caption lines)
SEG=[(A,0.7,3.8,['ГТА 5 ПРОТИВ','ГТА 6']),(B,0.0,3.6,['ЧТО ТВОРИТСЯ','У ГТА 6?']),(C,0.5,3.8,['А ТУТ…','ТИШИНА'])]
FD='/usr/share/fonts/opentype/inter/InterDisplay-Black.otf'
def cap(lines,path,y=300):
    im=Image.new('RGBA',(W,H),(0,0,0,0)); d=ImageDraw.Draw(im)
    for i,t in enumerate(lines):
        f=ImageFont.truetype(FD,112 if len(t)<12 else 96)
        d.text((W//2,y),t,font=f,fill=(255,255,255),anchor='mm',stroke_width=10,stroke_fill=(20,8,48))
        y+=130
    sh=im.filter(ImageFilter.GaussianBlur(8)); out=Image.new('RGBA',(W,H),(0,0,0,0)); out.alpha_composite(sh); out.alpha_composite(im); out.save(path)
parts=[]
for i,(src,ss,dur,lines) in enumerate(SEG):
    cap(lines,T+f'c{i}.png',1430 if i==0 else 300); p=T+f's{i}.mp4'
    run('ffmpeg','-y','-ss',str(ss),'-t',str(dur),'-i',src,'-loop','1','-t',str(dur),'-i',T+f'c{i}.png','-filter_complex',
        f"[0:v]scale={W}:{H}:flags=lanczos,fps=30[v];[v][1:v]overlay=0:0:enable='gte(t,0.15)'[o]",'-map','[o]','-map','0:a','-af',f'afade=t=in:d=0.05,afade=t=out:st={dur-0.2}:d=0.2',
        '-c:v','libx264','-preset','veryfast','-crf','14','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-ar','44100','-ac','2',p); parts.append(p)
# cover 0.4s: frame of B + 3D text
run('ffmpeg','-y','-ss','1.0','-i',B,'-frames:v','1','-vf',f'scale={W}:{H}:flags=lanczos',T+'f.png')
im=Image.open(T+'f.png').convert('RGB').filter(ImageFilter.GaussianBlur(3)); im=Image.blend(im,Image.new('RGB',(W,H),(60,10,110)),0.35).convert('RGBA')
cover.text3d(im,700,'GTA 5',230,[(255,255,255),(200,200,210)]); cover.text3d(im,960,'ПРОТИВ',150,[(255,240,120),(255,150,40)]); cover.text3d(im,1240,'GTA 6',260,[(255,120,220),(150,90,255)])
im.convert('RGB').save(T+'cover.png'); im.convert('RGB').save('cover.png')
run('ffmpeg','-y','-loop','1','-t','0.4','-i',T+'cover.png','-f','lavfi','-t','0.4','-i','anullsrc=r=44100:cl=stereo','-vf','fps=30','-c:v','libx264','-preset','veryfast','-crf','14','-pix_fmt','yuv420p','-c:a','aac','-ar','44100',T+'cov.mp4')
open(T+'l.txt','w').write(''.join(f"file '{p}'\n" for p in [T+'cov.mp4']+parts))
run('ffmpeg','-y','-f','concat','-safe','0','-i',T+'l.txt','-c:v','libx264','-preset','medium','-crf','18','-c:a','aac','-b:a','192k','-movflags','+faststart',OUT)
