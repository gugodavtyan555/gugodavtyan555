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
  // ---- ավտոմատ սեղմում (պաշտպանիչ կանոններով) ----
  const AUTO = true;        // true՝ սիգնալի պահին ինքնաբերաբար սեղմել Купить/Продать
  const ALLOW_REAL = false; // false՝ ՄԻԱՅՆ Demo հաշվի վրա (իրական հաշվի վրա չի սեղմի)
  const MIN_PAYOUT = 80;    // % նվազագույն եկամտաբերություն, որի դեպքում սեղմում է
  const MAX_AUTO = 300;     // նվազագույն սահման՝ մեկ էջի բեռնման ընթացքում առավելագույն գործարքներ
  // ---- 8 քայլանոց սանդուղք (parlay)՝ շահածը գնում է հաջորդ գործարքին (միայն Demo) ----
  const PARLAY = true;
  const STEPS = 8;
  const STAKE0 = 1;         // $ սկզբնական գումար
  const DELAYS = [0, 1, 2, 3]; // ուշացումներ, որոնց համար չափվում է արդյունքը
  // ==========================

  const isReal = (a) => !/_otc$/i.test(a || '');
  const ticks = {};        // asset -> [{t,p}]
  const moves = {};        // asset -> [|move|, ...] (վերջին ~300)
  const pend = [];
  let sel = '', lastSig = {}, nSig = 0, lastTickT = 0, lastTickP = 0;
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
  snd.onclick = () => { soundOn = !soundOn; unlock(); if (soundOn) setTimeout(() => beep(1), 150); };
  box.append(grip, reset, snd, body);
  document.addEventListener('DOMContentLoaded', () => document.body.appendChild(box));
  const pct = (a) => (a[0] + a[1] ? (100 * a[0] / (a[0] + a[1])).toFixed(1) + '%' : '—');
  let nTicks = 0;
  setInterval(() => {
    const real = !ONLY_REAL || isReal(sel);
    snd.textContent = !soundOn ? ' 🔇 ' : (unlocked ? ' 🔊 ' : ' 🔊? սեղմեք ');
    body.textContent = (AUTO ? '🤖 ավտո: ' + (autoMsg || '—') + '\n' : '') + (PARLAY ? '🪜 ' + par.streak + '/' + STEPS + ' · գումար $' + par.stake + ' · փորձ #' + par.attempts + ' · լավագույն ' + par.best + ' · անցած ' + par.done + ' (շահ ' + par.wins + ' / կոր. ' + par.losses + ')' + (parMsg ? '\n' + parMsg : '') + '\n' : '') + 'BB(' + BB_N + 'վրկ,' + BB_K + 'σ) ' + (WITH_IMPULSE ? 'հետ' : 'հակառակ') + ' | ' + (sel || '…') + (isReal(sel) ? ' (REAL)' : ' (OTC)') + ' | տիկեր ' + nTicks + ' | սիգնալներ ' + nSig +
      '\nարդյունք ըստ ձեր ուշացման (շահույթի շեմ ≥' + (isReal(sel) ? 53.5 : 52.1) + '%)՝' +
      DELAYS.map((d) => '\n ' + d + ' վրկ ուշ՝ ' + stat[d][0] + '/' + stat[d][1] + ' ' + pct(stat[d])).join('') +
      '';
    try { localStorage.setItem(KEY(), JSON.stringify({ stat, nSig })); } catch (e) {}
  }, 2000);

  // ---- parlay վիճակ ----
  let par = { stake: STAKE0, streak: 0, attempts: 1, best: 0, done: 0, wins: 0, losses: 0 };
  try { const o = JSON.parse(localStorage.getItem('po_parlay') || 'null'); if (o) par = Object.assign(par, o); } catch (e) {}
  let parPend = null, parMsg = '';
  function savePar() { try { localStorage.setItem('po_parlay', JSON.stringify(par)); } catch (e) {} }
  function desc(e) {
    try { return (e.tagName || '?') + '[type=' + (e.type || '') + ',ro=' + (e.readOnly ? 1 : 0) + ',ce=' + (e.isContentEditable ? 1 : 0) + ',v=' + (e.value !== undefined ? e.value : (e.textContent || '').slice(0, 12)) + ']'; } catch (x) { return '?'; }
  }
  function findStakeEl() {
    const cands = [];
    try {
      document.querySelectorAll('input,[contenteditable="true"]').forEach((e) => {
        const val = String(e.value !== undefined ? e.value : e.textContent || '').trim();
        if (!/^\d+([.,]\d+)?$/.test(val)) return; // ժամանակի դաշտը (00:00:10) չի համապատասխանում
        let node = e, ok = false;
        for (let k = 0; k < 4 && node; k++) {
          node = node.parentElement;
          const tx = node ? (node.textContent || '') : '';
          if (/(Сумма|Amount|Sum)/i.test(tx) && !/(Время|Time)/i.test(tx)) { ok = true; break; }
        }
        cands.push({ e, ok });
      });
    } catch (x) {}
    const good = cands.find((c) => c.ok);
    return good ? good.e : (cands[0] ? cands[0].e : null);
  }
  let stakeEl = null;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  function dumpCands() {
    try {
      return [...document.querySelectorAll('input,[contenteditable="true"]')].slice(0, 6).map((e) => {
        let r = null; try { r = e.getBoundingClientRect(); } catch (x) {}
        return desc(e) + (r ? '{' + Math.round(r.width) + 'x' + Math.round(r.height) + '}' : '') + '.' + String(e.className || '').slice(0, 18);
      }).join(' | ');
    } catch (x) { return '?'; }
  }
  async function setStakeAsync(v) { // վերադարձնում է { ok, how, info }
    const str = String(v);
    if (!stakeEl || !document.contains(stakeEl)) stakeEl = findStakeEl();
    const el = stakeEl;
    if (!el) return { ok: false, how: 'no-el', info: 'դաշտ չկա · ' + dumpCands() };
    const read = () => String(el.value !== undefined ? el.value : el.textContent || '').trim().replace(',', '.');
    if (read() === str) return { ok: true, how: '=', info: desc(el) }; // արդեն նույնն է
    if (el.readOnly) return { ok: false, how: 'ro', info: 'readonly · ' + desc(el) + ' · ' + dumpCands() };
    const ev = (n) => { try { el.dispatchEvent(new Event(n, { bubbles: true })); } catch (x) {} };
    const nativeSet = (val) => { if (el.tagName === 'INPUT') { const st = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; st.call(el, val); } else { el.textContent = val; } };
    const tries = [
      () => { nativeSet(str); ev('input'); ev('change'); ev('blur'); },
      () => { el.focus(); if (el.select) el.select(); document.execCommand('selectAll', false, null); document.execCommand('insertText', false, str); ev('input'); ev('change'); },
      () => {
        el.focus(); if (el.select) el.select(); nativeSet('');
        ev('input');
        let cur = '';
        for (const ch of str) {
          ['keydown', 'keypress'].forEach((n) => { try { el.dispatchEvent(new KeyboardEvent(n, { key: ch, bubbles: true })); } catch (x) {} });
          cur += ch; nativeSet(cur); ev('input');
          try { el.dispatchEvent(new KeyboardEvent('keyup', { key: ch, bubbles: true })); } catch (x) {}
        }
        ev('change'); ev('blur');
      }
    ];
    for (let i = 0; i < tries.length; i++) {
      try { tries[i](); } catch (x) {}
      await sleep(140); // սպասում ենք, որ հավելվածը չվերադարձնի արժեքը
      if (read() === str) return { ok: true, how: 'ABC'[i], info: desc(el) };
    }
    return { ok: false, how: 'fail', info: desc(el) + ' · ' + dumpCands() };
  }
  function parlayResolve(p, t, asset) {
    if (!parPend || parPend.asset !== asset || t < parPend.t + HOLD) return;
    const mv = (p - parPend.entry) * parPend.dir;
    const pay = parPend.pay;
    if (mv > 0) {
      par.wins++; par.streak++; par.best = Math.max(par.best, par.streak);
      par.stake = Math.round(par.stake * (1 + pay / 100) * 100) / 100;
      if (par.streak >= STEPS) { par.done++; par.streak = 0; par.stake = STAKE0; par.attempts++; parMsg = '🎉 ' + STEPS + '/' + STEPS + ' անցավ!'; try { beep(1); } catch (e) {} }
    } else if (mv < 0) {
      par.losses++; par.streak = 0; par.stake = STAKE0; par.attempts++;
    }
    parPend = null; savePar();
  }
  // ---- ավտոմատ սեղմման գործիքներ ----
  let nAuto = 0, autoMsg = '', btnBuy = null, btnSell = null;
  function acct() { // 'demo' | 'real' | 'unknown'
    try {
      const m = (document.body.innerText || '').match(/QT\s*(Demo|Real)/i);
      return m ? m[1].toLowerCase() : 'unknown';
    } catch (e) { return 'unknown'; }
  }
  function payoutNow() {
    try {
      const els = document.querySelectorAll('div,span,p');
      for (const e of els) {
        if (e.children.length) continue;
        const m = (e.textContent || '').trim().match(/^\+(\d{2,3})%$/);
        if (m && e.offsetParent !== null) return Number(m[1]);
      }
    } catch (e) {}
    return null;
  }
  function findBtn(words) {
    const els = document.querySelectorAll('button,div,span,a');
    let best = null;
    for (const e of els) {
      const t = (e.textContent || '').trim().toLowerCase();
      if (words.includes(t) && e.offsetParent !== null) { best = e; if (e.tagName === 'BUTTON') return e; }
    }
    return best;
  }
  function fire(el) {
    const r = el.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
    const o = { bubbles: true, cancelable: true, composed: true, clientX: x, clientY: y, view: window };
    ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'].forEach((n) => {
      try { el.dispatchEvent(n.startsWith('pointer') ? new PointerEvent(n, o) : new MouseEvent(n, o)); } catch (e) {}
    });
  }
  function autoClick(dir, asset) {
    if (!AUTO) return;
    const a = acct();
    if (a === 'unknown') { autoMsg = 'հաշիվը չի որոշվել՝ չեմ սեղմում'; return; }
    if (a === 'real' && !ALLOW_REAL) { autoMsg = 'REAL հաշիվ՝ ավտոմատ սեղմումը արգելված է (միայն Demo)'; return; }
    if (nAuto >= MAX_AUTO) { autoMsg = 'գործարքների սահմանը լրացավ (' + MAX_AUTO + ')'; return; }
    const pay = payoutNow();
    if (pay !== null && pay < MIN_PAYOUT) { autoMsg = 'եկամտաբերություն ' + pay + '% < ' + MIN_PAYOUT + '%՝ չեմ սեղմում'; return; }
    if (!btnBuy || !document.contains(btnBuy)) btnBuy = findBtn(['купить', 'buy', 'higher']);
    if (!btnSell || !document.contains(btnSell)) btnSell = findBtn(['продать', 'sell', 'lower']);
    const b = dir > 0 ? btnBuy : btnSell;
    if (!b) { autoMsg = 'կոճակը չի գտնվել'; return; }
    if (PARLAY) {
      if (parPend) { autoMsg = 'սպասում եմ նախորդ գործարքի արդյունքին'; return; }
      const pp = { asset, dir, t: lastTickT, entry: lastTickP, pay: pay || 92 };
      parPend = pp; // արգելափակում է նոր սիգնալները, մինչև այս գործարքի արդյունքը
      autoMsg = 'դնում եմ գումար $' + par.stake + '…';
      setStakeAsync(par.stake).then((r) => {
        if (parPend !== pp) return;
        if (!r.ok) { parPend = null; parMsg = '⚠ գումարը չդրվեց՝ ' + r.info; autoMsg = 'չսեղմեցի՝ գումարը չի փոխվում (սխալ գումարով գործարք չեմ բացում)'; return; }
        parMsg = 'գումար $' + par.stake + ' դրվեց (' + r.how + ')';
        fire(b);
        nAuto++;
        autoMsg = 'սեղմվեց ' + (dir > 0 ? 'Купить' : 'Продать') + ' #' + nAuto + ' (գումար $' + par.stake + ')';
      });
      return;
    }
    fire(b);
    nAuto++;
    autoMsg = 'սեղմվեց ' + (dir > 0 ? 'Купить' : 'Продать') + ' #' + nAuto + (pay !== null ? ' (եկամտ. ' + pay + '%)' : '');
  }
  // ---- ձայն (HTML audio՝ չի խլանում անձայն ռեժիմում) + Web Audio պահեստային ----
  let actx = null, soundOn = true, unlocked = false;
  function makeWav(freqs) {
    const sr = 22050, dur = 0.16, gap = 0.03, m = Math.floor(sr * dur), g = Math.floor(sr * gap);
    const total = freqs.length * (m + g), pcm = new Int16Array(total);
    freqs.forEach((f, k) => {
      const o = k * (m + g);
      for (let i = 0; i < m; i++) { const env = Math.min(1, i / 250, (m - i) / 500); pcm[o + i] = Math.sin(2 * Math.PI * f * i / sr) * env * 30000; }
    });
    const bytes = new Uint8Array(44 + pcm.length * 2), dv = new DataView(bytes.buffer);
    const ws = (off, str) => { for (let i = 0; i < str.length; i++) dv.setUint8(off + i, str.charCodeAt(i)); };
    ws(0, 'RIFF'); dv.setUint32(4, 36 + pcm.length * 2, true); ws(8, 'WAVE'); ws(12, 'fmt ');
    dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, 1, true); dv.setUint32(24, sr, true);
    dv.setUint32(28, sr * 2, true); dv.setUint16(32, 2, true); dv.setUint16(34, 16, true); ws(36, 'data'); dv.setUint32(40, pcm.length * 2, true);
    for (let i = 0; i < pcm.length; i++) dv.setInt16(44 + i * 2, pcm[i], true);
    let bin = ''; bytes.forEach((x) => (bin += String.fromCharCode(x)));
    return 'data:audio/wav;base64,' + btoa(bin);
  }
  let upA = null, downA = null;
  try { upA = new Audio(makeWav([660, 990, 1320])); downA = new Audio(makeWav([660, 440, 330])); upA.preload = downA.preload = 'auto'; } catch (e) {}
  function unlock() {
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {}
    try {
      if (!actx) { const AC = window.AudioContext || window.webkitAudioContext; if (AC) actx = new AC(); }
      if (actx && actx.state === 'suspended') actx.resume();
      if (actx) { const bf = actx.createBuffer(1, 1, 22050), sr = actx.createBufferSource(); sr.buffer = bf; sr.connect(actx.destination); sr.start(0); }
    } catch (e) {}
    [upA, downA].forEach((a) => {
      if (!a || a._ok) return;
      try {
        a.muted = true;
        const pr = a.play();
        if (pr && pr.then) pr.then(() => { a.pause(); a.currentTime = 0; a.muted = false; a._ok = true; unlocked = true; }).catch(() => { a.muted = false; });
      } catch (e) { a.muted = false; }
    });
  }
  ['touchend', 'click', 'pointerup'].forEach((ev) => document.addEventListener(ev, unlock, { passive: true, capture: true }));
  function beep(dir) {
    if (!soundOn) return;
    let played = false;
    try {
      const a = dir > 0 ? upA : downA;
      if (a && a._ok) { a.currentTime = 0; a.volume = 1; const pr = a.play(); if (pr && pr.catch) pr.catch(() => {}); played = true; }
    } catch (e) {}
    if (played) return;
    try {
      if (!actx) return;
      const t0 = actx.currentTime, freqs = dir > 0 ? [660, 990, 1320] : [660, 440, 330];
      freqs.forEach((f, i) => {
        const o = actx.createOscillator(), g = actx.createGain(), st = t0 + i * 0.19;
        o.type = 'sine'; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, st); g.gain.exponentialRampToValueAtTime(0.8, st + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, st + 0.17);
        o.connect(g); g.connect(actx.destination); o.start(st); o.stop(st + 0.18);
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
    if (asset === sel || !sel) { lastTickT = t; lastTickP = p; }
    if (PARLAY) parlayResolve(p, t, asset);
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
    autoClick(dir, asset);
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
