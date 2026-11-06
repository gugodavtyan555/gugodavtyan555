// Renders brand images: profile logo (800x800) and a profile cover (1920x1080).
// Usage: node brand.js   (writes ../brand/)
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'brand');
fs.mkdirSync(OUT, { recursive: true });
const img = (id) => 'data:image/png;base64,' + fs.readFileSync(path.join(ROOT, 'site', 'img', id + '.png')).toString('base64');

const logo = `<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;box-sizing:border-box}body{width:800px;height:800px;background:#2F7D5B;display:flex;align-items:center;justify-content:center;font-family:Inter,system-ui,sans-serif}
.c{width:560px;height:560px;border-radius:50%;background:#EEF4F0;display:flex;flex-direction:column;align-items:center;justify-content:center}
.m{font-size:200px;font-weight:800;color:#2F7D5B;letter-spacing:-.04em;line-height:1}.m span{color:#1F2A37}
.t{font-size:42px;font-weight:700;color:#1F2A37;margin-top:14px;letter-spacing:.02em}
</style></head><body><div class="c"><div class="m">P<span>&amp;</span>P</div><div class="t">Penny &amp; Plan</div></div></body></html>`;

const cover = `<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;box-sizing:border-box}body{width:1920px;height:1080px;background:#EEF4F0;font-family:Inter,system-ui,sans-serif;color:#1F2A37;position:relative;overflow:hidden}
.txt{position:absolute;left:110px;top:300px;width:700px}
.b{font-size:34px;font-weight:700;color:#2F7D5B;letter-spacing:.06em;text-transform:uppercase}
h1{font-size:82px;line-height:1.02;font-weight:800;letter-spacing:-.02em;margin-top:24px}
p{font-size:38px;color:#4B5563;margin-top:28px;line-height:1.3}
.card{position:absolute;width:700px;border-radius:22px;box-shadow:0 30px 70px rgba(31,42,55,.22);border:1px solid #D9DEE3;overflow:hidden;background:#fff}
.card img{display:block;width:100%}
</style></head><body>
<div class="txt"><div class="b">Penny &amp; Plan</div><h1>Spreadsheets that do the math for you</h1>
<p>Budget, debt, savings and small business templates for Excel &amp; Google Sheets.</p></div>
<div class="card" style="right:-40px;top:80px;transform:rotate(3deg)"><img src="${img('debt-payoff-planner')}"></div>
<div class="card" style="right:180px;top:480px;transform:rotate(-3deg)"><img src="${img('budget-planner')}"></div>
</body></html>`;

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 800, height: 800 } });
  await p.setContent(logo); await p.screenshot({ path: path.join(OUT, 'pinterest-profile-logo.png') });
  await p.setViewportSize({ width: 1920, height: 1080 });
  await p.setContent(cover, { waitUntil: 'load' }); await p.screenshot({ path: path.join(OUT, 'pinterest-cover.jpg'), type: 'jpeg', quality: 90 });
  await b.close();
  console.log('wrote brand images to', OUT);
})();
