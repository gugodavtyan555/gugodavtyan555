// Бренд-пакет «ДРАМУЛЬТ»: собственный маскот-капля, плоские фирменные цвета, словесный знак.
// node brand3.mjs -> ../out/dm_banner.png (2560x1440), dm_logo.png (800x800), dm_watermark.png (150x150)
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const { chromium } = createRequire('/opt/node22/lib/node_modules/')('playwright');
const dir = path.dirname(fileURLToPath(import.meta.url));
const NAME = process.argv[2] || 'ДРАМУЛЬТ', TAG = process.argv[3] || 'МУЛЬТ-ДРАМЫ ПО СЕРИЯМ', SCHED = process.argv[4] || 'НОВАЯ СЕРИЯ КАЖДЫЙ ДЕНЬ';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
page.on('pageerror', e => console.error('PAGE ERROR', e.message));
await page.goto('file://' + path.join(dir, '../mama3/page.html'));
await page.evaluate(() => window.ready);
const make = (w, h, kind) => page.evaluate(([w, h, kind, NAME, TAG, SCHED]) => {
  const cv2 = document.createElement('canvas'); cv2.width = w; cv2.height = h; const c = cv2.getContext('2d');
  const Y = '#ffd60a', IND = '#1d1a3d', COR = '#ff5a6e';
  // маскот-капля
  const drop = (x, y, s, e = 'smile', flat = false) => {
    c.save(); c.translate(x, y); c.scale(s, s);
    const body = () => { c.moveTo(0, -150); c.bezierCurveTo(26, -96, 112, -30, 112, 44); c.bezierCurveTo(112, 108, 62, 152, 0, 152); c.bezierCurveTo(-62, 152, -112, 108, -112, 44); c.bezierCurveTo(-112, -30, -26, -96, 0, -150); };
    c.save(); if (!flat) { c.shadowColor = 'rgba(10,6,30,0.4)'; c.shadowBlur = 30; c.shadowOffsetY = 16; } const g = c.createLinearGradient(0, -150, 0, 152); g.addColorStop(0, '#9be0ff'); g.addColorStop(1, '#3d9cf2'); c.fillStyle = g; c.beginPath(); body(); c.fill(); c.restore();
    c.strokeStyle = '#14122c'; c.lineWidth = 12; c.lineJoin = 'round'; c.beginPath(); body(); c.closePath(); c.stroke();
    c.fillStyle = 'rgba(255,255,255,0.75)'; c.beginPath(); c.ellipse(-52, 10, 16, 34, 0.35, 0, 7); c.fill();
    c.fillStyle = 'rgba(255,90,110,0.45)'; c.beginPath(); c.ellipse(-62, 78, 22, 13, 0, 0, 7); c.ellipse(62, 78, 22, 13, 0, 0, 7); c.fill();
    c.fillStyle = '#14122c'; c.strokeStyle = '#14122c'; c.lineWidth = 11; c.lineCap = 'round';
    if (e === 'cry') { for (const ex of [-38, 38]) { c.beginPath(); c.arc(ex, 50, 17, 1.15 * Math.PI, 1.85 * Math.PI); c.stroke(); } c.beginPath(); c.arc(0, 112, 20, 1.2 * Math.PI, 1.8 * Math.PI); c.stroke(); c.fillStyle = '#eaf8ff'; c.beginPath(); c.ellipse(60, 84, 9, 15, 0, 0, 7); c.fill(); }
    else if (e === 'wow') { for (const ex of [-38, 38]) { c.fillStyle = '#fff'; c.beginPath(); c.ellipse(ex, 44, 22, 26, 0, 0, 7); c.fill(); c.fillStyle = '#14122c'; c.beginPath(); c.ellipse(ex, 46, 11, 14, 0, 0, 7); c.fill(); } c.beginPath(); c.ellipse(0, 100, 13, 18, 0, 0, 7); c.fill(); }
    else { for (const ex of [-38, 38]) { c.beginPath(); c.ellipse(ex, 44, 13, 18, 0, 0, 7); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(ex + 4, 37, 5, 0, 7); c.fill(); c.fillStyle = '#14122c'; } c.beginPath(); c.arc(0, 82, 26, 0.12 * Math.PI, 0.88 * Math.PI); c.stroke(); }
    c.restore();
  };
  const bt = (t, x, y, size, fill, st, rot = 0) => { c.save(); c.translate(x, y); c.rotate(rot); c.font = `900 ${size}px M`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round'; c.shadowColor = 'rgba(0,0,0,0.5)'; c.shadowBlur = 26; c.shadowOffsetY = 12; c.strokeStyle = '#000'; c.lineWidth = st; c.strokeText(t, 0, 0); c.shadowColor = 'transparent'; c.fillStyle = fill; c.fillText(t, 0, 0); c.restore(); };
  if (kind === 'banner') {
    c.fillStyle = IND; c.fillRect(0, 0, w, h);
    const g = c.createRadialGradient(w / 2, h / 2, 100, w / 2, h / 2, 1500); g.addColorStop(0, '#3a2f7a'); g.addColorStop(1, IND); c.fillStyle = g; c.fillRect(0, 0, w, h);
    const r = rng(11); c.globalAlpha = 0.1;
    for (let i = 0; i < 90; i++) { const x = r() * w, y = r() * h, s = 0.14 + r() * 0.16, k = i % 3; c.save(); c.translate(x, y); c.rotate((r() - 0.5) * 0.8); c.fillStyle = k == 0 ? '#9be0ff' : k == 1 ? Y : COR; c.beginPath(); if (k == 0) { c.moveTo(0, -150 * s); c.bezierCurveTo(26 * s, -96 * s, 112 * s, -30 * s, 112 * s, 44 * s); c.bezierCurveTo(112 * s, 108 * s, 62 * s, 152 * s, 0, 152 * s); c.bezierCurveTo(-62 * s, 152 * s, -112 * s, 108 * s, -112 * s, 44 * s); c.bezierCurveTo(-112 * s, -30 * s, -26 * s, -96 * s, 0, -150 * s); } else if (k == 1) { c.moveTo(-90 * s, -110 * s); c.lineTo(110 * s, 0); c.lineTo(-90 * s, 110 * s); c.closePath(); } else { const q = s * 3; c.moveTo(0, 30 * q); c.bezierCurveTo(-70 * q, -20 * q, -40 * q, -70 * q, 0, -34 * q); c.bezierCurveTo(40 * q, -70 * q, 70 * q, -20 * q, 0, 30 * q); } c.fill(); c.restore(); }
    c.globalAlpha = 1;
    drop(650, 730, 1.05, 'cry'); drop(1910, 730, 1.05, 'wow'); drop(330, 760, 0.7, 'smile'); drop(2230, 760, 0.7, 'smile');
    let size = 190; c.font = `900 ${size}px M`; const tw = c.measureText(NAME).width; if (tw > 960) size = Math.floor(size * 960 / tw);
    bt(NAME, 1280, 640, size, Y, 34, -0.02);
    bt(TAG, 1280, 790, 58, '#ffffff', 16);
    c.save(); c.font = '900 40px M'; const sw = c.measureText(SCHED).width + 80; c.translate(1280, 876); c.fillStyle = COR; c.strokeStyle = '#14122c'; c.lineWidth = 8; c.beginPath(); c.roundRect(-sw / 2, -34, sw, 68, 34); c.fill(); c.stroke(); c.fillStyle = '#fff'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(SCHED, 0, 3); c.restore();
  } else if (kind === 'logo') {
    c.fillStyle = Y; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(255,255,255,0.22)'; c.beginPath(); c.arc(w / 2, h / 2, 330, 0, 7); c.fill();
    drop(w / 2, h / 2 + 6, 1.9, 'cry');
  } else { drop(w / 2, h / 2, 0.44, 'smile', true); }
  return cv2.toDataURL('image/png');
}, [w, h, kind, NAME, TAG, SCHED]);
for (const [w, h, kind, out] of [[2560, 1440, 'banner', 'dm_banner.png'], [800, 800, 'logo', 'dm_logo.png'], [150, 150, 'mark', 'dm_watermark.png']]) {
  const url = await make(w, h, kind);
  fs.writeFileSync(path.join(dir, '../out', out), Buffer.from(url.split(',')[1], 'base64'));
}
await browser.close();
