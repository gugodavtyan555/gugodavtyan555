# Local Pocket Option auto-trader (use at your own risk)

Reads the bot's strongest signal (`/api/signal`) and opens ONE trade per signal on YOUR account.
Runs only on your computer. Never share your SSID.

**Risks you accepted:** Pocket Option support said third-party automation is not officially supported and may lead
to restrictions/blocking (demo or real). The signals have no proven edge (break-even ~55.6% at 80% payout).

## Setup
1. Python 3.9+ and `pip install binaryoptionstoolsv2`
2. Get the `ssid` cookie from YOUR OWN browser session of Pocket Option (DEMO account first). Keep it secret.
3. Set variables (PowerShell: `$env:NAME="value"`; bash: `export NAME=value`):
   - `PO_SSID` – your session string
   - `SIGNAL_URL` – `https://fx-analyzer-bot.gugodavtyan555.workers.dev/api/signal`
   - `SIGNAL_KEY` – the API key given to you in chat
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
| MAX_SIGNAL_AGE | 20 s | ignore stale signals |
| MIN_PAYOUT | 75 % | skip if payout is lower |

Stop anytime: Ctrl+C or create a file named `STOP` next to the script. Log: `trades_log.csv`.
Untested against the live platform (written from the library docs). Test on DEMO and watch the first trades.
