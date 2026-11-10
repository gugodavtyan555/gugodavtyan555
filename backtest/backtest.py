"""Backtest of the 'three-timeframe agreement' strategy, 15-minute binary outcome.
Usage: python backtest.py data.csv   (columns: time,open,high,low,close ; M1 bars)
       python backtest.py --synthetic   (random-walk sanity check)
"""
import sys, math
import numpy as np, pandas as pd

PAYOUT = 0.92
HORIZON = 3  # bars ahead; 3 x M5 = 15 min (use 15 for M1 data)
BREAKEVEN = 1 / (1 + PAYOUT)  # ~52.08%

def ema(s, n): return s.ewm(span=n, adjust=False).mean()
def rsi(s, n=14):
    d = s.diff(); up = d.clip(lower=0).ewm(alpha=1/n, adjust=False).mean()
    dn = (-d.clip(upper=0)).ewm(alpha=1/n, adjust=False).mean()
    return 100 - 100 / (1 + up / dn)

def load(path):
    df = pd.read_csv(path, parse_dates=['time']).set_index('time').sort_index()
    return df[['open','high','low','close']]

def synthetic(n=200000, seed=1):
    r = np.random.default_rng(seed).normal(0, 1e-4, n)
    idx = pd.date_range('2024-01-01', periods=n, freq='1min')
    c = 1.1 * np.exp(np.cumsum(r))
    return pd.DataFrame({'open': c, 'high': c, 'low': c, 'close': c}, index=idx)

def tf_state(close, rule):
    c = close.resample(rule).last().dropna()
    e = ema(c, 20); m = c.rolling(20).mean(); sd = c.rolling(20).std()
    st = pd.DataFrame({'close': c, 'ema': e, 'mid': m, 'up': m+2*sd, 'lo': m-2*sd, 'rsi': rsi(c)})
    # use only fully closed bars: shift by one bar
    return st.shift(1)

def signals(df):
    c = df['close']
    s15, s5, s1 = tf_state(c,'15min'), tf_state(c,'5min'), tf_state(c,'5min')
    f = pd.DataFrame(index=s1.index)
    for name, s in (('m15',s15),('m5',s5)):
        f[name] = s.reindex(f.index, method='ffill')['close'] - s.reindex(f.index, method='ffill')['ema']
    f['m1_rsi'] = rsi(c.resample('5min').last().dropna(), 7).shift(1); f['m1_lo'] = s1['close'] < s1['lo']; f['m1_up'] = s1['close'] > s1['up']
    f['price'] = c.reindex(f.index)
    up   = (f.m15>0)&(f.m5>0)&(f.m1_rsi<45)   # trend up on 15/5, M1 pullback
    down = (f.m15<0)&(f.m5<0)&(f.m1_rsi>55)
    sig = pd.Series(0, index=f.index); sig[up]=1; sig[down]=-1
    # one trade per 15 minutes max
    sig[sig.index.minute % 15 != 0] = 0
    sig.name='sig'
    return sig, c

def run(df, quiet=False):
    sig, c = signals(df)
    fut = c.shift(-HORIZON)
    t = pd.DataFrame({'sig': sig, 'p0': c, 'p1': fut}).dropna()
    t = t[t.sig != 0]
    t = t[t.p1 != t.p0]
    win = ((t.sig > 0) & (t.p1 > t.p0)) | ((t.sig < 0) & (t.p1 < t.p0))
    n, w = len(t), int(win.sum())
    if quiet: return n, w
    p = w / n; se = math.sqrt(p*(1-p)/n)
    pnl = (w * PAYOUT - (n - w)) / n
    print(f"trades={n}  wins={w}  win_rate={p:.2%}  95% CI=[{p-1.96*se:.2%}, {p+1.96*se:.2%}]")
    print(f"break-even={BREAKEVEN:.2%}  avg PnL per $1 stake={pnl:+.3f}")
    verdict = "NO edge proven" if p - 1.96*se <= BREAKEVEN else "edge above break-even (check out-of-sample!)"
    print("verdict:", verdict)

if __name__ == '__main__':
    run(synthetic() if sys.argv[1:] == ['--synthetic'] else load(sys.argv[1]))
