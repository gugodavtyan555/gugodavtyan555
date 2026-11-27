// ==UserScript==
// @name         Price Signal Overlay (RSI, display only)
// @match        *://*/*
// @grant        none
// ==/UserScript==
// Միայն ցուցադրում է ազդանշան։ Գործարք ՉԻ բացում։
(function () {
  'use strict';
  // ՓՈՓՈԽԻՐ՝ CSS selector-ը այն տարրի, որտեղ երևում է ընթացիկ գինը
  const PRICE_SELECTOR = '.current-price';
  const RSI_PERIOD = 14, OVERBOUGHT = 70, OVERSOLD = 30, TICK_MS = 1000;

  const prices = [];
  const box = document.createElement('div');
  box.style.cssText = 'position:fixed;top:10px;right:10px;z-index:99999;background:#111;color:#fff;padding:10px 14px;border-radius:8px;font:14px monospace;opacity:.9';
  box.textContent = 'Սպասում եմ տվյալների…';
  document.body.appendChild(box);

  function rsi(p, n) {
    if (p.length <= n) return null;
    let g = 0, l = 0;
    for (let i = p.length - n; i < p.length; i++) {
      const d = p[i] - p[i - 1];
      d >= 0 ? (g += d) : (l -= d);
    }
    if (l === 0) return 100;
    return 100 - 100 / (1 + g / l);
  }

  setInterval(() => {
    const el = document.querySelector(PRICE_SELECTOR);
    if (!el) { box.textContent = 'Selector-ը չի գտնվել'; return; }
    const v = parseFloat(el.textContent.replace(/[^\d.]/g, ''));
    if (isNaN(v)) return;
    prices.push(v);
    if (prices.length > 200) prices.shift();
    const r = rsi(prices, RSI_PERIOD);
    if (r === null) { box.textContent = `Տվյալներ՝ ${prices.length}/${RSI_PERIOD + 1}`; return; }
    let s = 'Չեզոք', c = '#fff';
    if (r >= OVERBOUGHT) { s = 'Գերգնված (հնարավոր անկում)'; c = '#f55'; }
    else if (r <= OVERSOLD) { s = 'Գերվաճառված (հնարավոր աճ)'; c = '#5f5'; }
    box.style.color = c;
    box.textContent = `Գին ${v} | RSI ${r.toFixed(1)} | ${s}`;
  }, TICK_MS);
})();
