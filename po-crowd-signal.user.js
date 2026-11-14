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
  const WEIGHT_BY_AMOUNT = true; // true՝ ըստ գումարի, false՝ ըստ քանակի
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
    const out = ['COUNTS ' + JSON.stringify(counts)];
    for (const n in samples) if (!SKIP.test(n)) out.push('## ' + n + '\n' + samples[n].join('\n'));
    navigator.clipboard.writeText(out.join('\n').slice(0, 6000));
  };
  box.append(info, btn);
  document.addEventListener('DOMContentLoaded', () => document.body.appendChild(box));
  let nWs = 0, nDeals = 0, lastName = '';

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

  setInterval(() => {
    for (const [asset, b] of Object.entries(buckets)) {
      const t = b.buy + b.sell;
      if (b.n >= MIN_TOTAL && t > 0) {
        const sb = b.buy / t, ss = b.sell / t;
        if (sb >= THRESH) send('🔴 SELL ' + asset + ' (ամբոխ BUY ' + Math.round(sb * 100) + '%, ' + t.toFixed(0) + ')');
        else if (ss >= THRESH) send('🟢 BUY ' + asset + ' (ամբոխ SELL ' + Math.round(ss * 100) + '%, ' + t.toFixed(0) + ')');
      }
      delete buckets[asset];
    }
    info.firstChild.textContent = 'WS:' + nWs + ' deals:' + nDeals + ' ';
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
      if (/OpenedSocialDeals/.test(lastName)) parse(d);
    });
    return ws;
  };
  window.WebSocket.prototype = Orig.prototype;
})();
