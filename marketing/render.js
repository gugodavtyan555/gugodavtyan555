const { chromium } = require('playwright');
(async () => {
  const dir = process.argv[2], FPS = 30;
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await p.goto('file://' + dir + '/reel.html'); await p.evaluate(() => document.fonts.ready);
  const total = await p.evaluate(() => DUR) * FPS;
  for (let f = 0; f < total; f++) {
    await p.evaluate((t) => render(t), f / FPS);
    await p.screenshot({ path: `${dir}/frames/f${String(f).padStart(4, '0')}.jpg`, type: 'jpeg', quality: 92 });
  }
  await b.close(); console.log('frames', total);
})();
