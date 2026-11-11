// node cover.mjs -> ../out/mayak_part2_cover.png (обложка 1080x1920)
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
  X.save(); X.fillStyle = '#000'; X.fillRect(0, 0, W, H); FN.shotFog(X, 3.4, 5, 64.9, [0.14, 2.14, 3.96]); X.restore();
  vignette(X, 7);
  bigText(X, 'КТО ОТВЕТИЛ?', W / 2, 280, 116, '#ffd60a', 1, -0.03, 30);
  bigText(X, 'В ТУМАНЕ — ЛОДКА', W / 2, 440, 84, '#ffffff', 1, 0, 20);
  bigText(X, 'ЧАСТЬ 2', W / 2, 1560, 110, '#ffd60a', 1, 0.02, 18);
});
await page.screenshot({ path: path.join(dir, '../out/mayak_part2_cover.png'), type: 'png' });
await browser.close();
