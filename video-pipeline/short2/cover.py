"""Shorts cover (1080x1920); all content kept inside y 250-1670 (TikTok/grid 3:4 safe area) in the bright '3D text' style. usage: cover.py OUT 'LINE1' 'LINE2' [chip]"""
import sys, glob
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance, ImageChops
IMG='../dl/img/'; FD='/usr/share/fonts/opentype/inter/'; W,H=1080,1920
BI=lambda s: ImageFont.truetype(FD+'InterDisplay-BlackItalic.otf',s); BK=lambda s: ImageFont.truetype(FD+'InterDisplay-Black.otf',s)
NAVY=(20,8,48)
def vgrad(size,stops):
    w,h=size; g=Image.new('RGB',(1,h))
    for y in range(h):
        t=y/max(1,h-1)*(len(stops)-1); i=min(int(t),len(stops)-2); u=t-i
        g.putpixel((0,y),tuple(int(stops[i][k]+(stops[i+1][k]-stops[i][k])*u) for k in range(3)))
    return g.resize((w,h))
def text3d(im, cy, text, size, stops, glow=(255,62,150), maxw=W-60):
    f=BI(size); d=ImageDraw.Draw(im)
    while d.textlength(text,font=f)>maxw: size-=6; f=BI(size)
    tw=int(d.textlength(text,font=f)); x=(W-tw)//2; y=cy-size//2
    def mask(sw):
        m=Image.new('L',(W,H),0); ImageDraw.Draw(m).text((x,y),text,font=f,fill=255,stroke_width=sw,stroke_fill=255); return m
    gl=Image.new('RGBA',(W,H),glow+(0,)); gl.putalpha(mask(34).filter(ImageFilter.GaussianBlur(26)).point(lambda v:int(v*0.9))); im.alpha_composite(gl)
    out=mask(20); ext=Image.new('L',(W,H),0)
    for i in range(0,22,2): ext=ImageChops.lighter(ext,ImageChops.offset(out,i//2,i))
    im.paste(Image.new('RGB',(W,H),(8,3,24)),(0,0),ext); im.paste(Image.new('RGB',(W,H),NAVY),(0,0),out)
    im.paste(Image.new('RGB',(W,H),(255,255,255)),(0,0),mask(7))
    fill=vgrad((W,size+40),stops); full=Image.new('RGB',(W,H)); full.paste(fill,(0,y-10)); im.paste(full,(0,0),mask(0))
    hl=Image.new('L',(W,H),0); ImageDraw.Draw(hl).rectangle((0,y+int(size*0.18),W,y+int(size*0.46)),fill=70); im.paste(Image.new('RGB',(W,H),(255,255,255)),(0,0),ImageChops.multiply(hl,mask(0)))
def box(im, name, cx, cy, h, ang, label, col):
    a=Image.open(IMG+name+'.jpg').convert('RGBA'); a=a.resize((int(a.width*h/a.height),h),Image.LANCZOS)
    b=Image.new('RGBA',(a.width+24,a.height+24),(255,255,255,255)); b.paste(a,(12,12)); d=ImageDraw.Draw(b)
    f=BK(54); tw=d.textlength(label,font=f); d.rounded_rectangle((b.width/2-tw/2-30,b.height-104,b.width/2+tw/2+30,b.height-24),radius=20,fill=col); d.text((b.width/2,b.height-64),label,font=f,fill=(255,255,255),anchor='mm',stroke_width=3,stroke_fill=NAVY)
    b=b.rotate(ang,expand=True,resample=Image.BICUBIC)
    sh=Image.new('RGBA',b.size,(0,0,0,0)); sh.paste((0,0,0,170),(0,0),b.split()[3]); sh=sh.filter(ImageFilter.GaussianBlur(22))
    im.alpha_composite(sh,(cx-b.width//2+18,cy-b.height//2+26)); im.alpha_composite(b,(cx-b.width//2,cy-b.height//2))
def make(out,l1,l2,chip=None):
    bgs=sorted(glob.glob(IMG+'Hero_BG.*.jpg')); bg=Image.open(bgs[4]).convert('RGB'); s=H/bg.height; bg=bg.resize((int(bg.width*s),H),Image.LANCZOS); x0=(bg.width-W)//2
    bg=ImageEnhance.Color(bg.crop((x0,0,x0+W,H))).enhance(1.7); im=Image.blend(bg,vgrad((W,H),[(120,60,230),(255,90,190),(60,10,110)]),0.42).convert('RGBA')
    lg=Image.open('../full/logo.png').convert('RGBA'); lg=lg.resize((int(lg.width*250/lg.height),250),Image.LANCZOS)
    sh=Image.new('RGBA',(lg.width+80,lg.height+80),(0,0,0,0)); sh.paste((0,0,0,170),(40,40),lg.split()[3]); im.alpha_composite(sh.filter(ImageFilter.GaussianBlur(18)),((W-lg.width)//2-40,240)); im.alpha_composite(lg,((W-lg.width)//2,280))
    box(im,'GTAVI_FOB_StandardEdition_Desktop',300,860,500,7,'STANDARD',(255,62,150)); box(im,'GTAVI_FOB_UltimateEdition_Desktop_en_us',780,885,530,-6,'ULTIMATE',(240,170,20))
    dk=Image.new('RGBA',(W,H),NAVY+(0,)); g=Image.new('L',(1,H)); [g.putpixel((0,y),int(200*max(0,(y-1150)/770)**0.9)) for y in range(H)]; dk.putalpha(g.resize((W,H))); im.alpha_composite(dk)
    im=im.convert('RGB').convert('RGBA')
    text3d(im,1265,l1,210,[(255,255,255),(225,215,255),(150,130,235)])
    text3d(im,1465,l2,210,[(255,250,170),(255,205,40),(255,120,20)],glow=(255,150,30))
    if chip:
        d=ImageDraw.Draw(im); f=BI(60); tw=d.textlength(chip,font=f); d.rounded_rectangle((W/2-tw/2-40,1582,W/2+tw/2+40,1668),radius=24,fill=(255,62,150),outline=(255,255,255),width=5); d.text((W/2,1625),chip,font=f,fill=(255,255,255),anchor='mm')
    im.convert('RGB').save(out,quality=95)
if __name__=='__main__': make(sys.argv[1],sys.argv[2],sys.argv[3],sys.argv[4] if len(sys.argv)>4 else None)
