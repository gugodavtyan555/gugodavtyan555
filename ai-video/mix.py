"""Синтез музыки + звуковых эффектов и финальный микс (голос, музыка с дакингом, SFX).
python3 mix.py  →  audio/mix.wav   (нужны: audio/voice.wav, timing.js; numpy)"""
import numpy as np, wave, re, json, os
SR=44100; D=os.path.dirname(os.path.abspath(__file__)); AD=os.path.join(D,'audio')
rng=np.random.default_rng(7)
def rd(p):
    w=wave.open(p); a=np.frombuffer(w.readframes(w.getnframes()),np.int16).astype(np.float32)/32768
    if w.getnchannels()==2:a=a.reshape(-1,2).mean(1)
    return a
def wr(p,a):
    a=np.clip(a,-1,1);w=wave.open(p,'w');w.setnchannels(1);w.setsampwidth(2);w.setframerate(SR)
    w.writeframes((a*32767).astype(np.int16).tobytes());w.close()
def t_(d):return np.arange(int(d*SR))/SR
def lp(x,fc):  # one-pole lowpass (fc может быть массивом)
    fc=np.broadcast_to(fc,x.shape);a=1-np.exp(-2*np.pi*fc/SR);y=np.empty_like(x);s=0.0
    for i in range(len(x)):s+=a[i]*(x[i]-s);y[i]=s
    return y
def env(n,att,dec):
    t=np.arange(n)/SR;return np.minimum(t/max(att,1e-4),1)*np.exp(-t/dec)
# ---------- SFX ----------
def whoosh(d=.45):
    n=int(d*SR);t=np.arange(n)/SR;x=rng.standard_normal(n)
    y=lp(x,200+5500*np.sin(np.pi*t/d)**2);y=lp(y,200+5500*np.sin(np.pi*t/d)**2)
    return y/np.abs(y).max()*np.sin(np.pi*t/d)**1.5*.55
def pop(f0=700,f1=260,d=.16):
    t=t_(d);ph=2*np.pi*np.cumsum(f1+(f0-f1)*np.exp(-t*30))/SR
    return np.sin(ph)*env(len(t),.002,.05)*.7
def tick(f=1800):
    t=t_(.05);return (np.sin(2*np.pi*f*t)+.5*rng.standard_normal(len(t)))*env(len(t),.0005,.008)*.5
def ding(f=1318,d=.7):
    t=t_(d);return (np.sin(2*np.pi*f*t)+.4*np.sin(2*np.pi*f*2.01*t)+.2*np.sin(2*np.pi*f*3.02*t))*env(len(t),.002,.18)*.35
def rise(d=.9,f0=300,f1=1400):
    t=t_(d);ph=2*np.pi*np.cumsum(f0+(f1-f0)*(t/d)**2)/SR;return np.sin(ph)*np.minimum(t/d,1)*np.minimum((d-t)/.05,1)*.25
def snip():
    return np.concatenate([tick(2600),np.zeros(int(.05*SR)),tick(2200)])
def click():return tick(1100)
def beepup():return np.concatenate([pop(500,500,.07),pop(800,800,.07),pop(1100,1100,.12)])
def coin():
    return np.concatenate([pop(1700,1700,.06),ding(2093,.6)])
def bounce():return np.concatenate([pop(600,300,.1),np.zeros(int(.1*SR)),pop(600,300,.1)])
ICON_SFX={'week':lambda:[(0.2+k*.16,click()) for k in range(5)],'gauge':lambda:[(0.15,rise(1.3))],'flow':lambda:[(0.15,pop()),(0.75,pop()),(1.35,ding(1318))],'crosslist':lambda:[(0.5+k*.6,snip()) for k in range(4)],'tools':lambda:[(0.2,pop()),(0.55,pop()),(0.9,pop())],'prompt':lambda:[(0.15+k*.05,click()) for k in range(14)]+[(1.0,pop()),(1.3,pop()),(1.6,pop())],'checklist':lambda:[(0.5,ding(1568)),(1.1,ding(1568)),(1.7,ding(1760))],'voicepick':lambda:[(0.2,pop()),(0.5,pop()),(1.3,beepup())],'progress':lambda:[(0.15,rise(1.6)),(0.6,ding(1318)),(1.1,ding(1568)),(1.6,ding(1760))],'free':lambda:[(0.2,coin())],'tg':lambda:[(0.3,bounce()),(0.9,bounce()),(1.5,bounce())],'clock':lambda:[(0.15,tick(2000)),(0.65,tick(1500)),(1.15,tick(2000)),(1.65,tick(1500))],
 'timer':lambda:[(0.2,rise(1.3))],'film':lambda:[(0.25,snip())],'bulb':lambda:[(0.25,ding(1568))],
 'doc':lambda:[(0.15+k*.25,click()) for k in range(6)],'wave':lambda:[(0.2,beepup())],
 'timeline':lambda:[(0.2,click()),(0.5,click()),(0.8,click())],'coin':lambda:[(0.3,coin())],
 'arrow':lambda:[(0.3,bounce()),(0.9,bounce()),(1.5,bounce())]}
# ---------- Музыка: спокойный lo-fi, 76 BPM, Cmaj7–Am7–Fmaj7–G6 ----------
def reverb(x,sec=1.8,wet=.32):
    n=int(sec*SR);ir=rng.standard_normal(n)*np.exp(-np.arange(n)/SR*3.2);ir=lp(ir,3500);ir/=np.abs(ir).sum()*.06
    L=len(x)+n;N=1<<(L-1).bit_length();y=np.fft.irfft(np.fft.rfft(x,N)*np.fft.rfft(ir,N),N)[:len(x)]
    return x*(1-wet)+y*wet*3
def epiano(f,d):
    t=t_(d);mod=np.sin(2*np.pi*f*t)*1.6*np.exp(-t*5)
    y=np.sin(2*np.pi*f*t+mod)+.25*np.sin(2*np.pi*f*2*t+mod*.5)*np.exp(-t*3)
    return y*env(len(t),.004,.9)*.5
def music(total,bpm=76):
    n=int(total*SR);out=np.zeros(n+SR*4);beat=60/bpm;bar=beat*4
    chords=[[48,55,59,64],[45,52,55,60],[41,48,52,57],[43,50,55,59]]
    mf=lambda m:440*2**((m-69)/12)
    pent=[72,74,76,79,81,84]
    def add(x,at):
        i=int(at*SR);m=min(len(x),len(out)-i)
        if m>0:out[i:i+m]+=x[:m]
    nb=int(total/bar)+2;tk=t_(.28);kick=np.sin(2*np.pi*np.cumsum(48+70*np.exp(-tk*30))/SR)*env(len(tk),.002,.09)
    hat=lp(rng.standard_normal(int(.08*SR)),7000)*env(int(.08*SR),.002,.02)
    for b in range(nb):
        ch=chords[b%4];st=b*bar
        add(kick*.22,st);add(kick*.15,st+2*beat)               # очень мягкий бочонок
        for k in range(8):add(hat*(.10 if k%2 else .05),st+k*beat/2)  # щёточки
        # бас
        tb=t_(bar*.95);f=mf(ch[0]-12);add((np.sin(2*np.pi*f*tb)+.2*np.sin(4*np.pi*f*tb))*np.minimum(tb/.05,1)*np.minimum((bar-tb)/.3,1)*.30,st)
        # пэд
        tp=t_(bar*1.05);pad=sum(np.sin(2*np.pi*mf(m)*tp)+.4*np.sin(2*np.pi*mf(m)*1.003*tp) for m in ch)/9
        add(pad*np.minimum(tp/.6,1)*np.minimum((bar*1.05-tp)/.6,1)*.20,st)
        # аккорд на пианино (мягко) + арпеджио 8-ми
        for k,m in enumerate(ch):add(epiano(mf(m+12),1.4)*.10,st+k*beat/2*.06)
        for k in range(8):
            m=ch[[0,2,1,3,2,1,3,2][k]]+12;add(epiano(mf(m),.9)*.09,st+k*beat/2)
        # мелодия — пентатоника, редкие ноты
        for pos in([0,1.5,2.5] if b%2==0 else [0.5,2,3]):
            if rng.random()<.8:add(epiano(mf(int(rng.choice(pent))),1.6)*.16,st+pos*beat)
    m=reverb(out[:n]);return m/np.abs(m).max()*.9
# ---------- Микс ----------
timing=json.loads(re.search(r'\[.*\]',open(os.path.join(D,'timing.js')).read()).group(0))
icons=re.findall(r'icon:\s*"(\w+)"',open(os.path.join(D,'scenes.js')).read())
voice=rd(os.path.join(AD,'voice.wav'));total=len(voice)/SR
mus=music(total)
# fade in/out
f=int(.8*SR);mus[:f]*=np.linspace(0,1,f);mus[-int(1.5*SR):]*=np.linspace(1,0,int(1.5*SR))
# дакинг под голос
absv=np.abs(voice);w=int(.12*SR);sm=np.convolve(absv,np.ones(w)/w,'same')
duck=np.clip(1-sm*12,.38,1);duck=lp(duck,6.0)
mus=mus[:len(voice)]*duck[:len(mus)]*.62
sfx=np.zeros(len(voice)+SR*2);st=0
def put(x,at):
    i=int(at*SR);m=min(len(x),len(sfx)-i)
    if m>0:sfx[i:i+m]+=x[:m]
for k,d in enumerate(timing):
    put(whoosh(),st);put(pop(),st+.12)
    for dt,x in ICON_SFX.get(icons[k],lambda:[])():put(x,st+dt)
    st+=d
sfx=sfx[:len(voice)]*.5
# голос: лёгкая компрессия/нормализация
v=voice/ max(np.abs(voice).max(),1e-3)*.92
mix=v*1.0+mus+sfx
mix=np.tanh(mix*1.1)*.95
wr(os.path.join(AD,'mix.wav'),mix);print('mix.wav',round(total,1),'сек')
