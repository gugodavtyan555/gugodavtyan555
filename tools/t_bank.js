const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const ROOT = '/home/user/gugodavtyan555/ru-site';
(async () => {
  const b = await chromium.launch(); const errs = [];
  for (const [u, w] of [['kalkulyator-bankrolla.html',1200],['kalkulyator-bankrolla.html',375],['es/kalkulyator-bankrolla.html',375],['pt/kalkulyator-bankrolla.html',390],['widget/bankroll.html?lang=es',360]]) {
    const p = await b.newPage({ viewport: { width: w, height: 1000 } });
    p.on('pageerror', e => errs.push(u + ': ' + e.message));
    const t0 = Date.now(); await p.goto('http://localhost:8765/' + u);
    await p.waitForTimeout(300);
    const g = () => p.evaluate(() => ({ loss: document.querySelector('[data-out=loss]').textContent, profit: document.querySelector('[data-out=profit]').textContent, bust: document.querySelector('[data-out=bust]').textContent, med: document.querySelector('[data-out=median]').textContent, lines: document.querySelectorAll('[data-out=chart] polyline').length, ov: document.documentElement.scrollWidth > innerWidth }));
    const r1 = await g();
    await p.selectOption('[name=vol]', 'high'); await p.waitForTimeout(400); const r2 = await g();
    await p.fill('[name=spins]', '5000'); const t1 = Date.now(); await p.waitForTimeout(600); const r3 = await g();
    console.log(u, w, 'mid', JSON.stringify(r1), '| high', r2.profit, r2.bust, r2.med, '| 5000 spins', r3.loss, r3.bust);
    if (u === 'kalkulyator-bankrolla.html' && w === 375) { await p.fill('[name=spins]', '500'); await p.waitForTimeout(500); const el = await p.$('form.calc'); await el.screenshot({ path: '/tmp/claude-0/-workspace/8aeb4342-0200-5c82-93a5-effabca2f09f/scratchpad/bank-m.png' }); }
    await p.close();
  }
  // all pages: errors, overflow, JSON-LD parse, internal links
  const files = []; (function walk(d) { for (const f of fs.readdirSync(d)) { const fp = path.join(d, f); if (fs.statSync(fp).isDirectory()) walk(fp); else if (f.endsWith('.html')) files.push(path.relative(ROOT, fp)); } })(ROOT);
  const ctx = await b.newContext({ viewport: { width: 390, height: 800 } }); const p = await ctx.newPage(); const bad = [];
  p.on('pageerror', e => errs.push(p.url() + ': ' + e.message));
  for (const f of files) {
    if (f === '404.html') continue;
    await p.goto('http://localhost:8765/' + f);
    const r = await p.evaluate(() => {
      let ld = 0, ldbad = 0; document.querySelectorAll('script[type="application/ld+json"]').forEach(s => { try { JSON.parse(s.textContent); ld++; } catch (e) { ldbad++; } });
      return { ov: document.documentElement.scrollWidth > innerWidth, ld, ldbad, links: [...document.querySelectorAll('a[href]')].filter(a => !a.closest('.lang-bar,.cookie-bar')).map(a => a.href).filter(h => h.startsWith('http://localhost')) };
    });
    if (r.ov) bad.push(f + ' overflow'); if (r.ldbad) bad.push(f + ' bad json-ld');
    for (const l of r.links) { const lp = decodeURIComponent(new URL(l).pathname).replace(/\/$/, '/index.html'); if (!fs.existsSync(ROOT + lp)) bad.push(f + ' -> ' + lp); }
  }
  console.log('pages checked:', files.length, 'problems:', bad.join('; ') || 'none');
  console.log('errors:', errs.join('; ') || 'none'); await b.close();
})();
