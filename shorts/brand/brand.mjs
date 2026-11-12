// node brand.mjs "НАЗВАНИЕ" "слоган" -> ../out/yt_banner.png (2560x1440), ../out/yt_avatar.png (800x800)
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const { chromium } = createRequire('/opt/node22/lib/node_modules/')('playwright');
const dir = path.dirname(fileURLToPath(import.meta.url));
const NAME = process.argv[2] || 'ТЁПЛЫЙ СВЕТ', TAG = process.argv[3] || 'ИСТОРИИ, КОТОРЫЕ ТРОГАЮТ ДО СЛЁЗ';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
page.on('pageerror', e => console.error('PAGE ERROR', e.message));
await page.goto('file://' + path.join(dir, '../mama3/page.html'));
await page.evaluate(() => window.ready);
const make = async (w, h, kind) => page.evaluate(([w, h, kind, NAME, TAG]) => {
  const cv2 = document.createElement('canvas'); cv2.width = w; cv2.height = h; const c = cv2.getContext('2d');
  const lh = (x, by, hh) => { // бумажный маяк
    const wb = hh * 0.26, wt = hh * 0.16, ty = by - hh * 0.78;
    paper(c, '#f6efe2', () => { c.moveTo(x - wb / 2, by); c.lineTo(x - wt / 2, ty); c.lineTo(x + wt / 2, ty); c.lineTo(x + wb / 2, by); c.closePath(); }, hh * 0.04, hh * 0.02, 0.35);
    c.save(); c.beginPath(); c.moveTo(x - wb / 2, by); c.lineTo(x - wt / 2, ty); c.lineTo(x + wt / 2, ty); c.lineTo(x + wb / 2, by); c.closePath(); c.clip(); c.fillStyle = '#c9564a'; for (const k of [0.1, 0.42, 0.74]) c.fillRect(x - wb, ty + (by - ty) * k, wb * 2, (by - ty) * 0.16); c.restore();
    paper(c, '#3a2d3d', () => c.rect(x - wt * 0.95, ty - hh * 0.03, wt * 1.9, hh * 0.03), 6, 3, 0.3);
    glow(c, x, ty - hh * 0.1, hh * 0.55, 'rgba(255,220,140,A)', 0.6);
    paper(c, '#ffe7ad', () => c.rect(x - wt * 0.32, ty - hh * 0.16, wt * 0.64, hh * 0.13), 6, 3, 0.25);
    paper(c, '#8a3c40', () => { c.moveTo(x - wt * 0.46, ty - hh * 0.16); c.quadraticCurveTo(x, ty - hh * 0.3, x + wt * 0.46, ty - hh * 0.16); c.closePath(); }, 6, 3, 0.3);
    return { x, y: ty - hh * 0.1 };
  };
  const beamP = (L, dir, len, sp) => { c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createLinearGradient(L.x, 0, L.x + dir * len, 0); g.addColorStop(0, 'rgba(255,236,170,0.55)'); g.addColorStop(1, 'rgba(255,236,170,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(L.x, L.y - 8); c.lineTo(L.x + dir * len, L.y - len * sp); c.lineTo(L.x + dir * len, L.y + len * sp * 0.6); c.lineTo(L.x, L.y + 8); c.fill(); c.restore(); };
  const sky = () => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#2c2a5a'); g.addColorStop(0.5, '#8a4f80'); g.addColorStop(0.8, '#e48a6a'); g.addColorStop(1, '#f8c27a'); c.fillStyle = g; c.fillRect(0, 0, w, h); };
  const grain = () => { c.save(); c.globalCompositeOperation = 'multiply'; c.globalAlpha = 0.55; for (let x = 0; x < w; x += 512) for (let y = 0; y < h; y += 512) c.drawImage(PG, x, y); c.restore(); };
  if (kind === 'banner') {
    sky(); const r = rng(5); c.fillStyle = '#fff'; for (let i = 0; i < 160; i++) { c.globalAlpha = 0.3 + r() * 0.7; c.beginPath(); c.arc(r() * w, r() * h * 0.5, 1.5 + r() * 2.5, 0, 7); c.fill(); } c.globalAlpha = 1;
    glow(c, w / 2, h * 0.86, 900, 'rgba(255,220,150,A)', 0.6);
    for (const [cx, cy, cw] of [[420, 330, 240], [1500, 250, 300], [2150, 400, 220]]) paper(c, 'rgba(255,225,215,0.75)', () => { c.ellipse(cx, cy, cw, 44, 0, 0, 7); c.ellipse(cx + cw * 0.3, cy - 36, cw * 0.5, 44, 0, 0, 7); }, 16, 8, 0.18);
    const hill = (pts, col) => paper(c, col, () => { c.moveTo(-50, h + 50); pts.forEach(([x, y], i) => i ? c.quadraticCurveTo(pts[i - 1][0] + (x - pts[i - 1][0]) / 2, Math.min(y, pts[i - 1][1]) - 40, x, y) : c.lineTo(x, y)); c.lineTo(w + 50, h + 50); c.closePath(); }, 40, -16, 0.3);
    hill([[-50, 1040], [500, 960], [1100, 1060], [1700, 980], [2610, 1050]], '#6a4478');
    const L = lh(2050, 1030, 520); beamP(L, -1, 1500, 0.1);
    hill([[-50, 1160], [600, 1100], [1300, 1190], [2000, 1110], [2610, 1180]], '#4a3060');
    // домик с тёплым окном
    paper(c, '#3a2d50', () => { c.rect(380, 960, 300, 230); c.moveTo(350, 960); c.lineTo(530, 820); c.lineTo(710, 960); c.closePath(); }, 24, 12, 0.35);
    glow(c, 530, 1070, 260, 'rgba(255,205,130,A)', 0.8); paper(c, '#ffd98a', () => c.roundRect(470, 1010, 120, 120, 12), 8, 4, 0.25); c.fillStyle = '#3a2d50'; c.fillRect(526, 1010, 8, 120); c.fillRect(470, 1066, 120, 8);
    hill([[-50, 1290], [700, 1250], [1400, 1310], [2100, 1260], [2610, 1300]], '#2c1d40');
    grain();
    const bt = (t, y, size, fill, st) => { c.save(); c.font = `900 ${size}px M`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round'; c.shadowColor = 'rgba(0,0,0,0.55)'; c.shadowBlur = 30; c.shadowOffsetY = 12; c.strokeStyle = '#000'; c.lineWidth = st; c.strokeText(t, w / 2, y); c.shadowColor = 'transparent'; c.fillStyle = fill; c.fillText(t, w / 2, y); c.restore(); };
    let size = 210; c.font = `900 ${size}px M`; const tw = c.measureText(NAME).width; if (tw > 1400) size = Math.floor(size * 1400 / tw);
    bt(NAME, 660, size, '#ffd60a', 34);
    let s2 = 64; c.font = `900 ${s2}px M`; const tw2 = c.measureText(TAG).width; if (tw2 > 1440) s2 = Math.floor(s2 * 1440 / tw2);
    bt(TAG, 820, s2, '#ffffff', 16);
  } else {
    sky(); const r = rng(8); c.fillStyle = '#fff'; for (let i = 0; i < 40; i++) { c.globalAlpha = 0.3 + r() * 0.7; c.beginPath(); c.arc(r() * w, r() * h * 0.5, 1.5 + r() * 2.5, 0, 7); c.fill(); } c.globalAlpha = 1;
    paper(c, '#6a4478', () => { c.moveTo(-20, 640); c.quadraticCurveTo(300, 560, 820, 650); c.lineTo(820, 820); c.lineTo(-20, 820); c.closePath(); }, 24, -10, 0.3);
    const L = lh(400, 660, 560); beamP(L, -1, 520, 0.16); beamP(L, 1, 520, 0.16);
    paper(c, '#2c1d40', () => { c.moveTo(-20, 720); c.quadraticCurveTo(420, 640, 820, 730); c.lineTo(820, 820); c.lineTo(-20, 820); c.closePath(); }, 24, -10, 0.3);
    grain();
  }
  return cv2.toDataURL('image/png');
}, [w, h, kind, NAME, TAG]);
import fs from 'node:fs';
for (const [w, h, kind, out] of [[2560, 1440, 'banner', 'yt_banner.png'], [800, 800, 'avatar', 'yt_avatar.png']]) {
  const url = await make(w, h, kind);
  fs.writeFileSync(path.join(dir, '../out', out), Buffer.from(url.split(',')[1], 'base64'));
}
await browser.close();
