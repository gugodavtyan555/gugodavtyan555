const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const errs = [];
  for (const [path, w] of [['kalkulyator.html',1200],['kalkulyator.html',375],['es/kalkulyator.html',375],['pt/kalkulyator.html',1200],['widget/wager.html?lang=pt',360],['widget/wager.html',600]]) {
    const p = await b.newPage({ viewport: { width: w, height: 900 } });
    p.on('pageerror', e => errs.push(path + ': ' + e.message));
    await p.goto('http://localhost:8765/' + path);
    const r = await p.evaluate(() => {
      const o = n => document.querySelector('[data-out="'+n+'"]').textContent;
      return { turn: o('turnover'), spins: o('spins'), loss: o('loss'), ev: o('ev'), v: o('verdict'), overflow: document.documentElement.scrollWidth > innerWidth, forms: document.querySelectorAll('form.calc').length };
    });
    await p.fill('[name="wager"]', '20');
    const r2 = await p.evaluate(() => document.querySelector('[data-out="ev"]').textContent + ' | ' + document.querySelector('.calc-verdict').className);
    console.log(path, w, JSON.stringify(r), '| x20:', r2);
    if (path === 'kalkulyator.html' && w === 375) await p.screenshot({ path: '/tmp/claude-0/-workspace/8aeb4342-0200-5c82-93a5-effabca2f09f/scratchpad/calc-m.png', fullPage: false });
    await p.close();
  }
  // link checks on pages containing promo
  const p = await b.newPage();
  for (const path of ['index.html','articles/chto-takoe-vejdzher.html','articles/frispiny.html','articles/kak-poluchit-bonus.html','es/index.html','pt/articles/frispiny.html','es/articles/chto-takoe-vejdzher.html','kalkulyator.html','es/kalkulyator.html']) {
    await p.goto('http://localhost:8765/' + path);
    const links = await p.$$eval('a[href]', as => as.map(a => a.href).filter(h => h.startsWith('http://localhost')));
    let bad = [];
    for (const l of [...new Set(links)]) { const r = await p.request.get(l.split('#')[0]); if (r.status() !== 200) bad.push(l); }
    const promo = await p.$$eval('.calc-promo a', a => a.map(x => x.getAttribute('href')));
    console.log(path, 'promo:', promo.join(','), 'bad:', bad.join(',') || 'none');
  }
  console.log('errors:', errs.join('; ') || 'none'); await b.close();
})();
