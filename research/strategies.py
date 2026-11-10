"""Broad strategy search with strict train/test split (first 2/3 train, last 1/3 test, 28 pairs, 60d M5).
Each rule gives signal +1/-1 at a closed M5 bar; outcome = sign(close[t+k]-close[t]). Break-even @80% payout = 55.6%."""
import glob, math, numpy as np, pandas as pd
def ema(s,n): return s.ewm(span=n,adjust=False).mean()
def rsi(s,n=14):
    d=s.diff(); u=d.clip(lower=0).ewm(alpha=1/n,adjust=False).mean(); l=(-d.clip(upper=0)).ewm(alpha=1/n,adjust=False).mean(); return 100-100/(1+u/l)
S={}   # name -> list of (signal, fut dict, time)
frames=[]
for f in sorted(glob.glob("[A-Z]*.csv")):
    d=pd.read_csv(f); d["end"]=pd.to_datetime(d.t,unit="s")+pd.Timedelta(minutes=5); d=d.set_index("end")
    o,h,l,c=d.o,d.h,d.l,d.c
    atr=pd.concat([h-l,(h-c.shift()).abs(),(l-c.shift()).abs()],axis=1).max(axis=1).ewm(alpha=1/14,adjust=False).mean()
    r=rsi(c); r7=rsi(c,7); m=c.rolling(20).mean(); sd=c.rolling(20).std(); z=(c-m)/sd
    macd=ema(c,12)-ema(c,26); sig=ema(macd,9); hist=macd-sig
    lo14=l.rolling(14).min(); hi14=h.rolling(14).max(); stoch=100*(c-lo14)/(hi14-lo14)
    body=(c-o); rng=(h-l)
    sg={}
    sg["RSI14<30 buy/>70 sell (reversion)"]=np.where(r<30,1,np.where(r>70,-1,0))
    sg["RSI7<20 buy/>80 sell"]=np.where(r7<20,1,np.where(r7>80,-1,0))
    sg["RSI14>70 buy/<30 sell (momentum)"]=np.where(r>70,1,np.where(r<30,-1,0))
    sg["Bollinger z<-2 buy/>2 sell"]=np.where(z<-2,1,np.where(z>2,-1,0))
    sg["Bollinger z>2 buy/<-2 sell (breakout)"]=np.where(z>2,1,np.where(z<-2,-1,0))
    sg["Stoch<10 buy/>90 sell"]=np.where(stoch<10,1,np.where(stoch>90,-1,0))
    sg["MACD hist cross up buy/down sell"]=np.where((hist>0)&(hist.shift()<=0),1,np.where((hist<0)&(hist.shift()>=0),-1,0))
    sg["MACD cross reversed"]=-sg["MACD hist cross up buy/down sell"]
    sg["EMA9/21 cross"]=np.where((ema(c,9)>ema(c,21))&(ema(c,9).shift()<=ema(c,21).shift()),1,np.where((ema(c,9)<ema(c,21))&(ema(c,9).shift()>=ema(c,21).shift()),-1,0))
    sg["Break 20-bar high buy/low sell"]=np.where(c>h.rolling(20).max().shift(),1,np.where(c<l.rolling(20).min().shift(),-1,0))
    sg["Break 20-bar reversed (fade)"]=-sg["Break 20-bar high buy/low sell"]
    sg["Big candle (>2ATR) continue"]=np.where(body>2*atr,1,np.where(body<-2*atr,-1,0))
    sg["Big candle (>2ATR) fade"]=-sg["Big candle (>2ATR) continue"]
    sg["3 same-colour candles fade"]=np.where((body>0)&(body.shift()>0)&(body.shift(2)>0),-1,np.where((body<0)&(body.shift()<0)&(body.shift(2)<0),1,0))
    sg["3 same-colour candles continue"]=-sg["3 same-colour candles fade"]
    sg["Long lower wick (pin) buy / upper wick sell"]=np.where(((np.minimum(o,c)-l)>2*body.abs())&(rng>atr),1,np.where(((h-np.maximum(o,c))>2*body.abs())&(rng>atr),-1,0))
    sg["Engulfing"]=np.where((body>0)&(body.shift()<0)&(c>o.shift())&(o<c.shift()),1,np.where((body<0)&(body.shift()>0)&(c<o.shift())&(o>c.shift()),-1,0))
    sg["Prev bar direction continue"]=np.sign(body)
    sg["Prev bar direction fade"]=-np.sign(body)
    for k,v in sg.items(): S.setdefault(k,[]).append(pd.Series(v,index=d.index))
    fut={k:np.sign(c.shift(-k)-c) for k in (1,3,6,12)}
    frames.append(pd.DataFrame({f"f{k}":v for k,v in fut.items()}))
    for k,v in sg.items(): pass
F=pd.concat(frames)
cut=F.index.sort_values()[int(len(F)*2/3)]
out=[]
for name,lst in S.items():
    sig=pd.concat(lst)
    D=F.copy(); D["sig"]=sig.values
    D=D.dropna(); D=D[D.sig!=0]
    for k in (1,3,6,12):
        x=D[D[f"f{k}"]!=0]
        a=x[x.index<cut]; b=x[x.index>=cut]
        if len(a)<2000 or len(b)<1000: continue
        wa=(a[f"f{k}"]==a.sig).mean(); wb=(b[f"f{k}"]==b.sig).mean()
        se=math.sqrt(wb*(1-wb)/len(b))
        out.append((wb,wa,name,5*k,len(a),len(b),se))
out.sort(reverse=True)
print(f"{len(out)} strategy/horizon combos tested. Break-even 55.6%. Top 12 by TEST win rate:")
for wb,wa,name,m,na,nb,se in out[:12]:
    print(f"  TEST {wb:.2%} (±{1.96*se:.1%}, n={nb}) | TRAIN {wa:.2%} | {m:2d} min | {name}")
print("\nBest by TRAIN, then how they did on TEST (selection-bias check):")
for wb,wa,name,m,na,nb,se in sorted(out,key=lambda t:-t[1])[:8]:
    print(f"  TRAIN {wa:.2%} -> TEST {wb:.2%} | {m:2d} min | {name}")
print(f"\ncombos with TEST >= 55.6%: {sum(1 for t in out if t[0]>=0.556)}; with TEST lower CI > 52.1%: {sum(1 for t in out if t[0]-1.96*t[6]>0.521)}")
