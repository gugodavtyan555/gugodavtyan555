import json,subprocess as sp,os,sys
from PIL import Image,ImageDraw
SC=json.load(open('scenes.json')); T='/tmp/claude-0/sh5/'; os.makedirs(T,exist_ok=True)
keys=sys.argv[1].split(','); step=float(sys.argv[2]); out=sys.argv[3]; items=[]
for k in keys:
    v=SC[k]; w,h,x,y=v['crop']
    for f in os.listdir(T):
        if f.startswith(k+'_'): os.remove(T+f)
    sp.run(['ffmpeg','-v','error','-y','-i',v['path'],'-vf',f'crop={w}:{h}:{x}:{y},fps=1/{step},scale=128:72','-q:v','5',T+f'{k}_%03d.jpg'])
    i=1
    while os.path.exists(T+f'{k}_{i:03d}.jpg'): items.append((k,(i-1)*step,T+f'{k}_{i:03d}.jpg')); i+=1
cols=15; rows=(len(items)+cols-1)//cols; im=Image.new('RGB',(cols*128,rows*72)); d=ImageDraw.Draw(im)
for j,(k,t,f) in enumerate(items):
    x,y=(j%cols)*128,(j//cols)*72; im.paste(Image.open(f),(x,y)); d.rectangle((x,y,x+52,y+10),fill=(0,0,0)); d.text((x+1,y),f'{k}{t:.0f}',fill=(255,255,0))
im.save(out); print(len(items))
