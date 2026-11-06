// Vertical 1080x1920 slideshow video (no audio) from a JSON spec.
// Usage: node video.js spec.json out.mp4
// spec: {"brand": "...", "slides": [{"emoji": "🎁", "title": "...", "text": "...", "big": "..."}], "secs": 3.5}
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs'), path = require('path'), os = require('os');
const [specPath, out] = process.argv.slice(2);
const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
const esc = s => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;');
(async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vid-'));
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  const n = spec.slides.length;
  for (let i = 0; i < n; i++) {
    const s = spec.slides[i];
    await p.setContent(`<html><body style="margin:0;width:1080px;height:1920px;font-family:'DejaVu Sans';color:#fff;background:radial-gradient(1100px 1300px at 50% 30%,#4a2391,#0d0b1a);display:flex;flex-direction:column;justify-content:space-between;align-items:center;padding:120px 80px;box-sizing:border-box;text-align:center">
      <div style="font-size:52px;font-weight:700">🎰 Lucky <span style="color:#ffc940">Spin</span> Club</div>
      <div style="display:flex;flex-direction:column;align-items:center;gap:40px">
        ${s.emoji ? `<div style="font-size:220px;line-height:1">${s.emoji}</div>` : ''}
        ${s.title ? `<div class="t" style="font-size:96px;font-weight:800;line-height:1.12">${esc(s.title)}</div>` : ''}
        ${s.big ? `<div style="font-size:120px;font-weight:800;color:#ffc940;line-height:1.1">${esc(s.big)}</div>` : ''}
        ${s.text ? `<div class="x" style="font-size:58px;line-height:1.35;color:#e9e4ff;max-width:900px">${esc(s.text)}</div>` : ''}
      </div>
      <div style="display:flex;gap:30px;align-items:center;font-size:40px;color:#b3abd6"><span>${i + 1} / ${n}</span><span style="border:4px solid #ffc940;color:#ffc940;border-radius:999px;padding:4px 22px;font-weight:700">18+</span></div>
    </body></html>`);
    // shrink text that would overflow
    await p.evaluate(() => { for (const sel of ['.t', '.x']) { const e = document.querySelector(sel); if (!e) continue; let f = parseFloat(getComputedStyle(e).fontSize); while (document.body.scrollHeight > 1920 && f > 30) { f -= 4; e.style.fontSize = f + 'px'; } } });
    await p.screenshot({ path: path.join(dir, `s${i}.png`) });
  }
  await b.close();
  const secs = spec.secs || 3.5, fade = 0.5;
  const args = ['-y'];
  for (let i = 0; i < n; i++) args.push('-loop', '1', '-t', String(secs), '-i', path.join(dir, `s${i}.png`));
  let filter = '', last = '[0:v]';
  for (let i = 1; i < n; i++) {
    const offset = (secs - fade) * i;
    const lab = i === n - 1 ? '[v]' : `[x${i}]`;
    filter += `${last}[${i}:v]xfade=transition=fade:duration=${fade}:offset=${offset.toFixed(2)}${lab};`;
    last = lab;
  }
  if (n === 1) filter = '[0:v]null[v];';
  args.push('-filter_complex', filter.replace(/;$/, ''), '-map', '[v]', '-r', '30', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '23', '-movflags', '+faststart', out);
  execFileSync('ffmpeg', args, { stdio: 'ignore' });
  console.log('video:', out, (fs.statSync(out).size / 1e6).toFixed(1) + ' MB');
})();
