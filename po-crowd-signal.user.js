// ==UserScript==
// @name         PO crowd 5s contrarian signal -> Telegram
// @match        https://*.pocketoption.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==
(function () {
  // ===== ԼՐԱՑՐԵՔ =====
  const BOT_TOKEN = '';      // @BotFather-ից
  const CHAT_ID = '';        // Ձեր chat id
  const WINDOW_MS = 5000;    // ժամանակահատված
  const MIN_TOTAL = 5;       // նվազագույն գործարք պատուհանում
  const THRESH = 0.65;       // ամբոխի մեկ կողմի մասնաբաժինը
  const WEIGHT_BY_AMOUNT = true; // true՝ ըստ գումարի, false՝ ըստ քանակի
  // ====================

  const buckets = {};        // asset -> {buy, sell, nb, ns}
  const raw = [];
  const box = document.createElement('div');
  box.style.cssText = 'position:fixed;top:60px;left:4px;z-index:99999;background:#000c;color:#0f0;font:11px monospace;padding:4px;max-width:75vw';
  const info = document.createElement('span');
  info.textContent = 'WS:0 deals:0 ';
  const btn = document.createElement('button');
  btn.textContent = 'Copy';
  btn.onclick = () => navigator.clipboard.writeText(raw.slice(-30).join('\n'));
  box.append(info, btn);
  document.addEventListener('DOMContentLoaded', () => document.body.appendChild(box));
  let nWs = 0, nDeals = 0;

  function side(v) {
    const s = String(v).toLowerCase();
    if (['call', 'buy', 'up', 'higher', '0'].includes(s)) return 'buy';
    if (['put', 'sell', 'down', 'lower', '1'].includes(s)) return 'sell';
    return null;
  }

  function walk(o) {
    if (!o || typeof o !== 'object') return;
    if (Array.isArray(o)) return o.forEach(walk);
    const dir = o.action ?? o.cmd ?? o.command ?? o.direction ?? o.type;
    const sd = dir !== undefined ? side(dir) : null;
    const amt = Number(o.amount ?? o.sum ?? o.value);
    if (sd && amt > 0) {
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

  function send(msg) {
    if (!BOT_TOKEN || !CHAT_ID) return;
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
      raw.push(d.slice(0, 400));
      parse(d);
    });
    return ws;
  };
  window.WebSocket.prototype = Orig.prototype;
})();
