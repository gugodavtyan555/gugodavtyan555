// ==UserScript==
// @name         Keno 40 · Hot Triple
// @match        *://*/*
// @grant        none
// ==/UserScript==
// Կենո 40՝ ամեն փուլում ընտրում է «տաք» եռյակ (վերջին փուլերում ամենահաճախ եկած թվերը) և սեղմում խաղադրույքը.
// Պանելում ցուցադրվում է իրական համեմատություն՝ տաք եռյակ / սառը եռյակ / պատահական եռյակ (ինչքան հիթ ունեին նույն փուլերում).
// Կայքը կարող է արգելել բոտերը. սա չի բարելավում շանսերը (յուրաքանչյուր վիճակահանություն անկախ է):
(() => {
  'use strict';
  const CFG = Object.assign({
    pick: 3,          // քանի թիվ ընտրել
    window: 12,       // քանի վերջին փուլն է հաշվվում
    decay: 0.85,      // նոր փուլերի կշիռը (1 = բոլորը հավասար)
    minRounds: 3,     // պատմության նվազագույն երկարություն՝ տաք ընտրության համար
    quietMs: 1800,    // փուլի ավարտ = այսքան ժամանակ DOM-ում փոփոխություն չկա
    startWaitMs: 900, // փուլի սկզբից նվազագույն սպասում
    maxWaitMs: 25000, // փուլի առավելագույն սպասում
    clickGap: 350,    // թվերի սեղմումների միջև դադար
    maxBets: 40,      // լռելյայն սահման՝ խաղադրույքների քանակ (փոխվում է պանելից)
    stopLossPct: 30   // լռելյայն սահման՝ մնացորդի կորուստ % (եթե մնացորդը կարդացվում է)
  }, window.__KENO_CFG || {});
  const BET_RE = /ставк|ставить|играть|bet|play|start|խաղադրույք|խաղալ|սկսել/i;
  const CLEAR_RE = /очист|clear|reset|сброс|մաքր|ջնջ/i;
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const $$ = s => Array.from(document.querySelectorAll(s));
  const rect = e => { try { return e.getBoundingClientRect(); } catch (_) { return { left: 0, top: 0, width: 0, height: 0 }; } };
  const vis = e => { const r = rect(e); return r.width > 0 && r.height > 0; };
  const cls = e => (e.getAttribute && e.getAttribute('class')) || '';
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (_) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) {} }
  };

  // ---------- DOM-ի հայտնաբերում ----------
  const clickable = e => (e.closest && e.closest('button,[role="button"],[onclick]')) || e;
  function findCells() {
    const groups = {};
    $$('div,span,button,li,td,a,p').forEach(e => {
      if (e.children.length > 1) return;
      const t = (e.textContent || '').trim();
      if (!/^\d{1,2}$/.test(t)) return;
      const n = +t; if (n < 1 || n > 40) return;
      const r = rect(e); if (r.width < 14 || r.height < 14 || r.width > 160 || r.height > 160) return;
      const k = Math.round(r.width / 4) + 'x' + Math.round(r.height / 4);
      ((groups[k] = groups[k] || {})[n] = groups[k][n] || []).push(e);
    });
    let best = null, bc = 0;
    Object.keys(groups).forEach(k => { const c = Object.keys(groups[k]).length; if (c > bc) { bc = c; best = groups[k]; } });
    if (!best || bc < 40) return null;
    const cells = {};
    for (let n = 1; n <= 40; n++) cells[n] = clickable(best[n][0]);
    return cells;
  }
  function findBtn(re, avoid) {
    const c = $$('button,[role="button"],a,div,span').filter(e => {
      if (!vis(e) || (avoid && avoid.has(e))) return false;
      if (e.children.length > 3) return false;
      const t = (e.textContent || '').trim();
      return t.length > 0 && t.length < 30 && re.test(t) && !/^\d{1,2}$/.test(t);
    });
    c.sort((a, b) => { const ra = rect(a), rb = rect(b); return rb.width * rb.height - ra.width * ra.height; });
    const top = c[0]; return top ? clickable(top) : null;
  }
  function press(el) {
    const r = rect(el), o = { bubbles: true, cancelable: true, composed: true, clientX: r.left + r.width / 2, clientY: r.top + r.height / 2, view: window };
    ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'].forEach(n => {
      try { el.dispatchEvent(n.startsWith('pointer') && window.PointerEvent ? new PointerEvent(n, o) : new MouseEvent(n, o)); } catch (_) {}
    });
  }
  function sig(e) {
    let cs = null; try { cs = getComputedStyle(e); } catch (_) {}
    const k = e.firstElementChild;
    return cls(e) + '|' + (cs ? cs.backgroundColor + '|' + cs.color + '|' + cs.borderColor + '|' + cs.opacity : '') + '|' + (e.getAttribute('aria-pressed') || '') + '|' + (k ? cls(k) : '');
  }
  const snapshot = cells => { const o = {}; for (let n = 1; n <= 40; n++) o[n] = sig(cells[n]); return o; };

  let lastMut = Date.now();
  try { new MutationObserver(() => { lastMut = Date.now(); }).observe(document.documentElement, { subtree: true, attributes: true, childList: true, characterData: true }); } catch (_) {}

  function readBalance() {
    const cand = $$('div,span,p,b,strong,li').filter(e => e.children.length < 3 && (e.textContent || '').length < 60 && /(баланс|balance|մնացորդ|balans)/i.test(e.textContent || ''));
    for (const e of cand) {
      for (const t of [e.textContent, e.nextElementSibling && e.nextElementSibling.textContent, e.parentElement && e.parentElement.textContent]) {
        const m = String(t || '').replace(/\s/g, '').match(/(\d+(?:[.,]\d+)?)/);
        if (m) return parseFloat(m[1].replace(',', '.'));
      }
    }
    return null;
  }

  // ---------- ընտրություն ----------
  const hist = () => store.get('kenoHist', []);
  function choose() {
    const H = hist().slice(-CFG.window), score = {};
    for (let n = 1; n <= 40; n++) score[n] = 0;
    H.slice().reverse().forEach((d, i) => { const w = Math.pow(CFG.decay, i); d.forEach(n => { score[n] += w; }); });
    const nums = Object.keys(score).map(Number), j = {};
    nums.forEach(n => { j[n] = Math.random(); });
    const hot = nums.slice().sort((a, b) => score[b] - score[a] || j[b] - j[a]);
    const cold = nums.slice().sort((a, b) => score[a] - score[b] || j[a] - j[b]);
    const rnd = nums.slice().sort(() => Math.random() - 0.5);
    const warm = H.length >= CFG.minRounds;
    return { hot: (warm ? hot : rnd).slice(0, CFG.pick), cold: cold.slice(0, CFG.pick), rnd: rnd.slice(0, CFG.pick), warm };
  }

  // ---------- վիճակագրություն ----------
  let S = store.get('kenoStats', { rounds: 0, hotHits: 0, coldHits: 0, rndHits: 0, expHits: 0, bets: 0 });
  const saveS = () => store.set('kenoStats', S);

  // ---------- UI ----------
  let panel = null, logEl = null, statEl = null, btn = null, inBets = null, inLoss = null, running = false, cells = null;
  function log(t) { if (!logEl) return; const d = document.createElement('div'); d.textContent = t; logEl.insertBefore(d, logEl.firstChild); while (logEl.childNodes.length > 40) logEl.removeChild(logEl.lastChild); }
  function showStats() {
    if (!statEl) return;
    const r = S.rounds || 1;
    statEl.textContent = 'փուլ ' + S.rounds + ' · հիթ/փուլ՝ տաք ' + (S.hotHits / r).toFixed(2) + ' · սառը ' + (S.coldHits / r).toFixed(2) + ' · պատահական ' + (S.rndHits / r).toFixed(2) + ' · սպասվող ' + (S.expHits / r).toFixed(2);
  }
  function build() {
    panel = document.createElement('div');
    panel.style.cssText = 'position:fixed;top:60px;right:8px;z-index:2147483647;background:#111;color:#fff;padding:8px;border-radius:8px;font:12px sans-serif;width:230px';
    panel.innerHTML = '<div id="kGrip" style="text-align:center;padding:6px;margin-bottom:6px;background:#333;border-radius:6px;cursor:move;touch-action:none;user-select:none">⠿ Կենո 40 · տաք եռյակ</div>' +
      '<button id="kBtn" style="width:100%;padding:8px;font-weight:bold;background:#2a2;color:#fff;border:0;border-radius:6px">START</button>' +
      '<div style="display:flex;gap:4px;margin-top:6px;align-items:center"><span style="flex:1">խաղադրույք ≤</span><input id="kBets" type="number" style="width:60px"><span style="flex:1;text-align:right">կորուստ %</span><input id="kLoss" type="number" style="width:50px"></div>' +
      '<div style="display:flex;gap:4px;margin-top:6px"><button id="kDbg" style="flex:1;padding:6px;background:#345;color:#fff;border:0;border-radius:6px">🔍 Debug</button><button id="kRst" style="flex:1;padding:6px;background:#345;color:#fff;border:0;border-radius:6px">↺ Զրո</button></div>' +
      '<div id="kStat" style="margin-top:6px;font-weight:bold"></div><div id="kLog" style="margin-top:6px;max-height:160px;overflow:auto"></div>';
    document.body.appendChild(panel);
    logEl = panel.querySelector('#kLog'); statEl = panel.querySelector('#kStat'); btn = panel.querySelector('#kBtn');
    inBets = panel.querySelector('#kBets'); inLoss = panel.querySelector('#kLoss');
    inBets.value = store.get('kenoMaxBets', CFG.maxBets); inLoss.value = store.get('kenoMaxLoss', CFG.stopLossPct);
    inBets.onchange = () => store.set('kenoMaxBets', +inBets.value || CFG.maxBets);
    inLoss.onchange = () => store.set('kenoMaxLoss', +inLoss.value || CFG.stopLossPct);
    const grip = panel.querySelector('#kGrip'); let dx = 0, dy = 0, drag = false;
    grip.addEventListener('pointerdown', e => { drag = true; const r = panel.getBoundingClientRect(); dx = e.clientX - r.left; dy = e.clientY - r.top; try { grip.setPointerCapture(e.pointerId); } catch (_) {} e.preventDefault(); });
    grip.addEventListener('pointermove', e => { if (!drag) return; panel.style.left = Math.max(0, e.clientX - dx) + 'px'; panel.style.top = Math.max(0, e.clientY - dy) + 'px'; panel.style.right = 'auto'; });
    grip.addEventListener('pointerup', () => { drag = false; });
    btn.onclick = () => { if (running) stop('կանգնեցված'); else start(); };
    panel.querySelector('#kRst').onclick = () => { store.set('kenoHist', []); S = { rounds: 0, hotHits: 0, coldHits: 0, rndHits: 0, expHits: 0, bets: 0 }; saveS(); showStats(); log('↺ պատմությունը և վիճակագրությունը մաքրվեց'); };
    panel.querySelector('#kDbg').onclick = debugDump;
    showStats();
  }
  function debugDump() {
    const c = findCells(), b = findBtn(BET_RE), k = findBtn(CLEAR_RE);
    const out = ['cells=' + (c ? 'OK' : 'ՉԳՏՆՎԵՑ'), 'bet=' + (b ? '«' + (b.textContent || '').trim().slice(0, 20) + '» ' + b.tagName + '.' + cls(b) : 'ՉԳՏՆՎԵՑ'), 'clear=' + (k ? '«' + (k.textContent || '').trim().slice(0, 20) + '»' : 'չկա'), 'balance=' + readBalance(), 'hist=' + hist().length];
    if (c) out.push('sig1=' + sig(c[1]).slice(0, 90));
    out.forEach(x => log(x));
    try { navigator.clipboard.writeText(out.join('\n')); } catch (_) {}
  }

  // ---------- խաղային ցիկլ ----------
  function stop(why) { running = false; if (btn) { btn.textContent = 'START'; btn.style.background = '#2a2'; } log('⏹ ' + why); }
  function start() {
    cells = findCells(); if (!cells) return log('⚠ 1–40 թվերի ցանցը չգտնվեց');
    if (!findBtn(BET_RE)) return log('⚠ խաղադրույքի կոճակը չգտնվեց (տես 🔍 Debug)');
    running = true; S.bets = 0; saveS(); startBal = readBalance();
    btn.textContent = 'STOP'; btn.style.background = '#c22';
    log('▶ սկսեցի' + (startBal !== null ? ' (մնացորդ ' + startBal + ')' : ' (մնացորդը չի կարդացվում՝ միայն քանակի սահման)'));
    loop();
  }
  let startBal = null;
  async function loop() {
    while (running) {
      const maxBets = +inBets.value || CFG.maxBets, maxLoss = +inLoss.value || CFG.stopLossPct;
      if (S.bets >= maxBets) { stop('սահմանաչափ՝ ' + maxBets + ' խաղադրույք'); break; }
      const bal = readBalance();
      if (startBal !== null && bal !== null && bal <= startBal * (1 - maxLoss / 100)) { stop('կորստի սահման՝ -' + maxLoss + '% (մնացորդ ' + bal + ')'); break; }
      try { await playRound(); } catch (e) { log('⚠ ' + e.message); await sleep(1500); }
      await sleep(500);
    }
  }
  async function playRound() {
    cells = findCells(); if (!cells) throw new Error('ցանցը կորավ');
    const clr = findBtn(CLEAR_RE); if (clr) { press(clr); await sleep(300); }
    const base = snapshot(cells), pk = choose();
    for (const n of pk.hot) { press(cells[n]); await sleep(CFG.clickGap); }
    let sel = snapshot(cells);
    const changed = () => Object.keys(sel).map(Number).filter(n => sel[n] !== base[n]);
    let ch = changed();
    if (ch.length !== pk.hot.length || !pk.hot.every(n => ch.includes(n))) { // ուղղում՝ toggle-ի սխալները
      for (const n of ch) if (!pk.hot.includes(n)) { press(cells[n]); await sleep(200); }
      for (const n of pk.hot) if (!ch.includes(n)) { press(cells[n]); await sleep(200); }
      sel = snapshot(cells); ch = changed();
      if (!pk.hot.every(n => ch.includes(n))) log('⚠ ընտրությունը չհաստատվեց՝ ' + ch.join(','));
    }
    const bet = findBtn(BET_RE); if (!bet) throw new Error('խաղադրույքի կոճակը կորավ');
    log((pk.warm ? '🔥 ' : '🎲 ') + pk.hot.join('-') + ' · խաղադրույք');
    const pre = snapshot(cells), seen = {};
    for (let n = 1; n <= 40; n++) seen[n] = new Set();
    press(bet); S.bets++; saveS();
    const t0 = Date.now(); let lastChange = Date.now();
    while (Date.now() - t0 < CFG.maxWaitMs) {
      await sleep(120);
      const sn = snapshot(cells);
      for (let n = 1; n <= 40; n++) if (!seen[n].has(sn[n])) { seen[n].add(sn[n]); lastChange = Date.now(); }
      if (Date.now() - t0 > CFG.startWaitMs && Date.now() - lastChange > CFG.quietMs && Date.now() - lastMut > CFG.quietMs) break;
    }
    const drawn = [];
    for (let n = 1; n <= 40; n++) {
      const allowed = new Set([base[n], pre[n]]);
      if (pk.hot.includes(n)) allowed.add(sel[n]);
      if (Array.from(seen[n]).some(s => !allowed.has(s))) drawn.push(n);
    }
    if (drawn.length < 3 || drawn.length > 30) { log('⚠ դուրս եկած թվերը չկարդացվեցին (' + drawn.length + ')՝ տես 🔍 Debug'); return; }
    const H = hist(); H.push(drawn); store.set('kenoHist', H.slice(-200));
    const hit = a => a.filter(n => drawn.includes(n)).length, hh = hit(pk.hot);
    S.rounds++; S.hotHits += hh; S.coldHits += hit(pk.cold); S.rndHits += hit(pk.rnd); S.expHits += CFG.pick * drawn.length / 40; saveS();
    log('→ դուրս եկավ ' + drawn.length + ' թիվ · հիթ ' + hh + '/' + CFG.pick);
    showStats();
  }

  // ---------- պանելը՝ միայն եթե 1–40 ցանցը կա ----------
  const watcher = setInterval(() => { if (panel) return clearInterval(watcher); if (document.body && findCells()) build(); }, 2000);
})();
