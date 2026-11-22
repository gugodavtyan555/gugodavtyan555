// ==UserScript==
// @name         PO impulse 10s
// @match        https://*.pocketoption.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==
(function () {
  // ===== կարգավորումներ =====
  const LOOK = 2;          // վրկ. նայում ենք վերջին շարժմանը
  const WITH_IMPULSE = true; // true՝ իմպուլսի ՀԵՏ (շարունակություն), false՝ հակառակ (fade)
  const RATIO_MIN = 2.5;   // շարժումը պետք է լինի ≥ այդքան անգամ ավելի մեծ, քան վերջին 5 րոպեի 75%-ը
  const HOLD = 10;         // գործարքի ժամկետ (վրկ)
  const GAP = 5;           // վրկ. նվազագույն ընդմիջում սիգնալների միջև
  const BREAK_EVEN = 53.5; // % (87% եկամտաբերության դեպքում)
  const ONLY_REAL = false; // false՝ աշխատում է նաև OTC-ում (արդյունքը չափվում է առանձին)
  const DELAYS = [0, 1, 2, 3]; // ուշացումներ, որոնց համար չափվում է արդյունքը
  // ==========================

  const isReal = (a) => !/_otc$/i.test(a || '');
  const ticks = {};        // asset -> [{t,p}]
  const moves = {};        // asset -> [|move|, ...] (վերջին ~300)
  const pend = [];
  let sel = '', lastSig = {}, nSig = 0;
  let stat = {};
  DELAYS.forEach((d) => (stat[d] = [0, 0]));
  let mkt = 'otc';
  const KEY = () => 'po_fade10_' + (WITH_IMPULSE ? 'w' : 'f') + '_' + mkt;
  const loadStat = () => { stat = {}; DELAYS.forEach((d) => (stat[d] = [0, 0])); nSig = 0; try { const o = JSON.parse(localStorage.getItem(KEY()) || 'null'); if (o) { stat = o.stat || stat; nSig = o.nSig || 0; } } catch (e) {} };
  const setMkt = (a) => { const m = isReal(a) ? 'real' : 'otc'; if (m !== mkt) { try { localStorage.setItem(KEY(), JSON.stringify({ stat, nSig })); } catch (e) {} mkt = m; pend.length = 0; loadStat(); } };
  loadStat();

  // ---- վահանակ ----
  const box = document.createElement('div');
  box.style.cssText = 'position:fixed;bottom:90px;left:4px;z-index:99999;background:#000c;color:#0f0;font:11px monospace;padding:4px;max-width:80vw;white-space:pre-wrap';
  const body = document.createElement('div');
  const grip = document.createElement('span');
  grip.textContent = ' ✥ ';
  grip.style.cssText = 'padding:4px 8px;background:#333;font-size:14px';
  grip.addEventListener('touchmove', (e) => { const t = e.touches[0]; box.style.bottom = 'auto'; box.style.left = Math.max(0, t.clientX - 20) + 'px'; box.style.top = Math.max(0, t.clientY - 10) + 'px'; e.preventDefault(); }, { passive: false });
  const reset = document.createElement('span');
  reset.textContent = ' ⟲ ';
  reset.style.cssText = 'padding:4px 8px;background:#533;font-size:14px;margin-left:4px';
  reset.onclick = () => { if (confirm('Մաքրե՞լ հաշվիչները')) { DELAYS.forEach((d) => (stat[d] = [0, 0])); nSig = 0; } };
  box.append(grip, reset, body);
  document.addEventListener('DOMContentLoaded', () => document.body.appendChild(box));
  const pct = (a) => (a[0] + a[1] ? (100 * a[0] / (a[0] + a[1])).toFixed(1) + '%' : '—');
  let nTicks = 0;
  setInterval(() => {
    const real = !ONLY_REAL || isReal(sel);
    body.textContent = (WITH_IMPULSE ? 'իմպուլսի հետ ≥' : 'fade ≥') + RATIO_MIN + ' | ' + (sel || '…') + (isReal(sel) ? ' (REAL)' : ' (OTC)') + ' | տիկեր ' + nTicks + ' | սիգնալներ ' + nSig +
      '\nարդյունք ըստ ձեր ուշացման (պետք է ≥' + BREAK_EVEN + '%)՝' +
      DELAYS.map((d) => '\n ' + d + ' վրկ ուշ՝ ' + stat[d][0] + '/' + stat[d][1] + ' ' + pct(stat[d])).join('') +
      '';
    try { localStorage.setItem(KEY(), JSON.stringify({ stat, nSig })); } catch (e) {}
  }, 2000);

  // ---- ցուցանակ ----
  let ov = null, ovTimer = null;
  function showOverlay(dir, asset, ratio) {
    if (!ov) {
      ov = document.createElement('div');
      ov.style.cssText = 'position:fixed;left:22%;right:22%;top:13%;z-index:100000;padding:6px 8px;border-radius:12px;text-align:center;font:700 20px/1.15 -apple-system,sans-serif;color:#fff;opacity:.95;box-shadow:0 0 24px #000a;pointer-events:none';
      document.body.appendChild(ov);
    }
    ov.style.background = dir > 0 ? '#12a34a' : '#d9372a';
    ov.innerHTML = (dir > 0 ? '🟢 ԳՆԵԼ ↑' : '🔴 ՎԱՃԱՌ. ↓') + '<div style="font-size:12px;margin-top:2px;font-weight:600">' + asset + ' · ՀԻՄԱ · ' + HOLD + 'վրկ</div>';
    ov.style.display = 'block';
    clearTimeout(ovTimer);
    ovTimer = setTimeout(() => { ov.style.display = 'none'; }, 3500);
  }

  function priceAt(arr, tt) { // վերջին տիկը, որի ժամանակը ≤ tt
    for (let i = arr.length - 1; i >= 0; i--) if (arr[i].t <= tt) return arr[i].p;
    return null;
  }

  function onTick(asset, t, p) {
    const arr = ticks[asset] || (ticks[asset] = []);
    arr.push({ t, p });
    if (arr.length > 900) arr.splice(0, 300);
    nTicks++;
    // ---- արդյունքների հետևում ----
    for (let i = pend.length - 1; i >= 0; i--) {
      const q = pend[i];
      if (q.asset !== asset) continue;
      let open = 0;
      for (const d of DELAYS) {
        if (q.done[d]) continue;
        if (q.entry[d] === undefined) { if (t >= q.t + d) q.entry[d] = p; open++; continue; }
        if (t >= q.t + d + HOLD) {
          const mv = (p - q.entry[d]) * q.dir;
          if (mv > 0) stat[d][0]++; else if (mv < 0) stat[d][1]++;
          q.done[d] = true;
        } else open++;
      }
      if (!open) pend.splice(i, 1);
    }
    if ((ONLY_REAL && !isReal(asset)) || (sel && asset !== sel)) return;
    const p0 = priceAt(arr, t - LOOK);
    if (p0 === null || arr[0].t > t - LOOK) return;
    const past = p - p0;
    if (past === 0) return;
    const m = moves[asset] || (moves[asset] = []);
    m.push(Math.abs(past)); if (m.length > 300) m.shift();
    if (m.length < 60) return;
    const q75 = m.slice().sort((a, b) => a - b)[Math.floor(m.length * 0.75)];
    if (!q75) return;
    const ratio = Math.abs(past) / q75;
    if (ratio < RATIO_MIN) return;
    if (t - (lastSig[asset] || 0) < GAP) return;
    lastSig[asset] = t;
    const dir = WITH_IMPULSE ? (past > 0 ? 1 : -1) : (past > 0 ? -1 : 1);
    nSig++;
    showOverlay(dir, asset, ratio);
    pend.push({ asset, dir, t, entry: { 0: p }, done: {} }); // 0 վրկ՝ ակնթարթային մուտք՝ ընթացիկ գնով
  }

  // ---- WebSocket ----
  const Orig = window.WebSocket;
  window.WebSocket = function (...a) {
    const ws = new Orig(...a);
    const origSend = ws.send.bind(ws);
    ws.send = function (m) {
      try { if (typeof m === 'string' && m.includes('changeSymbol')) { const o = JSON.parse(m.slice(m.indexOf('{'))); if (o.asset) { sel = o.asset; setMkt(sel); } } } catch (e) {}
      return origSend(m);
    };
    let last = '', chain = Promise.resolve();
    ws.addEventListener('message', (e) => {
      chain = chain.then(async () => {
        let d = e.data;
        if (d instanceof Blob) d = await d.text(); else if (d instanceof ArrayBuffer) d = new TextDecoder().decode(d);
        d = String(d);
        const m = d.match(/^\d*-?\[\s*"([^"]+)"/);
        if (m) { last = m[1]; return; }
        if (last === 'updateStream' && d[0] === '[') {
          try { const a = JSON.parse(d); for (const r of a) if (r && r[0]) onTick(r[0], r[1], r[2]); } catch (e) {}
        } else if (last === 'updateHistoryNewFast' && d[0] === '{') {
          try { const h = JSON.parse(d); if (h.asset) { sel = h.asset; setMkt(sel); } } catch (e) {}
        }
      }).catch(() => {});
    });
    return ws;
  };
  window.WebSocket.prototype = Orig.prototype;
})();
