import glob, math, backtest as b
N=W=0
for f in sorted(glob.glob('*_5m.csv')):
    n,w=b.run(b.load(f),quiet=True); N+=n; W+=w; print(f"{f[:6]} trades={n:4d} win={w/n:.1%}")
p=W/N; se=math.sqrt(p*(1-p)/N)
print(f"\nPOOLED trades={N} win_rate={p:.2%} 95% CI=[{p-1.96*se:.2%},{p+1.96*se:.2%}] break-even={b.BREAKEVEN:.2%}")
