import json,subprocess as sp,os
from PIL import Image,ImageDraw
SC=json.load(open('scenes.json')); T='/tmp/claude-0/sh4/'; os.makedirs(T,exist_ok=True)
items=[]
for k in ['G1','G3','VC','SA','G4','G5','G5N','RD2','T','A','L']:
    v=SC[k]; w,h,x,y=v['crop']; step=1.5 if k not in ('T','A','L') else 2.5
    n=int(v['dur']//step)
    sp.run(['ffmpeg','-v','error','-y','-i',v['path'],'-vf',f'crop={w}:{h}:{x}:{y},fps=1/{step},scale=128:72','-q:v','5',T+f'{k}_%03d.jpg'])
    for i in range(1,n+1):
        f=T+f'{k}_{i:03d}.jpg'
        if os.path.exists(f): items.append((k,(i-1)*step,f))
cols=15; per=90; sheets=[]
for s in range(0,len(items),per):
    sub=items[s:s+per]; rows=(len(sub)+cols-1)//cols; im=Image.new('RGB',(cols*128,rows*72)); d=ImageDraw.Draw(im)
    for j,(k,t,f) in enumerate(sub):
        x,y=(j%cols)*128,(j//cols)*72; im.paste(Image.open(f),(x,y)); d.rectangle((x,y,x+50,y+10),fill=(0,0,0)); d.text((x+1,y),f'{k}{t:.0f}',fill=(255,255,0))
    p=f'/tmp/claude-0/sh4_{s//per}.jpg'; im.save(p); sheets.append(p)
print(len(items),sheets)
