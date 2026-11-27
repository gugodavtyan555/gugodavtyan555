"""RSI backtest (սիմուլյացիա, առանց կայքի). Օգտագործում՝
  python3 backtest.py                 # պատահական (random walk) տվյալներ
  python3 backtest.py prices.csv      # CSV՝ մեկ սյուն՝ գներ (վայրկյանական)
"""
import sys, random

RSI_N, OB, OS = 14, 70, 30     # RSI ժամանակահատված, վերին/ստորին շեմ
EXPIRY = 10                    # ժամկետ (քայլ = 1 վարկյան)
STAKE, PAYOUT = 1.0, 0.92      # ստեյք, վճարում (+92%)

def load(path):
    if path:
        return [float(l.split(',')[0]) for l in open(path) if l.strip()]
    random.seed(1)
    p, out = 1.0, []
    for _ in range(20000):
        p += random.gauss(0, 0.0002); out.append(p)
    return out

def rsi(p, i, n=RSI_N):
    g = l = 0.0
    for k in range(i - n + 1, i + 1):
        d = p[k] - p[k - 1]
        if d >= 0: g += d
        else: l -= d
    return 100.0 if l == 0 else 100 - 100 / (1 + g / l)

def run(p):
    bal, wins, losses, curve, i = 0.0, 0, 0, [], RSI_N + 1
    while i < len(p) - EXPIRY:
        r = rsi(p, i)
        side = 1 if r <= OS else -1 if r >= OB else 0   # OS->UP, OB->DOWN
        if side:
            diff = (p[i + EXPIRY] - p[i]) * side
            if diff > 0: bal += STAKE * PAYOUT; wins += 1
            elif diff < 0: bal -= STAKE; losses += 1
            curve.append(bal)
            i += EXPIRY
        else:
            i += 1
    return bal, wins, losses, curve

if __name__ == '__main__':
    p = load(sys.argv[1] if len(sys.argv) > 1 else None)
    bal, w, l, c = run(p)
    n = w + l
    wr = 100 * w / n if n else 0
    print(f"Գործարքներ: {n} | Win: {w} | Loss: {l} | Win-rate: {wr:.1f}%")
    print(f"Շահույթ/կորուստ: {bal:+.2f}$ | Break-even win-rate: {100/(1+PAYOUT):.1f}%")
    try:
        import matplotlib; matplotlib.use('Agg')
        import matplotlib.pyplot as plt
        plt.plot(c); plt.title('Հաշվեկշիռ'); plt.savefig('equity.png')
        print('Գրաֆիկ՝ equity.png')
    except ImportError:
        pass
