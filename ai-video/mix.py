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
ICON_SFX={'clock':lambda:[(0.15,tick(2000)),(0.65,tick(1500)),(1.15,tick(2000)),(1.65,tick(1500))],
 'timer':lambda:[(0.2,rise(1.3))],'film':lambda:[(0.25,snip())],'bulb':lambda:[(0.25,ding(1568))],
 'doc':lambda:[(0.15+k*.25,click()) for k in range(6)],'wave':lambda:[(0.2,beepup())],
 'timeline':lambda:[(0.2,click()),(0.5,click()),(0.8,click())],'coin':lambda:[(0.3,coin())],
 'arrow':lambda:[(0.3,bounce()),(0.9,bounce()),(1.5,bounce())]}
# ---------- Музыка: 100 BPM, Am–F–C–G ----------
def music(total,bpm=100):
    n=int(total*SR);out=np.zeros(n+SR*2);beat=60/bpm;bar=beat*4
    chords=[(57,[57,60,64]),(53,[53,57,60]),(48,[48,52,55]),(55,[55,59,62])]
    mf=lambda m:440*2**((m-69)/12)
    nb=int(total/bar)+1
    def add(x,at):
        i=int(at*SR);m=min(len(x),len(out)-i)
        if m>0:out[i:i+m]+=x[:m]
    # ударные
    t=t_(.3);kick=np.sin(2*np.pi*np.cumsum(45+110*np.exp(-t*28))/SR)*env(len(t),.001,.1)
    hat=lp(rng.standard_normal(int(.06*SR)),9000);hat=(rng.standard_normal(int(.06*SR))-lp(rng.standard_normal(int(.06*SR)),3000))*env(int(.06*SR),.0005,.012)
    clap=(rng.standard_normal(int(.18*SR)))*env(int(.18*SR),.001,.05)
    for b in range(nb):
        root,ch=chords[b%4];st=b*bar
        for k in range(4):
            add(kick*.9,st+k*beat)
            if k in(1,3):add(clap*.22,st+k*beat)
        for k in range(8):add(hat*(.16 if k%2 else .09),st+k*beat/2)
        # бас
        for k,(off,div) in enumerate([(0,1),(1.5,1),(2,1),(3,1)]):
            f=mf(root-12);tb=t_(beat*.9);x=np.sin(2*np.pi*f*tb)+.35*np.sin(4*np.pi*f*tb)
            add(x*env(len(tb),.005,.35)*.38,st+off*beat)
        # пэд
        tp=t_(bar);pad=sum(np.sin(2*np.pi*mf(m)*tp)+.5*np.sin(2*np.pi*mf(m)*1.004*tp) for m in ch)/6
        add(pad*np.minimum(tp/.3,1)*np.minimum((bar-tp)/.3,1)*.16,st)
        # арпеджио 16-е
        for k in range(16):
            m=ch[[0,1,2,1][k%4]]+12*(1 if k%8>=4 else 0)+12;f=mf(m);ta=t_(beat/4*1.6)
            x=(np.sign(np.sin(2*np.pi*f*ta))*.4+np.sin(2*np.pi*f*ta)*.6)
            add(x*env(len(ta),.002,.07)*.1,st+k*beat/4)
    m=out[:n];return m/np.abs(m).max()*.9
# ---------- Микс ----------
timing=json.loads(re.search(r'\[.*\]',open(os.path.join(D,'timing.js')).read()).group(0))
icons=re.findall(r'icon:\s*"(\w+)"',open(os.path.join(D,'scenes.js')).read())
voice=rd(os.path.join(AD,'voice.wav'));total=len(voice)/SR
mus=music(total)
# fade in/out
f=int(.8*SR);mus[:f]*=np.linspace(0,1,f);mus[-int(1.5*SR):]*=np.linspace(1,0,int(1.5*SR))
# дакинг под голос
absv=np.abs(voice);w=int(.12*SR);sm=np.convolve(absv,np.ones(w)/w,'same')
duck=np.clip(1-sm*14,.28,1);duck=lp(duck,6.0)
mus=mus[:len(voice)]*duck[:len(mus)]*.55
sfx=np.zeros(len(voice)+SR*2);st=0
def put(x,at):
    i=int(at*SR);m=min(len(x),len(sfx)-i)
    if m>0:sfx[i:i+m]+=x[:m]
for k,d in enumerate(timing):
    put(whoosh(),st);put(pop(),st+.12)
    for dt,x in ICON_SFX.get(icons[k],lambda:[])():put(x,st+dt)
    st+=d
sfx=sfx[:len(voice)]*.75
# голос: лёгкая компрессия/нормализация
v=voice/ max(np.abs(voice).max(),1e-3)*.92
mix=v*1.0+mus+sfx
mix=np.tanh(mix*1.1)*.95
wr(os.path.join(AD,'mix.wav'),mix);print('mix.wav',round(total,1),'сек')
