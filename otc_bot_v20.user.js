// ==UserScript==
// @name         OTC Bot v20
// @match        *://*/*
// @grant        none
// @run-at       document-start
// ==/UserScript==
// Տեղադրում՝ Tampermonkey-ում։ Սկսիր DEMO հաշվով։
// WebSocket hook՝ ներարկվում է էջի աշխարհ (page world), գները ուղարկում postMessage-ով
const OTC_WS = {}, OTC_WT = {};
let OTC_MSGS = 0;
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

  async function setAmount(v) {
    const i = findInput(); if (!i) return false;
    const nat = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    // 1) իրական «տպելու» եղանակ՝ execCommand (կայքը այն ընդունում է որպես օգտատիրոջ մուտք)
    try {
      i.focus(); i.select && i.select();
      document.execCommand('selectAll', false, null);
      document.execCommand('insertText', false, String(v));
      i.dispatchEvent(new Event('change', { bubbles: true }));
      await sleep(150);
      if (okStake(v)) return true;
    } catch (_) {}
    // 2) ուղիղ արժեք
    nat.call(i, String(v));
    i.dispatchEvent(new Event('input', { bubbles: true }));
    i.dispatchEvent(new Event('change', { bubbles: true }));
    await sleep(150);
    if (okStake(v)) return true;
    // 3) հաշվիչի կոճակներ
    if (!keyOf('7')) { fire(i); try { i.focus(); } catch (_) {} await sleep(150); }
    const k0 = keyOf('0'), kd = keyOf('.');
    if (keyOf('7') && k0 && kd) {
      const z = k0.getBoundingClientRect(), d = kd.getBoundingClientRect();
      const bx = z.left + z.width / 2 + (z.left + z.width / 2 - (d.left + d.width / 2)), by = z.top + z.height / 2;
      const back = document.elementFromPoint(bx, by);
      if (back) for (let n = 0; n < 6; n++) { fire(back); await sleep(25); }
      for (const ch of String(v)) { const k = keyOf(ch); if (!k) break; fire(k); await sleep(30); }
      await sleep(150);
      if (okStake(v)) return true;
    }
    return false;
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
  function direction() {
    const raw = livePrices();
    const p = raw.filter((x, i) => i === 0 || x !== raw[i - 1]);
    if (p.length < 30) { log('սպասում եմ տվյալների (' + p.length + '/30) ws:' + OTC_MSGS); return null; }
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
    const nearTop = last >= hi - 0.15 * R, nearBot = last <= lo + 0.15 * R; // ճշգրիտ կետ՝ դիմադրություն/աջակցություն
    const cs = candleSignal();
    const down = [z > 1.2, r > 68, dir > 0 && run >= 4, turnedDown].filter(Boolean).length + 2 * cs.down;
    const up = [z < -1.2, r < 30 + 2, dir < 0 && run >= 4, turnedUp].filter(Boolean).length + 2 * cs.up;
    // մոմի նմուշ + ևս 1 հաստատում
    const noC = cs.n < 6; // մոմեր չկան (սոկետ չկա)՝ աշխատում է առանց նմուշի
    if ((noC ? down >= 3 : cs.down > 0 && down >= 3) && down > up && turnedDown && nearTop) return 'down';
    if ((noC ? up >= 3 : cs.up > 0 && up >= 3) && up > down && turnedUp && nearBot) return 'up';
    log('մոմեր ' + cs.n + (nearTop ? ' | դիմադրության մոտ' : nearBot ? ' | աջակցության մոտ' : ' | մակարդակից հեռու') + ' | ազդանշան չկա (z ' + z.toFixed(1) + ', RSI ' + r.toFixed(0) + ')'); return null;
  }

  // Ճշգրիտ ժամանակ՝ մուտք միայն 5 վրկ մոմի սկզբում (առաջին ~0.4 վրկ)
  async function waitBoundary() {
    while (running && Date.now() % 5000 > 400) await sleep(40);
  }
  // Շղթա՝ $1 → շահում → $1.92 → $3.69 → $7.08 → վերջ, նորից $1. Պարտության դեպքում՝ $1
  async function trade() {
    await waitBoundary(); if (!running) return;
    const po = payout();
    if (!isNaN(po) && po < CFG.minPayout) { log('վճարումը ' + po + '% < ' + CFG.minPayout + '% → չեմ մտնում'); await sleep(1500); return; }
    const dir = direction();
    if (!dir) { await sleep(1000); return; }
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
    const win = after > before - amount + 0.001;
    if (win) { stats.w++; step++; if (step >= CFG.chain) { step = 0; log('✅ Շահեց · շղթան ավարտվեց → $1'); } else log('✅ Շահեց → հաջորդը $' + (CFG.base * Math.pow(CFG.mult, step)).toFixed(2)); }
    else { stats.l++; step = 0; log('❌ Պարտվեց → $1'); }
    showStats();
    // անմիջապես նոր գումարը դնել
    const next = +(CFG.base * Math.pow(CFG.mult, step)).toFixed(2);
    try { const ok = await setAmount(next); const i = findInput(); log('գումար → $' + next + (ok && i ? ' (դաշտում՝ ' + i.value + ')' : ' ✗ չստացվեց')); if (i) i.blur(); } catch (e) { log('setAmount սխալ: ' + e.message); }
  }

  let looping = false;
  async function loop() {
    if (looping) return; // երկրորդ ցիկլ չբացել
    looping = true;
    try { while (running) { await trade(); await sleep(1500); } }
    finally { looping = false; }
  }

  // UI
  const box = document.createElement('div');
  box.id='otcBox'; box.style.cssText = 'position:fixed;top:80px;right:10px;z-index:99999;background:#111;color:#fff;padding:10px;border-radius:8px;font:12px sans-serif;width:210px';
  box.innerHTML = '<button id="otcBtn" style="width:100%;padding:8px;font-weight:bold;background:#2a2;color:#fff;border:0;border-radius:6px;cursor:pointer">START</button><div id="otcLog" style="margin-top:6px;max-height:140px;overflow:auto"></div>';
  document.body.appendChild(box);
  // Քարշելու բռնակ
  const grip = document.createElement('div');
  grip.textContent = '⠿ տեղափոխել (v20)';
  grip.style.cssText = 'text-align:center;padding:6px;margin-bottom:6px;background:#333;border-radius:6px;cursor:move;touch-action:none;user-select:none';
  box.prepend(grip);
  let dx = 0, dy = 0, drag = false;
  grip.addEventListener('pointerdown', e => { drag = true; const r = box.getBoundingClientRect(); dx = e.clientX - r.left; dy = e.clientY - r.top; grip.setPointerCapture(e.pointerId); e.preventDefault(); });
  grip.addEventListener('pointermove', e => { if (!drag) return; box.style.left = Math.max(0, e.clientX - dx) + 'px'; box.style.top = Math.max(0, e.clientY - dy) + 'px'; box.style.right = 'auto'; });
  grip.addEventListener('pointerup', () => { drag = false; });
  const logEl = box.querySelector('#otcLog'); showStats();
  function log(t) { logEl.insertAdjacentHTML('afterbegin', `<div>${t}</div>`); }
  const syncBtn = () => { const b = box.querySelector('#otcBtn'); b.textContent = running ? 'STOP' : 'START'; b.style.background = running ? '#c22' : '#2a2'; };
  box.querySelector('#otcBtn').onclick = e => {
    running = !running;
    e.target.textContent = running ? 'STOP' : 'START';
    e.target.style.background = running ? '#c22' : '#2a2';
    if (running && !looping) loop();
  };
};
if (document.body) main(); else document.addEventListener('DOMContentLoaded', main);
