// ==UserScript==
// @name         OTC 10s Martingale Bot
// @match        *://*/*
// @grant        none
// ==/UserScript==
// Տեղադրում՝ Tampermonkey-ում։ Սկսիր DEMO հաշվով։
(() => {
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

  let running = false, step = 0, ticks = [], timer = null;
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
  function direction() {
    const p = num($(CFG.sel.price)); if (!isNaN(p)) ticks.push(p);
    ticks = ticks.slice(-20);
    if (ticks.length >= 6) {
      const a = ticks.slice(-3).reduce((x, y) => x + y) / 3;
      const b = ticks.slice(-6, -3).reduce((x, y) => x + y) / 3;
      if (a !== b) return a > b ? 'up' : 'down';
    }
    return Math.random() < 0.5 ? 'up' : 'down';
  }

  async function trade() {
    const amount = +(CFG.base * Math.pow(CFG.mult, step)).toFixed(2);
    if (!setAmount(amount)) { running = false; syncBtn(); return log('Գումարի դաշտը չգտնվեց'); }
    const dir = direction();
    const btn = findBtn(dir);
    if (!btn) { running = false; syncBtn(); return log('Կոճակը չգտնվեց'); }
    const before = bal();
    btn.click();
    log(`Խաղ #${step + 1}: $${amount} ${dir.toUpperCase()}`);
    await sleep((CFG.expirySec + 3) * 1000);
    const after = bal();
    const win = after > before - amount + 0.001; // վերադարձ > 0 → շահում
    if (win) { step = 0; log('✅ Շահեց → $' + CFG.base); }
    else { step++; if (step >= CFG.maxLoss) { step = 0; log('❌ 4 պարտություն → reset'); } else log('❌ Պարտվեց'); }
  }

  async function loop() {
    while (running) { await trade(); await sleep(1500); }
  }

  // UI
  const box = document.createElement('div');
  box.id='otcBox'; box.style.cssText = 'position:fixed;top:80px;right:10px;z-index:99999;background:#111;color:#fff;padding:10px;border-radius:8px;font:12px sans-serif;width:210px';
  box.innerHTML = '<button id="otcBtn" style="width:100%;padding:8px;font-weight:bold;background:#2a2;color:#fff;border:0;border-radius:6px;cursor:pointer">START</button><div id="otcLog" style="margin-top:6px;max-height:140px;overflow:auto"></div>';
  document.body.appendChild(box);
  const logEl = box.querySelector('#otcLog');
  function log(t) { logEl.insertAdjacentHTML('afterbegin', `<div>${t}</div>`); }
  const syncBtn = () => { const b = box.querySelector('#otcBtn'); b.textContent = running ? 'STOP' : 'START'; b.style.background = running ? '#c22' : '#2a2'; };
  box.querySelector('#otcBtn').onclick = e => {
    running = !running; step = 0;
    e.target.textContent = running ? 'STOP' : 'START';
    e.target.style.background = running ? '#c22' : '#2a2';
    if (running) loop();
  };
})();
