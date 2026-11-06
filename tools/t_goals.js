const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const errs = [];
  const ctx = await b.newContext({ viewport: { width: 390, height: 900 } });
  await ctx.addInitScript(() => { window.__ym = []; window.ym = function () { window.__ym.push([].slice.call(arguments)); }; });
  await ctx.route(/^https?:\/\/(?!localhost)/, r => r.abort());
  const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:8765/kazino.html');
  await p.selectOption('[name=country]', 'kz');
  await p.$eval('a.casino-ref[data-casino="booi"]', a => { a.addEventListener('click', e => e.preventDefault()); a.click(); });
  await p.$eval('a.ref', a => { a.addEventListener('click', e => e.preventDefault()); a.click(); });
  const calls = await p.evaluate(() => window.__ym.filter(c => c[1] === 'reachGoal' || c[1] === 'params').map(c => c[1] + ':' + JSON.stringify(c[2])));
  console.log(calls.join('\n'));
  console.log('errors:', errs.join('; ') || 'none'); await b.close();
})();
