// FX analysis Telegram bot on Cloudflare Workers (webhook + cron, D1 storage).
// Bindings: DB (D1), BOT_TOKEN, WEBHOOK_SECRET, ALLOWED_CHAT (secrets/vars)

const PAIRS = "EURUSD GBPUSD USDJPY AUDUSD USDCAD USDCHF NZDUSD EURGBP EURJPY EURCHF EURAUD EURCAD EURNZD GBPJPY GBPAUD GBPCAD GBPCHF GBPNZD AUDJPY AUDCAD AUDNZD CADJPY CADCHF CHFJPY NZDJPY NZDCAD NZDCHF".split(" ");
const GROUPS = 2;                 // free plan: only 2 cron triggers available -> 2 groups of 14 pairs
const CRONS = ["*/1 * * * *"];   // one trigger: scans all 28 pairs every minute; ranks + settles on 5-min boundaries
const PAYOUT = 0.80, TOP_N = 1, TZ_OFFSET = 4 * 3600;
const START_KB = { keyboard: [[{ text: "▶️ Start" }, { text: "🔍 Լավագույն սիգնալ" }], [{ text: "📜 Պատմություն" }, { text: "⚙️ Ավտո ON/OFF" }], [{ text: "↩️ Հակառակ սիգնալ" }, { text: "🔁 RSI սիգնալ" }]], resize_keyboard: true, is_persistent: true };

// ---------- indicators ----------
const ema = (v, n) => { const a = 2 / (n + 1); const o = new Array(v.length); o[0] = v[0]; for (let i = 1; i < v.length; i++) o[i] = a * v[i] + (1 - a) * o[i - 1]; return o; };
function rsiLast(v, n = 14) {
  const a = 1 / n; let U = 0, L = 0, init = false;
  for (let i = 1; i < v.length; i++) {
    const d = v[i] - v[i - 1], u = d > 0 ? d : 0, l = d < 0 ? -d : 0;
    if (!init) { U = u; L = l; init = true; } else { U = U * (1 - a) + u * a; L = L * (1 - a) + l * a; }
  }
  return L === 0 ? 100 : 100 - 100 / (1 + U / L);
}
// series: {t:[sec], c:[close]}; resample to minutes using last close per bucket
function resample(s, minutes) {
  const step = minutes * 60, t = [], c = [];
  for (let i = 0; i < s.t.length; i++) {
    const b = Math.floor(s.t[i] / step) * step;
    if (t.length && t[t.length - 1] === b) c[c.length - 1] = s.c[i]; else { t.push(b); c.push(s.c[i]); }
  }
  return { t, c };
}
function closedOnly(s, minutes, now) {
  const end = minutes * 60; let n = s.t.length;
  while (n > 0 && s.t[n - 1] + end > now) n--;
  return { t: s.t.slice(0, n), c: s.c.slice(0, n) };
}

async function fetchYahoo(pair, interval, range) {
  const r = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${pair}=X?interval=${interval}&range=${range}`, { headers: { "User-Agent": "Mozilla/5.0" } });
  const j = await r.json(); const res = j.chart.result[0]; const cl = res.indicators.quote[0].close;
  const t = [], c = [];
  for (let i = 0; i < res.timestamp.length; i++) if (cl[i] != null) { t.push(res.timestamp[i]); c.push(cl[i]); }
  return { t, c };
}

function mergeLive(base, step, m1) {
  const t = base.t.slice(), c = base.c.slice();
  if (m1.t.length) {
    const b = Math.floor(m1.t[m1.t.length - 1] / step) * step, lc = m1.c[m1.c.length - 1];
    if (t.length && t[t.length - 1] === b) c[c.length - 1] = lc; else if (!t.length || b > t[t.length - 1]) { t.push(b); c.push(lc); }
  }
  return { t, c };
}

// "Live snapshot" analysis: M15 / M5 / M1 vs EMA20 using the latest price incl. the unfinished candle.
async function computeInfo(pair, now, lite = false) {
  let m1, m5, m15;
  if (lite) {   // 1 subrequest per pair: derive M5/M15 from 3 days of 1-minute data
    m1 = await fetchYahoo(pair, "1m", "3d"); m5 = resample(m1, 5); m15 = resample(m1, 15);
  } else {
    const [a, m5raw] = await Promise.all([fetchYahoo(pair, "1m", "1d"), fetchYahoo(pair, "5m", "5d")]);
    m1 = a; m5 = mergeLive(m5raw, 300, m1); m15 = resample(m5, 15);
  }
  const tfs = { M15: m15, M5: m5, M1: m1 };
  const st = {};
  for (const k of ["M15", "M5", "M1"]) {
    const s = tfs[k]; if (s.c.length < 21) throw new Error("not enough data " + k);
    const e = ema(s.c, 20); const last = s.c[s.c.length - 1], el = e[e.length - 1];
    st[k] = [last > el ? "UP" : "DOWN", last, el];
  }
  const r5 = rsiLast(tfs.M5.c), r1 = rsiLast(tfs.M1.c);
  const d15 = st.M15[0], d5 = st.M5[0], d1 = st.M1[0];
  const agree = d15 === d5, full = agree && d1 === d15;
  const sc = !agree ? 0 : full ? 10 : 3;
  const bar = m1.t[m1.t.length - 1];
  const m5c = tfs.M5.c, n5 = m5c.length; let tr = 0; for (let i = n5 - 14; i < n5; i++) tr += Math.abs(m5c[i] - m5c[i - 1]);
  const atr = tr / 14, feat = { hour: new Date(now * 1000).getUTCHours(), rsi5: +r5.toFixed(1), rsi1: +r1.toFixed(1), dist: +(Math.abs(st.M5[1] - st.M5[2]) / atr).toFixed(2), vol: +(atr / st.M5[1] * 1e4).toFixed(2) };
  return { feat, pair, st, r5, r1, score: sc + (1 - Math.abs(r5 - 50) / 50) * 0.5, dir: d15, price: st.M1[1], bar, full, agree };
}

// ---------- TradingView technical rating (public scanner endpoint, read-only) ----------
async function fetchTV(pairs) {
  const r = await fetch("https://scanner.tradingview.com/forex/scan", { method: "POST", headers: { "content-type": "application/json", "User-Agent": "Mozilla/5.0" },
    body: JSON.stringify({ symbols: { tickers: pairs.map(p => "FX_IDC:" + p) }, columns: ["Recommend.All|1", "Recommend.All|5", "Recommend.All|15"] }) });
  const j = await r.json(), out = {};
  for (const row of j.data || []) out[row.s.split(":")[1]] = { m1: row.d[0], m5: row.d[1], m15: row.d[2] };
  return out;
}

// ---------- LIVE scan from TradingView (one light request: price, EMA20, RSI, ATR on 1/5/15 min) ----------
const DIST_SCALE = 2.66;   // TradingView ATR(14) ~ 2.66x the close-to-close ATR the distance thresholds were calibrated on
const marketOpen = now => { const d = new Date(now * 1000), wd = d.getUTCDay(), h = d.getUTCHours(); return !((wd === 5 && h >= 22) || wd === 6 || (wd === 0 && h < 22)); };
async function scanTV(pairs, now) {
  const r = await fetch("https://scanner.tradingview.com/forex/scan", { method: "POST", headers: { "content-type": "application/json", "User-Agent": "Mozilla/5.0" },
    body: JSON.stringify({ symbols: { tickers: pairs.map(p => "FX_IDC:" + p) }, columns: ["close|1", "EMA20|1", "RSI|1", "close|5", "EMA20|5", "RSI|5", "ATR|5", "close|15", "EMA20|15", "Recommend.All|1", "Recommend.All|5", "Recommend.All|15"] }) });
  const j = await r.json(), out = [];
  for (const row of j.data || []) {
    const pair = row.s.split(":")[1], [c1, e1, rs1, c5, e5, rs5, atr5, c15, e15, t1, t5, t15] = row.d;
    if ([c1, e1, rs1, c5, e5, rs5, atr5, c15, e15].some(x => x == null) || !(atr5 > 0)) continue;
    const dir = (c, e) => c > e ? "UP" : "DOWN";
    const st = { M15: [dir(c15, e15), c15, e15], M5: [dir(c5, e5), c5, e5], M1: [dir(c1, e1), c1, e1] };
    const d15 = st.M15[0], agree = d15 === st.M5[0], full = agree && st.M1[0] === d15;
    const sc = !agree ? 0 : full ? 10 : 3;
    const tvv = [t1, t5, t15].map(x => x == null ? 0 : x);
    out.push({ pair, st, r5: rs5, r1: rs1, score: sc + (1 - Math.abs(rs5 - 50) / 50) * 0.5, dir: d15, price: c1, bar: now, full, agree,
      feat: { hour: new Date(now * 1000).getUTCHours(), rsi5: +rs5.toFixed(1), rsi1: +rs1.toFixed(1), dist: +(Math.abs(c5 - e5) / atr5 * DIST_SCALE).toFixed(2), vol: +((atr5 / DIST_SCALE) / c5 * 1e4).toFixed(2), tv: tvv.map(x => +x.toFixed(2)) },
      tv: { m1: tvv[0], m5: tvv[1], m15: tvv[2] } });
  }
  return out;
}

// ---------- rendering ----------
const mmss = s => { s = Math.floor(s); const m = Math.floor(s / 60), r = s % 60; return m ? `${m} ր ${String(r).padStart(2, "0")} վ` : `${r} վ`; };
const pairName = p => `${p.slice(0, 3)}/${p.slice(3)}`;
const ico = { UP: "🟢", DOWN: "🔴" };
function render(info, now) {
  const { pair, st, r5, r1 } = info;
  const ts = new Date(now * 1000).toISOString().slice(11, 19);
  const L = [`📊 *${pairName(pair)}* · ${ts} UTC · գին ${info.price.toFixed(5)}`, ""];
  for (const k of ["M15", "M5", "M1"]) L.push(`${k}: ${ico[st[k][0]]} ${st[k][0]} (EMA20 ${st[k][2].toFixed(5)})`);
  L.push(`RSI M5 ${r5.toFixed(0)} · RSI M1 ${r1.toFixed(0)}`, "_(վիճակը հենց այս պահի գնով)_", "");
  const d15 = st.M15[0];
  if (!info.agree) L.push("➡️ *WAIT / չմտնել*", "M15-ը և M5-ը հակասում են, ուղղություն չկա։");
  else {
    if (info.full) L[0] = "🔥 " + L[0];
    L.push(`➡️ *${d15}* ${ico[d15]} ${info.full ? "🔥 (երեք ժամկետն էլ համաձայն)" : "🟡 թույլ (M1-ը հակառակն է՝ պուլբեք)"}`, "⏱ Expiry՝ *5 րոպե*",
      "✅ Մտնելու համար՝ հիմա (սիգնալը ընթացիկ պահի համար է)",
      `❌ Անվավեր, եթե M5 մոմը փակվի EMA20-ի ${d15 === "UP" ? "ներքև" : "վերև"} (${st.M5[2].toFixed(5)})`);
    if ((d15 === "UP" && r5 > 70) || (d15 === "DOWN" && r5 < 30)) L.push("⚠️ M5 RSI-ն ծայրահեղ է՝ ռեվերսի ռիսկ");
  }
  return L.join("\n");
}

// ---------- telegram ----------
async function tg(env, method, body) {
  return fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/${method}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
}
const send = (env, chat, text, markup) => tg(env, "sendMessage", { chat_id: chat, text, parse_mode: "Markdown", ...(markup ? { reply_markup: markup } : {}) });
const getMode = async env => ((await env.DB.prepare("SELECT v FROM kv WHERE k='mode'").first())?.v) === "F" ? "F" : "T";
const modeText = () => "Ընտրիր զույգը 👇 (կստանաս երկու սիգնալ՝ տրենդով և հակառակը)";
const pairKb = (mode = "T") => ({ inline_keyboard: [
  [{ text: "🔍 Գտնել լավագույն սիգնալը", callback_data: "BEST" }],
  ...Array.from({ length: Math.ceil(PAIRS.length / 3) }, (_, i) => PAIRS.slice(i * 3, i * 3 + 3).map(p => ({ text: pairName(p), callback_data: p })))] });
const oneKb = p => ({ inline_keyboard: [[{ text: `🔄 ${pairName(p)}`, callback_data: p }], [{ text: "📲 Բացել Pocket Option", url: "https://m.pocketoption.com/ru/cabinet/" }]] });
const bestKb = p => ({ inline_keyboard: [...(p ? [[{ text: `🔄 ${pairName(p)}`, callback_data: p }]] : []), [{ text: "🔍 Նորից գտնել", callback_data: "BEST" }], [{ text: "📲 Բացել Pocket Option", url: "https://m.pocketoption.com/ru/cabinet/" }]] });

// ---------- "clear signal" rules (strict) ----------
// Trend: M15, M5, M1 all agree AND M5 RSI not extreme (35-65) AND price not stretched (<= 2 ATR from M5 EMA20)
// Fade:  M15, M5, M1 all agree AND price stretched (>= 2.5 ATR from M5 EMA20) -> trade against the move
const fadeDir = i => i.dir === "UP" ? "DOWN" : "UP";
const isClearTrend = i => i.full && i.r5 > 35 && i.r5 < 65 && i.feat.dist <= 2;   // TradingView agreement only ranks / labels strength
const isClearFade = i => i.full && i.feat.dist >= 2.5 && tvAgree(i.tv, fadeDir(i)) >= 1;   // not fully opposed by TradingView
const dot = d => ico[d];

// Signal is for entering RIGHT NOW (expiry 5 minutes from entry).
const entryLine = now => "✅ Մտիր հիմա (սիգնալը ընթացիկ պահի համար է)";
function tvWhy(i, dir) { return !i.tv ? "TradingView-ի տվյալներ չկան" : `TradingView-ը համաձայն չէ (${tvAgree(i.tv, dir)}/3)`; }
function whyNotTrend(i) {
  if (!i.agree) return "M15-ը և M5-ը հակասում են";
  if (!i.full) return "M1-ը հակառակ կողմում է (պուլբեք)";
  if (i.r5 <= 35 || i.r5 >= 65) return `RSI-ն ծայրահեղ է (${i.r5.toFixed(0)})՝ ռեվերսի ռիսկ`;
  return `գինը շատ է հեռացել EMA-ից (${i.feat.dist} ATR)`;
}

// TradingView rating helpers: value in [-1, 1]
const tvDir = v => v >= 0.1 ? "UP" : v <= -0.1 ? "DOWN" : "FLAT";
const tvIcon = v => v >= 0.5 ? "🟢🟢" : v >= 0.1 ? "🟢" : v > -0.1 ? "🟡" : v > -0.5 ? "🔴" : "🔴🔴";
const tvAgree = (tv, dir) => tv ? ["m1", "m5", "m15"].filter(k => tvDir(tv[k]) === dir).length : 0;
function tvLine(tv, dir) {
  if (!tv) return null;
  const n = tvAgree(tv, dir);
  const v = n === 3 ? "✅ համաձայն (3/3)" : n === 2 ? "✅ մեծ մասամբ համաձայն (2/3)" : n === 1 ? "⚠️ թույլ համաձայնություն (1/3)" : "⚠️ հակառակ է (0/3)";
  return `📡 TradingView՝ 1ր ${tvIcon(tv.m1)} · 5ր ${tvIcon(tv.m5)} · 15ր ${tvIcon(tv.m15)} — ${v}`;
}
function renderClear(i, now) {
  const hh = new Date(now * 1000).toISOString().slice(11, 19), p = pairName(i.pair);
  if (!isClearTrend(i)) return `⚪️ *WAIT* · ${p}\nՏրենդային հստակ սիգնալ չկա. ${whyNotTrend(i)}։`;
  const d = i.dir;
  return [`${dot(d)} *${d} · 5 րոպե* — ${p} ${tvAgree(i.tv, d) === 3 ? "🔥🔥 ամենաուժեղ" : tvAgree(i.tv, d) === 2 ? "🔥" : "🟡"}`,
    `M15 ${dot(i.st.M15[0])} M5 ${dot(i.st.M5[0])} M1 ${dot(i.st.M1[0])} համաձայն · RSI ${i.r5.toFixed(0)} · EMA-ից ${i.feat.dist} ATR`,
    tvLine(i.tv, d),
    `Գին ${i.price.toFixed(5)} · ${hh} UTC`,
    entryLine(now)].filter(Boolean).join("\n");
}
function renderFadeClear(i, now) {
  const hh = new Date(now * 1000).toISOString().slice(11, 19), p = pairName(i.pair);
  if (!isClearFade(i)) return `↩️ ⚪️ *WAIT* · ${p}\nՀակառակ հստակ սիգնալ չկա. ` + (!i.full ? "երեք ժամկետը համաձայն չեն" : i.feat.dist < 2.5 ? `գինը բավականաչափ հեռու չէ EMA-ից (${i.feat.dist} ATR, պետք է ≥ 2.5)` : tvWhy(i, fadeDir(i))) + "։";
  const trend = i.dir, fade = trend === "UP" ? "DOWN" : "UP";
  return [`↩️ ${dot(fade)} *${fade} · 5 րոպե* — ${p} (հակառակ)`,
    `Գինը EMA-ից ${i.feat.dist} ATR ${trend === "UP" ? "վերև" : "ներքև"} է (ձգված շարժում) · RSI ${i.r5.toFixed(0)}`,
    tvLine(i.tv, fade),
    `Գին ${i.price.toFixed(5)} · ${hh} UTC`,
    entryLine(now)].filter(Boolean).join("\n");
}

// Buttons read the scan cache written by the cron every minute (HTTP handlers have a 10 ms CPU limit on the free plan).
async function readScan(env, now) {
  const { results } = await env.DB.prepare("SELECT pair, asof, info FROM scan WHERE asof >= ?").bind(now - 420).all();
  return results.map(r => ({ ...JSON.parse(r.info), asof: r.asof })).filter(i => i.bar >= now - 480);
}
const ageNote = (rows, now) => { const age = rows.length ? now - Math.min(...rows.map(r => r.asof)) : 0; return `_(տվյալները ${mmss(age)} առաջվա են)_`; };
const scanFresh = readScan;

function bestFrom(fresh, now) {
  const clear = fresh.filter(isClearTrend).sort((a, b) => b.score - a.score);
  const head = `🔍 Սկանավորվեց ${fresh.length} զույգ հենց հիմա · հստակ տրենդային սիգնալներ՝ ${clear.length}`;
  if (!clear.length) return { pair: null, text: `${head}\n\n⚪️ *Հստակ տրենդային սիգնալ չկա հիմա։* Սպասիր կամ սեղմիր նորից մի քանի րոպեից։` };
  return { pair: clear[0].pair, text: `${head}\n\n${renderClear(clear[0], now)}` };
}
function fadeFrom(fresh, now) {
  const clear = fresh.filter(isClearFade).sort((a, b) => tvAgree(b.tv, b.dir === "UP" ? "DOWN" : "UP") - tvAgree(a.tv, a.dir === "UP" ? "DOWN" : "UP") || b.feat.dist - a.feat.dist);
  if (!clear.length) return { text: "↩️ ⚪️ *Հստակ հակառակ սիգնալ չկա հիմա* (չկա զույգ, որի գինը ≥ 2.5 ATR հեռու է EMA-ից և երեք ժամկետն էլ համաձայն են)։" };
  return { pair: clear[0].pair, text: renderFadeClear(clear[0], now) };
}

// "Best signal" = ONE pair, two signals (trend + opposite). Every press is a fresh scan; no memory between presses.
async function bestSignal(env, now) {
  if (!marketOpen(now)) return { pair: null, text: "Շուկան հիմա փակ է (բացվում է կիրակի երեկոյան)։" };
  const fresh = await scanTV(PAIRS, now);
  if (!fresh.length) return { pair: null, text: "Տվյալներ չստացվեցին։ Փորձիր նորից։" };
  const tr = fresh.filter(isClearTrend).sort((a, b) => tvAgree(b.tv, b.dir) - tvAgree(a.tv, a.dir) || b.score - a.score);
  const fd = fresh.filter(isClearFade).sort((a, b) => tvAgree(b.tv, fadeDir(b)) - tvAgree(a.tv, fadeDir(a)) || b.feat.dist - a.feat.dist);
  const order = [...tr, ...fd.filter(f => !tr.some(t => t.pair === f.pair))];
  const head = `🔍 Սկանավորվեց ${fresh.length} զույգ հենց հիմա · հստակ սիգնալներ՝ տրենդային ${tr.length}, հակառակ ${fd.length}`;
  if (!order.length) return { pair: null, text: `${head}\n\n⚪️ *Հստակ սիգնալ չկա հիմա։* Սպասիր կամ սեղմիր նորից մի քանի րոպեից։` };
  // ONE signal only: the single best of this moment (trend first; fade only if there is no clear trend signal).
  const pick = order[0], isTrend = tr.includes(pick);
  const body = isTrend ? renderClear(pick, now) : renderFadeClear(pick, now);
  return { pair: pick.pair, text: `${head}\n\n${body}` };
}

function renderFade(i, now, note) {
  const trend = i.dir, fade = trend === "UP" ? "DOWN" : "UP";
  const atr = i.feat.dist > 0 ? Math.abs(i.st.M5[1] - i.st.M5[2]) / i.feat.dist : 0;
  const lvl = trend === "UP" ? i.price + atr : i.price - atr;
  const ts = new Date(now * 1000).toISOString().slice(11, 19);
  const L = [`↩️ *Հակառակ սիգնալ* · ${pairName(i.pair)} · ${ts} UTC · գին ${i.price.toFixed(5)}`];
  if (note) L.push(`_(${note})_`);
  L.push("");
  for (const k of ["M15", "M5", "M1"]) L.push(`${k}: ${ico[i.st[k][0]]} ${i.st[k][0]} (EMA20 ${i.st[k][2].toFixed(5)})`);
  L.push(`RSI M5 ${i.r5.toFixed(0)} · RSI M1 ${i.r1.toFixed(0)} · հեռավորություն EMA20-ից՝ ${i.feat.dist} ATR`, "");
  if (!i.full) { L.push("➡️ *WAIT / չմտնել*", "Հակառակ սիգնալ չկա. M15, M5, M1 երեքն էլ համաձայն չեն։"); return L.join("\n"); }
  L.push(`➡️ *${fade}* ${ico[fade]} (տրենդին հակառակ՝ վերադարձի վրա)`, "⏱ Expiry՝ *5 րոպե*", "✅ Մտնելու համար՝ հիմա (սիգնալը ընթացիկ պահի համար է)",
    `❌ Անվավեր, եթե գինը ևս 1 ATR հեռանա՝ ${trend === "UP" ? "վերև" : "ներքև"} (${lvl.toFixed(5)})`,
    "", "⚠️ Փորձնական (վիրտուալ թեստով ստուգվող) ռազմավարություն, ապացուցված առավելություն չունի։");
  return L.join("\n");
}

async function fadeSignal(env, now) {
  if (!marketOpen(now)) return { text: "Շուկան հիմա փակ է (բացվում է կիրակի երեկոյան)։" };
  const fresh = await scanTV(PAIRS, now);
  if (!fresh.length) return { text: "Տվյալներ չստացվեցին։ Փորձիր նորից։" };
  return fadeFrom(fresh, now);
}

// RSI-extreme reversion signal (60-minute expiry): M5 RSI14 < 30 -> UP, > 70 -> DOWN. Fresh scan on every press.
const rsiKb = p => ({ inline_keyboard: [...(p ? [[{ text: `🔄 ${pairName(p)}`, callback_data: p }]] : []), [{ text: "🔁 Նորից գտնել", callback_data: "RSI" }], [{ text: "📲 Բացել Pocket Option", url: "https://m.pocketoption.com/ru/cabinet/" }]] });
async function rsiSignal(env, now) {
  if (!marketOpen(now)) return { pair: null, text: "Շուկան հիմա փակ է (բացվում է կիրակի երեկոյան)։" };
  const fresh = await scanTV(PAIRS, now);
  if (!fresh.length) return { pair: null, text: "Տվյալներ չստացվեցին։ Փորձիր նորից։" };
  const c = fresh.filter(i => i.r5 < 30 || i.r5 > 70).sort((a, b) => Math.abs(b.r5 - 50) - Math.abs(a.r5 - 50));
  const head = `🔁 Սկանավորվեց ${fresh.length} զույգ հենց հիմա · RSI գերծայրահեղ՝ ${c.length}`;
  if (!c.length) return { pair: null, text: `${head}\n\n⚪️ *RSI սիգնալ չկա հիմա* (պետք է M5 RSI < 30 կամ > 70)։ Սեղմիր նորից մի քանի րոպեից։` };
  const i = c[0], d = i.r5 < 30 ? "UP" : "DOWN", hh = new Date(now * 1000).toISOString().slice(11, 19);
  const text = [head, "", `🔁 ${ico[d]} *${d} · 60 րոպե* — ${pairName(i.pair)} (RSI գերծայրահեղ → վերադարձ)`,
    `M5 RSI ${i.r5.toFixed(0)} (${i.r5 < 30 ? "գերվաճառված" : "գերգնված"}) · M1 RSI ${i.r1.toFixed(0)} · EMA-ից ${i.feat.dist} ATR`,
    `Գին ${i.price.toFixed(5)} · ${hh} UTC`, "✅ Մտիր հիմա · expiry՝ 60 րոպե"].join("\n");
  return { pair: i.pair, text };
}

async function historyText(env, now) {
  const loc = t => new Date((t + TZ_OFFSET) * 1000);
  const dayStr = t => loc(t).toISOString().slice(0, 10);
  const today = dayStr(now);
  const { results } = await env.DB.prepare("SELECT * FROM trades ORDER BY open_at ASC, id ASC").all();
  const auto = (await env.DB.prepare("SELECT v FROM kv WHERE k='auto'").first())?.v === "1";
  const td = results.filter(t => dayStr(t.open_at) === today);
  const stats = trs => { const w = trs.filter(t => t.result === "win").length, l = trs.filter(t => t.result === "loss").length, d = trs.filter(t => t.result === "draw").length; const n = w + l;
    return `✅ ${w} · ❌ ${l} · ➖ ${d} · Win rate ${n ? (100 * w / n).toFixed(1) + "%" : "—"} · P&L ${(w * PAYOUT - l >= 0 ? "+" : "") + (w * PAYOUT - l).toFixed(2)}`; };
  const T = x => x.filter(t => (t.strat || "T") === "T"), F = x => x.filter(t => t.strat === "F"), R = x => x.filter(t => t.strat === "R");
  const L = [`📜 *Պատմություն · ${today}*  (վիրտուալ գործարքներ)`, `Ավտո՝ ${auto ? "🟢 միացված" : "🔴 անջատված"}`, "↩️ = հակառակ ուղղությամբ թեստ · 🔁 = RSI գերծայրահեղ, 60 րոպե", ""];
  if (!td.length) L.push("Այսօր դեռ գործարք չկա։");
  const icon = { win: "✅", loss: "❌", draw: "➖", error: "⚠️" };
  for (const t of td.slice(-40)) L.push(`${icon[t.result] || "⏳"}${t.strat === "F" ? "↩️" : t.strat === "R" ? "🔁" : ""} ${loc(t.open_at).toISOString().slice(11, 16)} ${pairName(t.pair)} ${t.dir} ${t.entry.toFixed(5)}→${t.exit != null ? t.exit.toFixed(5) : "…"}`);
  L.push("", "*Տրենդով (հիմնական)*", `Այսօր. ${stats(T(td))}`, `Ընդհանուր (${T(results).length}). ${stats(T(results))}`,
    "", "*↩️ Հակառակ (թեստ)*", `Այսօր. ${stats(F(td))}`, `Ընդհանուր (${F(results).length}). ${stats(F(results))}`,
    "", "*🔁 RSI գերծայրահեղ → հակառակ (60 ր, թեստ)*", `Այսօր. ${stats(R(td))}`, `Ընդհանուր (${R(results).length}). ${stats(R(results))}`,
    "", `1 միավոր/գործարք, վճար ${Math.round(PAYOUT * 100)}%։ Break-even ~${(100 / (1 + PAYOUT)).toFixed(1)}%։ Շահույթի համար win rate-ը պետք է դրանից բարձր լինի՝ բավարար թվով գործարքների վրա։`);
  return L.join("\n");
}

async function handleUpdate(env, u) {
  const now = Math.floor(Date.now() / 1000);
  const msg = u.message, cb = u.callback_query;
  const chat = (msg || cb?.message)?.chat?.id;
  if (!chat || (env.ALLOWED_CHAT && String(chat) !== String(env.ALLOWED_CHAT))) return;
  if (cb) {
    await tg(env, "answerCallbackQuery", { callback_query_id: cb.id });
    try {
      let mode = await getMode(env);
      if (cb.data === "MODE") {
        mode = mode === "F" ? "T" : "F";
        await env.DB.prepare("INSERT OR REPLACE INTO kv VALUES ('mode', ?)").bind(mode).run();
        await tg(env, "editMessageText", { chat_id: chat, message_id: cb.message.message_id, text: modeText(mode), parse_mode: "Markdown", reply_markup: pairKb(mode) });
      } else if (cb.data === "FADE") { const r = await fadeSignal(env, now); await send(env, chat, r.text, { inline_keyboard: [[{ text: "↩️ Նորից գտնել", callback_data: "FADE" }]] }); }
      else if (cb.data === "RSI") { const r = await rsiSignal(env, now); await send(env, chat, r.text, rsiKb(r.pair)); }
      else if (cb.data === "BEST") {
        const r = await bestSignal(env, now, mode === "F"); await send(env, chat, r.text, bestKb(r.pair));
      } else if (PAIRS.includes(cb.data)) {
        if (!marketOpen(now)) { await send(env, chat, "Շուկան հիմա փակ է (բացվում է կիրակի երեկոյան)։", oneKb(cb.data)); return; }
        const [info] = await scanTV([cb.data], now);
        if (!info) { await send(env, chat, "Տվյալներ չստացվեցին։ Փորձիր նորից։", oneKb(cb.data)); return; }
        await send(env, chat, [renderClear(info, now), renderFadeClear(info, now)].join("\n\n━━━━━━━━━━\n\n"), oneKb(cb.data));
      }
    } catch (e) { await send(env, chat, "Սխալ տվյալներ ստանալիս՝ " + e.message); }
    return;
  }
  const text = msg.text || "";
  if (text.startsWith("📜")) return void await send(env, chat, await historyText(env, now), START_KB);
  if (text.startsWith("⚙️")) {
    const cur = (await env.DB.prepare("SELECT v FROM kv WHERE k='auto'").first())?.v === "1";
    await env.DB.prepare("INSERT OR REPLACE INTO kv VALUES ('auto', ?)").bind(cur ? "0" : "1").run();
    return void await send(env, chat, `Ավտո վիրտուալ առևտուր՝ ${cur ? "🔴 անջատված" : "🟢 միացված"}`, START_KB);
  }
  if (text.startsWith("🔁")) { const r = await rsiSignal(env, now); return void await send(env, chat, r.text, rsiKb(r.pair)); }
  if (text.startsWith("↩️")) { const r = await fadeSignal(env, now); return void await send(env, chat, r.text, { inline_keyboard: [[{ text: "↩️ Նորից գտնել", callback_data: "FADE" }]] }); }
  if (text.startsWith("🔍")) { const r = await bestSignal(env, now); return void await send(env, chat, r.text, bestKb(r.pair)); }
  if (text.startsWith("/alerts")) {
    const cur = (await env.DB.prepare("SELECT v FROM kv WHERE k='alerts'").first())?.v !== "0";
    await env.DB.prepare("INSERT OR REPLACE INTO kv VALUES ('alerts', ?)").bind(cur ? "0" : "1").run();
    return void await send(env, chat, `🔔 Ավտոմատ ծանուցումներ՝ ${cur ? "🔴 անջատված" : "🟢 միացված"}`, START_KB);
  }
  if (text.startsWith("/start")) await send(env, chat, "Բարև 👋 Ներքևի «▶️ Start» կոճակով ցանկացած պահի կարող ես բացել զույգերի ցանկը։", START_KB);
  await send(env, chat, modeText(), pairKb());
}

// ---------- cron jobs (every minute) ----------
async function cronScan(env, now) {
  const infos = await scanTV(PAIRS, now);
  const stmts = infos.map(i => env.DB.prepare("INSERT OR REPLACE INTO scan VALUES (?,?,?)").bind(i.pair, now, JSON.stringify(i)));
  if (stmts.length) await env.DB.batch(stmts);
  return infos;
}

// On a 5-minute boundary: settle open virtual trades with the SAME price source (TradingView), then open new ones.
async function rankAndSettle(env, boundary, infos) {
  const out = { settled: 0, opened: [] }, px = {};
  for (const i of infos) px[i.pair] = i.price;
  const { results: open } = await env.DB.prepare("SELECT * FROM trades WHERE result IS NULL AND exit_at <= ?").bind(boundary + 90).all();
  for (const t of open) {
    const p = px[t.pair];
    if (t.exit_at >= boundary - 90 && p != null) {
      const moved = p - t.entry, res = moved === 0 ? "draw" : ((moved > 0) === (t.dir === "UP") ? "win" : "loss");
      await env.DB.prepare("UPDATE trades SET exit=?, result=? WHERE id=?").bind(p, res, t.id).run(); out.settled++;
    } else if (t.exit_at < boundary - 90) await env.DB.prepare("UPDATE trades SET result='error' WHERE id=?").bind(t.id).run();
  }
  const auto = (await env.DB.prepare("SELECT v FROM kv WHERE k='auto'").first())?.v === "1";
  if (auto) {
    const ins = (i, dir, strat) => env.DB.prepare("INSERT OR IGNORE INTO trades (pair, dir, open_at, exit_at, entry, score, feat, strat) VALUES (?,?,?,?,?,?,?,?)")
      .bind(i.pair, dir, boundary, boundary + 300, i.price, Math.round(i.score * 100) / 100, JSON.stringify(i.feat), strat);
    const t = infos.filter(isClearTrend).sort((a, b) => b.score - a.score).slice(0, TOP_N);
    for (const i of t) { await ins(i, i.dir, "T").run(); out.opened.push("T:" + i.pair); }
    const f = infos.filter(isClearFade).sort((a, b) => b.feat.dist - a.feat.dist)[0];
    if (f) { await ins(f, f.dir === "UP" ? "DOWN" : "UP", "F").run(); out.opened.push("F:" + f.pair); }
    // R = RSI-extreme reversion, 60-minute expiry (RSI14 on M5 < 30 -> UP, > 70 -> DOWN). Test candidate from the strategy search.
    const { results: openR } = await env.DB.prepare("SELECT pair FROM trades WHERE strat='R' AND result IS NULL").all();
    const busy = new Set(openR.map(r => r.pair));
    const cand = infos.filter(i => (i.r5 < 30 || i.r5 > 70) && !busy.has(i.pair)).sort((a, b) => Math.abs(b.r5 - 50) - Math.abs(a.r5 - 50)).slice(0, 2);
    for (const i of cand) {
      await env.DB.prepare("INSERT OR IGNORE INTO trades (pair, dir, open_at, exit_at, entry, score, feat, strat) VALUES (?,?,?,?,?,?,?,?)")
        .bind(i.pair, i.r5 < 30 ? "UP" : "DOWN", boundary, boundary + 3600, i.price, Math.round(Math.abs(i.r5 - 50) * 100) / 100, JSON.stringify(i.feat), "R").run();
      out.opened.push("R:" + i.pair);
    }
  }
  return out;
}

// Automatic alert: when a strongest signal appears (trend signal with TradingView 3/3), push it to the chat.
// Anti-spam: at most one alert per 5 minutes; the same pair+direction is not repeated within 20 minutes.
async function maybeAlert(env, infos, now) {
  const on = (await env.DB.prepare("SELECT v FROM kv WHERE k='alerts'").first())?.v;
  if (on === "0" || !env.ALLOWED_CHAT) return false;
  const pick = infos.filter(i => isClearTrend(i) && tvAgree(i.tv, i.dir) === 3).sort((a, b) => b.score - a.score)[0];
  if (!pick) return false;
  let last = null; try { const r = await env.DB.prepare("SELECT v FROM kv WHERE k='lastalert'").first(); if (r) last = JSON.parse(r.v); } catch (e) {}
  if (last && now - last.t < 300) return false;
  if (last && last.pair === pick.pair && last.dir === pick.dir && now - last.t < 1200) return false;
  await send(env, env.ALLOWED_CHAT, `🔔 *Ավտոմատ սիգնալ*\n\n${renderClear(pick, now)}\n\n━━━━━━━━━━\n\n${renderFadeClear(pick, now)}`, oneKb(pick.pair));
  await env.DB.prepare("INSERT OR REPLACE INTO kv VALUES ('signal', ?)").bind(JSON.stringify({ id: now, pair: pick.pair, dir: pick.dir, expiry_sec: 300, strength: "strongest", price: pick.price, t: now })).run();
  await env.DB.prepare("INSERT OR REPLACE INTO kv VALUES ('lastalert', ?)").bind(JSON.stringify({ pair: pick.pair, dir: pick.dir, t: now })).run();
  return true;
}

async function cronTick(env, scheduledSec) {
  if (!marketOpen(scheduledSec)) return { closed: true };
  const infos = await cronScan(env, scheduledSec);
  const alerted = await maybeAlert(env, infos, scheduledSec).catch(() => false);
  const onBoundary = Math.floor(scheduledSec / 60) % 5 === 0;
  return { scanned: infos.length, alerted, ...(onBoundary ? await rankAndSettle(env, Math.floor(scheduledSec / 300) * 300, infos) : {}) };
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (req.method === "POST" && url.pathname === "/" + env.WEBHOOK_SECRET) {
      if (req.headers.get("X-Telegram-Bot-Api-Secret-Token") !== env.WEBHOOK_SECRET) return new Response("forbidden", { status: 403 });
      const u = await req.json();
      try { await handleUpdate(env, u); } catch (e) { console.log("update error", e.message); }
      return new Response("ok");
    }
    // manual test routes (protected)
    if (url.pathname === "/run/" + env.WEBHOOK_SECRET) {
      const kind = url.searchParams.get("k"), now = Math.floor(Date.now() / 1000), t0 = Date.now();
      if (kind === "best") { const r = await bestSignal(env, now); return new Response(r.text + "\n\nms=" + (Date.now() - t0)); }
      if (kind === "tick") return new Response(JSON.stringify({ r: await cronTick(env, Math.floor(now / 60) * 60), ms: Date.now() - t0 }));
      if (kind === "boundary") return new Response(JSON.stringify({ r: await cronTick(env, Math.floor(now / 300) * 300), ms: Date.now() - t0 }));
    }
    if (url.pathname === "/api/signal" && env.API_TOKEN && url.searchParams.get("key") === env.API_TOKEN) {
      const r = await env.DB.prepare("SELECT v FROM kv WHERE k='signal'").first();
      return new Response(r ? r.v : "{}", { headers: { "content-type": "application/json", "cache-control": "no-store" } });
    }
    return new Response("FX analyzer bot");
  },
  async scheduled(event, env, ctx) {
    ctx.waitUntil(cronTick(env, Math.floor(event.scheduledTime / 1000)));
  }
};
