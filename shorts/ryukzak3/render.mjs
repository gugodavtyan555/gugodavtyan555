// node render.mjs data            -> work/data.json
// node render.mjs stills 1.5,3.8  -> work/still_*.jpg
// node render.mjs seg <from> <to> <name> -> work/<name>.mp4 (кадры [from,to))
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const { chromium } = createRequire('/opt/node22/lib/node_modules/')('playwright');

const dir = path.dirname(fileURLToPath(import.meta.url));
const FPS = 30, OFFSET = 0.5;
const words = JSON.parse(fs.readFileSync(path.join(dir, 'work/words.json'), 'utf8'));
// предложения
const sent = []; let cur = [];
words.forEach((w, i) => { cur.push(i); if (/[.?!…]$/.test(w[0])) { sent.push(cur); cur = []; } });
if (cur.length) sent.push(cur);
const ss = i => words[sent[i][0]][1] + OFFSET;          // старт предложения (видео-время)
const se = i => words[sent[i][sent[i].length - 1]][2] + OFFSET;
const DUR = Math.ceil((se(sent.length - 1) + 5.5) * 2) / 2;

// субтитры
const HL = ['дрогнул', 'рукав', 'головой', 'сказала.', 'спала', 'ждал', 'стул.', 'парту.', 'Лиза.', 'класс.', 'было.', 'температурой', 'год.', 'всё.', 'декабрь', 'машину', 'компота', 'молчал', 'плакал', 'парты', 'Дима', 'один.', 'пятеро', 'голоса.', 'видел.', 'колонку', 'четыре', 'смеялся', 'пол.', 'брате', 'говорила', 'запищал', 'подпрыгнула', 'Другой', 'врач.', 'экран'];
const clean = s => s.replace(/[.,…?!«»]/g, '');
const chunks = [];
sent.forEach((idx, si) => {
  let g = [];
  const flush = () => { if (!g.length) return; chunks.push({ t: g.map(i => clean(words[i][0])).join(' '), s: words[g[0]][1] + OFFSET, e: words[g[g.length - 1]][2] + OFFSET, hl: g.some(i => HL.some(h => words[i][0].startsWith(h) || clean(words[i][0]) === clean(h))), si }); g = []; };
  idx.forEach((wi, k) => {
    const len = g.reduce((a, i) => a + clean(words[i][0]).length + 1, 0) + clean(words[wi][0]).length;
    if (g.length >= 4 || (g.length && len > 15)) {
      const last = g[g.length - 1];
      if (g.length > 1 && ['в','на','с','к','у','о','и','а','не','ни','по','за','из','от','до','но'].includes(clean(words[last][0]).toLowerCase())) { g.pop(); flush(); g.push(last); } else flush();
    }
    g.push(wi);
  });
  flush();
});
// сцены: [fn, первое предложение, флаги]
const PLAN = [['shotFinger0', 0], ['shotSleeve', 1], ['shotReflex', 3], ['shotTeacherNight', 8], ['shotPutBag', 10], ['shotBagStays', 14], ['shotLizaSick', 17], ['shotTellClass', 20], ['shotAshamed', 24], ['shotDimaIdea', 27],
  ['shotRecord', 31], ['shotVoices', 36], ['shotSpeaker', 44], ['shotLizaHears', 45], ['shotLizaFloor', 49], ['shotSpeakerTalk', 51], ['shotBeep', 54], ['shotDoctorRun', 58]];
const NOCAP = [56, 57, 2, 4, 5, 6, 7, 13, 28, 29, 30, 36, 37, 38, 39, 40, 41, 42, 43, 52, 53, 61, 62];
chunks.forEach(c => { if (NOCAP.includes(c.si)) c.nocap = true; });
const shots = PLAN.map(([fn, s0, fl], i) => {
  const s1 = i + 1 < PLAN.length ? PLAN[i + 1][1] : sent.length;
  const s = i === 0 ? 0 : ss(s0) - 0.14;
  return { fn, s, marks: Array.from({ length: s1 - s0 }, (_, k) => ss(s0 + k) - s), ...(fl || {}) };
});
const T = n => shots.find(s => s.fn === n).s;
const lightning = [];
const fl = [];
const last = sent.length - 1;
const DATA = { chunks, shots, dur: DUR, lightning, fl, outro: se(last) + 1.2,
  sections: [[0, 'tension'], [T('shotReflex'), 'calm'], [T('shotPutBag'), 'main'], [T('shotLizaSick'), 'soft'], [T('shotTellClass'), 'calm'], [T('shotDimaIdea'), 'main'], [T('shotRecord'), 'build'], [T('shotVoices'), 'warm'], [T('shotSpeaker'), 'soft'], [T('shotLizaFloor'), 'calm'], [T('shotSpeakerTalk'), 'build'], [T('shotBeep'), 'tension'], [T('shotDoctorRun'), 'dark']],
  hits: [ss(56), ss(57), ss(62)] };
// совместимость с базовым page.html
DATA.cuts = shots.map(s => s.s).concat([DUR]);

const mode = process.argv[2];
if (mode === 'data') { fs.writeFileSync(path.join(dir, 'work/data.json'), JSON.stringify(DATA, null, 1)); console.log('dur', DUR, 'shots', shots.length, 'chunks', chunks.length); process.exit(0); }

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
page.on('pageerror', e => console.error('PAGE ERROR', e.message));
page.on('console', m => { if (m.type() === 'error') console.error('CONSOLE', m.text()); });
await page.goto('file://' + path.join(dir, 'page.html'));
await page.evaluate(d => { window.DATA = d; }, DATA);
await page.evaluate(() => window.ready);

if (mode === 'stills') {
  for (const t of process.argv[3].split(',').map(Number)) {
    await page.evaluate(([t, f]) => window.renderFrame(t, f), [t, Math.round(t * FPS)]);
    await page.screenshot({ path: path.join(dir, `work/still_${t}.jpg`), type: 'jpeg', quality: 80 });
  }
} else if (mode === 'seg') {
  const total = Math.round(DUR * FPS), a = Math.round(+process.argv[3] * total), b = Math.round(+process.argv[4] * total);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', path.join(dir, `work/${process.argv[5]}.mp4`)], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let f = a; f < b; f++) {
    await page.evaluate(([t, f]) => window.renderFrame(t, f), [f / FPS, f]);
    const buf = await page.screenshot({ type: 'jpeg', quality: 95 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  console.log('seg ok', a, b);
}
await browser.close();
