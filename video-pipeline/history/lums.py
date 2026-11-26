import json,subprocess as sp,numpy as np
SC=json.load(open('scenes.json')); out={}
for k,v in SC.items():
    w,h,x,y=v['crop']
    raw=sp.run(['ffmpeg','-v','error','-i',v['path'],'-vf',f'crop={w}:{h}:{x}:{y},scale=160:90,fps=4,format=gray','-f','rawvideo','-'],capture_output=True).stdout
    fr=np.frombuffer(raw,np.uint8).reshape(-1,160*90).astype(float)
    # also frame difference vs previous (fades)
    out[k]={'lum':[round(float(a),1) for a in fr.mean(1)],'sd':[round(float(a),1) for a in fr.std(1)]}
    print(k,len(fr),flush=True)
json.dump(out,open('lums.json','w'))
