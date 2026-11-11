import subprocess,json,sys
from PIL import Image, ImageDraw
n=sys.argv[1]; dur=float(sys.argv[2]); cols=int(sys.argv[3]) if len(sys.argv)>3 else 10
cuts=[0.0]+[float(x) for x in open(n+'.cuts')]+[dur]
sc=[(a,b) for a,b in zip(cuts,cuts[1:]) if b-a>=0.6]
w,h=256,144; rows=(len(sc)+cols-1)//cols
im=Image.new('RGB',(cols*w,rows*h)); d=ImageDraw.Draw(im)
for i,(a,b) in enumerate(sc):
    subprocess.run(['ffmpeg','-v','error','-y','-ss',f'{a+(b-a)*0.5:.2f}','-i',n+'_1080.mp4','-frames:v','1','-vf',f'scale={w}:{h}','f.jpg'])
    x,y=(i%cols)*w,(i//cols)*h; im.paste(Image.open('f.jpg'),(x,y)); d.rectangle((x,y,x+92,y+13),fill=(0,0,0)); d.text((x+2,y+1),f'{a:.1f}-{b:.1f}',fill=(255,255,0))
im.save(n+'_sheet.jpg',quality=78); print(n,len(sc),im.size)
