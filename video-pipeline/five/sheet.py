import sys,subprocess as sp,glob,os
from PIL import Image,ImageDraw
src,step,out=sys.argv[1],int(sys.argv[2]),sys.argv[3]
d=float(sp.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',src]))
T='/tmp/claude-0/sh/';os.makedirs(T,exist_ok=True)
for f in glob.glob(T+'*.jpg'):os.remove(f)
sp.run(['ffmpeg','-v','error','-i',src,'-vf',f'fps=1/{step},scale=240:135','-q:v','4',T+'%03d.jpg'],check=True)
fs=sorted(glob.glob(T+'*.jpg'));cols=8;rows=(len(fs)+cols-1)//cols
im=Image.new('RGB',(cols*240,rows*135));dr=ImageDraw.Draw(im)
for i,f in enumerate(fs):
    x,y=(i%cols)*240,(i//cols)*135;im.paste(Image.open(f),(x,y));dr.rectangle((x,y,x+44,y+14),fill=(0,0,0));dr.text((x+2,y+1),str(i*step),fill=(255,255,0))
im.save(out)
