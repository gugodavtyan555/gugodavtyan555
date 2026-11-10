"""Telegram bot: press a real-market FX pair -> get M15/M5/M1 trend analysis + 5-min direction.
Rule-based (same rule as the manual scans): follow trend when M15 & M5 agree.
Run: TRADE_BOT_TOKEN=... python bot.py      (deps: requests, pandas)
"""
import os, time, json, threading, requests, pandas as pd
from concurrent.futures import ThreadPoolExecutor
from zoneinfo import ZoneInfo

TZ = ZoneInfo("Asia/Yerevan")
PAYOUT = 0.80  # assumed payout on real pairs (used only for virtual P&L)
STORE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "trades.json")
LOCK = threading.Lock()
TOP_N = 3  # best signals opened per 5-min cycle

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

def mmss(sec):
    m, r = divmod(int(sec), 60)
    return f"{m} ր {r:02d} վ" if m else f"{r} վ"

def closed(series, minutes, now):
    """Keep only fully closed bars: bar start + length <= now."""
    end = series.index + pd.Timedelta(minutes=minutes)
    return series[end <= now]

def analyze_full(pair):
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
    lines.append(f"🕒 M5 մոմը փակվեց {mmss(since)} առաջ · հաջորդ փակումը՝ {mmss(nxt)} հետո\n")
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
                  ("✅ Մտիր հիմա (M5 մոմը նոր է փակվել)" if since <= 60 else f"⏳ Ավելի լավ է սպասել M5 փակմանը ({mmss(nxt)}) և նոր մտնել"),
                  f"❌ Անվավեր, եթե M5 փակվի EMA20-ի {'ներքև' if d15=='UP' else 'վերև'} ({st['M5'][2]:.5f})"]
        if (d15 == "UP" and r5 > 70) or (d15 == "DOWN" and r5 < 30):
            lines.append("⚠️ M5 RSI-ն ծայրահեղ է՝ ռեվերսի ռիսկ")
    if d15 != d5: sc = 0
    elif all5: sc = 10 if not ((d15 == "UP" and r5 > 70) or (d15 == "DOWN" and r5 < 30)) else 9
    elif full: sc = 6
    else: sc = 3
    info = {"score": sc + (1 - abs(r5 - 50) / 50) * 0.5, "dir": d15, "price": float(m1.iloc[-1]), "bar": m1.index[-1]}
    return "\n".join(lines), info

def analyze(pair): return analyze_full(pair)[0]

def rank_all():
    def run(p):
        try: return p, analyze_full(p)
        except Exception: return p, None
    with ThreadPoolExecutor(8) as ex: res = dict(ex.map(run, PAIRS))
    return {p: r for p, r in res.items() if r}

def best_signal():
    res = rank_all()
    if not res: return None, "Տվյալներ չստացվեցին, փորձիր նորից։"
    p = max(res, key=lambda x: res[x][1]["score"])
    n5 = sum(1 for x in res.values() if x[1]["score"] >= 9)
    head = f"🔍 Սկանավորվեց {len(res)} զույգ · 🔥 սիգնալներ՝ {n5}\n"
    if res[p][1]["score"] < 6: head += "Ուժեղ սիգնալ չկա, ամենալավը թույլ է։\n"
    return p, head + "\n" + res[p][0]

# ---------- virtual trade history ----------
def load():
    try: return json.load(open(STORE))
    except Exception: return {"auto": True, "trades": []}

def save(d): json.dump(d, open(STORE, "w"), ensure_ascii=False, indent=1)

def settle_price(pair, bar_start):
    raw = fetch(pair)
    if bar_start in raw.index: return float(raw[bar_start])
    return None

def run_cycle(boundary):
    """boundary: pd.Timestamp (UTC naive) of the M5 close that just happened."""
    with LOCK:
        d = load()
        for t in d["trades"]:
            if t["result"] is None and pd.Timestamp(t["exit_at"]) <= boundary:
                px = settle_price(t["pair"], pd.Timestamp(t["exit_at"]) - pd.Timedelta(minutes=1))
                t["tries"] = t.get("tries", 0) + 1
                if px is None:
                    if t["tries"] >= 4: t["result"] = "error"
                    continue
                t["exit"] = px
                moved = px - t["entry"]
                t["result"] = "draw" if moved == 0 else ("win" if (moved > 0) == (t["dir"] == "UP") else "loss")
        if d["auto"]:
            res = rank_all()
            fresh = {p: r for p, r in res.items() if r[1]["bar"] >= boundary - pd.Timedelta(minutes=3)}
            top = sorted(fresh, key=lambda x: fresh[x][1]["score"], reverse=True)[:TOP_N]
            for p in top:
                inf = fresh[p][1]
                if inf["score"] >= 9:
                    d["trades"].append({"pair": p, "dir": inf["dir"], "open_at": str(boundary), "exit_at": str(boundary + pd.Timedelta(minutes=5)),
                                        "entry": inf["price"], "exit": None, "result": None, "score": round(inf["score"], 2)})
        save(d)

def scheduler():
    while True:
        try:
            now = pd.Timestamp.now("UTC").tz_localize(None)
            b = now.floor("5min")
            wake = b + pd.Timedelta(seconds=20)
            if now >= wake: b += pd.Timedelta(minutes=5); wake = b + pd.Timedelta(seconds=20)
            time.sleep(max(0, (wake - pd.Timestamp.now("UTC").tz_localize(None)).total_seconds()))
            run_cycle(b)
        except Exception as e:
            print("scheduler error", e); time.sleep(10)

def stats(trs):
    w = sum(t["result"] == "win" for t in trs); l = sum(t["result"] == "loss" for t in trs); dr = sum(t["result"] == "draw" for t in trs)
    n = w + l
    wr = f"{w/n:.1%}" if n else "—"
    return f"✅ {w} · ❌ {l} · ➖ {dr} · Win rate {wr} · P&L {w * PAYOUT - l:+.2f} (1 միավոր/գործարք, վճար {int(PAYOUT*100)}%)"

def history_text():
    d = load(); today = pd.Timestamp.now(TZ).date()
    loc = lambda t: pd.Timestamp(t["open_at"]).tz_localize("UTC").tz_convert(TZ)
    td = [t for t in d["trades"] if loc(t).date() == today]
    lines = [f"📜 *Պատմություն · {today}*  (վիրտուալ գործարքներ)", f"Ավտո՝ {'🟢 միացված' if d['auto'] else '🔴 անջատված'}", ""]
    if not td: lines.append("Այսօր դեռ գործարք չկա։")
    for t in td[-45:]:
        ic = {"win": "✅", "loss": "❌", "draw": "➖", "error": "⚠️", None: "⏳"}[t["result"]]
        ex = f"{t['exit']:.5f}" if t["exit"] else "…"
        lines.append(f"{ic} {loc(t).strftime('%H:%M')} {t['pair'][:3]}/{t['pair'][3:]} {t['dir']} {t['entry']:.5f}→{ex}")
    lines += ["", f"*Այսօր.* {stats(td)}", f"*Ընդհանուր ({len(d['trades'])}).* {stats(d['trades'])}",
              f"Break-even ~{1/(1+PAYOUT):.1%}։ Շահույթի համար win rate-ը պետք է դրանից բարձր լինի՝ բավարար թվով գործարքների վրա։"]
    return "\n".join(lines)

def keyboard():
    rows = [[{"text": "🔍 Գտնել լավագույն սիգնալը", "callback_data": "BEST"}]] + [[{"text": f"{p[:3]}/{p[3:]}", "callback_data": p} for p in PAIRS[i:i+3]] for i in range(0, len(PAIRS), 3)]
    return {"inline_keyboard": rows}

START_KB = {"keyboard": [[{"text": "▶️ Start"}, {"text": "🔍 Լավագույն սիգնալ"}], [{"text": "📜 Պատմություն"}, {"text": "⚙️ Ավտո ON/OFF"}]], "resize_keyboard": True, "is_persistent": True}

def send(chat, text, markup=None):
    requests.post(f"{API}/sendMessage", json={"chat_id": chat, "text": text, "parse_mode": "Markdown",
        **({"reply_markup": markup} if markup else {})}, timeout=20)

def main():
    requests.post(f"{API}/setMyCommands", json={"commands": [{"command": "start", "description": "Բացել զույգերի ցանկը"}]}, timeout=10)
    threading.Thread(target=scheduler, daemon=True).start()
    for c in ALLOWED: send(c, "🔄 Բոտը թարմացվեց։ Ավելացվեցին «📜 Պատմություն» և «⚙️ Ավտո ON/OFF» կոճակները։", START_KB)
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
                if text.startswith("📜"):
                    send(chat, history_text(), START_KB); continue
                if text.startswith("⚙️"):
                    with LOCK:
                        d = load(); d["auto"] = not d["auto"]; save(d)
                    send(chat, f"Ավտո վիրտուալ առևտուր՝ {'🟢 միացված' if d['auto'] else '🔴 անջատված'}", START_KB); continue
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
