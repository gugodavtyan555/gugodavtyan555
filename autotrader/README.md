# Local Pocket Option auto-trader (use at your own risk)

Reads the bot's signal from the Worker API and opens ONE trade per signal on YOUR account.
Runs only on your computer. Never share your SSID — not in chat, not with Claude, not anywhere.

**Risks you accepted:** Pocket Option support said third-party automation is not officially supported and may lead
to restrictions/blocking (demo or real). Treat any edge as unproven until a large forward-test sample confirms it.

## Strategies (pick with `STRATEGY`)
| STRATEGY | Endpoint | Expiry | What it is |
|---|---|---|---|
| `rsi` (default) | `/api/rsi_signal` | 60 min | RSI14(M5) extreme (<30 or >70) → trade the reversion. Best backtest/forward result so far. |
| `best` | `/api/signal` | 5 min | Older trend/fade "strongest signal". |

## Setup
1. Python 3.9+ and `pip install binaryoptionstoolsv2`
2. Get the `ssid`/session string from YOUR OWN browser session of Pocket Option (DEMO account first). Keep it secret —
   paste it only into your own terminal's environment variable, never into a chat or a file you share.
3. Set variables (PowerShell: `$env:NAME="value"`; bash: `export NAME=value`):
   - `PO_SSID` – your session string
   - `SIGNAL_URL` – `https://fx-analyzer-bot.gugodavtyan555.workers.dev`  (base URL, no path)
   - `SIGNAL_KEY` – the API key given to you in chat
   - `STRATEGY` – `rsi` (default) or `best`
4. Test without orders: `python po_autotrader.py --dry-run`
5. Demo trading: `python po_autotrader.py`  (refuses real accounts)
6. Real account (not recommended): `python po_autotrader.py --live`

## Safety defaults (env vars to change)
| Variable | Default | Meaning |
|---|---|---|
| STAKE / MAX_STAKE | 1.0 / 2.0 | fixed stake, hard cap |
| MAX_DAILY_LOSS | 3.0 | stop for the day |
| MAX_CONSEC_LOSSES | 3 | stop after N losses in a row |
| MAX_TRADES_PER_HOUR | 6 | trade limiter |
| MAX_SIGNAL_AGE | 280s (`rsi`) / 20s (`best`) | ignore stale signals — the `rsi` feed refreshes every 5 min |
| MIN_PAYOUT | 75 % | skip if payout is lower |

Stop anytime: Ctrl+C or create a file named `STOP` next to the script. Log: `trades_log.csv`.
Untested against the live platform (written from the library docs). Test on DEMO and watch the first trades.
