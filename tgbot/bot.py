"""Telegram bot: press a real-market FX pair -> get M15/M5/M1 trend analysis + 5-min direction.
Rule-based (same rule as the manual scans): follow trend when M15 & M5 agree.
Run: TRADE_BOT_TOKEN=... python bot.py      (deps: requests, pandas)
"""
import os, time, requests, pandas as pd
from concurrent.futures import ThreadPoolExecutor

SCORES = {}  # pair -> (score, direction)

TOKEN = os.environ["TRADE_BOT_TOKEN"]
API = f"https://api.telegram.org/bot{TOKEN}"
ALLOWED = {int(x) for x in os.environ.get("ALLOWED_CHAT_IDS", "").split(",") if x.strip()}  # empty = anyone
PAIRS = "EURUSD GBPUSD USDJPY AUDUSD USDCAD USDCHF NZDUSD EURGBP EURJPY EURCHF EURAUD EURCAD EURNZD GBPJPY GBPAUD GBPCAD GBPCHF GBPNZD AUDJPY AUDCAD AUDCHF AUDNZD CADJPY CADCHF CHFJPY NZDJPY NZDCAD NZDCHF".split()
DISCLAIMER = ("⚠️ Ուղղությունը ենթադրություն է, ոչ երաշխիք։ Բեքթեսթում այս կանոնը իրական շուկայում ~49% էր "
              "(break-even ~52–55%)։ Մեկ գործարք՝ փոքր գումարով։ Ոչ ֆինանսական խորհուրդ։")

def ema(s, n): return s.ewm(span=n, adjust=False).mean()
def rsi(s, n=14):
    d = s.diff(); u = d.clip(lower=0).ewm(alpha=1/n, adjust=False).mean()
    l = (-d.clip(upper=0)).ewm(alpha=1/n, adjust=False).mean()
    return 100 - 100 / (1 + u / l)

def fetch(pair):
    j = requests.get(f"https://query1.finance.yahoo.com/v8/finance/chart/{pair}=X",
        params={"interval": "1m", "range": "5d"}, headers={"User-Agent": "Mozilla/5.0"}, timeout=20).json()["chart"]["result"][0]
    return pd.Series(j["indicators"]["quote"][0]["close"], index=pd.to_datetime(j["timestamp"], unit="s")).dropna()

def closed(series, minutes, now):
    """Keep only fully closed bars: bar start + length <= now."""
    end = series.index + pd.Timedelta(minutes=minutes)
    return series[end <= now]

def analyze(pair):
    raw = fetch(pair)
    now = pd.Timestamp.now("UTC").tz_localize(None)
    m1 = closed(raw, 1, now)
    m5 = closed(raw.resample("5min").last().dropna(), 5, now)
    m15 = closed(raw.resample("15min").last().dropna(), 15, now)
    m30 = closed(raw.resample("30min").last().dropna(), 30, now)
    h1 = closed(raw.resample("60min").last().dropna(), 60, now)
    st = {}
    for name, s in (("H1", h1), ("M30", m30), ("M15", m15), ("M5", m5), ("M1", m1)):
        e = ema(s, 20).iloc[-1]; st[name] = ("UP" if s.iloc[-1] > e else "DOWN", s.iloc[-1], e)
    r5 = rsi(m5).iloc[-1]; r1 = rsi(m1).iloc[-1]
    price = m1.iloc[-1]; ts = now.strftime("%H:%M:%S")
    since = (now.minute % 5) * 60 + now.second; nxt = 300 - since
    ico = {"UP": "🟢", "DOWN": "🔴"}
    lines = [f"📊 *{pair[:3]}/{pair[3:]}* · {ts} UTC · գին {price:.5f}", ""]
    for k in ("H1", "M30", "M15", "M5", "M1"):
        lines.append(f"{k}: {ico[st[k][0]]} {st[k][0]} (EMA20 {st[k][2]:.5f})")
    lines.append(f"RSI M5 {r5:.0f} · RSI M1 {r1:.0f}")
    lines.append("_(հաշվարկը՝ միայն փակված մոմերով)_")
    lines.append(f"🕒 M5 մոմը փակվեց {since} վ առաջ · հաջորդ փակումը՝ {nxt} վ հետո\n")
    d15, d5, d1 = st["M15"][0], st["M5"][0], st["M1"][0]
    if d15 != d5:
        lines += ["➡️ *WAIT / չմտնել*", "M15-ը և M5-ը հակասում են, ուղղություն չկա։"]
    else:
        full = d1 == d15
        all5 = full and st["M30"][0] == d15 and st["H1"][0] == d15
        tag = "🔥 (բոլոր 5 ժամկետն էլ համաձայն)" if all5 else ("(M15, M5, M1 համաձայն)" if full else "🟡 թույլ (M1-ը հակառակն է՝ պուլբեք)")
        if all5: lines[0] = "🔥 " + lines[0]
        lines += [f"➡️ *{d15}* {ico[d15]} {tag}",
                  "⏱ Expiry՝ *5 րոպե*",
                  ("✅ Մտիր հիմա (M5 մոմը նոր է փակվել)" if since <= 60 else f"⏳ Ավելի լավ է սպասել M5 փակմանը ({nxt} վ) և նոր մտնել"),
                  f"❌ Անվավեր, եթե M5 փակվի EMA20-ի {'ներքև' if d15=='UP' else 'վերև'} ({st['M5'][2]:.5f})"]
        if (d15 == "UP" and r5 > 70) or (d15 == "DOWN" and r5 < 30):
            lines.append("⚠️ M5 RSI-ն ծայրահեղ է՝ ռեվերսի ռիսկ")
    if d15 != d5: sc = 0
    elif all5: sc = 10 if not ((d15 == "UP" and r5 > 70) or (d15 == "DOWN" and r5 < 30)) else 9
    elif full: sc = 6
    else: sc = 3
    SCORES[pair] = (sc + (1 - abs(r5 - 50) / 50) * 0.5, d15)  # tiebreak: less extreme RSI
    return "\n".join(lines)

def best_signal():
    SCORES.clear(); errs = 0
    def run(p):
        try: return p, analyze(p)
        except Exception: return p, None
    with ThreadPoolExecutor(8) as ex: res = dict(ex.map(run, PAIRS))
    ok = [p for p in PAIRS if res[p] and p in SCORES]
    if not ok: return None, "Տվյալներ չստացվեցին, փորձիր նորից։"
    p = max(ok, key=lambda x: SCORES[x][0])
    n5 = sum(1 for x in ok if SCORES[x][0] >= 9)
    head = f"🔍 Սկանավորվեց {len(ok)} զույգ · 🔥 սիգնալներ՝ {n5}\n"
    if SCORES[p][0] < 6: head += "Ուժեղ սիգնալ չկա, ամենալավը թույլ է։\n"
    return p, head + "\n" + res[p]

def keyboard():
    rows = [[{"text": "🔍 Գտնել լավագույն սիգնալը", "callback_data": "BEST"}]] + [[{"text": f"{p[:3]}/{p[3:]}", "callback_data": p} for p in PAIRS[i:i+3]] for i in range(0, len(PAIRS), 3)]
    return {"inline_keyboard": rows}

START_KB = {"keyboard": [[{"text": "▶️ Start"}, {"text": "🔍 Լավագույն սիգնալ"}]], "resize_keyboard": True, "is_persistent": True}

def send(chat, text, markup=None):
    requests.post(f"{API}/sendMessage", json={"chat_id": chat, "text": text, "parse_mode": "Markdown",
        **({"reply_markup": markup} if markup else {})}, timeout=20)

def main():
    requests.post(f"{API}/setMyCommands", json={"commands": [{"command": "start", "description": "Բացել զույգերի ցանկը"}]}, timeout=10)
    offset = None; print("bot started")
    while True:
        try:
            ups = requests.get(f"{API}/getUpdates", params={"timeout": 8, "offset": offset}, timeout=20).json().get("result", [])
        except Exception as e:
            print("poll error", e); time.sleep(5); continue
        for u in ups:
            offset = u["update_id"] + 1
            msg = u.get("message"); cb = u.get("callback_query")
            chat = (msg or cb["message"])["chat"]["id"] if (msg or cb) else None
            if chat is None or (ALLOWED and chat not in ALLOWED): continue
            if msg:
                text = msg.get("text", "")
                if text.startswith("🔍"):
                    send(chat, "🔍 Սկանավորում եմ 28 զույգը, սպասիր ~10 վայրկյան...")
                    try:
                        p, t = best_signal()
                        send(chat, t, {"inline_keyboard": [[{"text": f"🔄 {p[:3]}/{p[3:]}", "callback_data": p}] if p else [], [{"text": "🔍 Նորից գտնել", "callback_data": "BEST"}]]})
                    except Exception as e: send(chat, f"Սխալ՝ {e}")
                    continue
                if text.startswith("/start"): send(chat, "Բարև 👋 Ներքևի «▶️ Start» կոճակով ցանկացած պահի կարող ես բացել զույգերի ցանկը։", START_KB)
                send(chat, "Ընտրիր զույգը 👇", keyboard())
            elif cb:
                requests.post(f"{API}/answerCallbackQuery", json={"callback_query_id": cb["id"]}, timeout=10)
                if cb["data"] == "BEST":
                    try:
                        p, t = best_signal()
                        send(chat, t, {"inline_keyboard": [[{"text": f"🔄 {p[:3]}/{p[3:]}", "callback_data": p}] if p else [], [{"text": "🔍 Նորից գտնել", "callback_data": "BEST"}]]})
                    except Exception as e: send(chat, f"Սխալ՝ {e}")
                    continue
                try:
                    p = cb["data"]
                    send(chat, analyze(p), {"inline_keyboard": [[{"text": f"🔄 {p[:3]}/{p[3:]}", "callback_data": p}]]})
                except Exception as e: send(chat, f"Սխալ տվյալներ ստանալիս՝ {e}")

if __name__ == "__main__": main()
