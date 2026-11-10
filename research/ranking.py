"""Which RANKING criterion picks the best single trade per 5-min decision? (bot opens only 1)
Candidates at each M5 close: pairs where M5 & M15 trends agree. Pick top-1 by criterion, trade with the trend, 5-min outcome.
Train = first 2/3 of time, test = last 1/3."""
import glob, math, numpy as np, pandas as pd
exec(open("study.py").read().split("rows=[]")[0])   # reuse ema/rsi/adx helpers

frames=[]
for f in sorted(glob.glob("[A-Z]*.csv")):
    pair=f[:-4]; d=pd.read_csv(f); d["end"]=pd.to_datetime(d.t,unit="s")+pd.Timedelta(minutes=5); d=d.set_index("end")
    c=d.c; e=ema(c,20); s5=np.sign(c-e); ad,atr=adx(d.h,d.l,c); r5=rsi(c)
    def tf(m):
        x=c.resample(f"{m}min",closed="right",label="right").last().dropna(); return np.sign(x-ema(x,20)).reindex(d.index,method="ffill")
    s15=tf(15); s30=tf(30); s60=tf(60)
    o=pd.DataFrame({"pair":pair,"s5":s5,"s15":s15,"s30":s30,"s60":s60,"adx":ad,"vol":atr/c,"dist":(c-e).abs()/atr,
                    "rsi_dev":(r5-50).abs(),"mom":(c-c.shift(3)).abs()/atr,"fut":np.sign(c.shift(-1)-c)})
    o["all4"]=((o.s30==o.s5)&(o.s60==o.s5)).astype(int)
    frames.append(o.reset_index())
D=pd.concat(frames).dropna(); D=D[(D.s5!=0)&(D.s5==D.s15)&(D.fut!=0)]
D["win"]=(D.fut==D.s5).astype(int)
cut=D.end.sort_values().iloc[int(len(D)*2/3)]
crit={"RSI-neutral (current bot)":("rsi_dev",True),"smallest dist from EMA":("dist",True),"largest dist from EMA":("dist",False),
      "highest ADX":("adx",False),"lowest ADX":("adx",True),"highest volatility":("vol",False),"lowest volatility":("vol",True),
      "strongest 15-min momentum":("mom",False),"weakest momentum":("mom",True)}
def pick(df,col,asc,need_all4=False):
    x=df[df.all4==1] if need_all4 else df
    return x.sort_values(col,ascending=asc).groupby("end").head(1)
def fmt(p):
    n=len(p); w=p.win.sum(); r=w/n; se=math.sqrt(r*(1-r)/n); return f"{r:.2%} (n={n}, ±{1.96*se:.1%})"
tr,te=D[D.end<cut],D[D.end>=cut]
rng=np.random.default_rng(0)
rand=lambda df: df.sample(frac=1,random_state=1).groupby("end").head(1)
print(f"decision times: train {tr.end.nunique()}, test {te.end.nunique()}; break-even @80% = 55.6%\n")
print(f"{'criterion':30s} {'TRAIN (all4 cands)':>34s} | {'TEST (all4 cands)':>34s}")
print(f"{'random pick':30s} {fmt(rand(tr[tr.all4==1])):>34s} | {fmt(rand(te[te.all4==1])):>34s}")
for name,(col,asc) in crit.items():
    print(f"{name:30s} {fmt(pick(tr,col,asc,True)):>34s} | {fmt(pick(te,col,asc,True)):>34s}")
