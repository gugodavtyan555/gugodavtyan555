// ==UserScript==
// @name         OTC 10s Martingale Bot
// @match        https://pocketoption.com/*
// @match        https://*.pocketoption.com/*
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
      amount: '.block--bet-amount input[type=text], input.bet-amount, .value__val input',
      up: '.btn-call, .action-high-low .btn-call',
      down: '.btn-put, .action-high-low .btn-put',
      balance: '.js-balance-demo, .js-balance-real, .balance-info-block__balance',
      price: '.current-symbol__price, .chart-price, .value__val-start', // ընտրովի
    },
  };

  let running = false, step = 0, ticks = [], timer = null;
  const $ = s => document.querySelector(s);
  const num = el => el ? parseFloat(el.textContent.replace(/[^0-9.]/g, '')) : NaN;
  const bal = () => num($(CFG.sel.balance));
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  function setAmount(v) {
    const i = $(CFG.sel.amount); if (!i) return false;
    const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    set.call(i, '$' + v.toFixed(2).replace(/\.00$/, ''));
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
    if (!setAmount(amount)) return log('Գումարի դաշտը չգտնվեց');
    const dir = direction();
    const btn = $(dir === 'up' ? CFG.sel.up : CFG.sel.down);
    if (!btn) return log('Կոճակը չգտնվեց');
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
  box.style.cssText = 'position:fixed;top:80px;right:10px;z-index:99999;background:#111;color:#fff;padding:10px;border-radius:8px;font:12px sans-serif;width:210px';
  box.innerHTML = '<button id="otcBtn" style="width:100%;padding:8px;font-weight:bold;background:#2a2;color:#fff;border:0;border-radius:6px;cursor:pointer">START</button><div id="otcLog" style="margin-top:6px;max-height:140px;overflow:auto"></div>';
  document.body.appendChild(box);
  const logEl = box.querySelector('#otcLog');
  function log(t) { logEl.insertAdjacentHTML('afterbegin', `<div>${t}</div>`); }
  box.querySelector('#otcBtn').onclick = e => {
    running = !running; step = 0;
    e.target.textContent = running ? 'STOP' : 'START';
    e.target.style.background = running ? '#c22' : '#2a2';
    if (running) loop();
  };
})();
