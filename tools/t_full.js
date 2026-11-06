const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const ROOT = '/home/user/gugodavtyan555/ru-site';
(async () => {
  const files = []; (function walk(d) { for (const f of fs.readdirSync(d)) { const fp = path.join(d, f); if (fs.statSync(fp).isDirectory()) walk(fp); else if (f.endsWith('.html')) files.push(path.relative(ROOT, fp)); } })(ROOT);
  const b = await chromium.launch(); const bad = []; const errs = [];
  for (const f of files.sort()) {
    if (f === '404.html') continue;
    const ctx = await b.newContext({ viewport: { width: 390, height: 800 } }); const p = await ctx.newPage();
    p.on('pageerror', e => errs.push(f + ': ' + e.message));
    await p.goto('http://localhost:8765/' + f, { waitUntil: 'load' }); await p.waitForTimeout(150);
    const lg = /^(en|es|pt)\//.test(f) ? f.slice(0, 2) : 'ru';
    const r = await p.evaluate(() => {
      const q = s => document.querySelectorAll(s);
      let ldbad = 0, faqq = []; q('script[type="application/ld+json"]').forEach(s => { try { const j = JSON.parse(s.textContent); if (j['@type'] === 'FAQPage') faqq.push(j.mainEntity.length); } catch (e) { ldbad++; } });
      return { ov: document.documentElement.scrollWidth > innerWidth, cookie: !!document.querySelector('.cookie-bar') && getComputedStyle(document.querySelector('.cookie-bar')).display !== 'none',
        metrika: !!window.lscMetrikaLoaded, og: !!document.querySelector('meta[property="og:image"]'), langs: q('.langs a').length,
        header: [...q('header nav a.link')].map(a => a.getAttribute('href')), foot: [...q('footer a')].map(a => a.getAttribute('href')),
        cover: (() => { const i = document.querySelector('img.cover'); return i ? i.complete && i.naturalWidth > 0 : null; })(),
        rel: q('.related .card').length, logos: [...q('img.logo')].map(i => i.complete && i.naturalWidth > 0),
        refs: [...q('a.ref')].map(a => a.getAttribute('href')), cref: [...q('a.casino-ref')].map(a => a.href),
        tg: q('a[href="https://t.me/luckyspinclub_ru"]').length, ldbad, faqq, schema: !!document.querySelector('script[data-lsc="schema"]'),
        links: [...q('a[href]')].filter(a => !a.closest('.lang-bar,.cookie-bar')).map(a => a.href).filter(h => h.startsWith('http://localhost')),
        calc: (document.querySelector('[data-out=turnover]') || document.querySelector('[data-out=loss]') || {}).textContent };
    });
    const B = m => bad.push(f + ': ' + m);
    const isWidget = f.startsWith('widget/');
    if (r.ov) B('overflow'); if (r.ldbad) B('bad json-ld'); if (r.metrika) B('metrika loaded');
    for (const l of r.links) { const lp = decodeURIComponent(new URL(l).pathname).replace(/\/$/, '/index.html'); if (!fs.existsSync(ROOT + lp)) B('broken ' + lp); }
    if (r.calc !== undefined && (!r.calc || r.calc === '—')) B('calc empty');
    if (!isWidget) {
      if (!r.cookie) B('no cookie bar'); if (!r.og) B('no og'); if (r.langs !== 4) B('langs ' + r.langs); if (!r.schema) B('no schema');
      if (!r.header.some(h => h.endsWith('kazino.html'))) B('no kazino header'); if (!r.header.some(h => h.endsWith('stati.html'))) B('no hub header');
      if (!r.foot.some(h => h.endsWith('o-sajte.html')) || !r.foot.some(h => h.endsWith('privacy.html'))) B('footer');
      if (r.logos.some(x => !x)) B('logo not loaded');
      const own = (lg === 'ru' ? '' : lg + '/') + 'kazino.html';
      for (const h of r.refs) { const abs = path.normalize(path.join(path.dirname(f), h)); if (abs !== own) B('ref ' + h); }
      if (r.cref.some(h => h.startsWith('http://localhost'))) B('casino-ref local');
      if (lg === 'ru' && r.tg < 2) B('tg ' + r.tg);
      if (/articles\//.test(f)) { if (r.cover !== true) B('cover ' + r.cover); if (r.rel !== 3) B('related ' + r.rel); if (r.faqq.join() !== '3') B('faq ' + r.faqq); }
    }
    await ctx.close();
  }
  console.log('pages:', files.length - 1, '\nproblems:', bad.join('\n') || 'none', '\nerrors:', errs.join('; ') || 'none'); await b.close();
})();
