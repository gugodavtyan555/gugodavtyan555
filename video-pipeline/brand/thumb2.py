from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
import glob
IMG='../dl/img/'; FD='/usr/share/fonts/opentype/inter/'
FI=lambda s: ImageFont.truetype(FD+'InterDisplay-BlackItalic.otf',s)
PINK,YELLOW,NAVY,WHITE,GREEN=(255,62,150),(255,222,40),(14,8,30),(255,255,255),(70,255,90)
W,H=1280,720
LOGO=Image.open('../full/logo.png').convert('RGBA')
def logo(im,x,y,h):
    l=LOGO.resize((int(LOGO.width*h/LOGO.height),h),Image.LANCZOS)
    sh=Image.new('RGBA',(l.width+60,l.height+60),(0,0,0,0)); sh.paste((0,0,0,190),(30,30),l.split()[3]); im.alpha_composite(sh.filter(ImageFilter.GaussianBlur(14)),(x-30,y-30)); im.alpha_composite(l,(x,y))
def shade(im, top=0.0, bottom=0.92, start=0.45):
    g=Image.new('L',(1,H)); [g.putpixel((0,y),int(255*(top*max(0,1-y/(H*0.25))+bottom*max(0,(y/H-start)/(1-start))**1.2))) for y in range(H)]
    d=Image.new('RGBA',(W,H),NAVY+(0,)); d.putalpha(g.resize((W,H))); im.alpha_composite(d)
def line(im, y, parts, size, cx=W//2, align='c', x0=40):
    """parts: [(text, colour)]; draws one line with thick stroke + soft shadow."""
    f=FI(size); d=ImageDraw.Draw(im); tw=sum(d.textlength(t,font=f) for t,_ in parts)
    while tw>W-70: size-=4; f=FI(size); tw=sum(d.textlength(t,font=f) for t,_ in parts)
    x=cx-tw/2 if align=='c' else x0
    sh=Image.new('RGBA',(W,H),(0,0,0,0)); ds=ImageDraw.Draw(sh); xx=x
    for t,_ in parts: ds.text((xx+6,y+10),t,font=f,fill=(0,0,0,230),stroke_width=16,stroke_fill=(0,0,0,230)); xx+=ds.textlength(t,font=f)
    im.alpha_composite(sh.filter(ImageFilter.GaussianBlur(8))); d=ImageDraw.Draw(im)
    for t,c in parts: d.text((x,y),t,font=f,fill=c,stroke_width=13,stroke_fill=NAVY); x+=d.textlength(t,font=f)
def base(src,crop,color=1.35,contrast=1.15):
    bg=Image.open(IMG+src).convert('RGB').crop(crop).resize((W,H),Image.LANCZOS)
    return ImageEnhance.Contrast(ImageEnhance.Color(bg).enhance(color)).enhance(contrast).convert('RGBA')

# 1 — both heroes, tight crop, one huge line
im=base('Jason_Lucia_Rooftop_landscape.jpg',(1560,110,3540,1224)); shade(im,top=0.35,bottom=0.95,start=0.52)
logo(im,36,30,170); line(im,400,[('ВСЁ О ',WHITE),('GTA 6',YELLOW)],200); line(im,618,[('ПЕРЕД РЕЛИЗОМ',WHITE)],74)
im.convert('RGB').save('pro_1.jpg',quality=93)

# 2 — Lucia close-up, urgency
im=base('Lucia_Caminos_13.jpg',(120,0,3320,1800)); shade(im,top=0.3,bottom=0.95,start=0.5)
logo(im,W-36-int(LOGO.width*170/LOGO.height),30,170); line(im,410,[('ЭТО НАДО ',WHITE),('ЗНАТЬ',GREEN)],176); line(im,596,[('ДО 19 НОЯБРЯ',YELLOW)],96)
im.convert('RGB').save('pro_2.jpg',quality=93)

# 3 — official cut-outs line-up on a neon background
fg=sorted(glob.glob(IMG+'Hero_FG.*.png')); bgs=sorted(glob.glob(IMG+'Hero_BG.*.jpg'))
bg=Image.open(bgs[4]).convert('RGB').resize((W,int(W*2670/3840)),Image.LANCZOS).crop((0,60,W,60+H)); bg=ImageEnhance.Brightness(ImageEnhance.Color(bg).enhance(1.5)).enhance(0.55)
tint=Image.new('RGB',(W,H),(110,20,140)); im=Image.blend(bg,tint,0.45).convert('RGBA')
glow=Image.new('RGBA',(W,H),(0,0,0,0)); ImageDraw.Draw(glow).ellipse((240,60,1040,660),fill=(255,62,150,150)); im.alpha_composite(glow.filter(ImageFilter.GaussianBlur(120)))
def cut(i,height,x,flip=False):
    a=Image.open(fg[i]).convert('RGBA'); a=a.crop(a.getbbox())
    if a.height>a.width*2.2: a=a.crop((0,0,a.width,int(a.width*2.2)))
    a=a.resize((int(a.width*height/a.height),height),Image.LANCZOS)
    if flip: a=a.transpose(Image.FLIP_LEFT_RIGHT)
    edge=Image.new('RGBA',(a.width+40,a.height+40),(0,0,0,0)); edge.paste((255,255,255,255),(20,20),a.split()[3]); edge=edge.filter(ImageFilter.GaussianBlur(5))
    im.alpha_composite(edge,(x-20,H-height-20+40)); im.alpha_composite(a,(x,H-height+40))
cut(1,640,40); cut(4,600,770); cut(3,700,400)       # Raul, Real Dimez, Boobie in front
shade(im,top=0.25,bottom=0.97,start=0.58); logo(im,36,26,150)
line(im,462,[('ПОЛНЫЙ ',WHITE),('РАЗБОР',YELLOW)],168); line(im,634,[('ГЕРОИ • СЮЖЕТ • КАРТА',WHITE)],64)
im.convert('RGB').save('pro_3.jpg',quality=93)
prev=Image.new('RGB',(1920,360))
for i in (1,2,3): prev.paste(Image.open(f'pro_{i}.jpg').resize((640,360)),((i-1)*640,0))
prev.save('pro_prev.jpg',quality=85)
