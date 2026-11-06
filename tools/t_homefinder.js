const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const errs = [];
  for (const [u, c, cur] of [['index.html', 'kz', 'KZT'], ['es/index.html', 'mx', 'MXN'], ['pt/index.html', 'br', 'BRL'], ['en/index.html', 'ca', 'CAD']]) {
    const p = await b.newPage({ viewport: { width: 375, height: 900 } }); p.on('pageerror', e => errs.push(u + ': ' + e.message));
    await p.goto('http://localhost:8765/' + u);
    const vis = () => p.$$eval('.fh-item', els => els.filter(e => !e.hidden).map(e => e.querySelector('a.casino-ref').dataset.casino).join(','));
    const all = await vis();
    const hrefs = await p.$$eval('.fh-item a.casino-ref', as => as.every(a => /^https:\/\//.test(a.href)));
    await p.selectOption('[name=country]', c); await p.selectOption('[name=cur]', cur);
    const r = await p.evaluate(() => ({ res: document.querySelector('.finder-res').textContent, ov: document.documentElement.scrollWidth > innerWidth, top: Math.round(document.querySelector('#finder').getBoundingClientRect().top + scrollY) }));
    console.log(u, '| all:', all, '| external hrefs:', hrefs, '|', c, cur, '=>', await vis(), '|', r.res, '| overflow:', r.ov, '| finder at y=', r.top);
    if (u === 'index.html') {
      await p.selectOption('[name=cur]', '');
      await p.evaluate(() => { const c = document.querySelector('.cookie-bar'); if (c) c.remove(); document.querySelector('.home-finder').scrollIntoView(); });
      await (await p.$('.home-finder')).screenshot({ path: '/tmp/claude-0/-workspace/8aeb4342-0200-5c82-93a5-effabca2f09f/scratchpad/homefinder.png' });
    }
    await p.close();
  }
  console.log('errors:', errs.join('; ') || 'none'); await b.close();
})();
