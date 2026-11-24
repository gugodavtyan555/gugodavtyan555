// ==UserScript==
// @name         OTC Bot v4
// @match        *://*/*
// @grant        none
// @run-at       document-start
// ==/UserScript==
// Տեղադրում՝ Tampermonkey-ում։ Սկսիր DEMO հաշվով։
// WebSocket hook՝ գները ուղիղ սոկետից
const OTC_WS = {};
(() => {
  const feed = d => {
    const m = String(d).match(/\["([A-Za-z0-9_#]+)",\s*(\d{9,11}(?:\.\d+)?),\s*(\d+(?:\.\d+)?)/g);
    if (!m) return;
    m.forEach(x => {
      const r = x.match(/\["([A-Za-z0-9_#]+)",\s*(\d{9,11}(?:\.\d+)?),\s*(\d+(?:\.\d+)?)/);
      (OTC_WS[r[1]] = OTC_WS[r[1]] || []).push(parseFloat(r[3]));
      if (OTC_WS[r[1]].length > 300) OTC_WS[r[1]].shift();
    });
  };
  const handle = d => {
    if (typeof d === 'string') feed(d);
    else if (d instanceof Blob) { const f = new FileReader(); f.onload = () => feed(f.result); f.readAsText(d); }
    else if (d instanceof ArrayBuffer) feed(new TextDecoder().decode(d));
  };
  const W = window.WebSocket;
  if (!W) return;
  const P = function (...a) { const w = new W(...a); w.addEventListener('message', e => { try { handle(e.data); } catch (_) {} }); return w; };
  P.prototype = W.prototype;
  ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'].forEach(k => P[k] = W[k]);
  window.WebSocket = P;
})();

const main = () => {
  'use strict';
  const CFG = {
    base: 1,            // սկզբնական գումար
    mult: 1.92,         // բազմապատկիչ պարտվելուց հետո
    maxLoss: 4,         // 4 անընդմեջ պարտությունից հետո՝ վերադառնալ base
    expirySec: 10,
    // Սելեկտորներ (եթե կայքը փոխվի՝ ուղղիր այստեղ)
    sel: {
      amount: '.block--bet-amount input[type=text], input.bet-amount, input.input-control__input, input[type=tel], .value__val input',
      up: 'button.call-btn, .call-btn, .btn-call, .action-high-low .btn-call',
      down: 'button.put-btn, .put-btn, .btn-put, .action-high-low .btn-put',
      balance: '.usermenu__info-balance, .js-balance-demo, .js-balance-real, .balance-info-block__balance',
      price: '.current-symbol__price, .chart-price, .value__val-start', // ընտրովի
    },
  };

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

  function setAmount(v) {
    const i = findInput(); if (!i) return false;
    const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    set.call(i, String(v));
    i.dispatchEvent(new Event('input', { bubbles: true }));
    i.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
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
  function livePrices() {
    const k = symKey();
    let ws = null;
    Object.keys(OTC_WS).forEach(n => { if (k && n.toLowerCase().replace('#', '') === k) ws = OTC_WS[n]; });
    if (!ws) { let mx = 0; Object.keys(OTC_WS).forEach(n => { if (OTC_WS[n].length > mx) { mx = OTC_WS[n].length; ws = OTC_WS[n]; } }); }
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
  // Մուտք միայն երբ EMA, RSI և վերջին տիկերը համընկնում են, հակառակ դեպքում՝ սպասում
  function direction() {
    const raw = livePrices();
    const p = raw.filter((x, i) => i === 0 || x !== raw[i - 1]); // միայն փոփոխվող տիկեր
    if (p.length < 12) { log('սպասում եմ տվյալների (' + p.length + '/12)'); return null; }
    const f = ema(p, 5), sl = ema(p, 20), r = rsi(p), l3 = p.slice(-3);
    const up3 = l3[2] >= l3[1] && l3[1] >= l3[0], dn3 = l3[2] <= l3[1] && l3[1] <= l3[0];
    if (f > sl && r > 52 && r < 75 && up3) return 'up';
    if (f < sl && r < 48 && r > 25 && dn3) return 'down';
    log('ազդանշան չկա (RSI ' + r.toFixed(0) + ')'); return null;
  }

  async function trade() {
    const amount = +(CFG.base * Math.pow(CFG.mult, step)).toFixed(2);
    if (!setAmount(amount)) { running = false; syncBtn(); return log('Գումարի դաշտը չգտնվեց'); }
    const dir = direction();
    if (!dir) { await sleep(1000); return; }
    const btn = findBtn(dir);
    if (!btn) { running = false; syncBtn(); return log('Կոճակը չգտնվեց'); }
    const before = bal();
    btn.click();
    log(`Խաղ #${step + 1}: $${amount} ${dir.toUpperCase()}`);
    await sleep((CFG.expirySec + 3) * 1000);
    const after = bal();
    const win = after > before - amount + 0.001; // վերադարձ > 0 → շահում
    if (win) { step = 0; streak++; log('✅ Շահեց (' + streak + '/1)'); if (streak >= 1) { running = false; syncBtn(); log('🎯 1 շահում՝ կանգ'); } }
    else { streak = 0; step++; if (step >= CFG.maxLoss) { step = 0; log('❌ 4 պարտություն → reset'); } else log('❌ Պարտվեց'); }
  }

  async function loop() {
    while (running) { await trade(); await sleep(1500); }
  }

  // UI
  const box = document.createElement('div');
  box.id='otcBox'; box.style.cssText = 'position:fixed;top:80px;right:10px;z-index:99999;background:#111;color:#fff;padding:10px;border-radius:8px;font:12px sans-serif;width:210px';
  box.innerHTML = '<button id="otcBtn" style="width:100%;padding:8px;font-weight:bold;background:#2a2;color:#fff;border:0;border-radius:6px;cursor:pointer">START</button><div id="otcLog" style="margin-top:6px;max-height:140px;overflow:auto"></div>';
  document.body.appendChild(box);
  // Քարշելու բռնակ
  const grip = document.createElement('div');
  grip.textContent = '⠿ տեղափոխել (v4)';
  grip.style.cssText = 'text-align:center;padding:6px;margin-bottom:6px;background:#333;border-radius:6px;cursor:move;touch-action:none;user-select:none';
  box.prepend(grip);
  let dx = 0, dy = 0, drag = false;
  grip.addEventListener('pointerdown', e => { drag = true; const r = box.getBoundingClientRect(); dx = e.clientX - r.left; dy = e.clientY - r.top; grip.setPointerCapture(e.pointerId); e.preventDefault(); });
  grip.addEventListener('pointermove', e => { if (!drag) return; box.style.left = Math.max(0, e.clientX - dx) + 'px'; box.style.top = Math.max(0, e.clientY - dy) + 'px'; box.style.right = 'auto'; });
  grip.addEventListener('pointerup', () => { drag = false; });
  const logEl = box.querySelector('#otcLog');
  function log(t) { logEl.insertAdjacentHTML('afterbegin', `<div>${t}</div>`); }
  const syncBtn = () => { const b = box.querySelector('#otcBtn'); b.textContent = running ? 'STOP' : 'START'; b.style.background = running ? '#c22' : '#2a2'; };
  box.querySelector('#otcBtn').onclick = e => {
    running = !running; step = 0;
    e.target.textContent = running ? 'STOP' : 'START';
    e.target.style.background = running ? '#c22' : '#2a2';
    if (running) loop();
  };
};
if (document.body) main(); else document.addEventListener('DOMContentLoaded', main);
