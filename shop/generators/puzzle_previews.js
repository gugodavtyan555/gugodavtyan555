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
  'thanksgiving-party-games': page('Thanksgiving Party Games', '9 printable games for the whole family.', ['Trivia', 'Bingo', 'Table Talk', '67 pages'],
    [['th-04.png', 'right:-20px;top:380px;transform:rotate(7deg);width:460px'], ['tb-12.png', 'right:190px;top:300px;transform:rotate(1deg);width:460px'], ['tc-01.png', 'right:400px;top:170px;transform:rotate(-6deg);width:460px']]),
  'murder-mystery-mistletoe-manor': page('Murder at Mistletoe Manor', 'A Christmas murder mystery party for 6–8 players.', ['8 suspects', '20 clues', 'Host script', '34 pages'],
    [['me-27.png', 'right:-20px;top:380px;transform:rotate(7deg);width:460px'], ['mb-11.png', 'right:190px;top:300px;transform:rotate(1deg);width:460px'], ['mc-01.png', 'right:400px;top:170px;transform:rotate(-6deg);width:460px']]),
  'new-years-eve-party-games': page("New Year's Eve Party Games", '9 printable games to count down to 2027.', ['Trivia', 'Bingo', 'Year in Review', '67 pages'],
    [['nr-63.png', 'right:-20px;top:380px;transform:rotate(7deg);width:460px'], ['nb-12.png', 'right:190px;top:300px;transform:rotate(1deg);width:460px'], ['nc-01.png', 'right:400px;top:170px;transform:rotate(-6deg);width:460px']]),
  'escape-room-clockwork-lab': page('Escape the Clockwork Lab', 'A printable escape room for kids aged 7–12.', ['6 puzzles', '45 minutes', 'Hint cards', 'Certificate'],
    [['e8-08.png', 'right:-20px;top:380px;transform:rotate(7deg);width:460px'], ['e5-05.png', 'right:190px;top:300px;transform:rotate(1deg);width:460px'], ['e1-01.png', 'right:400px;top:170px;transform:rotate(-6deg);width:460px']]),
  'resume-templates': page('Resume Templates Bundle', '5 one-page designs + cover letters for Word and Google Docs.', ['5 designs', 'Cover letters', 'Word + Docs', 'Letter + A4'],
    [['rs-Executive-1.png', 'right:-20px;top:380px;transform:rotate(7deg);width:460px'], ['rs-Two-Column-1.png', 'right:190px;top:300px;transform:rotate(1deg);width:460px'], ['rs-Modern-1.png', 'right:400px;top:170px;transform:rotate(-6deg);width:460px']]),
  'armenian-alphabet-kids': page('Armenian Alphabet for Kids', 'All 39 letters: colour, trace and learn. Հայոց այբուբեն.', ['39 letters', 'Tracing', 'Flashcards', 'Poster'],
    [['hl-04.png', 'right:-20px;top:380px;transform:rotate(7deg);width:460px'], ['hp-03.png', 'right:190px;top:300px;transform:rotate(1deg);width:460px'], ['hc-01.png', 'right:400px;top:170px;transform:rotate(-6deg);width:460px']]),
  'wedding-planner-bundle': page('Wedding Planner + Shower Games', 'Budget, guests, vendors and checklist in one spreadsheet, plus 9 shower games.', ['Excel + Sheets', 'Guest list', 'Checklist', 'Shower games'],
    [['bh-03.png', 'right:-20px;top:380px;transform:rotate(7deg);width:460px'], ['wd-02.png', 'right:190px;top:300px;transform:rotate(1deg);width:460px'], ['bc-01.png', 'right:400px;top:170px;transform:rotate(-6deg);width:460px']]),
  'free-puzzle-sampler': page('Free Puzzle Sampler', 'Word search, sudoku and mazes to try at home. Free download.', ['FREE', 'Word search', 'Sudoku', 'Mazes'],
    [['mz-04.png', 'right:-20px;top:380px;transform:rotate(7deg);width:460px'], ['su-04.png', 'right:190px;top:300px;transform:rotate(1deg);width:460px'], ['fp-01.png', 'right:400px;top:170px;transform:rotate(-6deg);width:460px']]),
  'free-christmas-games': page('Free Christmas Party Games', 'Trivia, word scramble and finish the carol. Free download.', ['FREE', 'Trivia', 'Word scramble', 'Answers'],
    [['fc-06.png', 'right:-20px;top:380px;transform:rotate(7deg);width:460px'], ['fc-03.png', 'right:190px;top:300px;transform:rotate(1deg);width:460px'], ['fc-01.png', 'right:400px;top:170px;transform:rotate(-6deg);width:460px']]),
  'free-wedding-checklist': page('Free Wedding Checklist', '33 tasks from 12 months out to the big day. Free download.', ['FREE', '12 months', 'Printable', 'Letter + A4'],
    [['fw-03.png', 'right:-20px;top:380px;transform:rotate(7deg);width:460px'], ['fw-02.png', 'right:190px;top:300px;transform:rotate(1deg);width:460px'], ['fw-01.png', 'right:400px;top:170px;transform:rotate(-6deg);width:460px']]),
  'holiday-party-mega-bundle': page('Holiday Party Mega Bundle', 'Christmas games, a murder mystery, New Year\'s Eve games and a gift budget. Save $15.', ['4 products', 'Christmas', 'Murder mystery', 'New Year'],
    [['nc-01.png', 'right:-20px;top:380px;transform:rotate(7deg);width:460px'], ['mc-01.png', 'right:190px;top:300px;transform:rotate(1deg);width:460px'], ['xc-01.png', 'right:400px;top:170px;transform:rotate(-6deg);width:460px']]),
  'valentines-day-party-games': page("Valentine's Day Party Games", '9 printable games for kids, classrooms and families.', ['Scavenger hunt', 'Bingo', 'Trivia', '67 pages'],
    [['vh-04.png', 'right:-20px;top:380px;transform:rotate(7deg);width:460px'], ['vb-12.png', 'right:190px;top:300px;transform:rotate(1deg);width:460px'], ['vc-01.png', 'right:400px;top:170px;transform:rotate(-6deg);width:460px']]),
  'big-game-football-party-games': page('Big Game Football Party Games', '9 printable games for game day: squares, predictions, bingo and more.', ['Squares pool', 'Predictions', 'Bingo', '64 pages'],
    [['gs-04.png', 'right:-20px;top:380px;transform:rotate(7deg);width:460px'], ['gb-15.png', 'right:190px;top:300px;transform:rotate(1deg);width:460px'], ['gc-01.png', 'right:400px;top:170px;transform:rotate(-6deg);width:460px']]),
};

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1600, height: 1200 } });
  const only = (process.argv[4] || '').split(',').filter(Boolean);
  for (const [id, html] of Object.entries(items)) {
    if (only.length && !only.includes(id)) continue;
    await p.setContent(html, { waitUntil: 'load' });
    await p.screenshot({ path: path.join(outDir, `${id}.png`) });
    console.log('wrote', id);
  }
  await b.close();
})();
