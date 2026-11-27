import sys,subprocess as sp,os
sys.path.insert(0,'../doc')
from PIL import Image,ImageDraw,ImageFont,ImageFilter,ImageEnhance,ImageChops
import cover
cover.W,cover.H=1920,1080; W,H=1920,1080
D='../../dl/off/'; S='../../dl/src/'; T='/tmp/claude-0/th/'; os.makedirs(T,exist_ok=True)
FD='/usr/share/fonts/opentype/inter/InterDisplay-Black.otf'
def fr(path,t,name,crop=None):
    vf='scale=1280:720' if not crop else f'crop={crop},scale=1280:720'
    sp.run(['ffmpeg','-v','error','-y','-ss',str(t),'-i',path,'-frames:v','1','-vf',vf,T+name+'.png'],check=True); return Image.open(T+name+'.png').convert('RGB')
def lc(path,t,name):  # letterboxed source: use scenes.json crop
    import json; v=json.load(open('scenes.json'))[path]; w,h,x,y=v['crop']; return fr(v['path'],t,name,f'{w}:{h}:{x}:{y}')
games=[('1997',lc('G1b',20,'g1')),('2001',lc('G3c',30,'g3')),('2004',lc('SAb',24,'sa')),('2008',lc('G4',35,'g4')),('2013',lc('G5b',21,'g5'))]
vi=lc('L',40.6,'vi')
def vgrad(stops): return cover.vgrad((W,H),stops)
def build(out,variant):
    bg=vi.resize((int(1280*H/720*1.0),H)) if False else vi.resize((W,H),Image.LANCZOS)
    bg=ImageEnhance.Contrast(ImageEnhance.Color(bg).enhance(1.35)).enhance(1.1)
    im=Image.blend(bg,vgrad([(150,80,255),(255,110,200),(70,10,120)]),0.22).convert('RGBA')
    dk=Image.new('RGBA',(W,H),cover.NAVY+(0,)); g=Image.new('L',(1,H))
    for y in range(H): g.putpixel((0,y),int(190*max(0,(y-250)/830)**0.8 if variant=='A' else 130*max(0,1-y/600)+200*max(0,(y-560)/520)**0.9))
    dk.putalpha(g.resize((W,H))); im.alpha_composite(dk)
    # logo
    lg=Image.open('../assets/logo.png').convert('RGBA'); lg=lg.resize((int(lg.width*190/lg.height),190),Image.LANCZOS)
    sh=Image.new('RGBA',(lg.width+80,lg.height+80),(0,0,0,0)); sh.paste((0,0,0,200),(40,40),lg.split()[3]); im.alpha_composite(sh.filter(ImageFilter.GaussianBlur(14)),(W-lg.width-95,10)); im.alpha_composite(lg,(W-lg.width-55,40))
    if variant=='A':
        cover.text3d(im,370,'ИСТОРИЯ GTA',260,[(255,255,255),(225,215,255),(150,130,235)],maxw=W-140)
        # timeline strip of 5 games
        n=len(games); cw,ch=330,186; gap=26; x0=(W-(n*cw+(n-1)*gap))//2; y0=570
        d=ImageDraw.Draw(im)
        for i,(yr,img) in enumerate(games):
            x=x0+i*(cw+gap); tile=img.resize((cw,ch),Image.LANCZOS).convert('RGBA'); b=Image.new('RGBA',(cw+14,ch+14),(255,255,255,255)); b.paste(tile,(7,7))
            b=b.rotate((i-2)*2.2,expand=True,resample=Image.BICUBIC); s2=Image.new('RGBA',b.size,(0,0,0,0)); s2.paste((0,0,0,180),(0,0),b.split()[3]); im.alpha_composite(s2.filter(ImageFilter.GaussianBlur(14)),(x-12+10,y0+14)); im.alpha_composite(b,(x-12,y0))
            f=ImageFont.truetype(FD,56); tw=d.textlength(yr,font=f); cx=x-12+b.width//2; d.rounded_rectangle((cx-tw/2-22,y0+ch+22,cx+tw/2+22,y0+ch+96),radius=18,fill=(236,40,140),outline=(255,255,255),width=4); d.text((cx,y0+ch+59),yr,font=f,fill=(255,255,255),anchor='mm')
        cover.text3d(im,975,'ОТ 1997 ДО GTA 6',115,[(255,250,170),(255,205,40),(255,120,20)],glow=(255,150,30),maxw=W-160)
    else:
        cover.text3d(im,690,'ВСЯ ИСТОРИЯ',250,[(255,255,255),(225,215,255),(150,130,235)],maxw=W-140)
        cover.text3d(im,890,'GTA: 1997 → 2026',125,[(255,250,170),(255,205,40),(255,120,20)],glow=(255,150,30),maxw=W-160)
    im.convert('RGB').save(out,quality=95)
build('thumb_A.png','A'); build('thumb_B.png','B')
