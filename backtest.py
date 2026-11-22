#!/usr/bin/env python3
"""10s binary-option backtest + parlay (compounding) simulation.

Usage:
  python3 backtest.py                  # synthetic random-walk data
  python3 backtest.py prices.csv       # CSV with one price per row (1 tick = 1 second), column 'price' or single column
Strategy: edit signal() below.
"""
import sys, random, math

PAYOUT = 0.85      # win pays +85%, loss -100%
EXPIRY = 10        # seconds (ticks)
N_TICKS = 2_000_000
TARGET = 20000.0
START = 1.0
PARLAY_TRIALS = 20000


def load(path):
    out = []
    with open(path) as f:
        for line in f:
            p = line.strip().split(",")[-1] if "," in line else line.strip()
            try:
                out.append(float(p))
            except ValueError:
                pass  # header
    return out


def synthetic(n):
    p, out = 1.0, []
    for _ in range(n):
        p *= math.exp(random.gauss(0, 0.0002))
        out.append(p)
    return out


def signal(prices, i):
    """Return +1 (call), -1 (put) or 0 (skip). Example: 5-tick momentum."""
    if i < 5:
        return 0
    d = prices[i] - prices[i - 5]
    return 1 if d > 0 else -1 if d < 0 else 0


def main():
    prices = load(sys.argv[1]) if len(sys.argv) > 1 else synthetic(N_TICKS)
    results = []
    i = 5
    while i + EXPIRY < len(prices):
        s = signal(prices, i)
        if s:
            diff = prices[i + EXPIRY] - prices[i]
            if diff != 0:
                results.append(1 if diff * s > 0 else 0)
            i += EXPIRY
        else:
            i += 1
    n = len(results)
    if n == 0:
        print("No trades"); return
    wr = sum(results) / n
    be = 1 / (1 + PAYOUT)
    ev = wr * PAYOUT - (1 - wr)
    se = math.sqrt(wr * (1 - wr) / n)
    print(f"Trades: {n}")
    print(f"Win-rate: {wr*100:.2f}% (±{1.96*se*100:.2f}% 95% CI)")
    print(f"Break-even win-rate at payout {PAYOUT:.0%}: {be*100:.2f}%")
    print(f"EV per $1 stake: {ev:+.4f}")

    # Parlay: stake whole balance each trade, resample from real results
    reached, steps = 0, 0
    wins_needed = math.ceil(math.log(TARGET / START) / math.log(1 + PAYOUT))
    for _ in range(PARLAY_TRIALS):
        bal = START
        while bal < TARGET:
            steps += 1
            if random.random() < wr:
                bal *= 1 + PAYOUT
            else:
                bal = 0; break
        if bal >= TARGET:
            reached += 1
    print(f"Wins in a row needed for ${START:.0f} -> ${TARGET:.0f}: {wins_needed}")
    print(f"Parlay success: {reached}/{PARLAY_TRIALS} = {reached/PARLAY_TRIALS*100:.4f}%")
    print(f"Theoretical: {wr**wins_needed*100:.6f}%")


if __name__ == "__main__":
    main()
