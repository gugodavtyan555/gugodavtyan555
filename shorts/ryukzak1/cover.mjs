// node cover.mjs <shotFn> <t> <dur> "<строка1>" "<строка2>" "<часть>" <out.png>
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const { chromium } = createRequire('/opt/node22/lib/node_modules/')('playwright');
const dir = path.dirname(fileURLToPath(import.meta.url));
const [fn, t, d, l1, l2, part, out] = process.argv.slice(2);
const DATA = JSON.parse(fs.readFileSync(path.join(dir, 'work/data.json'), 'utf8'));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
page.on('pageerror', e => console.error('PAGE ERROR', e.message));
await page.goto('file://' + path.join(dir, 'page.html'));
await page.evaluate(d => { window.DATA = d; }, DATA);
await page.evaluate(() => window.ready);
await page.evaluate(([fn, t, d, l1, l2, part]) => {
  X.save(); X.fillStyle = '#000'; X.fillRect(0, 0, W, H); FN[fn](X, t, d, t, [0.14]); X.restore(); finish(X);
  const fit = (s, size) => { X.font = `900 ${size}px M`; const w = X.measureText(s).width; return w > 980 ? Math.floor(size * 980 / w) : size; };
  bigText(X, l1, W / 2, 250, fit(l1, 120), '#ffd60a', 1, -0.03, 22);
  bigText(X, l2, W / 2, 400, fit(l2, 80), '#ffffff', 1, 0, 16);
  bigText(X, part, W / 2, 1600, 110, '#ffd60a', 1, 0.02, 20);
}, [fn, +t, +d, l1, l2, part]);
await page.screenshot({ path: out, type: 'png' });
await browser.close();
