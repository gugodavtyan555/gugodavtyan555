"""Catalog of official footage: per source crop (letterbox) + scenes [(start,end,luma)]. -> scenes.json"""
import subprocess as sp, re, json, collections, numpy as np, sys
D='../../dl/off/'; S='../../dl/src/'
SRC={'G1':D+'G1.mp4','G3':D+'G3.mp4','VC':D+'VC.mp4','SA':D+'SA.mp4','G4':D+'G4.mp4','G5':D+'G5.mp4','G5N':D+'G5N.mp4','RD2':D+'RD2.mp4',
     'A':S+'GTAVI_Trailer_1.mp4','L':S+'GTAVI_Launch_Trailer.mp4','T':S+'GTAVI_Trailer_2.mp4','X1':S+'X_1028.mp4','X2':S+'X_1048.mp4','X3':S+'X_1100.mp4'}
def crop_of(p):
    out=sp.run(['ffmpeg','-hide_banner','-i',p,'-vf','fps=1,scale=iw/2:-2,cropdetect=24:2:0','-f','null','-'],capture_output=True,text=True).stderr
    c=collections.Counter(re.findall(r'crop=(\d+:\d+:\d+:\d+)',out)); (w,h,x,y)=[int(v) for v in c.most_common(1)[0][0].split(':')]
    return w*2,h*2,x*2,y*2
res={}
for k,p in SRC.items():
    if k.startswith('X'): w,h,x,y=3840,2160,0,0
    elif k in ('A',): w,h,x,y=3840,2160,0,0
    else: w,h,x,y=crop_of(p)
    # 16:9 window inside the detected picture (center)
    ww=min(w,int(h*16/9)); hh=int(ww*9/16)
    if hh>h: hh=h; ww=int(hh*16/9)
    cx=x+(w-ww)//2; cy=y+(h-hh)//2
    vf=f"crop={ww}:{hh}:{cx}:{cy},scale=320:180,"
    o=sp.run(['ffmpeg','-hide_banner','-i',p,'-vf',vf+"select='gt(scene,0.28)',showinfo",'-f','null','-'],capture_output=True,text=True).stderr
    cuts=[0.0]+[float(t) for t in re.findall(r'pts_time:([0-9.]+)',o)]
    dur=float(sp.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',p]))
    cuts.append(dur)
    # luma per 0.5s
    raw=sp.run(['ffmpeg','-v','error','-i',p,'-vf',vf+'fps=2,format=gray','-f','rawvideo','-'],capture_output=True).stdout
    fr=np.frombuffer(raw,np.uint8).reshape(-1,320*180); lum=fr.mean(1); sd=fr.std(1)
    sc=[]
    for a,b in zip(cuts[:-1],cuts[1:]):
        if b-a<1.0: continue
        i0,i1=int(a*2),max(int(a*2)+1,int(b*2)); l=float(lum[i0:i1].mean()); s=float(sd[i0:i1].mean())
        sc.append((round(a,2),round(b,2),round(l,1),round(s,1)))
    res[k]={'path':p,'crop':[ww,hh,cx,cy],'dur':dur,'scenes':sc}
    print(k,res[k]['crop'],len(sc),'scenes, total',round(sum(b-a for a,b,_,_ in sc),1),'s',flush=True)
json.dump(res,open('scenes.json','w'))
