const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const errs = [];
  const p = await b.newPage({ viewport: { width: 390, height: 900 } }); p.on('pageerror', e => errs.push(e.message));
  const vis = () => p.$$eval('.casino', els => els.filter(e => !e.hidden).map(e => e.querySelector('a.casino-ref').dataset.casino).join(','));
  for (const [u, tests] of [['kazino.html', [['kz', ''], ['', 'CRYPTO'], ['tr', ''], ['br', 'RUB'], ['other', 'RUB'], ['pe', 'PLN']]], ['es/kazino.html', [['mx', 'MXN'], ['ru', '']]], ['pt/kazino.html', [['br', 'BRL'], ['tr', 'TRY']]], ['en/kazino.html', [['ca', 'CAD']]]]) {
    await p.goto('http://localhost:8765/' + u);
    console.log(u, 'all:', await vis(), '| options:', await p.$$eval('[name=country] option', o => o.length), await p.$$eval('[name=cur] option', o => o.map(x => x.value).join('/')));
    for (const [c, cu] of tests) { await p.selectOption('[name=country]', c); await p.selectOption('[name=cur]', cu); console.log('  ', c || '-', cu || '-', '=>', await vis(), '|', await p.$eval('.finder-res', e => e.textContent)); }
  }
  await p.goto('http://localhost:8765/kazino.html'); await p.selectOption('[name=country]', 'kz'); await p.screenshot({ path: '/tmp/claude-0/-workspace/8aeb4342-0200-5c82-93a5-effabca2f09f/scratchpad/finder.png', fullPage: false });
  console.log('errors:', errs.join('; ') || 'none'); await b.close();
})();
