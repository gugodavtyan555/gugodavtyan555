"""Walk-forward study: which filters improve 5/10/15-min direction accuracy of the trend rule?
Decision at each closed M5 bar. Train = first 2/3 of time, test = last 1/3. Only closed bars used."""
import glob, math, numpy as np, pandas as pd

def ema(s,n): return s.ewm(span=n,adjust=False).mean()
def rsi(s,n=14):
    d=s.diff(); u=d.clip(lower=0).ewm(alpha=1/n,adjust=False).mean(); l=(-d.clip(upper=0)).ewm(alpha=1/n,adjust=False).mean(); return 100-100/(1+u/l)

def adx(h,l,c,n=14):
    up=h.diff(); dn=-l.diff()
    pdm=np.where((up>dn)&(up>0),up,0.0); ndm=np.where((dn>up)&(dn>0),dn,0.0)
    tr=pd.concat([h-l,(h-c.shift()).abs(),(l-c.shift()).abs()],axis=1).max(axis=1)
    a=1/n; atr=tr.ewm(alpha=a,adjust=False).mean()
    pdi=100*pd.Series(pdm,index=h.index).ewm(alpha=a,adjust=False).mean()/atr
    ndi=100*pd.Series(ndm,index=h.index).ewm(alpha=a,adjust=False).mean()/atr
    dx=100*(pdi-ndi).abs()/(pdi+ndi); return dx.ewm(alpha=a,adjust=False).mean(), atr

rows=[]
for f in sorted(glob.glob("*.csv")):
    pair=f[:-4]; d=pd.read_csv(f); d["end"]=pd.to_datetime(d.t,unit="s")+pd.Timedelta(minutes=5); d=d.set_index("end")
    c=d.c; s5=np.sign(c-ema(c,20)); ad,atr=adx(d.h,d.l,c); r5=rsi(c)
    def tf(m):
        x=c.resample(f"{m}min",closed="right",label="right").last().dropna(); return np.sign(x-ema(x,20)).reindex(d.index,method="ffill")
    s15,s30,s60=tf(15),tf(30),tf(60)
    out=pd.DataFrame({"pair":pair,"s5":s5,"s15":s15,"s30":s30,"s60":s60,"hour":d.index.hour,"adx":ad,"vol":atr/c,"dist":(c-ema(c,20)).abs()/atr,"rsi":r5,"c":c})
    for k in (1,2,3): out[f"fut{k}"]=np.sign(c.shift(-k)-c)
    rows.append(out)
D=pd.concat(rows).dropna(); D=D[D.s5!=0]
D=D[D.s5==D.s15]                      # base rule: M15 & M5 agree
D["all4"]=(D.s30==D.s5)&(D.s60==D.s5)
D["rsi_dir"]=np.where(D.s5>0,D.rsi,100-D.rsi)   # high = stretched in trend direction
cut=D.index.sort_values()[int(len(D)*2/3)]
tr,te=D[D.index<cut],D[D.index>=cut]
print(f"signals total={len(D)} train={len(tr)} test={len(te)} split={cut}")

def wr(df,k,flip=False):
    m=df[f"fut{k}"]!=0; x=df[m]; w=(x[f"fut{k}"]==x.s5).sum(); n=len(x)
    if flip: w=n-w
    return w,n
def fmt(w,n):
    if n==0: return "n=0"
    p=w/n; se=math.sqrt(p*(1-p)/n); return f"{p:.2%} (n={n}, ±{1.96*se:.1%})"

print("\n== Baselines (win rate, test set) ==  break-even @80% payout = 55.6%")
for k in (1,2,3):
    print(f" {5*k:2d}min  base: {fmt(*wr(te,k))} | all4: {fmt(*wr(te[te.all4],k))} | contrarian-base: {fmt(*wr(te,k,True))}")

filters={}
for name,lo,hi in [("Asia 0-7",0,7),("London 7-12",7,12),("Overlap 12-16",12,16),("NY 16-21",16,21),("Late 21-24",21,24)]:
    filters[name]=lambda df,lo=lo,hi=hi:(df.hour>=lo)&(df.hour<hi)
for lo,hi in [(0,20),(20,30),(30,100)]: filters[f"ADX {lo}-{hi}"]=lambda df,lo=lo,hi=hi:(df.adx>=lo)&(df.adx<hi)
for lo,hi in [(0,.5),(.5,1),(1,2),(2,99)]: filters[f"dist {lo}-{hi} ATR"]=lambda df,lo=lo,hi=hi:(df.dist>=lo)&(df.dist<hi)
for lo,hi in [(0,50),(50,60),(60,70),(70,101)]: filters[f"RSI-dir {lo}-{hi}"]=lambda df,lo=lo,hi=hi:(df.rsi_dir>=lo)&(df.rsi_dir<hi)
q=tr.vol.quantile([.25,.5,.75]).values
for i,(lo,hi) in enumerate([(0,q[0]),(q[0],q[1]),(q[1],q[2]),(q[2],9)]): filters[f"vol quartile {i+1}"]=lambda df,lo=lo,hi=hi:(df.vol>=lo)&(df.vol<hi)

print(f"\n== Single filters x base/all4 x horizon ({len(filters)*2*3} combos). Train vs TEST, only listing train>=52% & n>=800 ==")
res=[]
for fn,fm in filters.items():
    for sub,lab in ((lambda d:d,"base"),(lambda d:d[d.all4],"all4")):
        for k in (1,2,3):
            a,b=sub(tr),sub(te); a=a[fm(a)]; b=b[fm(b)]
            wa,na=wr(a,k); wb,nb=wr(b,k)
            if na>=800 and nb>=300: res.append((wa/na,fn,lab,5*k,(wa,na),(wb,nb)))
res.sort(reverse=True)
for p,fn,lab,m,a,b in res[:12]:
    print(f" {fn:18s} {lab:4s} {m:2d}min | train {fmt(*a)} | TEST {fmt(*b)}")
nsig=sum(1 for r in res if r[0]>=0.5558)
print(f"\ncombos with train >= 55.6%: {nsig} of {len(res)}")
# how do the top-N train combos do on test on average (selection-bias check)
top=res[:10]; W=sum(r[5][0] for r in top); N=sum(r[5][1] for r in top)
print(f"Top-10 by train -> pooled TEST win rate: {fmt(W,N)}")
