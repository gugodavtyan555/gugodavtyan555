// FX analysis Telegram bot on Cloudflare Workers (webhook + cron, D1 storage).
// Bindings: DB (D1), BOT_TOKEN, WEBHOOK_SECRET, ALLOWED_CHAT (secrets/vars)

const PAIRS = "EURUSD GBPUSD USDJPY AUDUSD USDCAD USDCHF NZDUSD EURGBP EURJPY EURCHF EURAUD EURCAD EURNZD GBPJPY GBPAUD GBPCAD GBPCHF GBPNZD AUDJPY AUDCAD AUDCHF AUDNZD CADJPY CADCHF CHFJPY NZDJPY NZDCAD NZDCHF".split(" ");
const GROUPS = 2;                 // free plan: only 2 cron triggers available -> 2 groups of 14 pairs
const CRONS = ["*/5 * * * *", "0-59/5 * * * *"];   // cron 1 also ranks + settles after scanning
const PAYOUT = 0.80, TOP_N = 3, TZ_OFFSET = 4 * 3600;
const START_KB = { keyboard: [[{ text: "▶️ Start" }, { text: "🔍 Սկանավորում" }], [{ text: "📜 Պատմություն" }, { text: "⚙️ Ավտո ON/OFF" }]], resize_keyboard: true, is_persistent: true };

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
async function computeInfo(pair, now) {
  const [m1, m5raw] = await Promise.all([fetchYahoo(pair, "1m", "1d"), fetchYahoo(pair, "5m", "5d")]);
  const m5 = mergeLive(m5raw, 300, m1);
  const tfs = { M15: resample(m5, 15), M5: m5, M1: m1 };
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
    L.push(`➡️ *${d15}* ${ico[d15]} ${info.full ? "(երեք ժամկետն էլ համաձայն)" : "🟡 թույլ (M1-ը հակառակն է՝ պուլբեք)"}`, "⏱ Expiry՝ *5 րոպե*",
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
const pairKb = () => ({ inline_keyboard: [[{ text: "🔍 Սկանավորել բոլոր զույգերը", callback_data: "BEST" }], ...Array.from({ length: Math.ceil(PAIRS.length / 3) }, (_, i) => PAIRS.slice(i * 3, i * 3 + 3).map(p => ({ text: pairName(p), callback_data: p })))] });
const oneKb = p => ({ inline_keyboard: [[{ text: `🔄 ${pairName(p)}`, callback_data: p }]] });
const bestKb = p => ({ inline_keyboard: [...(p ? [[{ text: `🔄 ${pairName(p)}`, callback_data: p }]] : []), [{ text: "🔍 Նորից գտնել", callback_data: "BEST" }]] });

async function bestSignal(env, now) {
  const { results } = await env.DB.prepare("SELECT pair, asof, info FROM scan WHERE asof >= ?").bind(now - 900).all();
  const rows = results.map(r => ({ asof: r.asof, ...JSON.parse(r.info) }));
  if (!rows.length) return { pair: null, text: "Վերջին սկանավորման տվյալներ դեռ չկան (շուկան փակ է կամ ցիկլը նոր է սկսվում)։ Փորձիր 1–2 րոպե հետո։" };
  const age = now - Math.max(...rows.map(r => r.asof));
  const names = a => a.map(r => pairName(r.pair)).join(", ") || "—";
  const up = rows.filter(r => r.full && r.dir === "UP"), dn = rows.filter(r => r.full && r.dir === "DOWN");
  const weak = rows.filter(r => r.agree && !r.full), skip = rows.filter(r => !r.agree);
  const L = [`📋 *Սկանավորում* · ${new Date(now * 1000).toISOString().slice(11, 16)} UTC _(տվյալները ${mmss(age)} առաջվա են)_`, "",
    `🟢 *UP* · 5 րոպե (երեք ժամկետն էլ համաձայն)\n${names(up)}`, "", `🔴 *DOWN* · 5 րոպե (երեք ժամկետն էլ համաձայն)\n${names(dn)}`, "",
    `🟡 *Թույլ* (M1-ը հակառակն է)\n${names(weak)}`, "", `⚪️ *Չմտնել* (M15-ը և M5-ը հակասում են)\n${names(skip)}`];
  const aligned = up.length + dn.length;
  if (aligned >= 4 && Math.max(up.length, dn.length) >= 0.6 * aligned) L.push("", "ℹ️ Շուկան միակողմանի է. սրանք մեծ մասամբ նույն շարժի կրկնություններ են (~1 անկախ սիգնալ), ուստի մեկ գործարք բավական է։");
  const full = rows.filter(r => r.full).sort((a, b) => b.score - a.score);
  const best = full[0] || [...rows].sort((a, b) => b.score - a.score)[0];
  L.push("", `*Առաջարկվող (RSI-ով ամենաչեզոք).* ${pairName(best.pair)}`, "", render(best, now));
  return { pair: best.pair, text: L.join("\n") };
}

async function historyText(env, now) {
  const loc = t => new Date((t + TZ_OFFSET) * 1000);
  const dayStr = t => loc(t).toISOString().slice(0, 10);
  const today = dayStr(now);
  const { results } = await env.DB.prepare("SELECT * FROM trades ORDER BY open_at ASC, id ASC").all();
  const auto = (await env.DB.prepare("SELECT v FROM kv WHERE k='auto'").first())?.v === "1";
  const td = results.filter(t => dayStr(t.open_at) === today);
  const stats = trs => { const w = trs.filter(t => t.result === "win").length, l = trs.filter(t => t.result === "loss").length, d = trs.filter(t => t.result === "draw").length; const n = w + l;
    return `✅ ${w} · ❌ ${l} · ➖ ${d} · Win rate ${n ? (100 * w / n).toFixed(1) + "%" : "—"} · P&L ${(w * PAYOUT - l >= 0 ? "+" : "") + (w * PAYOUT - l).toFixed(2)} (1 միավոր/գործարք, վճար ${Math.round(PAYOUT * 100)}%)`; };
  const L = [`📜 *Պատմություն · ${today}*  (վիրտուալ գործարքներ)`, `Ավտո՝ ${auto ? "🟢 միացված" : "🔴 անջատված"}`, ""];
  if (!td.length) L.push("Այսօր դեռ գործարք չկա։");
  const icon = { win: "✅", loss: "❌", draw: "➖", error: "⚠️" };
  for (const t of td.slice(-45)) L.push(`${icon[t.result] || "⏳"} ${loc(t.open_at).toISOString().slice(11, 16)} ${pairName(t.pair)} ${t.dir} ${t.entry.toFixed(5)}→${t.exit != null ? t.exit.toFixed(5) : "…"}`);
  L.push("", `*Այսօր.* ${stats(td)}`, `*Ընդհանուր (${results.length}).* ${stats(results)}`, `Break-even ~${(100 / (1 + PAYOUT)).toFixed(1)}%։ Շահույթի համար win rate-ը պետք է դրանից բարձր լինի՝ բավարար թվով գործարքների վրա։`);
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
      if (cb.data === "BEST") { const r = await bestSignal(env, now); await send(env, chat, r.text, bestKb(r.pair)); }
      else if (PAIRS.includes(cb.data)) { const info = await computeInfo(cb.data, now); await send(env, chat, render(info, now), oneKb(cb.data)); }
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
  if (text.startsWith("🔍")) { const r = await bestSignal(env, now); return void await send(env, chat, r.text, bestKb(r.pair)); }
  if (text.startsWith("/start")) await send(env, chat, "Բարև 👋 Ներքևի «▶️ Start» կոճակով ցանկացած պահի կարող ես բացել զույգերի ցանկը։", START_KB);
  await send(env, chat, "Ընտրիր զույգը 👇", pairKb());
}

// ---------- cron jobs ----------
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function scanGroup(env, g, boundary, wait) {
  if (wait) await sleep(15000);
  const now = Math.floor(Date.now() / 1000);
  const mine = PAIRS.filter((_, i) => i % GROUPS === g);
  const res = await Promise.all(mine.map(p => computeInfo(p, now).catch(() => null)));
  const stmts = res.filter(Boolean).map(i => env.DB.prepare("INSERT OR REPLACE INTO scan VALUES (?,?,?)").bind(i.pair, boundary, JSON.stringify(i)));
  if (stmts.length) await env.DB.batch(stmts);
  return res.filter(Boolean).length;
}

async function rankAndSettle(env, boundary, wait) {
  if (wait) await sleep(20000);  // give the other scan group time to finish
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
    const rows = results.map(r => JSON.parse(r.info)).filter(i => i.bar >= boundary - 180).sort((a, b) => b.score - a.score).slice(0, TOP_N);
    for (const i of rows) if (i.score >= 10) {
      await env.DB.prepare("INSERT OR IGNORE INTO trades (pair, dir, open_at, exit_at, entry, score, feat) VALUES (?,?,?,?,?,?,?)").bind(i.pair, i.dir, boundary, boundary + 300, i.price, Math.round(i.score * 100) / 100, JSON.stringify(i.feat)).run();
      out.opened.push(i.pair);
    }
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
