// node cover.mjs -> ../out/mama_part1_cover.png
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
  X.save(); X.fillStyle = '#000'; X.fillRect(0, 0, W, H); FN.shotRoom(X, 2.0, 3.6, 2.0, []); X.restore(); finish(X);
  bigText(X, 'ОН ЗВОНИТ МАМЕ', W / 2, 250, 90, '#ffd60a', 1, -0.03, 22);
  bigText(X, 'А ОНА НЕ ОТВЕЧАЕТ', W / 2, 400, 80, '#ffffff', 1, 0, 16);
  bigText(X, 'ЧАСТЬ 1', W / 2, 1600, 110, '#ffd60a', 1, 0.02, 20);
});
await page.screenshot({ path: path.join(dir, '../out/mama_part1_cover.png'), type: 'png' });
await browser.close();
