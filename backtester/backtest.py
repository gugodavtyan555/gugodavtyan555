"""
Binary options strategy backtester (no real money involved).

Tests common short-term strategies on historical candles and reports the
real win rate and what would have happened to a balance at a given payout.

Usage (on your own computer, with internet):
    pip install pandas numpy yfinance
    python backtest.py                    # EUR/USD, 1-minute candles, last 7 days
    python backtest.py --symbol GBPUSD=X  # another pair
    python backtest.py --interval 5m      # 5-minute candles, last 60 days
    python backtest.py --csv my_data.csv  # your own file with open,high,low,close columns
    python backtest.py --synthetic        # random prices, for a quick test without internet
"""

import argparse
import sys

import numpy as np
import pandas as pd


# ---------------------------------------------------------------- data

def load_yahoo(symbol: str, interval: str) -> pd.DataFrame:
    import yfinance as yf

    period = {"1m": "7d", "2m": "60d", "5m": "60d", "15m": "60d"}.get(interval, "60d")
    df = yf.download(symbol, interval=interval, period=period, progress=False, auto_adjust=False)
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = df.columns.get_level_values(0)
    df = df.rename(columns=str.lower)[["open", "high", "low", "close"]].dropna()
    return df


def load_csv(path: str) -> pd.DataFrame:
    df = pd.read_csv(path)
    df.columns = [c.strip().lower() for c in df.columns]
    return df[["open", "high", "low", "close"]].dropna().reset_index(drop=True)


def synthetic(n: int = 20000, seed: int = 1) -> pd.DataFrame:
    """Random-walk prices with EUR/USD-like 1-minute volatility."""
    rng = np.random.default_rng(seed)
    close = 1.10 * np.exp(np.cumsum(rng.normal(0, 0.00012, n)))
    open_ = np.r_[close[0], close[:-1]]
    spread = np.abs(rng.normal(0, 0.00006, n)) * close
    return pd.DataFrame({
        "open": open_,
        "high": np.maximum(open_, close) + spread,
        "low": np.minimum(open_, close) - spread,
        "close": close,
    })


# ---------------------------------------------------------------- indicators

def rsi(close: pd.Series, n: int = 14) -> pd.Series:
    d = close.diff()
    up = d.clip(lower=0).ewm(alpha=1 / n, adjust=False).mean()
    down = (-d.clip(upper=0)).ewm(alpha=1 / n, adjust=False).mean()
    return 100 - 100 / (1 + up / down.replace(0, np.nan))


def ema(s: pd.Series, n: int) -> pd.Series:
    return s.ewm(span=n, adjust=False).mean()


# ---------------------------------------------------------------- strategies
# Each returns a Series of +1 (CALL), -1 (PUT) or 0 (no trade), decided at the
# close of the candle; the trade opens at that close.

def s_rsi_reversal(df):
    r = rsi(df.close)
    return pd.Series(np.where(r < 30, 1, np.where(r > 70, -1, 0)), index=df.index)


def s_bollinger_reversal(df):
    m = df.close.rolling(20).mean()
    sd = df.close.rolling(20).std()
    return pd.Series(np.where(df.close < m - 2 * sd, 1, np.where(df.close > m + 2 * sd, -1, 0)), index=df.index)


def s_ema_cross(df):
    fast, slow = ema(df.close, 9), ema(df.close, 21)
    above = fast > slow
    cross_up = above & ~above.shift(1, fill_value=False)
    cross_dn = ~above & above.shift(1, fill_value=False)
    return pd.Series(np.where(cross_up, 1, np.where(cross_dn, -1, 0)), index=df.index)


def s_macd(df):
    macd = ema(df.close, 12) - ema(df.close, 26)
    sig = ema(macd, 9)
    above = macd > sig
    up = above & ~above.shift(1, fill_value=False)
    dn = ~above & above.shift(1, fill_value=False)
    return pd.Series(np.where(up, 1, np.where(dn, -1, 0)), index=df.index)


def _streak(df, k=3):
    color = np.sign(df.close - df.open)
    ups = (color == 1).astype(int).rolling(k).sum() == k
    dns = (color == -1).astype(int).rolling(k).sum() == k
    return ups, dns


def s_three_candles_follow(df):
    ups, dns = _streak(df)
    return pd.Series(np.where(ups, 1, np.where(dns, -1, 0)), index=df.index)


def s_three_candles_reverse(df):
    ups, dns = _streak(df)
    return pd.Series(np.where(ups, -1, np.where(dns, 1, 0)), index=df.index)


def s_rsi_with_trend(df):
    """RSI pullback only in the direction of the 100-EMA trend."""
    r = rsi(df.close)
    trend_up = df.close > ema(df.close, 100)
    return pd.Series(np.where(trend_up & (r < 35), 1, np.where(~trend_up & (r > 65), -1, 0)), index=df.index)


STRATEGIES = {
    "RSI reversal": s_rsi_reversal,
    "Bollinger reversal": s_bollinger_reversal,
    "EMA 9/21 cross": s_ema_cross,
    "MACD cross": s_macd,
    "3 candles follow": s_three_candles_follow,
    "3 candles reverse": s_three_candles_reverse,
    "RSI + trend filter": s_rsi_with_trend,
}


# ---------------------------------------------------------------- backtest

def run(df, signal, expiry, payout, stake=1.0, start_balance=100.0):
    close = df.close.to_numpy()
    sig = signal.to_numpy()
    wins = losses = 0
    balance = peak = start_balance
    max_dd = 0.0
    i, n = 0, len(close)
    while i < n - expiry:
        s = sig[i]
        if s != 0 and not np.isnan(close[i]):
            move = close[i + expiry] - close[i]
            if move == 0:                       # tie: stake returned
                pass
            elif np.sign(move) == s:
                wins += 1
                balance += stake * payout
            else:
                losses += 1
                balance -= stake
            peak = max(peak, balance)
            max_dd = max(max_dd, peak - balance)
            i += expiry                         # one trade at a time
        else:
            i += 1
    trades = wins + losses
    return {
        "trades": trades,
        "win_rate": wins / trades * 100 if trades else float("nan"),
        "profit": balance - start_balance,
        "max_drawdown": max_dd,
    }


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--symbol", default="EURUSD=X")
    p.add_argument("--interval", default="1m")
    p.add_argument("--csv")
    p.add_argument("--synthetic", action="store_true")
    p.add_argument("--payout", type=float, default=0.85, help="0.85 = 85%% payout on a win")
    p.add_argument("--expiries", default="1,3,5", help="expiry in candles")
    a = p.parse_args()

    if a.synthetic:
        df, src = synthetic(), "synthetic random walk"
    elif a.csv:
        df, src = load_csv(a.csv), a.csv
    else:
        try:
            df, src = load_yahoo(a.symbol, a.interval), f"{a.symbol} {a.interval} (Yahoo)"
        except Exception as e:
            sys.exit(f"Could not download data ({e}). Try --csv or --synthetic.")
    df = df.reset_index(drop=True)
    if len(df) < 500:
        sys.exit(f"Only {len(df)} candles loaded, need at least 500.")

    breakeven = 100 / (1 + a.payout)
    half = len(df) // 2
    parts = {"first half": df.iloc[:half].reset_index(drop=True),
             "second half": df.iloc[half:].reset_index(drop=True)}

    print(f"\nData: {src}, {len(df)} candles")
    print(f"Payout {a.payout*100:.0f}%  ->  break-even win rate {breakeven:.1f}%")
    print("Stake $1 per trade, start balance $100. Results shown for each half of the data")
    print("separately: a real edge has to hold in BOTH halves, not just one.\n")
    hdr = f"{'strategy':<22}{'exp':>4} | {'trades':>6}{'win%':>7}{'profit':>9} | {'trades':>6}{'win%':>7}{'profit':>9}"
    print(f"{'':<26} | {'---- first half ----':^22} | {'---- second half ----':^22}")
    print(hdr)
    print("-" * len(hdr))

    best = None
    for name, fn in STRATEGIES.items():
        for e in [int(x) for x in a.expiries.split(",")]:
            r = [run(d, fn(d), e, a.payout) for d in parts.values()]
            row = f"{name:<22}{e:>4} | "
            row += " | ".join(f"{x['trades']:>6}{x['win_rate']:>6.1f}%{x['profit']:>+9.2f}" for x in r)
            both_ok = all(x["trades"] >= 30 and x["win_rate"] > breakeven for x in r)
            print(row + ("  <- above break-even in both halves" if both_ok else ""))
            if both_ok and (best is None or min(x["profit"] for x in r) > best[1]):
                best = (f"{name}, expiry {e}", min(x["profit"] for x in r))

    print()
    if best:
        print(f"Passed both halves: {best[0]}. Re-test on more data before trusting it.")
    else:
        print(f"No strategy beat {breakeven:.1f}% in both halves. None of them has a real edge on this data.")


if __name__ == "__main__":
    main()
