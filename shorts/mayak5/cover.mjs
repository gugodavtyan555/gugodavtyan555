// node cover.mjs -> ../out/mayak_part5_cover.png (обложка 1080x1920)
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const { chromium } = createRequire('/opt/node22/lib/node_modules/')('playwright');
const dir = path.dirname(fileURLToPath(import.meta.url));
const DATA = JSON.parse(fs.readFileSync(path.join(dir, 'work/data.json'), 'utf8'));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
page.on('pageerror', e => console.error('PAGE ERROR', e.message));
await page.goto('file://' + path.join(dir, 'page.html'));
await page.evaluate(d => { window.DATA = d; }, DATA);
await page.evaluate(() => window.ready);
await page.evaluate(() => {
  X.save(); X.fillStyle = '#000'; X.fillRect(0, 0, W, H); FN.shotEmptyBed(X, 1.3, 6, 1.3, [0.5]); X.restore();
  vignette(X, 7);
  bigText(X, 'ФИНАЛ', W / 2, 270, 210, '#ffd60a', 1, -0.03, 30);
  bigText(X, 'ГДЕ ЛЁША?', W / 2, 450, 110, '#ffffff', 1, 0, 20);
  bigText(X, 'ЧАСТЬ 5', W / 2, 1600, 110, '#ffd60a', 1, 0.02, 18);
});
await page.screenshot({ path: path.join(dir, '../out/mayak_part5_cover.png'), type: 'png' });
await browser.close();
