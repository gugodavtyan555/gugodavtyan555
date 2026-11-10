// Рендер: node render.mjs [stills]  -> work/video.mp4 (без звука) или кадры-превью
import { createRequire } from 'node:module';
const { chromium } = createRequire('/opt/node22/lib/node_modules/')('playwright');
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const FPS = 30, OFFSET = 0.5, DUR = 15.0;
const words = JSON.parse(fs.readFileSync(path.join(dir, 'work/words.json'), 'utf8'));
const HL = new Set(['маяк.', 'ходят.', 'смеются.', 'ждёт.', 'ответили.']);
// группировка слов в чанки субтитров (индексы слов)
const groups = [[0, 1], [2, 3], [4], [5, 6], [7, 8], [9, 10], [11, 12], [13, 14], [15], [16, 17, 18], [19, 20], [21, 22, 23], [24], [25]];
const chunks = groups.map(g => ({
  t: g.map(i => words[i][0]).join(' ').replace(/[.,…]/g, ''),
  s: words[g[0]][1] + OFFSET, e: words[g[g.length - 1]][2] + OFFSET,
  hl: g.some(i => HL.has(words[i][0])),
}));
const ws = i => words[i][1] + OFFSET;
const cuts = [0, ws(5) - 0.12, ws(11) - 0.12, ws(16) - 0.12, ws(21) - 0.2, DUR];
const DATA = { chunks, cuts, dur: DUR, outro: cuts[4] + 4.75 };

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
page.on('pageerror', e => console.error('PAGE ERROR', e.message));
await page.goto('file://' + path.join(dir, 'page.html'));
await page.evaluate(d => { window.DATA = d; }, DATA);
await page.evaluate(() => window.ready);

if (process.argv[2] === 'stills') {
  const ts = (process.argv[3] || '1.5,3.8,6.0,7.9,9.5,11.5,14.0').split(',').map(Number);
  for (const t of ts) {
    await page.evaluate(([t, f]) => window.renderFrame(t, f), [t, Math.round(t * FPS)]);
    await page.screenshot({ path: path.join(dir, `work/still_${t}.jpg`), type: 'jpeg', quality: 80 });
  }
} else {
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', path.join(dir, 'work/video.mp4')], { stdio: ['pipe', 'inherit', 'inherit'] });
  const n = Math.round(DUR * FPS);
  for (let f = 0; f < n; f++) {
    await page.evaluate(([t, f]) => window.renderFrame(t, f), [f / FPS, f]);
    const buf = await page.screenshot({ type: 'jpeg', quality: 96 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  console.log('video ok', n, 'frames');
}
await browser.close();
