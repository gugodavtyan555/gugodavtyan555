// Фирменный пакет канала из персонажей и сцен роликов.
// node brand2.mjs -> ../out/yt2_banner.png, yt2_logo_clock.png, yt2_logo_tima.png, yt2_watermark.png
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const { chromium } = createRequire('/opt/node22/lib/node_modules/')('playwright');
const dir = path.dirname(fileURLToPath(import.meta.url));
const L1 = process.argv[2] || 'РОВНО', L2 = process.argv[3] || 'В ВОСЕМЬ', TAG = process.argv[4] || 'ИСТОРИИ, КОТОРЫЕ ЖДУТ ТЕБЯ КАЖДЫЙ ВЕЧЕР';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
page.on('pageerror', e => console.error('PAGE ERROR', e.message));
await page.goto('file://' + path.join(dir, '../mama3/page.html'));
await page.evaluate(() => window.ready);
const make = (w, h, kind) => page.evaluate(([w, h, kind, L1, L2, TAG]) => {
  const cv2 = document.createElement('canvas'); cv2.width = w; cv2.height = h; const c = cv2.getContext('2d');
  const grain = () => { c.save(); c.globalCompositeOperation = 'multiply'; c.globalAlpha = 0.5; for (let x = 0; x < w; x += 512) for (let y = 0; y < h; y += 512) c.drawImage(PG, x, y); c.restore(); };
  const bt = (t, x, y, size, fill, st) => { c.save(); c.font = `900 ${size}px M`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round'; c.shadowColor = 'rgba(0,0,0,0.55)'; c.shadowBlur = 30; c.shadowOffsetY = 12; c.strokeStyle = '#000'; c.lineWidth = st; c.strokeText(t, x, y); c.shadowColor = 'transparent'; c.fillStyle = fill; c.fillText(t, x, y); c.restore(); };
  const T = 0.6;
  if (kind === 'banner') {
    c.save(); c.beginPath(); c.rect(0, 0, 1280, h); c.clip(); c.translate(0, -300); c.scale(1.185, 1.185); room(c, T); c.restore();
    c.save(); c.beginPath(); c.rect(1280, 0, 1280, h); c.clip(); c.translate(1280, -300); c.scale(1.185, 1.185); veraRoom(c, T, { noPhone: true }); c.restore();
    c.fillStyle = 'rgba(25,15,40,0.42)'; c.fillRect(0, 0, w, h);
    const g = c.createLinearGradient(700, 0, 1860, 0); g.addColorStop(0, 'rgba(22,14,36,0)'); g.addColorStop(0.25, 'rgba(22,14,36,0.78)'); g.addColorStop(0.75, 'rgba(22,14,36,0.78)'); g.addColorStop(1, 'rgba(22,14,36,0)'); c.fillStyle = g; c.fillRect(700, 0, 1160, h);
    glow(c, 1280, 720, 620, 'rgba(255,200,120,A)', 0.16);
    const b = doll(c, { ...BOY, x: 660, y: 1110, s: 1.75, face: 1, noLegs: true, expr: { eyes: 'closed', mouth: 'smile', brow: 0.3 }, pose: { lean: 0.03, headTilt: 0.08, armL: [-2.3, -3.3], armR: [0.2, 0.5] } }); phoneMini(c, b.hf.x - 10, b.hf.y - 34, 0.12, 1.75, 0.5);
    const v = vera(c, { x: 1900, y: 1110, s: 1.7, face: -1, noLegs: true, expr: { eyes: 'closed', mouth: 'smile', brow: 0.3 }, pose: { lean: 0.03, headTilt: 0.08, armL: [-2.3, -3.3], armR: [0.2, 0.5] } }); phoneMini(c, v.hf.x + 10, v.hf.y - 34, -0.12, 1.7, 0.5);
    c.save(); c.strokeStyle = '#ffd60a'; c.lineWidth = 9; c.lineCap = 'round'; c.setLineDash([4, 26]); c.beginPath(); c.moveTo(b.head.x + 150, b.head.y - 110); c.quadraticCurveTo(1280, 430, v.head.x - 150, v.head.y - 110); c.stroke(); c.restore();
    c.font = '900 150px M'; const w1 = c.measureText(L1).width, cr = 66, tot = w1 + 30 + cr * 2, x0 = 1280 - tot / 2;
    bt(L1, x0 + w1 / 2, 622, 150, '#ffd60a', 30); clockP(c, x0 + w1 + 30 + cr, 618, cr, 20, 0);
    bt(L2, 1280, 772, 150, '#ffd60a', 30);
    let s2 = 46; c.font = `900 ${s2}px M`; const tw = c.measureText(TAG).width; if (tw > 900) s2 = Math.floor(s2 * 900 / tw); bt(TAG, 1280, 884, s2, '#ffffff', 11);
    grain();
  } else if (kind === 'clock' || kind === 'mark') {
    if (kind === 'clock') { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#3a5564'); g.addColorStop(1, '#507282'); c.fillStyle = g; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(255,255,255,0.04)'; for (let x = -20; x < w; x += 90) c.fillRect(x, 0, 44, h); glow(c, w / 2, h / 2, w * 0.62, 'rgba(255,205,130,A)', 0.5); }
    const r = w * (kind === 'clock' ? 0.34 : 0.44); c.save(); if (kind === 'mark') c.globalAlpha = 0.92;
    paper(c, '#ffd60a', () => c.arc(w / 2, h / 2, r * 1.13, 0, 7), kind === 'clock' ? 40 : 6, kind === 'clock' ? 20 : 3, 0.4);
    clockP(c, w / 2, h / 2, r, 20, 0); c.restore();
    if (kind === 'clock') grain();
  } else {
    const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#5a4a8a'); g.addColorStop(0.6, '#d2707c'); g.addColorStop(1, '#f8b66a'); c.fillStyle = g; c.fillRect(0, 0, w, h); glow(c, w / 2, h * 0.75, w * 0.7, 'rgba(255,220,150,A)', 0.6);
    const b = doll(c, { ...BOY, x: 400, y: 1080, s: 3.0, face: 1, noLegs: true, expr: { eyes: 'closed', mouth: 'smile', brow: 0.3 }, pose: { lean: 0.02, headTilt: 0.06, armL: [-2.3, -3.3], armR: [0.2, 0.5] } }); phoneMini(c, b.hf.x - 18, b.hf.y - 56, 0.12, 3.0, 0.5);
    grain();
  }
  return cv2.toDataURL('image/png');
}, [w, h, kind, L1, L2, TAG]);
for (const [w, h, kind, out] of [[2560, 1440, 'banner', 'yt2_banner.png'], [800, 800, 'clock', 'yt2_logo_clock.png'], [800, 800, 'tima', 'yt2_logo_tima.png'], [150, 150, 'mark', 'yt2_watermark.png']]) {
  const url = await make(w, h, kind);
  fs.writeFileSync(path.join(dir, '../out', out), Buffer.from(url.split(',')[1], 'base64'));
}
await browser.close();
