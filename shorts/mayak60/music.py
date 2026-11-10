import numpy as np, wave, json
d=json.load(open('work/data.json'))
SR=44100; D=float(d['dur']); n=int(SR*D); t=np.arange(n)/SR
rng=np.random.default_rng(4); out=np.zeros(n)
shot={s['fn']:s['s'] for s in d['shots']}
def note(f,start,dur,amp=0.3,kind='piano'):
    i0=int(start*SR); m=min(int(dur*SR),n-i0)
    if m<=0 or i0<0: return
    tt=np.arange(m)/SR
    if kind=='piano':
        env=np.exp(-tt*2.2)*np.minimum(1,tt/0.006)
        w=sum(a*np.sin(2*np.pi*f*h*tt*(1+0.0004*h*h)) for h,a in ((1,1),(2,0.45),(3,0.22),(4,0.1),(5,0.05)))
    elif kind=='bell':
        env=np.exp(-tt*1.6)*np.minimum(1,tt/0.004)
        w=sum(a*np.sin(2*np.pi*f*h*tt) for h,a in ((1,1),(2.76,0.4),(5.4,0.2),(8.9,0.08)))
    else:
        env=np.minimum(1,tt/1.2)*np.minimum(1,(dur-tt)/1.5)
        w=sum(np.sin(2*np.pi*f*dd*tt+ph) for dd,ph in ((1,0),(1.004,1),(0.996,2),(2.002,0.5)))*0.3
    out[i0:i0+m]+=amp*env*w
A=lambda s: 220*2**(s/12)
CH=[[-12,0,3,7],[-16,-4,0,5],[-9,-5,3,7],[-14,-2,2,5]]   # Am F C G
BAR=3.75
st0,st1=d['storm']; eS=shot['shotE']; fin=d['finale']; nS=shot['shotNights']; dS=shot['shotD']
def sect(x):
    if x>=fin: return 'fin'
    if x>=eS: return 'tension'
    if x>=dS: return 'soft'
    if x>=nS: return 'build'
    if x>=st1: return 'calm'
    if x>=st0: return 'storm'
    return 'main'
b=0
while b*BAR<D:
    s0=b*BAR; ch=CH[b%4]; sc=sect(s0+0.1)
    if sc=='fin': ch=[-12,0,4,7]      # A major — надежда
    pa={'storm':0.07,'tension':0.06,'fin':0.06}.get(sc,0.05)
    for s in ch: note(A(s)/2,s0,BAR+0.6,pa,'pad')
    if sc=='storm':
        note(A(ch[0])/2,s0,BAR,0.12,'pad')
    b+=1
x=0.0
while x<D-1:
    sc=sect(x); ch=CH[int(x//BAR)%4]; k=int(round((x%BAR)/0.3125))
    arp=[ch[1],ch[2],ch[3],ch[2]+12,ch[3],ch[2]]
    if sc=='main' and k%2==0:
        note(A(arp[(k//2)%6]),x,2.5,0.10,'piano')
        if k==0: note(A(ch[0]),x,3.5,0.13,'piano')
    elif sc=='build':
        note(A(arp[k%6]+ (12 if k%4==3 else 0)),x,1.6,0.085+0.03*min(1,(x-nS)/4),'piano')
        if k==0: note(A(ch[0]),x,3.5,0.15,'piano')
    elif sc in('calm','soft') and k%4==0:
        note(A(arp[(k//4)%6]+12),x,3.0,0.09,'piano')
    elif sc=='fin' and k%3==0:
        f=[0,4,7,12,16,19][(k//3)%6]; note(A(f),x,3.0,0.10,'piano')
    x+=0.3125
# hit + bells
i0=int(d['hit']*SR); tt=np.arange(n-i0)/SR
out[i0:]+=0.55*np.exp(-tt*1.2)*np.sin(2*np.pi*(50+20*np.exp(-tt*9))*tt)
for i,f in enumerate(d['fl']):
    s=19 if i<3 else 24
    note(A(s),f['t'],2.5,0.17,'bell'); note(A(s-12),f['t'],2.5,0.08,'bell')
# noise beds
def smooth(x,k): return np.convolve(x,np.ones(k)/k,'same')
sea=smooth(rng.standard_normal(n),60); sea/=np.abs(sea).max()
out+=sea*0.09*(0.55+0.45*np.sin(2*np.pi*t/5.5))
env=np.clip((t-st0)/0.6,0,1)*np.clip((st1-t)/0.8,0,1)
w=rng.standard_normal(n); rainn=w-smooth(w,8); rainn/=np.abs(rainn).max()
out+=rainn*0.05*env
wind=smooth(rng.standard_normal(n),400); wind/=np.abs(wind).max()
out+=wind*0.22*env*(0.6+0.4*np.sin(2*np.pi*t/2.3))
for L in d['lightning']:
    i0=int((L+0.1)*SR); m=min(int(2.4*SR),n-i0); tt=np.arange(m)/SR
    th=smooth(rng.standard_normal(m),260); th/=np.abs(th).max()
    out[i0:i0+m]+=th*0.55*np.exp(-tt*1.7)*np.minimum(1,tt/0.02)
    cr=rng.standard_normal(m); out[i0:i0+m]+=cr*0.10*np.exp(-tt*14)
# reverb
ir_n=int(2.2*SR); ir=rng.standard_normal(ir_n)*np.exp(-np.arange(ir_n)/SR*2.6); ir[0]=0
N=1<<int(np.ceil(np.log2(n+ir_n)))
wet=np.fft.irfft(np.fft.rfft(out,N)*np.fft.rfft(ir,N),N)[:n]
out=out+wet/np.abs(wet).max()*np.abs(out).max()*0.4
out*=np.minimum(1,t/0.4)*np.minimum(1,(D-t)/1.2)
out=np.tanh(out/np.abs(out).max()*1.6)*0.8
wv=wave.open('work/music.wav','wb'); wv.setnchannels(1); wv.setsampwidth(2); wv.setframerate(SR); wv.writeframes((out*32767).astype(np.int16).tobytes()); wv.close()
print('music ok',D)
