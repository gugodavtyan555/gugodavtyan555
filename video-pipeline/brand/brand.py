from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
import os
IMG='../dl/img/'; FD='/usr/share/fonts/opentype/inter/'
F=lambda n,s: ImageFont.truetype(FD+n,s)
BLACK=lambda s:F('InterDisplay-Black.otf',s); XB=lambda s:F('InterDisplay-ExtraBold.otf',s); B=lambda s:F('InterDisplay-Bold.otf',s)
PINK,YELLOW,NAVY,WHITE=(255,62,150),(255,210,63),(20,14,40),(255,255,255)

def grad(size, c1, c2, c3):
    w,h=size; im=Image.new('RGB',(1,256))
    for y in range(256):
        t=y/255; a,b,u=(c1,c2,t*2) if t<.5 else (c2,c3,(t-.5)*2)
        im.putpixel((0,y),tuple(int(a[i]+(b[i]-a[i])*u) for i in range(3)))
    return im.resize((w,h))

def wordmark(scale=1.0, tag=True):
    """'GTA' + yellow 'ГИД' chip on a transparent layer; returns RGBA image tightly cropped."""
    s=scale; im=Image.new('RGBA',(int(1500*s),int(520*s)),(0,0,0,0)); d=ImageDraw.Draw(im)
    f=BLACK(int(330*s)); d.text((int(20*s),int(40*s)),'GTA',font=f,fill=WHITE,stroke_width=int(10*s),stroke_fill=NAVY)
    x=int(20*s)+d.textlength('GTA',font=f)+int(46*s)
    f2=BLACK(int(250*s)); tw=d.textlength('ГИД',font=f2)
    d.rounded_rectangle((x,int(86*s),x+tw+int(90*s),int(392*s)),radius=int(44*s),fill=YELLOW)
    d.text((x+int(45*s),int(239*s)),'ГИД',font=f2,fill=NAVY,anchor='lm')
    d.rectangle((int(30*s),int(430*s),int(30*s)+int(420*s),int(452*s)),fill=PINK)
    return im.crop(im.getbbox())

# ---------- avatar 800x800 (shown as a circle)
av=grad((800,800),(52,18,96),(170,30,120),(255,120,70)).convert('RGBA')
glow=Image.new('RGBA',(800,800),(0,0,0,0)); ImageDraw.Draw(glow).ellipse((150,330,650,830),fill=(255,210,63,150)); av.alpha_composite(glow.filter(ImageFilter.GaussianBlur(70)))
d=ImageDraw.Draw(av)
for i in range(7): d.rectangle((0,560+i*38,800,560+i*38+10+i*3),fill=NAVY+(210,))       # retro sun stripes / horizon
d.rectangle((0,700,800,800),fill=NAVY+(255,))
f=BLACK(250); d.text((400,300),'GTA',font=f,fill=WHITE,anchor='mm',stroke_width=10,stroke_fill=NAVY)
f2=BLACK(150); tw=d.textlength('ГИД',font=f2)
d.rounded_rectangle((400-tw/2-46,405,400+tw/2+46,590),radius=34,fill=YELLOW); d.text((400,497),'ГИД',font=f2,fill=NAVY,anchor='mm')
av.convert('RGB').save('avatar_800.png')
m=Image.new('L',(800,800),0); ImageDraw.Draw(m).ellipse((0,0,799,799),fill=255)
prev=Image.new('RGB',(800,800),(255,255,255)); prev.paste(av.convert('RGB'),(0,0),m); prev.resize((300,300)).save('avatar_preview.jpg')

# ---------- banner 2560x1440, safe area 1546x423 centred
W,H=2560,1440
bg=Image.open(IMG+'Vice_City_27.jpg').convert('RGB').resize((W,H),Image.LANCZOS)
bg=ImageEnhance.Brightness(bg).enhance(0.62); bg=ImageEnhance.Color(bg).enhance(1.25)
tint=grad((W,H),(40,10,90),(120,20,110),(20,14,40)); bn=Image.blend(bg,tint,0.38).convert('RGBA')
band=Image.new('RGBA',(W,H),(0,0,0,0)); ImageDraw.Draw(band).rectangle((0,H//2-290,W,H//2+290),fill=(12,8,28,150)); bn.alpha_composite(band.filter(ImageFilter.GaussianBlur(60)))
d=ImageDraw.Draw(bn); cx,cy=W//2,H//2
wm=wordmark(0.54); bn.alpha_composite(wm,(cx-wm.width//2,cy-200))
f=XB(58); tx='ВСЁ О GTA 6: РАЗБОРЫ • НОВОСТИ • ГАЙДЫ'
d.text((cx,cy+78),tx,font=f,fill=WHITE,anchor='mm',stroke_width=4,stroke_fill=NAVY)
f=B(42); tx='Только факты — без слухов и кликбейта'; tw=d.textlength(tx,font=f)
d.rounded_rectangle((cx-tw/2-30,cy+124,cx+tw/2+30,cy+192),radius=14,fill=PINK); d.text((cx,cy+158),tx,font=f,fill=WHITE,anchor='mm')
bn.convert('RGB').save('banner_2560x1440.png')
chk=bn.copy(); ImageDraw.Draw(chk).rectangle((cx-773,cy-211,cx+773,cy+211),outline=(0,255,0,255),width=6); chk.convert('RGB').resize((1280,720)).save('banner_preview.jpg',quality=85)
bn.crop((cx-773,cy-211,cx+773,cy+211)).convert('RGB').resize((1030,282)).save('banner_mobile_preview.jpg',quality=85)

# ---------- video watermark 150x150
wmk=Image.new('RGBA',(600,600),(0,0,0,0)); d=ImageDraw.Draw(wmk)
d.rounded_rectangle((20,20,580,580),radius=120,fill=NAVY+(235,)); d.rounded_rectangle((20,20,580,580),radius=120,outline=PINK+(255,),width=18)
d.text((300,215),'GTA',font=BLACK(190),fill=WHITE,anchor='mm')
f2=BLACK(120); tw=d.textlength('ГИД',font=f2); d.rounded_rectangle((300-tw/2-34,310,300+tw/2+34,470),radius=30,fill=YELLOW); d.text((300,390),'ГИД',font=f2,fill=NAVY,anchor='mm')
wmk.resize((150,150),Image.LANCZOS).save('watermark_150.png')
