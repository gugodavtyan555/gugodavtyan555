import sys,subprocess as sp
sys.path.insert(0,'../doc')
from PIL import Image,ImageEnhance,ImageFilter
import cover
cover.W,cover.H=1920,1080; W,H=1920,1080
sp.run(['ffmpeg','-v','error','-y','-ss','19.5','-i','../../dl/src/GTAVI_Trailer_1.mp4','-frames:v','1','-vf',f'scale={W}:{H}','/tmp/claude-0/hist/tf.png'],check=True)
bg=Image.open('/tmp/claude-0/hist/tf.png').convert('RGB'); bg=ImageEnhance.Contrast(ImageEnhance.Color(bg).enhance(1.5)).enhance(1.12)
im=Image.blend(bg,cover.vgrad((W,H),[(150,80,255),(255,110,200),(70,10,120)]),0.18).convert('RGBA')
dk=Image.new('RGBA',(W,H),cover.NAVY+(0,)); g=Image.new('L',(1,H)); [g.putpixel((0,y),int(210*max(0,(y-300)/780)**0.9)) for y in range(H)]; dk.putalpha(g.resize((W,H))); im.alpha_composite(dk)
lg=Image.open('../assets/logo.png').convert('RGBA'); lg=lg.resize((int(lg.width*300/lg.height),300),Image.LANCZOS)
sh=Image.new('RGBA',(lg.width+80,lg.height+80),(0,0,0,0)); sh.paste((0,0,0,190),(40,40),lg.split()[3]); im.alpha_composite(sh.filter(ImageFilter.GaussianBlur(16)),(40,20)); im.alpha_composite(lg,(80,60))
cover.text3d(im,640,'ИСТОРИЯ GTA',250,[(255,255,255),(225,215,255),(150,130,235)],maxw=W-120)
cover.text3d(im,880,'ОТ 1997 ДО GTA 6',150,[(255,250,170),(255,205,40),(255,120,20)],glow=(255,150,30),maxw=W-120)
im.convert('RGB').save('thumb.png',quality=95)
