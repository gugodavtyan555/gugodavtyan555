// ==UserScript==
// @name         PO classic 1m signal -> Telegram
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

  const deals = [];
  const buckets = {}; const seen = new Set();        // asset -> {buy, sell, nb, ns}
  const raw = [];
  const box = document.createElement('div');
  box.style.cssText = 'position:fixed;bottom:90px;left:4px;z-index:99999;background:#000c;color:#0f0;font:11px monospace;padding:4px;max-width:75vw';
  const info = document.createElement('span');
  info.textContent = 'WS:0 deals:0 ';
  const btn = document.createElement('button');
  btn.textContent = 'Copy';
  const counts = {}, samples = {};
  const SKIP = /updateStream|updateHistory|updateCharts|chat_room|Balance|updateClosedDeals|updateOpenedDeals|updateOpenedDynamic|Express|indicator|favorite|alert|ai-strategy|Pending|Express|serverName/i;
  btn.onclick = () => {
    navigator.clipboard.writeText(report());
  };
  const box2 = document.createElement('div');
  info.onclick = () => {
    const b = prompt('Bot token (123456:ABC...):', BOT_TOKEN), c = prompt('Chat id:', CHAT_ID);
    if (b !== null && c !== null) {
      BOT_TOKEN = b.trim().replace(/^bot/i, ''); CHAT_ID = c.trim();
      try { localStorage.setItem('po_bot', BOT_TOKEN); localStorage.setItem('po_chat', CHAT_ID); } catch (e) {}
      send('✅ test');
    }
  };
  const grip = document.createElement('span');
  grip.textContent = ' ✥ ';
  grip.style.cssText = 'padding:4px 8px;background:#333;margin-left:4px;font-size:14px';
  grip.addEventListener('touchmove', (e) => {
    const t = e.touches[0];
    box.style.bottom = 'auto';
    box.style.left = Math.max(0, t.clientX - 20) + 'px';
    box.style.top = Math.max(0, t.clientY - 10) + 'px';
    e.preventDefault();
  }, { passive: false });
  box.append(info, btn, grip, box2);
  document.addEventListener('DOMContentLoaded', () => document.body.appendChild(box));
  let nWs = 0, nDeals = 0, lastName = '';
  const EXPIRY_MS = 60000;
  // ---- 5s tick analysis: many variants, every tick, persisted ----
  const HZ = 60, OVL = HZ * 2; // 1 րոպե, ~2 տիկ/վրկ
  const ticks = {}, tq = {}, tstat = {}, cstat = {};
  const sg = (x) => (x > 0 ? 1 : x < 0 ? -1 : 0);
  const VARS = {};
  for (const L of [1, 2, 3, 4, 6, 10, 20]) {
    VARS['mom' + L] = (t) => { const n = t.length; return n > L ? sg(t[n-1].p - t[n-1-L].p) : 0; };
    VARS['rev' + L] = (t) => -VARS['mom' + L](t);
  }
  for (const W of [10, 20, 40, 80]) {
    const dev = (t) => { const n = t.length; if (n < W) return 0; let sum = 0; for (let i = n - W; i < n; i++) sum += t[i].p; return sg(t[n-1].p - sum / W); };
    VARS['meanrev' + W] = (t) => -dev(t);
    VARS['trend' + W] = (t) => dev(t);
  }
  try { Object.assign(tstat, JSON.parse(localStorage.getItem('po_an_classic') || '{}').t || {}); Object.assign(cstat, JSON.parse(localStorage.getItem('po_an_classic') || '{}').c || {}); } catch (e) {}
  for (const k in VARS) if (!tstat[k]) tstat[k] = { w: 0, l: 0 };
  function onTick(asset, ts, price) {
    const arr = ticks[asset] || (ticks[asset] = []);
    arr.push({ ts, p: price });
    if (arr.length > 100) arr.shift();
    const q = tq[asset] || (tq[asset] = []);
    while (q.length && ts >= q[0].ts + HZ) {
      const e = q.shift();
      if (price !== e.p) { if ((price > e.p) === (e.dir > 0)) tstat[e.k].w++; else tstat[e.k].l++; }
    }
    for (const k in VARS) {
      const d = VARS[k](arr);
      if (d) { q.push({ k, ts, p: price, dir: d }); if (TSEND) tsignal(asset, k, d); }
    }
  }
  const TSEND = true;
  const CSEND = false;
  const MIN_RATE = 0.52, MIN_TRIALS = 600, GAP_MS = 60000;
  let lastSent = 0, selAsset = '';
  function tsignal(asset, k, d) {
    if (selAsset && asset !== selAsset) return; // միայն ընտրված զույգի համար
    let best = null, bz = 0;
    for (const n in tstat) {
      const v = tstat[n], t = v.w + v.l;
      if (t < MIN_TRIALS) continue;
      const z = (v.w - t / 2) / Math.sqrt(t / 4) / Math.sqrt(OVL);
      if (z > bz) { bz = z; best = n; }
    }
    const v = tstat[k], t = v.w + v.l;
    if (best !== k || v.w / t < MIN_RATE) return;
    const now = Date.now();
    if (now - lastSent < GAP_MS) return;
    lastSent = now;
    send((d > 0 ? '🟢 ' : '🔴 ') + asset + ' ' + Math.round(100 * v.w / t) + '%');
  }
  function rows() {
    return Object.entries(tstat).map(([k, v]) => { const n = v.w + v.l; return { k, n, w: v.w, r: n ? v.w / n : 0, z: n ? (v.w - n / 2) / Math.sqrt(n / 4) / Math.sqrt(OVL) : 0 }; })
      .sort((a, b) => Math.abs(b.z) - Math.abs(a.z));
  }
  function tickText() {
    return rows().slice(0, 3).map((x) => x.k + ' ' + (x.r * 100).toFixed(1) + '% n' + x.n).join(' | ');
  }
  function report() {
    return 'VARIANTS (sorted by |z|, 60s horizon, z corrected for overlap):\n' +
      rows().map((x) => x.k + ' ' + x.w + '/' + (x.n - x.w) + ' ' + (x.r * 100).toFixed(1) + '% z' + x.z.toFixed(1)).join('\n') +
      '\nCROWD (up/down after 5s & 60s) ' + JSON.stringify(cstat) + '\nCROWDWL ' + stat() + ' deals=' + nDeals + '\nCOUNTS ' + JSON.stringify(counts);
  }
  const lastPrice = {}, pending = [], cpend = [], st = { w: 0, l: 0 };

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
      deals.push({ asset, sd, t: Date.now() });
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
    for (let i = cpend.length - 1; i >= 0; i--) {
      const c = cpend[i];
      if (now - c.t < c.h) continue;
      const cur = lastPrice[c.asset];
      if (cur !== undefined && cur !== c.p) {
        const key = c.bin + '_' + c.h / 1000, o = cstat[key] || (cstat[key] = { up: 0, dn: 0 });
        if (cur > c.p) o.up++; else o.dn++;
      }
      cpend.splice(i, 1);
    }
    for (const [asset, b] of Object.entries(buckets)) {
      const t = b.buy + b.sell;
      if (b.n >= MIN_TOTAL && t > 0) {
        const sb = b.buy / t, ss = b.sell / t;
        const px = lastPrice[asset];
        if (px !== undefined) {
          const bin = sb >= 0.65 ? 'crowdBUY' : ss >= 0.65 ? 'crowdSELL' : 'mixed';
          cpend.push({ asset, bin, p: px, t: now, h: 5000 }, { asset, bin, p: px, t: now, h: 60000 });
        }
      }
      delete buckets[asset];
    }
    info.firstChild.textContent = 'WS:' + nWs + ' deals:' + nDeals + ' crowd ' + stat() + ' ';
    box2.textContent = tickText();
    try { localStorage.setItem('po_an_classic', JSON.stringify({ t: tstat, c: cstat })); } catch (e) {}
  }, WINDOW_MS);

  // ---- ամեն րոպե՝ ամենաուժեղ ամբոխի դեմ սիգնալ ----
  setInterval(() => {
    const now = Date.now();
    while (deals.length && now - deals[0].t > 60000) deals.shift();
    const g = {};
    for (const d of deals) { const o = g[d.asset] || (g[d.asset] = { buy: 0, sell: 0 }); o[d.sd]++; }
    let best = null, bs = 0;
    for (const [asset, o] of Object.entries(g)) {
      const n = o.buy + o.sell;
      if (n < 5) continue;
      const share = Math.max(o.buy, o.sell) / n;
      if (share < 0.65) continue;
      const score = Math.abs(o.buy - o.sell) / Math.sqrt(n);
      if (score > bs) { bs = score; best = { asset, o, n, share, crowd: o.buy > o.sell ? 'buy' : 'sell' }; }
    }
    if (!best) return;
    const mine = best.crowd === 'buy' ? 'sell' : 'buy';
    if (CSEND) send((mine === 'buy' ? '🟢 BUY ' : '🔴 SELL ') + best.asset + ' | crowd ' + best.crowd.toUpperCase() + ' ' + Math.round(best.share * 100) + '% (' + best.n + ')');
    const px = lastPrice[best.asset];
    if (px !== undefined) pending.push({ asset: best.asset, dir: mine, price: px, t: now });
  }, 60000);

  const Orig = window.WebSocket;
  window.WebSocket = function (...a) {
    const ws = new Orig(...a);
    const origSend = ws.send.bind(ws);
    ws.send = function (m) {
      try { if (typeof m === 'string' && m.includes('changeSymbol')) { const o = JSON.parse(m.slice(m.indexOf('{'))); if (o.asset) selAsset = o.asset; } } catch (e) {}
      return origSend(m);
    };
    let last = '';
    let chain = Promise.resolve();
    ws.addEventListener('message', (e) => {
      chain = chain.then(async () => {
        let d = e.data;
        if (d instanceof Blob) d = await d.text();
        else if (d instanceof ArrayBuffer) d = new TextDecoder().decode(d);
        d = String(d);
        nWs++;
        const m = d.match(/^\d*-?\[\s*"([^"]+)"/);
        if (m) { last = m[1]; counts[last] = (counts[last] || 0) + 1; }
        else if (last) { const a = samples[last] || (samples[last] = []); a.push(d.slice(0, 500)); if (a.length > 3) a.shift(); }
        if (last === 'updateStream' && d[0] === '[') {
          try { const a = JSON.parse(d); for (const r of a) if (r && r[0]) { lastPrice[r[0]] = r[2]; onTick(r[0], r[1], r[2]); } } catch (e) {}
        }
        if (last === 'updateHistoryNewFast' && d[0] === '{') { try { const h = JSON.parse(d); if (h.asset) selAsset = h.asset; } catch (e) {} }
        if (/OpenedSocialDeals/.test(last)) parse(d);
      }).catch(() => {});
    });
    return ws;
  };
  window.WebSocket.prototype = Orig.prototype;
})();
