// Cover images (1600x1200) for the puzzle books, built from real rendered pages.
// Usage: node puzzle_previews.js <page_png_dir> <out_dir>
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const [dir = '../dist/pz', outDir = '../site/img'] = process.argv.slice(2);
const img = (f) => 'data:image/png;base64,' + fs.readFileSync(path.join(dir, f)).toString('base64');

const css = `*{box-sizing:border-box;margin:0}body{width:1600px;height:1200px;background:#F4F1EA;font-family:Inter,system-ui,sans-serif;color:#1F2A37;overflow:hidden;position:relative}
.label{position:absolute;left:90px;top:90px;width:620px}.brand{font-size:26px;font-weight:600;color:#2F7D5B;letter-spacing:.04em;text-transform:uppercase}
h1{font-size:74px;line-height:1.05;margin-top:22px;font-weight:800;letter-spacing:-.02em}.sub{font-size:30px;color:#4B5563;margin-top:26px;line-height:1.35}
.chips{display:flex;flex-wrap:wrap;gap:12px;margin-top:36px}.chip{background:#fff;border:2px solid #E2D9C6;border-radius:999px;padding:10px 20px;font-size:22px;font-weight:600;color:#2F7D5B}
.pg{position:absolute;width:540px;background:#fff;box-shadow:0 30px 60px rgba(31,42,55,.22);border-radius:6px}`;

const page = (title, sub, chips, pages) => `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>
<div class="label"><div class="brand">Penny &amp; Plan · Printable</div><h1>${title}</h1><div class="sub">${sub}</div>
<div class="chips">${chips.map((c) => `<span class="chip">${c}</span>`).join('')}</div></div>
${pages.map(([f, style]) => `<img class="pg" src="${img(f)}" style="${style}">`).join('')}</body></html>`;

const items = {
  'word-search-large-print': page('Large Print Word Search', '50 themed puzzles with big, easy-to-read letters.', ['50 puzzles', 'Answers', 'Letter + A4'],
    [['wsa-54.png', 'right:30px;top:330px;transform:rotate(5deg)'], ['ws-03.png', 'right:300px;top:110px;transform:rotate(-3deg)']]),
  'sudoku-puzzle-book': page('Sudoku: 120 Puzzles', 'Easy to expert. Every puzzle has exactly one solution.', ['120 puzzles', '4 levels', 'Answers'],
    [['su2-75.png', 'right:30px;top:330px;transform:rotate(5deg)'], ['su-04.png', 'right:300px;top:110px;transform:rotate(-3deg)']]),
  'mazes-for-kids': page('Mazes for Kids', '60 mazes for ages 5–10, from simple to tricky.', ['60 mazes', 'Ages 5–10', 'Solutions'],
    [['mz2-48.png', 'right:30px;top:330px;transform:rotate(5deg)'], ['mz-04.png', 'right:300px;top:110px;transform:rotate(-3deg)']]),
  'puzzle-bundle': page('The Puzzle Book Bundle', 'Word search, sudoku and mazes in one download. Save $4.', ['3 books', '230 puzzles', 'Letter + A4'],
    [['mz-04.png', 'right:-30px;top:380px;transform:rotate(8deg);width:440px'], ['su-04.png', 'right:170px;top:300px;transform:rotate(1deg);width:440px'], ['ws-03.png', 'right:380px;top:190px;transform:rotate(-6deg);width:440px']]),
  'christmas-party-games': page('Christmas Party Games', '9 printable games for kids, families and friends.', ['Scavenger hunt', 'Bingo', 'Trivia', '64 pages'],
    [['xh-04.png', 'right:-20px;top:380px;transform:rotate(7deg);width:460px'], ['xb-12.png', 'right:190px;top:300px;transform:rotate(1deg);width:460px'], ['xc-01.png', 'right:400px;top:170px;transform:rotate(-6deg);width:460px']]),
};

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1600, height: 1200 } });
  for (const [id, html] of Object.entries(items)) {
    await p.setContent(html, { waitUntil: 'load' });
    await p.screenshot({ path: path.join(outDir, `${id}.png`) });
    console.log('wrote', id);
  }
  await b.close();
})();
