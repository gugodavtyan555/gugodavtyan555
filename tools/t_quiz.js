const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const errs = [];
  for (const lg of ['', 'es/', 'pt/']) {
    const p = await b.newPage({ viewport: { width: 375, height: 800 } }); p.on('pageerror', e => errs.push(lg + e.message));
    await p.goto('http://localhost:8765/' + lg + 'viktorina.html');
    const items = await p.$$('.qz-item'); let i = 0;
    for (const it of items) {
      const c = await it.getAttribute('data-correct');
      const pick = i % 3 ? c : (c === 'm' ? 'f' : 'm');
      await (await it.$('button[data-a="' + pick + '"]')).click(); i++;
    }
    const r = await p.evaluate(() => ({ score: document.querySelector('.qz-score').textContent, text: document.querySelector('.qz-text').textContent.slice(0, 50), tg: document.querySelector('.qz-tg').href.slice(0, 60), ov: document.documentElement.scrollWidth > innerWidth, expl: document.querySelectorAll('.qz-expl:not([hidden])').length }));
    console.log(lg || 'ru/', 'quiz', JSON.stringify(r));
    if (!lg) {
      await p.evaluate(() => { const c = document.querySelector('.cookie-bar'); if (c) c.remove(); });
      await (await p.$('.qz-item')).screenshot({ path: '/tmp/claude-0/-workspace/8aeb4342-0200-5c82-93a5-effabca2f09f/scratchpad/quiz.png' });
    }
    await p.goto('http://localhost:8765/' + lg + 'samoproverka.html');
    await p.click('.st-go'); const inc = await p.$eval('.st-result', e => e.textContent);
    for (const [n, ans] of [[0, []], [1, [1]], [3, [0, 2, 5]]]) {
      for (let k = 0; k < 8; k++) await p.check('input[name=q' + k + '][value="' + (ans.includes(k) ? 1 : 0) + '"]');
      await p.click('.st-go');
      console.log('  selftest', n, '->', await p.$eval('.st-result', e => e.className + ' | ' + e.querySelector('h2').textContent));
    }
    console.log('  incomplete msg:', inc.slice(0, 40));
    await p.close();
  }
  console.log('errors:', errs.join('; ') || 'none'); await b.close();
})();
