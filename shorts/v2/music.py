import numpy as np, wave, sys
SR=44100; D=15.0; n=int(SR*D); t=np.arange(n)/SR
rng=np.random.default_rng(4)
out=np.zeros(n)
def note(f,start,dur,amp=0.3,kind='piano'):
    i0=int(start*SR); m=min(int(dur*SR),n-i0)
    if m<=0: return
    tt=np.arange(m)/SR
    if kind=='piano':
        env=np.exp(-tt*2.2)*np.minimum(1,tt/0.006)
        w=sum(a*np.sin(2*np.pi*f*h*tt*(1+0.0004*h*h)) for h,a in ((1,1),(2,0.45),(3,0.22),(4,0.1),(5,0.05)))
    elif kind=='bell':
        env=np.exp(-tt*1.6)*np.minimum(1,tt/0.004)
        w=sum(a*np.sin(2*np.pi*f*h*tt) for h,a in ((1,1),(2.76,0.4),(5.4,0.2),(8.9,0.08)))
    else: # pad
        env=np.minimum(1,tt/1.2)*np.minimum(1,(dur-tt)/1.5)
        w=sum(np.sin(2*np.pi*f*d*tt+ph) for d,ph in ((1,0),(1.004,1),(0.996,2),(2.002,0.5)))*0.3
    out[i0:i0+m]+=amp*env*w
A=lambda s: 220*2**(s/12)
chords=[(0,[-12,0,3,7]),(3.75,[-16,-4,0,5]),(7.5,[-9,-5,3,7]),(11.25,[-17,-5,-1,2,7])]
for st,ch in chords:
    for s in ch: note(A(s)/2,st,4.3,0.05,'pad')
    arp=[ch[1],ch[2],ch[3],ch[2]+12,ch[3],ch[2]]
    for k,s in enumerate(arp):
        tt0=st+k*0.625
        if tt0<10.6: note(A(s),tt0,2.5,0.11,'piano')
    note(A(ch[0]),st,3.5,0.14,'piano')
# hit on "маяку"
i0=int(10.3*SR); tt=np.arange(n-i0)/SR
out[i0:]+=0.5*np.exp(-tt*1.3)*np.sin(2*np.pi*(52+18*np.exp(-tt*9))*tt)
# answering flashes -> bells
for ft,s in zip(FL:=[float(x) for x in sys.argv[1].split(',')],(19,19,24)):
    note(A(s),ft,2.5,0.16,'bell'); note(A(s-12),ft,2.5,0.08,'bell')
# sea noise
ns=rng.standard_normal(n); k=np.ones(60)/60; ns=np.convolve(ns,k,'same'); ns=ns/np.abs(ns).max()
out+=ns*0.10*(0.55+0.45*np.sin(2*np.pi*t/5.5))
# reverb
ir_n=int(2.2*SR); ir=rng.standard_normal(ir_n)*np.exp(-np.arange(ir_n)/SR*2.6); ir[0]=0
N=1<<int(np.ceil(np.log2(n+ir_n)))
wet=np.fft.irfft(np.fft.rfft(out,N)*np.fft.rfft(ir,N),N)[:n]
out=out+wet/np.abs(wet).max()*np.abs(out).max()*0.45
fade=np.minimum(1,t/0.4)*np.minimum(1,(D-t)/0.9)
out=out*fade; out=out/np.abs(out).max()*0.8
w=wave.open('work/music.wav','wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out*32767).astype(np.int16).tobytes()); w.close()
