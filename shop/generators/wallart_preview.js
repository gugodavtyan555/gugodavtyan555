// Cover image (1600x1200) and a 6-print overview for the boho wall art set.
// Usage: node wallart_preview.js <thumb_dir> <out_dir>
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const [dir = '../dist/pz', outDir = '../site/img'] = process.argv.slice(2);
const img = (n) => 'data:image/jpeg;base64,' + fs.readFileSync(path.join(dir, `wa-${n}.jpg`)).toString('base64');

const frame = (n, x, y, w) => `<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;padding:${w * 0.07}px;background:#fff;
  border:${w * 0.035}px solid #B88A5A;box-shadow:0 18px 40px rgba(60,40,20,.28)"><img src="${img(n)}" style="width:100%;display:block"></div>`;

const cover = `<!doctype html><html><head><meta charset="utf-8"><style>*{margin:0;box-sizing:border-box}
body{width:1600px;height:1200px;background:linear-gradient(#EDE4D8,#E4D8C8);font-family:Inter,system-ui,sans-serif;color:#3A3230;position:relative;overflow:hidden}
.floor{position:absolute;left:0;right:0;bottom:0;height:150px;background:#C9B092}
.label{position:absolute;left:80px;top:80px;width:520px}.brand{font-size:26px;font-weight:600;color:#9E4A2F;letter-spacing:.04em;text-transform:uppercase}
h1{font-size:72px;line-height:1.05;margin-top:20px;font-weight:800;letter-spacing:-.02em}.sub{font-size:28px;color:#6B5E54;margin-top:24px;line-height:1.35}
.chips{display:flex;flex-wrap:wrap;gap:12px;margin-top:34px}.chip{background:#fff;border:2px solid #E2D2BE;border-radius:999px;padding:10px 20px;font-size:22px;font-weight:600;color:#9E4A2F}
</style></head><body><div class="floor"></div>
<div class="label"><div class="brand">Penny &amp; Plan · Printable</div><h1>Boho Wall Art Set of 6</h1>
<div class="sub">Mid-century prints in warm earth tones. Download, print and frame.</div>
<div class="chips"><span class="chip">6 prints</span><span class="chip">5 sizes each</span><span class="chip">300 dpi</span><span class="chip">Up to 24x36</span></div></div>
${frame('01-Sun-and-Hills', 680, 120, 300)}${frame('02-Rainbow-Arches', 1010, 70, 300)}${frame('05-Balanced-Stones', 1340, 120, 230)}
${frame('03-Bauhaus-Shapes', 760, 610, 230)}${frame('04-Boho-Leaves', 1020, 560, 230)}${frame('06-Golden-Waves', 1280, 600, 230)}
</body></html>`;

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1600, height: 1200 } });
  await p.setContent(cover, { waitUntil: 'load' });
  await p.screenshot({ path: path.join(outDir, 'boho-wall-art.png') });
  await b.close();
  console.log('wrote boho-wall-art');
})();
