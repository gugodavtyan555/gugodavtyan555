"""16:9 thumbnail (1280x720) in the same bright 3D-text style as the Shorts covers."""
import sys; sys.path.insert(0,'.')
import cover as C
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance
C.W,C.H=1280,720; W,H=1280,720
def make(out,src,crop,line,chip,stops=((255,250,170),(255,205,40),(255,120,20))):
    bg=Image.open(C.IMG+src).convert('RGB').crop(crop).resize((W,H),Image.LANCZOS)
    bg=ImageEnhance.Contrast(ImageEnhance.Color(bg).enhance(1.5)).enhance(1.1)
    im=Image.blend(bg,C.vgrad((W,H),[(150,80,255),(255,110,200),(70,10,120)]),0.22).convert('RGBA')
    dk=Image.new('RGBA',(W,H),C.NAVY+(0,)); g=Image.new('L',(1,H)); [g.putpixel((0,y),int(215*max(0,(y-330)/390)**0.9)) for y in range(H)]; dk.putalpha(g.resize((W,H))); im.alpha_composite(dk)
    lg=Image.open('../full/logo.png').convert('RGBA'); lg=lg.resize((int(lg.width*190/lg.height),190),Image.LANCZOS)
    sh=Image.new('RGBA',(lg.width+60,lg.height+60),(0,0,0,0)); sh.paste((0,0,0,180),(30,30),lg.split()[3]); im.alpha_composite(sh.filter(ImageFilter.GaussianBlur(14)),(4,0)); im.alpha_composite(lg,(34,26))
    im=im.convert('RGB').convert('RGBA')
    C.text3d(im,470,line,215,list(stops),glow=(255,150,30),maxw=W-70)
    d=ImageDraw.Draw(im); f=C.BI(62); tw=d.textlength(chip,font=f); d.rounded_rectangle((W/2-tw/2-40,596,W/2+tw/2+40,686),radius=24,fill=(255,62,150),outline=(255,255,255),width=5); d.text((W/2,641),chip,font=f,fill=(255,255,255),anchor='mm')
    im.convert('RGB').save(out,quality=94)
if __name__=='__main__':
    make('long_thumb_3d.jpg','Jason_Lucia_Rooftop_landscape.jpg',(1560,110,3540,1224),'ВСЁ О GTA 6','ПЕРЕД РЕЛИЗОМ')
