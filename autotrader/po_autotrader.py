#!/usr/bin/env python3
"""
Local auto-trader: reads the bot's strongest signal and opens ONE trade on YOUR Pocket Option account.

!! READ FIRST !!
 * Runs ONLY on your own computer. Your SSID never leaves it (never paste it into chats / servers / repos).
 * Pocket Option support told you this kind of automation is NOT officially supported and can lead to
   account restrictions or blocking (demo or real). You accept that risk by running it.
 * The signals have NO proven edge (break-even at ~80% payout is ~55.6%). Automation can lose money fast.
 * Defaults are deliberately safe: DEMO accounts only, tiny fixed stake, hard loss limits, kill switch.

Setup:
    pip install binaryoptionstoolsv2
    export PO_SSID='...'            # your own session string (demo session first!)
    export SIGNAL_URL='https://fx-analyzer-bot.gugodavtyan555.workers.dev/api/signal'
    export SIGNAL_KEY='...'         # the API key you were given for the signal endpoint

Run:
    python po_autotrader.py --dry-run          # only prints what it WOULD do (needs no SSID)
    python po_autotrader.py                    # trades, but refuses to run on a REAL account
    python po_autotrader.py --live             # also allows a REAL account (not recommended)

Stop it any time: Ctrl+C, or create a file named STOP next to this script.
Library API reference used (BinaryOptionsToolsV2 docs): PocketOptionAsync(ssid), balance(), is_demo() [sync],
payout(asset), active_assets(), buy(asset, amount, time_seconds), sell(...), check_win(trade_id).
NOTE: this script was written from the docs and has NOT been run against the live platform by its author.
"""
import argparse, asyncio, csv, json, os, sys, time, urllib.request
from datetime import datetime, timezone

HERE = os.path.dirname(os.path.abspath(__file__))
STATE = os.path.join(HERE, "state.json")
LOG = os.path.join(HERE, "trades_log.csv")
STOP_FILE = os.path.join(HERE, "STOP")

def env_f(name, default): return float(os.environ.get(name, default))

STAKE = env_f("STAKE", 1.0)                       # fixed stake per trade (USD)
MAX_STAKE = env_f("MAX_STAKE", 2.0)               # hard cap, STAKE can never exceed it
MAX_DAILY_LOSS = env_f("MAX_DAILY_LOSS", 3.0)     # stop for the day when net loss reaches this
MAX_CONSEC_LOSSES = int(env_f("MAX_CONSEC_LOSSES", 3))
MAX_TRADES_PER_HOUR = int(env_f("MAX_TRADES_PER_HOUR", 6))
MAX_SIGNAL_AGE = env_f("MAX_SIGNAL_AGE", 20)      # seconds; older signals are ignored
MIN_PAYOUT = env_f("MIN_PAYOUT", 75)              # % ; skip if the platform pays less
POLL_SEC = env_f("POLL_SEC", 3)

def now(): return time.time()
def load_state():
    try: return json.load(open(STATE))
    except Exception: return {"last_id": 0, "day": "", "day_pnl": 0.0, "consec_losses": 0, "trade_times": []}
def save_state(s): json.dump(s, open(STATE, "w"))
def log(row):
    new = not os.path.exists(LOG)
    with open(LOG, "a", newline="") as f:
        w = csv.writer(f)
        if new: w.writerow(["utc_time", "pair", "dir", "stake", "payout", "result", "profit", "note"])
        w.writerow(row)
def say(msg): print(f"[{datetime.now(timezone.utc).strftime('%H:%M:%S')}] {msg}", flush=True)

def fetch_signal():
    url = os.environ["SIGNAL_URL"] + "?key=" + os.environ["SIGNAL_KEY"]
    req = urllib.request.Request(url, headers={"User-Agent": "po-autotrader"})
    with urllib.request.urlopen(req, timeout=10) as r: return json.loads(r.read().decode())

def risk_block(st):
    """Return a reason string if trading must stop/skip, else None."""
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    if st["day"] != today: st.update(day=today, day_pnl=0.0, consec_losses=0)
    if -st["day_pnl"] >= MAX_DAILY_LOSS: return f"daily loss limit reached ({st['day_pnl']:.2f})"
    if st["consec_losses"] >= MAX_CONSEC_LOSSES: return f"{st['consec_losses']} losses in a row"
    st["trade_times"] = [t for t in st["trade_times"] if now() - t < 3600]
    if len(st["trade_times"]) >= MAX_TRADES_PER_HOUR: return "hourly trade limit reached"
    return None

def asset_active(assets, asset):
    for a in assets or []:
        vals = [str(v) for v in (a.values() if isinstance(a, dict) else [])]
        if asset in vals: return bool(a.get("is_active", True))
    return True  # unknown structure -> let the platform decide (buy() will fail if closed)

async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true", help="never place orders")
    ap.add_argument("--live", action="store_true", help="allow a REAL-money account (default: refuse)")
    args = ap.parse_args()
    if STAKE > MAX_STAKE: sys.exit(f"STAKE {STAKE} exceeds MAX_STAKE {MAX_STAKE}")
    for k in ("SIGNAL_URL", "SIGNAL_KEY"):
        if k not in os.environ: sys.exit(f"missing environment variable {k}")

    client = None
    if not args.dry_run:
        if "PO_SSID" not in os.environ: sys.exit("missing PO_SSID (use --dry-run to test without it)")
        from BinaryOptionsToolsV2 import PocketOptionAsync   # imported only when really trading
        client = PocketOptionAsync(os.environ["PO_SSID"])
        await client.wait_for_assets()
        if not client.is_demo() and not args.live:
            await client.shutdown(); sys.exit("REAL account detected. Refusing without --live. Use a DEMO session.")
        say(f"connected | demo={client.is_demo()} | balance={await client.balance():.2f} | stake={STAKE}")
    else:
        say("DRY RUN: no orders will be placed")

    st = load_state()
    try:
        while True:
            if os.path.exists(STOP_FILE): say("STOP file found, exiting"); break
            try: sig = await asyncio.to_thread(fetch_signal)
            except Exception as e: say(f"signal fetch failed: {e}"); await asyncio.sleep(POLL_SEC * 2); continue
            sid = int(sig.get("id") or 0)
            if sid and sid != st["last_id"]:
                st["last_id"] = sid; save_state(st)          # mark as seen BEFORE acting (no double trades)
                pair, d = sig.get("pair"), sig.get("dir")
                age = now() - float(sig.get("t", 0))
                if age > MAX_SIGNAL_AGE: say(f"skip {pair} {d}: signal is {age:.0f}s old")
                elif (why := risk_block(st)): say(f"STOP/SKIP: {why}"); log([datetime.utcnow().isoformat(), pair, d, STAKE, "", "skipped", "", why]); save_state(st)
                else:
                    say(f"signal {pair} {d} (age {age:.0f}s)")
                    if args.dry_run: say("dry-run: would trade now"); continue
                    try:
                        pay = await client.payout(pair)
                        if pay is not None and pay < MIN_PAYOUT: say(f"skip: payout {pay}% < {MIN_PAYOUT}%"); continue
                        if not asset_active(await client.active_assets(), pair): say(f"skip: {pair} market closed"); continue
                        fn = client.buy if d == "UP" else client.sell
                        trade_id, _ = await fn(pair, STAKE, int(sig.get("expiry_sec", 300)))   # (asset, amount, time_seconds)
                        st["trade_times"].append(now()); save_state(st)
                        say(f"opened {d} {pair} stake={STAKE} id={trade_id}; waiting for result...")
                        res = await client.check_win(trade_id)
                        profit = float(res.profit)
                        st["day_pnl"] += profit
                        st["consec_losses"] = 0 if profit > 0 else st["consec_losses"] + 1
                        save_state(st)
                        word = "WIN" if profit > 0 else ("DRAW" if profit == 0 else "LOSS")
                        say(f"{word} {profit:+.2f} | day pnl {st['day_pnl']:+.2f} | losses in a row {st['consec_losses']}")
                        log([datetime.utcnow().isoformat(), pair, d, STAKE, pay, word, f"{profit:.2f}", ""])
                    except Exception as e:
                        say(f"trade failed: {e}"); log([datetime.utcnow().isoformat(), pair, d, STAKE, "", "error", "", str(e)[:120]])
            await asyncio.sleep(POLL_SEC)
    except KeyboardInterrupt:
        say("stopped by user")
    finally:
        if client: await client.shutdown()

if __name__ == "__main__":
    asyncio.run(main())
