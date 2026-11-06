const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const errs = [];
  const Q = {
    'index.html': ['как отыграть бонус', 'что такое RTP', 'не могу вывести деньги', 'какие документы нужны', 'мартингейл работает?', 'что такое скаттер', 'фриспины сгорают', 'абракадабра'],
    'es/index.html': ['cómo retirar dinero', 'qué es el rollover', 'giros gratis caducan', 'ruleta americana'],
    'pt/articles/frispiny.html': ['como sacar o bônus', 'o que é RTP', 'blackjack seguro'],
    'en/index.html': ['what is wagering', 'withdraw money'],
  };
  for (const [u, qs] of Object.entries(Q)) {
    const p = await b.newPage({ viewport: { width: 375, height: 800 } }); p.on('pageerror', e => errs.push(u + ': ' + e.message));
    await p.goto('http://localhost:8765/' + u);
    for (const q of qs) {
      await p.fill('#ask-q', q); await p.press('#ask-q', 'Enter'); await p.waitForTimeout(250);
      const r = await p.$$eval('.ask-res .ask-item, .ask-res .ask-none', els => els.map(e => e.querySelector('b') ? e.querySelector('b').textContent + ' → ' + e.querySelector('a').getAttribute('href') : 'NONE'));
      console.log(u, '|', q, '=>', r.slice(0, 2).join('  ||  '));
    }
    const links = await p.$$eval('.ask-res a', as => as.map(a => a.href));
    await p.close();
  }
  console.log('errors:', errs.join('; ') || 'none'); await b.close();
})();
