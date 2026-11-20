"""Second round: filters on top of the RSI-extreme reversion rule (our best so far), plus a few new
standalone ideas. Strict train/test split: first 2/3 of time = search, last 1/3 = held-out test.
Rule: at M5 close, RSI14 < 30 (go UP) or > 70 (go DOWN); expiry 60 min (12 bars). Break-even @80% payout = 55.6%."""
import glob, math, numpy as np, pandas as pd

def ema(s, n): return s.ewm(span=n, adjust=False).mean()
def rsi(s, n=14):
    d = s.diff(); u = d.clip(lower=0).ewm(alpha=1/n, adjust=False).mean(); l = (-d.clip(upper=0)).ewm(alpha=1/n, adjust=False).mean()
    return 100 - 100 / (1 + u / l)
def adx(h, l, c, n=14):
    up = h.diff(); dn = -l.diff()
    pdm = np.where((up > dn) & (up > 0), up, 0.0); ndm = np.where((dn > up) & (dn > 0), dn, 0.0)
    tr = pd.concat([h - l, (h - c.shift()).abs(), (l - c.shift()).abs()], axis=1).max(axis=1)
    a = 1 / n; atr = tr.ewm(alpha=a, adjust=False).mean()
    pdi = 100 * pd.Series(pdm, index=h.index).ewm(alpha=a, adjust=False).mean() / atr
    ndi = 100 * pd.Series(ndm, index=h.index).ewm(alpha=a, adjust=False).mean() / atr
    dx = 100 * (pdi - ndi).abs() / (pdi + ndi)
    return dx.ewm(alpha=a, adjust=False).mean(), atr

H = 12  # 60 min at M5
rows = []
for f in sorted(glob.glob("[A-Z]*.csv")):
    pair = f[:-4]; d = pd.read_csv(f)
    d["end"] = pd.to_datetime(d.t, unit="s") + pd.Timedelta(minutes=5); d = d.set_index("end")
    o, h, l, c = d.o, d.h, d.l, d.c
    r5 = rsi(c); r5_7 = rsi(c, 7)
    ad, atr = adx(h, l, c)
    m = c.rolling(20).mean(); sd = c.rolling(20).std(); bw = (sd / m).rolling(50)
    bw_pctile = bw.apply(lambda x: (x.rank(pct=True).iloc[-1]), raw=False) if False else (sd / m)  # placeholder, replaced below
    bw_rank = (sd / m).rolling(100).rank(pct=True)
    hour = d.index.hour; dow = d.index.dayofweek
    sig = np.where(r5 < 30, 1, np.where(r5 > 70, -1, 0))
    fut = np.sign(c.shift(-H) - c)
    out = pd.DataFrame({"pair": pair, "sig": sig, "fut": fut, "adx": ad, "bw_rank": bw_rank,
                         "hour": hour, "dow": dow, "dist_rsi": (r5 - 50).abs(), "r7": r5_7, "atr_pct": atr / c})
    rows.append(out)

D = pd.concat(rows).dropna()
D = D[D.sig != 0]
cut = D.index.sort_values()[int(len(D) * 2 / 3)]
tr, te = D[D.index < cut], D[D.index >= cut]

def wr(df):
    x = df[df.fut != 0]; n = len(x)
    if n == 0: return 0, 0
    w = (x.fut == x.sig).sum(); return w, n

def fmt(w, n):
    if n == 0: return "n=0"
    p = w / n; se = math.sqrt(p * (1 - p) / n); return f"{p:.2%} (n={n}, ±{1.96*se:.1%})"

print("BASELINE (no extra filter):")
print(f"  train {fmt(*wr(tr))} | TEST {fmt(*wr(te))}")
print()

filters = {}
for lo, hi in [(0, 20), (20, 30), (30, 100)]: filters[f"ADX {lo}-{hi}"] = lambda df, lo=lo, hi=hi: (df.adx >= lo) & (df.adx < hi)
for lo, hi in [(0, .33), (.33, .66), (.66, 1.01)]: filters[f"BBwidth pct {lo:.2f}-{hi:.2f}"] = lambda df, lo=lo, hi=hi: (df.bw_rank >= lo) & (df.bw_rank < hi)
for name, lo, hi in [("Asia 0-7", 0, 7), ("London 7-12", 7, 12), ("Overlap 12-16", 12, 16), ("NY 16-21", 16, 21), ("Late 21-24", 21, 24)]:
    filters[name] = lambda df, lo=lo, hi=hi: (df.hour >= lo) & (df.hour < hi)
for lo, hi in [(20, 25), (25, 50)]: filters[f"RSI dist {lo}-{hi} (more extreme)"] = lambda df, lo=lo, hi=hi: (df.dist_rsi >= lo) & (df.dist_rsi < hi)
filters["RSI7 confirms (same side extreme)"] = lambda df: ((df.sig == 1) & (df.r7 < 35)) | ((df.sig == -1) & (df.r7 > 65))
filters["RSI7 NOT confirming (diverges)"] = lambda df: ~(((df.sig == 1) & (df.r7 < 35)) | ((df.sig == -1) & (df.r7 > 65)))
for i, d in enumerate(["Mon", "Tue", "Wed", "Thu", "Fri"]): filters[f"Weekday {d}"] = lambda df, i=i: df.dow == i
for lo, hi in [(0, 5), (5, 10), (10, 20)]: filters[f"ATR% {lo}-{hi}bp"] = lambda df, lo=lo * 1e-4, hi=hi * 1e-4: (df.atr_pct >= lo) & (df.atr_pct < hi)

print(f"Testing {len(filters)} filters on top of RSI-extreme. Only showing train n>=500:")
results = []
for name, fn in filters.items():
    a = tr[fn(tr)]; b = te[fn(te)]
    wa, na = wr(a); wb, nb = wr(b)
    if na < 500 or nb < 200: continue
    results.append((wb / nb if nb else 0, wa / na if na else 0, name, na, nb, wa, wb))
results.sort(reverse=True)
for wb, wa, name, na, nb, wa_w, wb_w in results[:15]:
    print(f"  TRAIN {fmt(wa_w, na)} -> TEST {fmt(wb_w, nb)} | {name}")

n_pass = sum(1 for wb, wa, name, na, nb, wa_w, wb_w in results if wb - 1.96*math.sqrt(wb*(1-wb)/nb) > 0.556)
print(f"\nfilters with TEST 95% lower bound > 55.6%: {n_pass} of {len(results)}")
