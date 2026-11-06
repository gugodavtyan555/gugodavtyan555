const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const jobs = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
  for (const j of jobs) {
    await p.setContent(`<html><body style="margin:0;width:1200px;height:630px;box-sizing:border-box;overflow:hidden;font-family:'DejaVu Sans',sans-serif;color:#f4f1ff;background:radial-gradient(900px 600px at 20% 0%,#4a2391 0%,#1a1236 55%,#0d0b1a 100%);display:flex;align-items:center;gap:56px;padding:0 72px">
      <div style="font-size:200px;line-height:1;flex:none">${j.icon}</div>
      <div style="min-width:0;flex:1">
        <div style="font-size:36px;font-weight:800">🎰 Lucky <span style="color:#ffc940">Spin</span> Club</div>
        <div style="display:inline-block;margin-top:20px;border:3px solid #ffc940;color:#ffc940;border-radius:999px;padding:6px 20px;font-size:24px;font-weight:700;text-transform:uppercase;letter-spacing:1px">${esc(j.label)}</div>
        <div class="h" style="font-size:60px;font-weight:800;line-height:1.1;margin-top:22px">${esc(j.title)}</div>
        <div style="margin-top:26px;font-size:24px;color:#b3abd6">lucky-spin-ru.netlify.app · 18+</div>
      </div></body></html>`);
    await p.evaluate(() => {
      const h = document.querySelector('.h'); let s = 60;
      while ((h.scrollWidth > h.clientWidth || h.getBoundingClientRect().bottom > 560) && s > 30) { s -= 2; h.style.fontSize = s + 'px'; }
    });
    await p.waitForTimeout(80);
    fs.mkdirSync(path.dirname(j.out), { recursive: true });
    await p.screenshot({ path: j.out, type: 'jpeg', quality: 82 });
  }
  await b.close();
})();
