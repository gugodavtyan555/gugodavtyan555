// FX analysis Telegram bot on Cloudflare Workers (webhook + cron, D1 storage).
// Bindings: DB (D1), BOT_TOKEN, WEBHOOK_SECRET, ALLOWED_CHAT (secrets/vars)

const PAIRS = "EURUSD GBPUSD USDJPY AUDUSD USDCAD USDCHF NZDUSD EURGBP EURJPY EURCHF EURAUD EURCAD EURNZD GBPJPY GBPAUD GBPCAD GBPCHF GBPNZD AUDJPY AUDCAD AUDCHF AUDNZD CADJPY CADCHF CHFJPY NZDJPY NZDCAD NZDCHF".split(" ");
const GROUPS = 2;                 // free plan: only 2 cron triggers available -> 2 groups of 14 pairs
const CRONS = ["*/5 * * * *", "0-59/5 * * * *"];   // cron 1 also ranks + settles after scanning
const PAYOUT = 0.80, TOP_N = 1, TZ_OFFSET = 4 * 3600;
const START_KB = { keyboard: [[{ text: "▶️ Start" }, { text: "🔍 Լավագույն սիգնալ" }], [{ text: "📜 Պատմություն" }, { text: "⚙️ Ավտո ON/OFF" }], [{ text: "↩️ Հակառակ սիգնալ" }]], resize_keyboard: true, is_persistent: true };

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
const oneKb = p => ({ inline_keyboard: [[{ text: `🔄 ${pairName(p)}`, callback_data: p }]] });
const bestKb = p => ({ inline_keyboard: [...(p ? [[{ text: `🔄 ${pairName(p)}`, callback_data: p }]] : []), [{ text: "🔍 Նորից գտնել", callback_data: "BEST" }]] });

// ---------- "clear signal" rules (strict) ----------
// Trend: M15, M5, M1 all agree AND M5 RSI not extreme (35-65) AND price not stretched (<= 2 ATR from M5 EMA20)
// Fade:  M15, M5, M1 all agree AND price stretched (>= 2.5 ATR from M5 EMA20) -> trade against the move
const isClearTrend = i => i.full && i.r5 > 35 && i.r5 < 65 && i.feat.dist <= 2;
const isClearFade = i => i.full && i.feat.dist >= 2.5;
const dot = d => ico[d];

function whyNotTrend(i) {
  if (!i.agree) return "M15-ը և M5-ը հակասում են";
  if (!i.full) return "M1-ը հակառակ կողմում է (պուլբեք)";
  if (i.r5 <= 35 || i.r5 >= 65) return `RSI-ն ծայրահեղ է (${i.r5.toFixed(0)})՝ ռեվերսի ռիսկ`;
  return `գինը շատ է հեռացել EMA-ից (${i.feat.dist} ATR)`;
}
function renderClear(i, now) {
  const hh = new Date(now * 1000).toISOString().slice(11, 19), p = pairName(i.pair);
  if (!isClearTrend(i)) return `⚪️ *WAIT* · ${p}\nՏրենդային հստակ սիգնալ չկա. ${whyNotTrend(i)}։`;
  const d = i.dir, lvl = i.st.M5[2];
  return [`${dot(d)} *${d} · 5 րոպե* — ${p} 🔥`,
    `M15 ${dot(i.st.M15[0])} M5 ${dot(i.st.M5[0])} M1 ${dot(i.st.M1[0])} համաձայն · RSI ${i.r5.toFixed(0)} · EMA-ից ${i.feat.dist} ATR`,
    `Գին ${i.price.toFixed(5)} · ${hh} UTC · ✅ մտիր հիմա`,
    `❌ Անվավեր, եթե M5 փակվի ${lvl.toFixed(5)}-ից ${d === "UP" ? "ներքև" : "վերև"}`].join("\n");
}
function renderFadeClear(i, now) {
  const hh = new Date(now * 1000).toISOString().slice(11, 19), p = pairName(i.pair);
  if (!isClearFade(i)) return `↩️ ⚪️ *WAIT* · ${p}\nՀակառակ հստակ սիգնալ չկա. ` + (!i.full ? "երեք ժամկետը համաձայն չեն" : `գինը բավականաչափ հեռու չէ EMA-ից (${i.feat.dist} ATR, պետք է ≥ 2.5)`) + "։";
  const trend = i.dir, fade = trend === "UP" ? "DOWN" : "UP";
  const atr = Math.abs(i.st.M5[1] - i.st.M5[2]) / i.feat.dist, lvl = trend === "UP" ? i.price + atr : i.price - atr;
  return [`↩️ ${dot(fade)} *${fade} · 5 րոպե* — ${p} (հակառակ)`,
    `Գինը EMA-ից ${i.feat.dist} ATR ${trend === "UP" ? "վերև" : "ներքև"} է (ձգված շարժում) · RSI ${i.r5.toFixed(0)}`,
    `Գին ${i.price.toFixed(5)} · ${hh} UTC · ✅ մտիր հիմա`,
    `❌ Անվավեր, եթե գինը ևս 1 ATR հեռանա (${lvl.toFixed(5)})`].join("\n");
}

const scanFresh = async now => (await Promise.all(PAIRS.map(p => computeInfo(p, now, true).catch(() => null)))).filter(i => i && i.bar >= now - 180);

function bestFrom(fresh, now) {
  const clear = fresh.filter(isClearTrend).sort((a, b) => b.score - a.score);
  const head = `🔍 Սկանավորվեց ${fresh.length} զույգ հենց հիմա · հստակ տրենդային սիգնալներ՝ ${clear.length}`;
  if (!clear.length) return { pair: null, text: `${head}\n\n⚪️ *Հստակ տրենդային սիգնալ չկա հիմա։* Սպասիր կամ սեղմիր նորից մի քանի րոպեից։` };
  return { pair: clear[0].pair, text: `${head}\n\n${renderClear(clear[0], now)}` };
}
function fadeFrom(fresh, now) {
  const clear = fresh.filter(isClearFade).sort((a, b) => b.feat.dist - a.feat.dist);
  if (!clear.length) return { text: "↩️ ⚪️ *Հստակ հակառակ սիգնալ չկա հիմա* (չկա զույգ, որի գինը ≥ 2.5 ATR հեռու է EMA-ից և երեք ժամկետն էլ համաձայն են)։" };
  return { pair: clear[0].pair, text: renderFadeClear(clear[0], now) };
}

// "Best signal" = trend signal + opposite (fade) signal from one fresh scan of all pairs
async function bestSignal(env, now, fadeFirst = false) {
  const fresh = await scanFresh(now);
  if (!fresh.length) return { pair: null, text: "Թարմ տվյալներ չստացվեցին (շուկան կարող է փակ լինել)։ Փորձիր նորից։" };
  const t = bestFrom(fresh, now), f = fadeFrom(fresh, now);
  const parts = fadeFirst ? [f.text, t.text] : [t.text, f.text];
  return { pair: t.pair, text: parts.join("\n\n━━━━━━━━━━\n\n") };
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
  const fresh = await scanFresh(now);
  if (!fresh.length) return { text: "Թարմ տվյալներ չստացվեցին (շուկան կարող է փակ լինել)։ Փորձիր նորից։" };
  return fadeFrom(fresh, now);
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
  const T = x => x.filter(t => (t.strat || "T") === "T"), F = x => x.filter(t => t.strat === "F");
  const L = [`📜 *Պատմություն · ${today}*  (վիրտուալ գործարքներ)`, `Ավտո՝ ${auto ? "🟢 միացված" : "🔴 անջատված"}`, "↩️ = հակառակ ուղղությամբ թեստ", ""];
  if (!td.length) L.push("Այսօր դեռ գործարք չկա։");
  const icon = { win: "✅", loss: "❌", draw: "➖", error: "⚠️" };
  for (const t of td.slice(-40)) L.push(`${icon[t.result] || "⏳"}${t.strat === "F" ? "↩️" : ""} ${loc(t.open_at).toISOString().slice(11, 16)} ${pairName(t.pair)} ${t.dir} ${t.entry.toFixed(5)}→${t.exit != null ? t.exit.toFixed(5) : "…"}`);
  L.push("", "*Տրենդով (հիմնական)*", `Այսօր. ${stats(T(td))}`, `Ընդհանուր (${T(results).length}). ${stats(T(results))}`,
    "", "*↩️ Հակառակ (թեստ)*", `Այսօր. ${stats(F(td))}`, `Ընդհանուր (${F(results).length}). ${stats(F(results))}`,
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
      else if (cb.data === "BEST") {
        const r = await bestSignal(env, now, mode === "F"); await send(env, chat, r.text, bestKb(r.pair));
      } else if (PAIRS.includes(cb.data)) {
        const info = await computeInfo(cb.data, now, true);
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
  if (text.startsWith("↩️")) { const r = await fadeSignal(env, now); return void await send(env, chat, r.text, { inline_keyboard: [[{ text: "↩️ Նորից գտնել", callback_data: "FADE" }]] }); }
  if (text.startsWith("🔍")) { const r = await bestSignal(env, now); return void await send(env, chat, r.text, bestKb(r.pair)); }
  if (text.startsWith("/start")) await send(env, chat, "Բարև 👋 Ներքևի «▶️ Start» կոճակով ցանկացած պահի կարող ես բացել զույգերի ցանկը։", START_KB);
  await send(env, chat, modeText(), pairKb());
}

// ---------- cron jobs ----------
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function scanGroup(env, g, boundary, wait) {
  if (wait) await sleep(3000);
  const now = Math.floor(Date.now() / 1000);
  const mine = PAIRS.filter((_, i) => i % GROUPS === g);
  const res = await Promise.all(mine.map(p => computeInfo(p, now).catch(() => null)));
  const stmts = res.filter(Boolean).map(i => env.DB.prepare("INSERT OR REPLACE INTO scan VALUES (?,?,?)").bind(i.pair, boundary, JSON.stringify(i)));
  if (stmts.length) await env.DB.batch(stmts);
  return res.filter(Boolean).length;
}

async function rankAndSettle(env, boundary, wait) {
  if (wait) await sleep(8000);  // give the other scan group time to finish
  const out = { settled: 0, opened: [] };
  // settle
  const { results: open } = await env.DB.prepare("SELECT * FROM trades WHERE result IS NULL AND exit_at <= ?").bind(boundary).all();
  const cache = {};
  for (const t of open) {
    let px = null;
    try { cache[t.pair] = cache[t.pair] || await fetchYahoo(t.pair, "1m", "1d"); const s = cache[t.pair]; if (s.t.length && s.t[s.t.length - 1] >= t.exit_at) px = s.c[s.c.length - 1]; } catch (e) {}
    const tries = t.tries + 1;
    if (px == null) { await env.DB.prepare("UPDATE trades SET tries=?, result=? WHERE id=?").bind(tries, tries >= 4 ? "error" : null, t.id).run(); continue; }
    const moved = px - t.entry; const res = moved === 0 ? "draw" : ((moved > 0) === (t.dir === "UP") ? "win" : "loss");
    await env.DB.prepare("UPDATE trades SET exit=?, result=?, tries=? WHERE id=?").bind(px, res, tries, t.id).run(); out.settled++;
  }
  // open new virtual trades
  const auto = (await env.DB.prepare("SELECT v FROM kv WHERE k='auto'").first())?.v === "1";
  if (auto) {
    const { results } = await env.DB.prepare("SELECT info, asof FROM scan WHERE asof = ?").bind(boundary).all();
    const all = results.map(r => JSON.parse(r.info)).filter(i => i.bar >= boundary - 180);
    const ins = (i, dir, strat) => env.DB.prepare("INSERT OR IGNORE INTO trades (pair, dir, open_at, exit_at, entry, score, feat, strat) VALUES (?,?,?,?,?,?,?,?)")
      .bind(i.pair, dir, boundary, boundary + 300, i.price, Math.round(i.score * 100) / 100, JSON.stringify(i.feat), strat);
    // T = trend (best aligned pair, RSI-neutral). F = fade (aligned pair farthest from EMA, trade AGAINST the trend)
    const t = all.filter(isClearTrend).sort((a, b) => b.score - a.score).slice(0, TOP_N);
    for (const i of t) { await ins(i, i.dir, "T").run(); out.opened.push("T:" + i.pair); }
    const f = all.filter(isClearFade).sort((a, b) => b.feat.dist - a.feat.dist)[0];
    if (f) { await ins(f, f.dir === "UP" ? "DOWN" : "UP", "F").run(); out.opened.push("F:" + f.pair); }
  }
  return out;
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
    // manual test run of cron jobs (protected)
    if (url.pathname === "/run/" + env.WEBHOOK_SECRET) {
      const kind = url.searchParams.get("k"), boundary = Math.floor(Date.now() / 300000) * 300;
      const t0 = Date.now();
      if (kind === "best") { const r = await bestSignal(env, Math.floor(Date.now() / 1000)); return new Response(r.text + "\n\nms=" + (Date.now() - t0)); }
      const r = kind === "rank" ? await rankAndSettle(env, boundary, false) : await scanGroup(env, Number(kind), boundary, false);
      return new Response(JSON.stringify({ kind, r, ms: Date.now() - t0 }));
    }
    return new Response("FX analyzer bot");
  },
  async scheduled(event, env, ctx) {
    const idx = CRONS.indexOf(event.cron); const boundary = Math.floor(event.scheduledTime / 300000) * 300;
    if (idx < 0) return;
    ctx.waitUntil((async () => {
      await scanGroup(env, idx, boundary, true);
      if (idx === GROUPS - 1) await rankAndSettle(env, boundary, true);
    })());
  }
};
