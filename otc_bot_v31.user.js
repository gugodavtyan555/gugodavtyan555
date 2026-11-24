// ==UserScript==
// @name         OTC Bot v31
// @match        *://*/*
// @grant        none
// @run-at       document-start
// ==/UserScript==
// Տեղադրում՝ Tampermonkey-ում։ Սկսիր DEMO հաշվով։
// WebSocket hook՝ ներարկվում է էջի աշխարհ (page world), գները ուղարկում postMessage-ով
const OTC_WS = {}, OTC_WT = {};
let OTC_MSGS = 0;
const OTC_T0 = Date.now();
(() => {
  const injected = function () {
    if (window.__otcHooked) return; window.__otcHooked = true;
    const re = /\["([A-Za-z0-9_#]+)",\s*(\d{9,11}(?:\.\d+)?),\s*(\d+(?:\.\d+)?)/g;
    const feed = d => {
      const out = []; let m; re.lastIndex = 0;
      const str = String(d);
      while ((m = re.exec(str))) out.push([m[1], parseFloat(m[2]), parseFloat(m[3])]);
      if (out.length) window.postMessage({ __otc: 1, d: out }, '*');
    };
    const handle = d => {
      if (typeof d === 'string') feed(d);
      else if (d instanceof Blob) { const f = new FileReader(); f.onload = () => feed(f.result); f.readAsText(d); }
      else if (d instanceof ArrayBuffer) feed(new TextDecoder().decode(d));
    };
    const W = window.WebSocket;
    const P = function (...a) { const w = new W(...a); w.addEventListener('message', e => { try { handle(e.data); } catch (_) {} }); return w; };
    P.prototype = W.prototype;
    ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'].forEach(k => P[k] = W[k]);
    window.WebSocket = P;
  };
  window.addEventListener('message', e => {
    if (!e.data || !e.data.__otc) return;
    e.data.d.forEach(([sym, t, p]) => {
      OTC_MSGS++;
      (OTC_WS[sym] = OTC_WS[sym] || []).push(p);
      (OTC_WT[sym] = OTC_WT[sym] || []).push(t);
      if (OTC_WS[sym].length > 600) { OTC_WS[sym].shift(); OTC_WT[sym].shift(); }
    });
  });
  const s = document.createElement('script');
  s.textContent = '(' + injected.toString() + ')()';
  (document.head || document.documentElement).appendChild(s);
  s.remove();
})();

const main = () => {
  'use strict';
  const CFG = {
    base: 1,            // սկզբնական գումար
    mult: 1.92,         // բազմապատկիչ պարտվելուց հետո
    maxLoss: 4,         // 4 անընդմեջ պարտությունից հետո՝ վերադառնալ base
    expirySec: 10,
    chain: 4,           // $1, $1.92, $3.69, $7.08
    minPayout: 92,      // եթե վճարումը սրանից ցածր է՝ չի մտնում
    // Սելեկտորներ (եթե կայքը փոխվի՝ ուղղիր այստեղ)
    sel: {
      amount: '.block--bet-amount input[type=text], input.bet-amount, input.input-control__input, input[type=tel], .value__val input',
      up: 'button.call-btn, .call-btn, .btn-call, .action-high-low .btn-call',
      down: 'button.put-btn, .put-btn, .btn-put, .action-high-low .btn-put',
      balance: '.usermenu__info-balance, .js-balance-demo, .js-balance-real, .balance-info-block__balance',
      price: '.current-symbol__price, .chart-price, .value__val-start', // ընտրովի
    },
  };

  let stats = { w: 0, l: 0 }; try { stats = JSON.parse(localStorage.getItem('otcStats')) || stats; } catch (_) {}
  const showStats = () => { try { localStorage.setItem('otcStats', JSON.stringify(stats)); } catch (_) {} const t = stats.w + stats.l; const e = document.getElementById('otcStats'); if (e) e.textContent = `✅${stats.w} ❌${stats.l} | ` + (t ? Math.round(100 * stats.w / t) + '%' : '—'); };
  let startBal = NaN;
  let running = false, step = 0, streak = 0, ticks = [], timer = null;
  const $ = s => document.querySelector(s);
  const num = el => el ? parseFloat(el.textContent.replace(/[^0-9.]/g, '')) : NaN;
  const vis = e => e && e.getBoundingClientRect().width > 0;
  const all = s => [...document.querySelectorAll(s)];
  function findInput() {
    const ins = all('input').filter(i => vis(i) && !i.closest('#otcBox'));
    return ins.find(i => /сумм|amount|investment/i.test(i.closest('div')?.parentElement?.textContent || '') && /^\$?[\d.,]+$/.test(i.value.trim()))
      || ins.find(i => /^\$?[\d.,]+$/.test(i.value.trim()) && !/:/.test(i.value));
  }
  function findBtn(dir) {
    const re = dir === 'up' ? /^(купить|buy|call|up|higher)$/i : /^(продать|sell|put|down|lower)$/i;
    const el = $(CFG.sel[dir]) || all('button,div,a,span').find(e => vis(e) && re.test(e.textContent.trim()) && e.children.length < 4);
    return el && (el.closest('button,a,[role=button]') || el);
  }
  function bal() {
    const e = $(CFG.sel.balance);
    if (e) return num(e);
    const c = all('span,div,p').find(e => !e.children.length && vis(e) && e.getBoundingClientRect().top < 300 && /^[\d,]+\.\d{2}$/.test(e.textContent.trim()));
    return num(c);
  }
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  const fire = el => ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'].forEach(t =>
    el.dispatchEvent(new (t.startsWith('pointer') && window.PointerEvent ? PointerEvent : MouseEvent)(t, { bubbles: true, cancelable: true, view: window })));
  const keyOf = ch => all('div,button,span').find(e => vis(e) && !e.children.length && e.textContent.trim() === ch && e.getBoundingClientRect().width > 25);
  // Վճարման տոկոս (+92%)
  function payout() {
    const e = all('span,div,p').find(e => !e.children.length && vis(e) && /^\+\s?\d{2,3}\s?%$/.test(e.textContent.trim()));
    return e ? parseInt(e.textContent.replace(/\D/g, '')) : NaN;
  }
  // Գումարը մուտքագրում է հավելվածի հաշվիչի (калькулятор) կոճակներով
  // Իրական ցուցադրվող գումարը՝ «Выплата $X» / (1 + վճարում%)
  function stakeShown() {
    const m = document.body.innerText.match(/Выплата\s*\$?\s*([\d.,]+)/);
    const po = payout();
    if (!m || isNaN(po)) return NaN;
    return parseFloat(m[1].replace(',', '')) / (1 + po / 100);
  }
  const okStake = v => { const x = stakeShown(); return isNaN(x) || Math.abs(x - v) <= 0.02 + v * 0.01; };

  // Իրական հպման սիմուլյացիա (touch + pointer + mouse + click)
  function touchSeq(el) {
    try {
      const r = el.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
      const t = document.createTouch ? document.createTouch(window, el, 1, x, y, x, y) : new Touch({ identifier: 1, target: el, clientX: x, clientY: y, pageX: x, pageY: y });
      const list = document.createTouchList ? document.createTouchList(t) : [t];
      el.dispatchEvent(new TouchEvent('touchstart', { bubbles: true, cancelable: true, touches: list, targetTouches: list, changedTouches: list }));
      el.dispatchEvent(new TouchEvent('touchend', { bubbles: true, cancelable: true, touches: [], targetTouches: [], changedTouches: list }));
    } catch (_) {}
  }
  const pressEvents = el => { touchSeq(el); fire(el); };
  // Ուղիղ կանչում է React/Vue-ի handler-ը
  function pressHandler(el) {
    let n = el;
    for (let d = 0; n && d < 7; d++, n = n.parentElement) {
      const fake = { target: el, currentTarget: n, type: 'click', preventDefault() {}, stopPropagation() {}, persist() {}, nativeEvent: {}, button: 0 };
      const rk = Object.keys(n).find(k => k.startsWith('__reactProps$'));
      if (rk) {
        const pr = n[rk];
        const f = pr.onClick || pr.onMouseDown || pr.onPointerDown || pr.onTouchStart || pr.onTouchEnd || pr.onMouseUp;
        if (f) { try { f(fake); return true; } catch (_) {} }
      }
      const vei = n._vei;
      if (vei) {
        const h = vei.onClick || vei.onMousedown || vei.onPointerdown || vei.onTouchstart || vei.onTouchend;
        if (h) { const f = h.value; try { (Array.isArray(f) ? f : [f]).forEach(g => g && g(fake)); return true; } catch (_) {} }
      }
    }
    return false;
  }
  async function openCalc(i) {
    if (keyOf('7')) return true;
    touchSeq(i); fire(i); try { i.focus(); } catch (_) {}
    for (let t = 0; t < 10 && !keyOf('7'); t++) await sleep(50);
    return !!keyOf('7');
  }
  async function typeVia(press, v) {
    const k0 = keyOf('0'), kd = keyOf('.');
    if (!k0 || !kd) return false;
    const z = k0.getBoundingClientRect(), d = kd.getBoundingClientRect();
    const bx = z.left + z.width / 2 + (z.left + z.width / 2 - (d.left + d.width / 2)), by = z.top + z.height / 2;
    const back = document.elementFromPoint(bx, by);
    if (back) for (let n = 0; n < 6; n++) { press(back); await sleep(30); }
    for (const ch of String(v)) { const k = keyOf(ch); if (!k) return false; press(k); await sleep(35); }
    await sleep(150);
    return okStake(v);
  }
  // Ճիշտ ինչպես ձեռքով՝ սեղմել գումարի դաշտը → հաշվիչի թվանշաններ
  // ---- Աշխատող եղանակ (po-fade սքրիփթից)՝ հաշվիչի ստեղները սեղմվում են կոորդինատներով ----
  const SSW = 920;
  const KC = [-430, -198, 34], KR = [-533, -441, -350, -259];
  const KM = { '7': [0, 0], '8': [1, 0], '9': [2, 0], '4': [0, 1], '5': [1, 1], '6': [2, 1], '1': [0, 2], '2': [1, 2], '3': [2, 2], '.': [0, 3], '0': [1, 3], back: [2, 3] };
  function fieldCenter() {
    const s = window.innerWidth / SSW;
    try {
      const labels = [...document.querySelectorAll('div,span,label,p')].filter((e) => /^(Сумма|Amount)$/i.test((e.textContent || '').trim()));
      for (const l of labels) {
        const r = l.getBoundingClientRect();
        if (r.width < 10 || r.height < 5 || r.top < 0 || r.top > window.innerHeight) continue;
        return { x: r.left + 187.5 * s, y: r.top + r.height / 2 + 67 * s, s, src: 'label' };
      }
    } catch (x) {}
    return { x: 287 / 402 * window.innerWidth, y: (1281 - 140) / 1634 * window.innerHeight, s, src: 'fixed' };
  }
  function kpt(name, fc) {
    if (name === 'disp') return [fc.x - 314 * fc.s, fc.y - 724 * fc.s];
    if (name === 'field') return [fc.x, fc.y];
    const m = KM[name];
    return [fc.x + KC[m[0]] * fc.s, fc.y + KR[m[1]] * fc.s];
  }
  function hitXY(p) { try { return document.elementFromPoint(p[0], p[1]); } catch (x) { return null; } }
  function dispRaw(fc) { // հաշվիչի ցուցանակի «$…» տեքստը (դատարկ էլ կարող է լինել՝ «$»), եթե հաշվիչը իրոք բաց է
    const t = hitXY(kpt('disp', fc));
    if (!t) return null;
    const re = /^\s*\$\s*[\d.,]*\s*$/;
    const cands = [t.value, t.textContent, t.parentElement && t.parentElement.textContent];
    for (const c of cands) {
      if (c === undefined || c === null) continue;
      const st = String(c).replace(',', '.');
      if (re.test(st)) return st.replace(/[^\d.]/g, '');
    }
    return null;
  }
  function dispNum(fc) { const r = dispRaw(fc); return r === null || r === '' || isNaN(parseFloat(r)) ? null : parseFloat(r); }
  function calcOpenNow(fc) { return dispRaw(fc || fieldCenter()) !== null; }
  function fieldNum(fc) { // «Сумма» դաշտի ընթացիկ թիվը (խիստ ստուգում՝ իսկապես թվային դաշտ է)
    const t = hitXY(kpt('field', fc));
    if (!t) return null;
    const raw = (t.value !== undefined && t.value !== '' ? String(t.value) : String(t.textContent || '')).trim().replace(',', '.');
    const m = raw.match(/^\$?\s*(\d+(?:\.\d+)?)$/);
    return m ? parseFloat(m[1]) : null;
  }
  function tapPt(p) {
    const t = hitXY(p);
    if (!t) return null;
    const o = { bubbles: true, cancelable: true, composed: true, clientX: p[0], clientY: p[1], view: window };
    ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'].forEach((n) => {
      try { t.dispatchEvent(n.startsWith('pointer') ? new PointerEvent(n, o) : new MouseEvent(n, o)); } catch (e) {}
    });
    return t;
  }
  async function typeProp(str) { // վերադարձնում է { ok, info }
    const want = parseFloat(str);
    let fc = fieldCenter();
    if (!calcOpenNow(fc)) {
      const fn = fieldNum(fc);
      if (fn === null) return { ok: false, info: 'Сумма դաշտը չգտնվեց (' + fc.src + ')՝ ոչինչ չեմ սեղմել' };
      if (Math.abs(fn - want) < 1e-9) return { ok: true, info: 'արդեն ' + fn };
      tapPt(kpt('field', fc));
      for (let i = 0; i < 10 && !calcOpenNow(); i++) await sleep(80);
      await sleep(150);
      fc = fieldCenter();
    }
    if (!calcOpenNow(fc)) return { ok: false, info: 'հաշվիչը չբացվեց՝ ստեղները չեմ սեղմել' };
    for (let i = 0; i < 9; i++) { tapPt(kpt('back', fc)); await sleep(25); }
    for (const ch of str) {
      if (!KM[ch]) return { ok: false, info: 'չկա ստեղն ' + ch };
      if (!calcOpenNow(fc)) return { ok: false, info: 'հաշվիչը անհետացավ՝ կանգնեցի' };
      tapPt(kpt(ch, fc)); await sleep(40);
    }
    await sleep(140);
    const shown = dispNum(fc);
    const ok = shown !== null && Math.abs(shown - want) < 1e-9;
    const closers = [
      () => { try { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); } catch (x) {} },
      () => { tapPt(kpt('field', fc)); },
      () => { try { document.activeElement && document.activeElement.blur && document.activeElement.blur(); } catch (x) {} }
    ];
    for (const f of closers) { if (!calcOpenNow(fc)) break; f(); await sleep(180); }
    return { ok, info: 'ցուցանակ=' + shown + (calcOpenNow(fc) ? ' (հաշվիչը բաց մնաց)' : '') };
  }

  async function setAmount(v) {
    const dbg = m => log('· ' + m);
    const hide = typeof box !== 'undefined' && box && box.style;
    try {
      if (hide) box.style.visibility = 'hidden'; // վահանակը չծածկի ստեղները
      const r = await typeProp(String(v));
      dbg(r.info);
      return r.ok;
    } catch (e) { dbg('սխալ՝ ' + e.message); return false; }
    finally { if (hide) box.style.visibility = 'visible'; }
  }
  function closeCalc(i) {
    try { i.blur(); } catch (_) {}
    try { window.getSelection().removeAllRanges(); } catch (_) {}
    const c = all('div').find(e => vis(e) && e.children.length === 0 && /Время закрытия|Close time/i.test(e.textContent));
    touchSeq(c || document.body); fire(c || document.body);
  }

  // Պարզ ազդանշան՝ վերջին գների momentum; եթե գին չկա՝ պատահական
  // Գնի սամփլեր՝ գտնում է այն թվային տարրը (1.84523 տիպի), որը ամենաշատ է փոխվում
  const hist = new Map();
  setInterval(() => {
    all('span,div,p,text,tspan').forEach(e => {
      if (e.children.length || !vis(e) || e.closest('#otcBox')) return;
      const t = e.textContent.trim();
      if (!/^\d{1,6}[.,]\d{3,6}$/.test(t)) return;
      const h = hist.get(e) || []; h.push(parseFloat(t.replace(',', '.')));
      hist.set(e, h.slice(-120));
    });
  }, 300);
  function symKey() {
    const m = document.body.innerText.match(/([A-Z]{3})\/([A-Z]{3})\s*OTC/);
    return m ? (m[1] + m[2] + '_otc').toLowerCase() : null;
  }
  function wsKey() {
    const k = symKey(); let best = null, mx = 0;
    Object.keys(OTC_WS).forEach(n => {
      if (k && n.toLowerCase().replace('#', '') === k) { best = n; mx = 1e9; }
      else if (OTC_WS[n].length > mx) { mx = OTC_WS[n].length; best = n; }
    });
    return best;
  }
  // Տիկերից կառուցում է մոմեր (OHLC)
  function candles(sec = 5) {
    const k = wsKey(); if (!k) return [];
    const P = OTC_WS[k], T = OTC_WT[k], out = [];
    for (let i = 0; i < P.length; i++) {
      const b = Math.floor(T[i] / sec), c = out[out.length - 1];
      if (c && c.b === b) { c.h = Math.max(c.h, P[i]); c.l = Math.min(c.l, P[i]); c.c = P[i]; }
      else out.push({ b, o: P[i], h: P[i], l: P[i], c: P[i] });
    }
    return out.slice(0, -1); // վերջին (չփակված) մոմը հանում ենք
  }
  function candleSignal() {
    const C = candles(5); if (C.length < 6) return { up: 0, down: 0, n: C.length };
    const a = C[C.length - 2], b = C[C.length - 1];
    const body = c => Math.abs(c.c - c.o), rng = c => (c.h - c.l) || 1e-9;
    const col = c => Math.sign(c.c - c.o);
    const upW = c => c.h - Math.max(c.o, c.c), loW = c => Math.min(c.o, c.c) - c.l;
    let up = 0, down = 0;
    // մերժման ստվերներ (pin bar)
    if (upW(b) >= 2 * body(b) && upW(b) > 0.55 * rng(b)) down++;
    if (loW(b) >= 2 * body(b) && loW(b) > 0.55 * rng(b)) up++;
    // կլանում (engulfing)
    if (col(b) > 0 && col(a) < 0 && b.c >= a.o && b.o <= a.c) up++;
    if (col(b) < 0 && col(a) > 0 && b.c <= a.o && b.o >= a.c) down++;
    // ուժասպառում՝ ≥3 նույն գույնի մոմ, հետո հակառակ
    const prev3 = C.slice(-4, -1);
    if (prev3.every(c => col(c) > 0) && col(b) <= 0) down++;
    if (prev3.every(c => col(c) < 0) && col(b) >= 0) up++;
    return { up, down, n: C.length };
  }
  // 15 վրկանոց մասշտաբ՝ գինը վերջին փակված 15վ մոմերի փակումների նկատմամբ (z-score)
  function z15() {
    const C = candles(15); if (C.length < 8) return null;
    const cl = C.slice(-12).map(c => c.c), m = cl.reduce((x, y) => x + y) / cl.length;
    const sd = Math.sqrt(cl.reduce((x, y) => x + (y - m) ** 2, 0) / cl.length) || 1e-9;
    const k = wsKey(), P = OTC_WS[k]; if (!P || !P.length) return null;
    return (P[P.length - 1] - m) / sd;
  }
  function livePrices() {
    const k = symKey();
    const ws = OTC_WS[wsKey()];
    if (ws && ws.length >= 5) return ws.slice();
    let best = [], bu = 1;
    hist.forEach((h, e) => {
      if (!document.contains(e)) { hist.delete(e); return; }
      const u = new Set(h).size;
      if (u > bu) { bu = u; best = h; }
    });
    return best;
  }
  const ema = (a, n) => { const k = 2 / (n + 1); return a.reduce((e, x, i) => i ? x * k + e * (1 - k) : x, a[0]); };
  function rsi(a, n = 14) {
    let g = 0, l = 0; const s = a.slice(-n - 1);
    for (let i = 1; i < s.length; i++) { const d = s[i] - s[i - 1]; d > 0 ? g += d : l -= d; }
    return l === 0 ? (g === 0 ? 50 : 100) : 100 - 100 / (1 + g / l);
  }
  // OTC ռեժիմ (fade)՝ սինթետիկ գինը հակված է վերադառնալու, ուստի մտնում ենք չափից դուրս շարժման ՀԱԿԱԴԻՐ
  let lastFeat = null;
  function direction() {
    const raw = livePrices();
    const p = raw.filter((x, i) => i === 0 || x !== raw[i - 1]);
    if (p.length < 30) {
      log('սպասում եմ տվյալների (' + p.length + '/30) ws:' + OTC_MSGS);
      try {
        if (OTC_MSGS > 0) sessionStorage.removeItem('otcReloaded');
        else if (Date.now() - OTC_T0 > 20000 && !sessionStorage.getItem('otcReloaded')) { sessionStorage.setItem('otcReloaded', '1'); log('🔁 ws չկա՝ թարմացնում եմ էջը…'); setTimeout(() => location.reload(), 800); }
      } catch (_) {}
      return null;
    }
    const n = p.length, last = p[n - 1];
    const w = p.slice(-30), mean = w.reduce((x, y) => x + y) / w.length;
    const sd = Math.sqrt(w.reduce((x, y) => x + (y - mean) ** 2, 0) / w.length) || 1e-9;
    const z = (last - mean) / sd, r = rsi(p, 10);
    const rangeP = (Math.max(...w) - Math.min(...w)) / (Math.abs(mean) || 1);
    if (rangeP < 0.00003) { log('շուկան «քնած» է'); return null; } // ֆլեթ՝ մուտք չկա
    // նախորդ շարժման երկարությունը (նույն ուղղությամբ տիկեր՝ առանց վերջինի)
    let run = 0, dir = Math.sign(p[n - 2] - p[n - 3]);
    for (let i = n - 2; i > 0 && Math.sign(p[i] - p[i - 1]) === dir && dir !== 0; i--) run++;
    const turnedDown = p[n - 1] < p[n - 2], turnedUp = p[n - 1] > p[n - 2]; // շրջման սկիզբ
    const lv = p.slice(-60, -2), hi = Math.max(...lv), lo = Math.min(...lv), R = (hi - lo) || 1e-9;
    const nearTop = last >= hi - 0.25 * R, nearBot = last <= lo + 0.25 * R; // ճշգրիտ կետ՝ դիմադրություն/աջակցություն
    const cs = candleSignal();
    const down = [z > 1.0, r > 65, dir > 0 && run >= 4, turnedDown].filter(Boolean).length + 2 * cs.down;
    const up = [z < -1.0, r < 35, dir < 0 && run >= 4, turnedUp].filter(Boolean).length + 2 * cs.up;
    // մոմի նմուշ + ևս 1 հաստատում
    const zz = z15(); // null = 15վ տվյալ դեռ չկա՝ չի արգելափակում
    const okD = zz === null || zz >= 1.5, okU = zz === null || zz <= -1.5;
    lastFeat = { z: +z.toFixed(2), rsi: Math.round(r), run, z15: zz === null ? '' : +zz.toFixed(2), pat: Math.max(cs.up, cs.down), nearTop: nearTop ? 1 : 0, nearBot: nearBot ? 1 : 0, up, down, candles: cs.n };
    const noC = cs.n < 6; // մոմեր չկան (սոկետ չկա)՝ աշխատում է առանց նմուշի
    if ((noC ? down >= 3 : (cs.down > 0 && down >= 3) || down >= 4) && down > up && turnedDown && nearTop && okD) return 'down';
    if ((noC ? up >= 3 : (cs.up > 0 && up >= 3) || up >= 4) && up > down && turnedUp && nearBot && okU) return 'up';
    log('15վ z=' + (zz === null ? '—' : zz.toFixed(1)) + ' | մոմեր ' + cs.n + (nearTop ? ' | դիմադրության մոտ' : nearBot ? ' | աջակցության մոտ' : ' | մակարդակից հեռու') + ' | ազդանշան չկա (z ' + z.toFixed(1) + ', RSI ' + r.toFixed(0) + ')'); return null;
  }

  // Ճշգրիտ ժամանակ՝ մուտք միայն 5 վրկ մոմի սկզբում (առաջին ~0.4 վրկ)
  async function waitBoundary() {
    while (running && Date.now() % 5000 > 1200) await sleep(40);
  }
  // Շղթա՝ $1 → շահում → $1.92 → $3.69 → $7.08 → վերջ, նորից $1. Պարտության դեպքում՝ $1
  let inTrade = false, rotBusy = false, forceRot = false, lastSwitch = Date.now();
  async function trade() { try { await tradeInner(); } finally { inTrade = false; } }
  async function tradeInner() {
    if (rotBusy) { await sleep(400); return; }
    await waitBoundary(); if (!running) return;
    const po = payout();
    if (!isNaN(po) && po < CFG.minPayout) { log('վճարումը ' + po + '% < ' + CFG.minPayout + '% → փոխում եմ զույգը'); forceRot = true; await sleep(1500); return; }
    const dir = direction();
    if (!dir) { await sleep(1000); return; }
    inTrade = true; lastSwitch = Date.now();
    const feat = lastFeat ? Object.assign({}, lastFeat) : {}, step0 = step;
    const amount = +(CFG.base * Math.pow(CFG.mult, step)).toFixed(2);
    if (!okStake(amount) || isNaN(stakeShown())) { if (!(await setAmount(amount))) { log('✗ գումարը չհաստատվեց ($' + amount + ') → չեմ մտնում'); await sleep(1500); return; } }
    const btn = findBtn(dir);
    if (!btn) { running = false; syncBtn(); return log('Կոճակը չգտնվեց'); }
    const before = bal();
    fire(btn);
    log(`Խաղ #${step + 1}: $${amount} ${dir.toUpperCase()}`);
    await sleep((CFG.expirySec + 0.8) * 1000);
    let after = bal();
    for (let t = 0; t < 30 && (isNaN(after) || Math.abs(after - before) < 0.001 || Math.abs(after - (before - amount)) < 0.001 && t < 6); t++) { await sleep(200); after = bal(); }
    const profit = after - before;
    const tie = Math.abs(profit) < 0.005;       // գումարը վերադարձվեց (ոչ-ոքի) կամ գործարք չբացվեց
    const win = profit >= 0.005;
    if (tie) { log('🤝 վերադարձ՝ գումարը նույնն է մնում ($' + amount + ')'); }
    else recordTrade(win, dir, amount, feat, step0);
    if (tie) { /* step-ը չի փոխվում */ }
    else if (win) { stats.w++; step++; if (step >= CFG.chain) { step = 0; log('✅ Շահեց · շղթան ավարտվեց → $1'); } else log('✅ Շահեց → հաջորդը $' + (CFG.base * Math.pow(CFG.mult, step)).toFixed(2)); }
    else { stats.l++; step = 0; log('❌ Պարտվեց → $1'); }
    showStats();
    // անմիջապես նոր գումարը դնել
    const next = +(CFG.base * Math.pow(CFG.mult, step)).toFixed(2);
    try { const ok = await setAmount(next); const i = findInput(); log('գումար → $' + next + (ok && i ? ' (դաշտում՝ ' + i.value + ')' : ' ✗ չստացվեց')); if (i) i.blur(); } catch (e) { log('setAmount սխալ: ' + e.message); }
  }


  // ---- Զույգերի ավտոմատ սկանավորում. եթե ազդանշան չկա՝ անցնում է հաջորդ OTC զույգին ----
  const ROT_SEC = 60;   // վրկ. մեկ զույգի վրա, եթե ազդանշան չկա
  const ROT_PAY = 92;   // նվազագույն վճարում %
  const visited = {};
  const normT = e => String(e.textContent || '').replace(/\s+/g, ' ').trim().toUpperCase();
  const curName = () => { const m = document.body.innerText.match(/([A-Z]{2,4}\/[A-Z]{2,4})\s*OTC/); return m ? m[1] + ' OTC' : ''; };
  const idOf = n => n.replace(/\s*OTC$/i, '').replace('/', '') + '_otc';
  function tapEl(e) { const r = e.getBoundingClientRect(); tapPt([r.left + r.width / 2, r.top + r.height / 2]); fire(e); }
  function clearPair(name) {
    const id = idOf(name).toLowerCase().replace('#', '');
    Object.keys(OTC_WS).forEach(k => { if (k.toLowerCase().replace('#', '') === id) { delete OTC_WS[k]; delete OTC_WT[k]; } });
  }
  async function switchPair() {
    const cur = curName(); if (!cur) return log('🔄 ընթացիկ զույգը չեմ գտնում');
    const openers = all('div,span,p').filter(e => !box.contains(e) && e.children.length < 4 && normT(e) === cur.toUpperCase() && e.getBoundingClientRect().top < innerHeight * 0.4 && vis(e));
    if (!openers.length) return log('🔄 զույգի կոճակը չգտնվեց');
    tapEl(openers[0]); await sleep(900);
    const rows = [];
    all('div,span,p').forEach(e => {
      if (e.children.length > 3 || box.contains(e) || !vis(e)) return;
      const t = normT(e); if (!/^[A-Z]{2,4}\/[A-Z]{2,4} OTC$/.test(t)) return;
      let par = e, pay = null;
      for (let k = 0; k < 5 && par && pay === null; k++) { par = par.parentElement; const m = par && String(par.textContent || '').match(/\+\s*(\d{2,3})\s*%/); if (m) pay = +m[1]; }
      rows.push({ el: e, name: t, pay, top: e.getBoundingClientRect().top });
    });
    rows.sort((a, b) => a.top - b.top);
    const now = Date.now(), ok = r => r.name !== cur.toUpperCase() && r.pay !== null && r.pay >= ROT_PAY && r.top < innerHeight * 0.9;
    const pick = rows.filter(ok).sort((a, b) => (visited[a.name] || 0) - (visited[b.name] || 0) || a.top - b.top)[0];
    if (!pick) { log('🔄 հարմար ≥' + ROT_PAY + '% զույգ չգտա (' + rows.length + ')'); try { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); } catch (_) {} return; }
    clearPair(pick.name); visited[pick.name] = now;
    tapEl(pick.el); await sleep(1500);
    log(curName() === pick.name ? '🔄 անցա ' + pick.name + ' (' + pick.pay + '%)' : '🔄 «' + pick.name + '»-ին չանցավ');
  }
  setInterval(async () => {
    if (!running || inTrade || rotBusy) return;
    const po = payout();
    const need = forceRot || (!isNaN(po) && po < ROT_PAY) || Date.now() - lastSwitch > ROT_SEC * 1000;
    if (!need) return;
    rotBusy = true;
    try { box.style.visibility = 'hidden'; await switchPair(); } catch (e) { log('🔄 սխալ՝ ' + e.message); }
    finally { box.style.visibility = 'visible'; forceRot = false; lastSwitch = Date.now(); rotBusy = false; }
  }, 3000);


  // ---- Վիճակագրության հավաքում (localStorage) ----
  const LOGKEY = 'otcTradeLog';
  const readLog = () => { try { return JSON.parse(localStorage.getItem(LOGKEY) || '[]'); } catch (_) { return []; } };
  function recordTrade(win, dir, amount, feat, step0) {
    const L = readLog();
    L.push(Object.assign({ t: new Date().toISOString().slice(0, 19), pair: curName(), dir, stake: amount, step: step0, hr: new Date().getHours(), win: win ? 1 : 0 }, feat || {}));
    try { localStorage.setItem(LOGKEY, JSON.stringify(L.slice(-3000))); } catch (_) {}
  }
  function groupStats(L, keyf) {
    const g = {};
    L.forEach(r => { const k = keyf(r); (g[k] = g[k] || { w: 0, n: 0 }).n++; g[k].w += r.win; });
    return Object.keys(g).sort().map(k => k + ': ' + g[k].w + '/' + g[k].n + ' (' + Math.round(100 * g[k].w / g[k].n) + '%)');
  }
  function showSummary() {
    const L = readLog(); if (!L.length) return log('📊 տվյալ դեռ չկա');
    const w = L.reduce((a, r) => a + r.win, 0);
    log('📊 ընդամենը ' + w + '/' + L.length + ' (' + Math.round(100 * w / L.length) + '%)');
    [['ուղղ.', r => r.dir], ['զույգ', r => r.pair], ['նմուշ', r => r.pat > 0 ? 'այո' : 'ոչ'], ['15վ z', r => r.z15 === '' ? '—' : (Math.abs(r.z15) >= 2 ? '≥2' : '1.5–2')], ['քայլ', r => '$' + r.stake]].forEach(([nm, f]) =>
      log('· ' + nm + ' | ' + groupStats(L, f).join(' | ')));
  }
  function copyCsv() {
    const L = readLog(); if (!L.length) return log('📊 տվյալ դեռ չկա');
    const cols = Object.keys(L[0]);
    const csv = cols.join(',') + '\n' + L.map(r => cols.map(c => r[c]).join(',')).join('\n');
    try { navigator.clipboard.writeText(csv); log('📋 պատճենվեց (' + L.length + ' տող)'); } catch (_) { log('📋 չստացվեց'); }
  }
  let looping = false;
  async function loop() {
    if (looping) return; // երկրորդ ցիկլ չբացել
    looping = true;
    try { while (running) { await trade(); await sleep(1500); } }
    finally { looping = false; }
  }

  try { window.getSelection().removeAllRanges(); } catch (_) {}
  // UI
  const box = document.createElement('div');
  box.id='otcBox'; box.style.cssText = 'position:fixed;top:80px;right:10px;z-index:99999;background:#111;color:#fff;padding:10px;border-radius:8px;font:12px sans-serif;width:210px';
  box.innerHTML = '<button id="otcBtn" style="width:100%;padding:8px;font-weight:bold;background:#2a2;color:#fff;border:0;border-radius:6px;cursor:pointer">START</button><div style="display:flex;gap:4px;margin-top:6px"><button id="otcSum" style="flex:1;padding:6px;background:#345;color:#fff;border:0;border-radius:6px">📊</button><button id="otcCsv" style="flex:1;padding:6px;background:#345;color:#fff;border:0;border-radius:6px">📋</button></div><button id="otcTest" style="width:100%;margin-top:6px;padding:6px;background:#345;color:#fff;border:0;border-radius:6px">Թեստ՝ դնել $1.92</button><div id="otcLog" style="margin-top:6px;max-height:140px;overflow:auto"></div>';
  document.body.appendChild(box);
  // Քարշելու բռնակ
  const grip = document.createElement('div');
  grip.textContent = '⠿ տեղափոխել (v31)';
  grip.style.cssText = 'text-align:center;padding:6px;margin-bottom:6px;background:#333;border-radius:6px;cursor:move;touch-action:none;user-select:none';
  box.prepend(grip);
  let dx = 0, dy = 0, drag = false;
  grip.addEventListener('pointerdown', e => { drag = true; const r = box.getBoundingClientRect(); dx = e.clientX - r.left; dy = e.clientY - r.top; grip.setPointerCapture(e.pointerId); e.preventDefault(); });
  grip.addEventListener('pointermove', e => { if (!drag) return; box.style.left = Math.max(0, e.clientX - dx) + 'px'; box.style.top = Math.max(0, e.clientY - dy) + 'px'; box.style.right = 'auto'; });
  grip.addEventListener('pointerup', () => { drag = false; });
  const logEl = box.querySelector('#otcLog'); showStats();
  function log(t) { logEl.insertAdjacentHTML('afterbegin', `<div>${t}</div>`); }
  const syncBtn = () => { const b = box.querySelector('#otcBtn'); b.textContent = running ? 'STOP' : 'START'; b.style.background = running ? '#c22' : '#2a2'; };
  box.querySelector('#otcSum').onclick = showSummary;
  box.querySelector('#otcCsv').onclick = copyCsv;
  box.querySelector('#otcTest').onclick = async () => { const ok = await setAmount(1.92); log(ok ? '✅ թեստ OK' : '✗ թեստ ձախողվեց'); };
  box.querySelector('#otcBtn').onclick = e => {
    running = !running;
    e.target.textContent = running ? 'STOP' : 'START';
    e.target.style.background = running ? '#c22' : '#2a2';
    if (running && !looping) loop();
  };
};
if (document.body) main(); else document.addEventListener('DOMContentLoaded', main);
