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
  const BB_N = 10;         // վրկ. Bollinger-ի պատուհան
  const BB_K = 2.0;        // σ շեմ
  const RATIO_MIN = 2.5;   // շարժումը պետք է լինի ≥ այդքան անգամ ավելի մեծ, քան վերջին 5 րոպեի 75%-ը
  const HOLD = 10;         // գործարքի ժամկետ (վրկ)
  const GAP = 10;          // վրկ. նվազագույն ընդմիջում սիգնալների միջև
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
  const KEY = () => 'po_fade10_' + 'bb' + (WITH_IMPULSE ? 'w' : 'f') + '_' + mkt;
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
  const snd = document.createElement('span');
  snd.textContent = ' 🔊 ';
  snd.style.cssText = 'padding:4px 8px;background:#235;font-size:14px;margin-left:4px';
  snd.onclick = () => { soundOn = !soundOn; unlock(); if (soundOn) beep(1); };
  box.append(grip, reset, snd, body);
  document.addEventListener('DOMContentLoaded', () => document.body.appendChild(box));
  const pct = (a) => (a[0] + a[1] ? (100 * a[0] / (a[0] + a[1])).toFixed(1) + '%' : '—');
  let nTicks = 0;
  setInterval(() => {
    const real = !ONLY_REAL || isReal(sel);
    snd.textContent = !soundOn ? ' 🔇 ' : (actx && actx.state === 'running' ? ' 🔊 ' : ' 🔊? ');
    body.textContent = 'BB(' + BB_N + 'վրկ,' + BB_K + 'σ) ' + (WITH_IMPULSE ? 'հետ' : 'հակառակ') + ' | ' + (sel || '…') + (isReal(sel) ? ' (REAL)' : ' (OTC)') + ' | տիկեր ' + nTicks + ' | սիգնալներ ' + nSig +
      '\nարդյունք ըստ ձեր ուշացման (շահույթի շեմ ≥' + (isReal(sel) ? 53.5 : 52.1) + '%)՝' +
      DELAYS.map((d) => '\n ' + d + ' վրկ ուշ՝ ' + stat[d][0] + '/' + stat[d][1] + ' ' + pct(stat[d])).join('') +
      '';
    try { localStorage.setItem(KEY(), JSON.stringify({ stat, nSig })); } catch (e) {}
  }, 2000);

  // ---- ձայն ----
  let actx = null, soundOn = true;
  function unlock() {
    try {
      if (!actx) { const AC = window.AudioContext || window.webkitAudioContext; if (AC) actx = new AC(); }
      if (actx && actx.state === 'suspended') actx.resume();
    } catch (e) {}
  }
  ['touchstart', 'click'].forEach((ev) => document.addEventListener(ev, unlock, { passive: true }));
  function beep(dir) {
    if (!soundOn) return;
    try {
      unlock();
      if (!actx) return;
      const t0 = actx.currentTime, freqs = dir > 0 ? [660, 990] : [500, 330]; // վերև՝ բարձրացող երկու ձայն, ներքև՝ իջնող
      freqs.forEach((f, i) => {
        const o = actx.createOscillator(), g = actx.createGain(), st = t0 + i * 0.17;
        o.type = 'sine'; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, st);
        g.gain.exponentialRampToValueAtTime(0.6, st + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, st + 0.15);
        o.connect(g); g.connect(actx.destination); o.start(st); o.stop(st + 0.16);
      });
    } catch (e) {}
  }
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
    beep(dir);
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
    // Bollinger-ի դուրս գալ՝ գինը դուրս է վերջին BB_N վայրկյանի միջինից ±BB_K σ
    if (arr[0].t > t - BB_N) return;
    const wnd = [];
    for (let j = 1; j <= BB_N; j++) { const v = priceAt(arr, t - j); if (v === null) return; wnd.push(v); }
    const mean = wnd.reduce((x, y) => x + y, 0) / BB_N;
    const sd = Math.sqrt(wnd.reduce((x, y) => x + (y - mean) * (y - mean), 0) / BB_N);
    if (!sd) return;
    const zv = (p - mean) / sd;
    if (Math.abs(zv) < BB_K) return;
    if (t - (lastSig[asset] || 0) < GAP) return;
    lastSig[asset] = t;
    const ratio = Math.abs(zv);
    const dir = WITH_IMPULSE ? (zv > 0 ? 1 : -1) : (zv > 0 ? -1 : 1);
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
