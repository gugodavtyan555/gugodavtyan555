// ==UserScript==
// @name         PO crowd 5s contrarian signal -> Telegram
// @match        https://*.pocketoption.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==
(function () {
  // ===== ԼՐԱՑՐԵՔ =====
  let BOT_TOKEN = '', CHAT_ID = '';
  try {
    BOT_TOKEN = localStorage.getItem('po_bot') || '';
    CHAT_ID = localStorage.getItem('po_chat') || '';
  } catch (e) {}
  document.addEventListener('DOMContentLoaded', () => setTimeout(() => {
    if (BOT_TOKEN && CHAT_ID) return;
    BOT_TOKEN = prompt('Bot token:') || '';
    CHAT_ID = prompt('Chat id:') || '';
    try { localStorage.setItem('po_bot', BOT_TOKEN); localStorage.setItem('po_chat', CHAT_ID); } catch (e) {}
  }, 1500));
  const WINDOW_MS = 5000;    // ժամանակահատված
  const MIN_TOTAL = 3;       // նվազագույն գործարք պատուհանում
  const THRESH = 0.65;       // ամբոխի մեկ կողմի մասնաբաժինը
  const WEIGHT_BY_AMOUNT = false; // true՝ ըստ գումարի, false՝ ըստ քանակի
  // ====================

  const buckets = {}; const seen = new Set();        // asset -> {buy, sell, nb, ns}
  const raw = [];
  const box = document.createElement('div');
  box.style.cssText = 'position:fixed;top:60px;left:4px;z-index:99999;background:#000c;color:#0f0;font:11px monospace;padding:4px;max-width:75vw';
  const info = document.createElement('span');
  info.textContent = 'WS:0 deals:0 ';
  const btn = document.createElement('button');
  btn.textContent = 'Copy';
  const counts = {}, samples = {};
  const SKIP = /updateStream|updateHistory|updateCharts|chat_room|Balance|updateClosedDeals|updateOpenedDeals|updateOpenedDynamic|Express|indicator|favorite|alert|ai-strategy|Pending|Express|serverName/i;
  btn.onclick = () => {
    const out = ['TICKS ' + tickText(), 'CROWD ' + stat(), 'COUNTS ' + JSON.stringify(counts)];
    for (const n in samples) if (!SKIP.test(n)) out.push('## ' + n + '\n' + samples[n].join('\n'));
    navigator.clipboard.writeText(out.join('\n').slice(0, 6000));
  };
  const box2 = document.createElement('div');
  box.append(info, btn, box2);
  document.addEventListener('DOMContentLoaded', () => document.body.appendChild(box));
  let nWs = 0, nDeals = 0, lastName = '';
  const EXPIRY_MS = 60000;
  // ---- 5s tick-strategy tester (no money, only W/L) ----
  const ticks = {}, tpend = {}, tstat = {};
  const sg = (x) => (x > 0 ? 1 : x < 0 ? -1 : 0);
  const STRATS = {
    mom3: (t) => { const n = t.length; if (n < 4) return 0; const a = sg(t[n-1].p - t[n-2].p), b = sg(t[n-2].p - t[n-3].p), c = sg(t[n-3].p - t[n-4].p); return a && a === b && b === c ? a : 0; },
    mom6: (t) => { const n = t.length; return n < 7 ? 0 : sg(t[n-1].p - t[n-7].p); },
    rev3: (t) => -STRATS.mom3(t),
    rev6: (t) => -STRATS.mom6(t),
    meanrev20: (t) => { const n = t.length; if (n < 20) return 0; const avg = t.slice(-20).reduce((x, y) => x + y.p, 0) / 20; return -sg(t[n-1].p - avg); },
  };
  for (const k in STRATS) tstat[k] = { w: 0, l: 0 };
  function onTick(asset, ts, price) {
    const arr = ticks[asset] || (ticks[asset] = []);
    arr.push({ ts, p: price });
    if (arr.length > 40) arr.shift();
    const pe = tpend[asset] || (tpend[asset] = {});
    for (const k in STRATS) {
      const q = pe[k];
      if (q) {
        if (ts >= q.ts + 5) {
          if (price !== q.p) { if ((price > q.p) === (q.dir > 0)) tstat[k].w++; else tstat[k].l++; }
          delete pe[k];
        }
      } else {
        const d = STRATS[k](arr);
        if (d) { pe[k] = { ts, p: price, dir: d }; tsignal(asset, k, d); }
      }
    }
  }
  function tsignal(asset, k, d) {
    let best = null, br = 0;
    for (const n in tstat) {
      const v = tstat[n], t = v.w + v.l;
      if (t >= 10 && v.w / t > br) { br = v.w / t; best = n; }
    }
    if (best !== k || br < 0.52) return;
    const v = tstat[k];
    send((d > 0 ? '⬆️ UP ' : '⬇️ DOWN ') + asset + ' 5s | ' + k + ' ' + Math.round(br * 100) + '% (' + v.w + '/' + v.l + ')');
  }
  function tickText() {
    return Object.entries(tstat).map(([k, v]) => k + ' ' + v.w + '/' + v.l + (v.w + v.l ? ' ' + Math.round(100 * v.w / (v.w + v.l)) + '%' : '')).join(' | ');
  }
  const lastPrice = {}, pending = [], st = { w: 0, l: 0 };

  function side(v) {
    const s = String(v).toLowerCase();
    if (['call', 'buy', 'up', 'higher', '0'].includes(s)) return 'buy';
    if (['put', 'sell', 'down', 'lower', '1'].includes(s)) return 'sell';
    return null;
  }

  function walk(o) {
    if (!o || typeof o !== 'object') return;
    if (Array.isArray(o)) return o.forEach(walk);
    const sd = o.command !== undefined ? side(o.command) : null;
    const amt = Number(o.amount);
    if (sd && amt > 0 && o.asset && o.id && !seen.has(o.id)) {
      seen.add(o.id);
      if (seen.size > 5000) seen.clear();
      const asset = o.asset ?? o.symbol ?? o.active ?? 'all';
      const b = buckets[asset] || (buckets[asset] = { buy: 0, sell: 0, n: 0 });
      b.n++;
      b[sd] += WEIGHT_BY_AMOUNT ? amt : 1;
      nDeals++;
    }
    Object.values(o).forEach(walk);
  }

  function parse(text) {
    const i = text.search(/[\[{]/);
    if (i < 0) return;
    try { walk(JSON.parse(text.slice(i))); } catch (e) { /* ոչ JSON */ }
  }

  const SEND = true;
  function send(msg) {
    if (!SEND || !BOT_TOKEN || !CHAT_ID) return;
    const u = 'https://api.telegram.org/bot' + BOT_TOKEN + '/sendMessage?chat_id=' +
      encodeURIComponent(CHAT_ID) + '&text=' + encodeURIComponent(msg);
    fetch(u, { mode: 'no-cors' }).catch(() => {});
  }

  function stat() { return st.w + '/' + st.l + ' (W/L)'; }
  setInterval(() => {
    const now = Date.now();
    for (let i = pending.length - 1; i >= 0; i--) {
      const p = pending[i];
      if (now - p.t < EXPIRY_MS) continue;
      const cur = lastPrice[p.asset];
      if (cur !== undefined && cur !== p.price) {
        const up = cur > p.price;
        if ((p.dir === 'buy') === up) st.w++; else st.l++;
      }
      pending.splice(i, 1);
    }
    for (const [asset, b] of Object.entries(buckets)) {
      const t = b.buy + b.sell;
      if (b.n >= MIN_TOTAL && t > 0) {
        const sb = b.buy / t, ss = b.sell / t;
        const px = lastPrice[asset];
        if (sb >= THRESH) {
          send('🔴 SELL ' + asset + ' | crowd BUY ' + Math.round(sb * 100) + '% (BUY ' + b.buy + ' / SELL ' + b.sell + ') | stat ' + stat());
          if (px !== undefined) pending.push({ asset, dir: 'sell', price: px, t: now });
        } else if (ss >= THRESH) {
          send('🟢 BUY ' + asset + ' | crowd SELL ' + Math.round(ss * 100) + '% (BUY ' + b.buy + ' / SELL ' + b.sell + ') | stat ' + stat());
          if (px !== undefined) pending.push({ asset, dir: 'buy', price: px, t: now });
        }
      }
      delete buckets[asset];
    }
    info.firstChild.textContent = 'WS:' + nWs + ' deals:' + nDeals + ' crowd ' + stat() + ' ';
    box2.textContent = tickText();
  }, WINDOW_MS);

  const Orig = window.WebSocket;
  window.WebSocket = function (...a) {
    const ws = new Orig(...a);
    ws.addEventListener('message', async (e) => {
      let d = e.data;
      if (d instanceof Blob) d = await d.text();
      else if (d instanceof ArrayBuffer) d = new TextDecoder().decode(d);
      d = String(d);
      nWs++;
      const m = d.match(/^\d*-?\[\s*"([^"]+)"/);
      if (m) { lastName = m[1]; counts[lastName] = (counts[lastName] || 0) + 1; }
      else if (lastName) { const a = samples[lastName] || (samples[lastName] = []); a.push(d.slice(0, 500)); if (a.length > 3) a.shift(); }
      if (lastName === 'updateStream' && d[0] === '[') {
        try { const a = JSON.parse(d); for (const r of a) if (r && r[0]) { lastPrice[r[0]] = r[2]; onTick(r[0], r[1], r[2]); } } catch (e) {}
      }
      if (/OpenedSocialDeals/.test(lastName)) parse(d);
    });
    return ws;
  };
  window.WebSocket.prototype = Orig.prototype;
})();
