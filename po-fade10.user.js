// ==UserScript==
// @name         PO impulse 10s
// @match        https://*.pocketoption.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==
(function () {
  // ===== կարգավորումներ =====
  const LOOK = 2;          // վրկ. նայում ենք վերջին շարժմանը
  const WITH_IMPULSE = true; // true՝ իմպուլսի ՀԵՏ (շարունակություն), false՝ հակառակ (fade)
  const BB_N = 10;         // վրկ. Bollinger-ի պատուհան
  const BB_K = 2.0;        // σ շեմ
  const RATIO_MIN = 2.5;   // շարժումը պետք է լինի ≥ այդքան անգամ ավելի մեծ, քան վերջին 5 րոպեի 75%-ը
  const HOLD = 10;         // գործարքի ժամկետ (վրկ)
  const GAP = 10;          // վրկ. նվազագույն ընդմիջում սիգնալների միջև
  const BREAK_EVEN = 53.5; // % (87% եկամտաբերության դեպքում)
  const ONLY_REAL = false; // false՝ աշխատում է նաև OTC-ում (արդյունքը չափվում է առանձին)
  // ---- ավտոմատ սեղմում (պաշտպանիչ կանոններով) ----
  const AUTO = true;        // true՝ սիգնալի պահին ինքնաբերաբար սեղմել Купить/Продать
  const ALLOW_REAL = true;        // true՝ աշխատում է նաև REAL հաշվի վրա (հաստատումով և սահմաններով)
  const REAL_MAX_STAKE = 10;      // $ REAL-ում ոչ մի գործարք այս գումարից մեծ չէ
  const REAL_LOSS_LIMIT = 1000000000;     // $ երբ հաշվեկշիռը նվազի սկզբնականից այսքանով, ամեն ինչ կանգնում է
  const REAL_MAX_TRADES = 1000000;    // REAL-ում առավելագույն գործարքներ մեկ էջի բեռնման ընթացքում
  const MIN_PAYOUT = 80;    // % նվազագույն եկամտաբերություն, որի դեպքում սեղմում է
  const MAX_AUTO = 1000000;     // նվազագույն սահման՝ մեկ էջի բեռնման ընթացքում առավելագույն գործարքներ
  // ---- 8 քայլանոց սանդուղք (parlay)՝ շահածը գնում է հաջորդ գործարքին (միայն Demo) ----
  const PARLAY = true;
  const STEPS = 4;
  const STAKE0 = 1;         // $ սկզբնական գումար
  const DELAYS = [0, 1, 2, 3]; // ուշացումներ, որոնց համար չափվում է արդյունքը
  // ==========================

  const isReal = (a) => !/_otc$/i.test(a || '');
  const ticks = {};        // asset -> [{t,p}]
  const moves = {};        // asset -> [|move|, ...] (վերջին ~300)
  const pend = [];
  let sel = '', lastSig = {}, nSig = 0, lastTickT = 0, lastTickP = 0, lastWall = 0;
  let stat = {};
  DELAYS.forEach((d) => (stat[d] = [0, 0]));
  let mkt = 'otc';
  const KEY = () => 'po_fade10_' + 'bb' + (WITH_IMPULSE ? 'w' : 'f') + '_' + mkt;
  const loadStat = () => { stat = {}; DELAYS.forEach((d) => (stat[d] = [0, 0])); nSig = 0; try { const o = JSON.parse(localStorage.getItem(KEY()) || 'null'); if (o) { stat = o.stat || stat; nSig = o.nSig || 0; } } catch (e) {} };
  const setMkt = (a) => { const m = isReal(a) ? 'real' : 'otc'; if (m !== mkt) { try { localStorage.setItem(KEY(), JSON.stringify({ stat, nSig })); } catch (e) {} try { saveFeat(); } catch (e) {} mkt = m; pend.length = 0; loadStat(); try { loadFeat(); } catch (e) {} } };
  loadStat();

  // ---- վահանակ ----
  const box = document.createElement('div');
  box.style.cssText = 'position:fixed;bottom:90px;left:4px;z-index:99999;background:#000c;color:#0f0;font:11px monospace;padding:4px;max-width:80vw;max-height:38vh;overflow:auto;white-space:pre-wrap';
  const body = document.createElement('div');
  const grip = document.createElement('span');
  grip.textContent = ' ✥ ';
  grip.style.cssText = 'padding:4px 8px;background:#333;font-size:14px';
  grip.addEventListener('touchmove', (e) => { const t = e.touches[0]; box.style.bottom = 'auto'; box.style.left = Math.max(0, t.clientX - 20) + 'px'; box.style.top = Math.max(0, t.clientY - 10) + 'px'; e.preventDefault(); }, { passive: false });
  const reset = document.createElement('span');
  reset.textContent = ' ⟲ ';
  reset.style.cssText = 'padding:4px 8px;background:#533;font-size:14px;margin-left:4px';
  reset.onclick = () => { if (confirm('Մաքրե՞լ հաշվիչները')) { DELAYS.forEach((d) => (stat[d] = [0, 0])); nSig = 0; } };
  const play = document.createElement('span');
  play.textContent = ' ▶ ';
  play.style.cssText = 'padding:4px 12px;background:#1a6b2c;font-size:18px;margin-right:4px;font-weight:700';
  function setRunning(on) {
    if (on) {
      const a = acct();
      if (a === 'unknown') { autoMsg = 'հաշիվը չի որոշվել՝ չեմ սկսում'; return; }
      if (a === 'real') {
        if (!ALLOW_REAL) { autoMsg = 'REAL հաշիվ՝ արգելված է'; return; }
        const ok = confirm('⚠ REAL հաշիվ՝ ավտոմատ առևտուրը ՍԿՍՎՈՒՄ Է։\n\nՍահմաններ՝\n• մեկ գործարք՝ առավելագույնը $' + REAL_MAX_STAKE + '\n• կորստի սահման՝ ' + (REAL_LOSS_LIMIT >= 1000000 ? 'ԱՆՋԱՏՎԱԾ' : '$' + REAL_LOSS_LIMIT + ' (հետո կանգնում է)') + '\n• գործարքների քանակ՝ ' + (REAL_MAX_TRADES >= 1000000 ? 'անսահմանափակ' : REAL_MAX_TRADES) + '\n• սանդուղք՝ ' + STEPS + ' քայլ, սկսած $' + STAKE0 + '\n\nԱռավելությունը ապացուցված չէ։ Շարունակե՞լ։');
        if (!ok) { autoMsg = 'REAL՝ չեղարկվեց'; return; }
        realOk = true; sessBal0 = readBalance();
      } else { realOk = false; }
      nAuto = 0; running = true; autoMsg = '▶ աշխատում է. սպասում եմ առաջին սիգնալին';
      prepareNext();
    } else { running = false; autoMsg = '⏸ կանգնեցված'; }
  }
  play.onclick = () => setRunning(!running);
  setInterval(() => { play.textContent = running ? ' ⏸ ' : ' ▶ '; play.style.background = running ? '#8a2a1a' : '#1a6b2c'; }, 500);
  const snd = document.createElement('span');
  snd.textContent = ' 🔊 ';
  snd.style.cssText = 'padding:4px 8px;background:#235;font-size:14px;margin-left:4px';
  snd.onclick = () => { soundOn = !soundOn; unlock(); if (soundOn) setTimeout(() => beep(1), 150); };
  const dbg = document.createElement('span');
  dbg.textContent = ' 🐞 ';
  dbg.style.cssText = 'padding:4px 8px;background:#442;font-size:14px;margin-left:4px';
  const dbgOut = document.createElement('div');
  dbgOut.style.cssText = 'font-size:8px;max-height:140px;overflow:auto;word-break:break-all;color:#ff0';
  dbg.onclick = () => { dbgOut.textContent = dumpDom(); };
  box.append(play, grip, reset, snd, dbg, dbgOut, body);
  document.addEventListener('DOMContentLoaded', () => document.body.appendChild(box));
  const pct = (a) => (a[0] + a[1] ? (100 * a[0] / (a[0] + a[1])).toFixed(1) + '%' : '—');
  let nTicks = 0;
  setInterval(() => {
    const real = !ONLY_REAL || isReal(sel);
    snd.textContent = !soundOn ? ' 🔇 ' : (unlocked ? ' 🔊 ' : ' 🔊? սեղմեք ');
    body.textContent = (AUTO ? (running ? '▶ ԱՇԽԱՏՈՒՄ Է ' : '⏸ ԿԱՆԳՆԱԾ ') : '') + (AUTO ? (acct() === 'real' ? '💰REAL' + (realOk ? '' : '(չհաստատված)') + ' ' : '') + '🤖 ավտո: ' + (autoMsg || '—') + '\n' : '') + (PARLAY ? '🪜 ' + par.streak + '/' + STEPS + ' · գումար $' + par.stake + ' · փորձ #' + par.attempts + ' · լավագույն ' + par.best + ' · անցած ' + par.done + ' (շահ ' + par.wins + ' / կոր. ' + par.losses + ')' + (parMsg ? '\n' + parMsg : '') + '\n' : '') + 'BB(' + BB_N + 'վրկ,' + BB_K + 'σ) ' + (WITH_IMPULSE ? 'հետ' : 'հակառակ') + ' | ' + (sel || '…') + (sel ? (isReal(sel) ? ' (REAL)' : ' (OTC)') : '') + ' | տիկեր ' + nTicks + ' | սիգնալներ ' + nSig +
      '\n' + featText() + '\nարդյունք ըստ ձեր ուշացման (շահույթի շեմ ≥' + (isReal(sel) ? 53.5 : 52.1) + '%)՝' +
      DELAYS.map((d) => '\n ' + d + ' վրկ ուշ՝ ' + stat[d][0] + '/' + stat[d][1] + ' ' + pct(stat[d])).join('') +
      '';
    try { localStorage.setItem(KEY(), JSON.stringify({ stat, nSig })); } catch (e) {}
  }, 2000);

  // ---- parlay վիճակ ----
  let par = { stake: STAKE0, streak: 0, attempts: 1, best: 0, done: 0, wins: 0, losses: 0 };
  try { const o = JSON.parse(localStorage.getItem('po_parlay') || 'null'); if (o) par = Object.assign(par, o); } catch (e) {}
  let parPend = null, parMsg = '', prep = null;
  let realOk = false, realAsked = false, sessBal0 = null, parAcct = '', running = false;
  function parKey() { return 'po_parlay_' + (parAcct || 'demo'); }
  function ensureParAcct(a) { // առանձին սանդուղք Demo-ի և REAL-ի համար
    if (!a || a === 'unknown' || parAcct === a) return;
    if (parAcct) { try { localStorage.setItem(parKey(), JSON.stringify(par)); } catch (e) {} }
    parAcct = a;
    let o = null; try { o = JSON.parse(localStorage.getItem(parKey()) || 'null'); } catch (e) {}
    if (!o && a === 'demo') { try { o = JSON.parse(localStorage.getItem('po_parlay') || 'null'); } catch (e) {} }
    par = Object.assign({ stake: STAKE0, streak: 0, attempts: 1, best: 0, done: 0, wins: 0, losses: 0 }, o || {});
    if (a === 'real' && (!par.stake || par.stake > REAL_MAX_STAKE)) { par.stake = STAKE0; par.streak = 0; }
    parPend = null;
  }
  function savePar() { try { localStorage.setItem(parKey(), JSON.stringify(par)); } catch (e) {} }
  function desc(e) {
    try { return (e.tagName || '?') + '[type=' + (e.type || '') + ',ro=' + (e.readOnly ? 1 : 0) + ',ce=' + (e.isContentEditable ? 1 : 0) + ',v=' + (e.value !== undefined ? e.value : (e.textContent || '').slice(0, 12)) + ']'; } catch (x) { return '?'; }
  }
  function topmost(e) { // իրականում տեսանելի՞ է՝ նրա կենտրոնում հենց ինքն է վերևում
    try {
      const r = e.getBoundingClientRect();
      if (r.width < 20 || r.height < 10) return false;
      const x = r.left + r.width / 2, y = r.top + r.height / 2;
      if (x < 0 || y < 0 || x > window.innerWidth || y > window.innerHeight) return false;
      const h = document.elementFromPoint(x, y);
      return !!h && (h === e || e.contains(h) || h.contains(e));
    } catch (x) { return false; }
  }
  function findStakeEl() {
    const cands = [];
    try {
      document.querySelectorAll('input,[contenteditable="true"]').forEach((e) => {
        const val = String(e.value !== undefined ? e.value : e.textContent || '').trim();
        if (!/^\d+([.,]\d+)?$/.test(val)) return; // ժամանակի դաշտը (00:00:10) չի համապատասխանում
        let node = e, ok = false;
        for (let k = 0; k < 4 && node; k++) {
          node = node.parentElement;
          const tx = node ? (node.textContent || '') : '';
          if (/(Сумма|Amount|Sum)/i.test(tx) && !/(Время|Time)/i.test(tx)) { ok = true; break; }
        }
        cands.push({ e, ok, top: topmost(e) });
      });
    } catch (x) {}
    const best = cands.find((c) => c.top && c.ok) || cands.find((c) => c.top) || cands.find((c) => c.ok) || cands[0];
    return best ? best.e : null;
  }
  let stakeEl = null;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  function dumpCands() {
    try {
      return [...document.querySelectorAll('input,[contenteditable="true"]')].slice(0, 6).map((e) => {
        let r = null; try { r = e.getBoundingClientRect(); } catch (x) {}
        return desc(e) + (r ? '{' + Math.round(r.width) + 'x' + Math.round(r.height) + '}' : '') + '.' + String(e.className || '').slice(0, 18);
      }).join(' | ');
    } catch (x) { return '?'; }
  }
  // ---- «Калькулятор» ստեղնաշարով գումար մուտքագրում ----
  function vis(e) { try { return e.offsetParent !== null || (e.getClientRects && e.getClientRects().length > 0); } catch (x) { return true; } }
  function calcVisible() {
    try { return !!findKeysGeneric() || [...document.querySelectorAll('div,span,p,button')].some((e) => (e.textContent || '').trim() === 'Калькулятор' && vis(e)); } catch (x) { return false; }
  }
  function keyChars() { return ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.']; }
  function findKeysGeneric() {
    try {
      const all = [...document.querySelectorAll('*')];
      const txt = (e) => (e.textContent || '').trim();
      const sevens = all.filter((e) => txt(e) === '7' && vis(e));
      for (const sv of sevens) {
        let cont = sv;
        for (let k = 0; k < 8 && cont.parentElement; k++) {
          cont = cont.parentElement;
          const inner = [...cont.querySelectorAll('*')].filter((e) => vis(e));
          const keys = {};
          let okAll = true;
          for (const ch of keyChars()) {
            const c = inner.filter((e) => txt(e) === ch);
            if (!c.length) { okAll = false; break; }
            keys[ch] = c[0];
          }
          if (!okAll) continue;
          let w = keys['0'];
          while (w.parentElement && w.parentElement !== cont && w.parentElement.children.length < 9) w = w.parentElement;
          let back = w.nextElementSibling;
          if (!back && w.parentElement) back = w.parentElement.lastElementChild;
          if (!back) continue;
          keys.back = back; keys._cont = cont;
          return keys;
        }
      }
    } catch (x) {}
    return null;
  }
  function findKeys() {
    const g = findKeysGeneric();
    if (g) return g;
    const keys = {};
    try {
      const all = [...document.querySelectorAll('button,div,span')];
      for (const ch of ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.']) {
        const c = all.filter((e) => (e.textContent || '').trim() === ch && vis(e));
        let pick = null;
        for (const e of c) { // պահանջում ենք՝ նախնիներից մեկը պարունակի «Калькулятор»
          let n = e, ok = false;
          for (let k = 0; k < 7 && n; k++) { n = n.parentElement; if (n && /Калькулятор/.test(n.textContent || '')) { ok = true; break; } }
          if (ok) { pick = e; break; }
        }
        if (!pick) return null;
        keys[ch] = pick;
      }
      // «ջնջել» կոճակը՝ '0'-ի հաջորդ ստեղնը ցանցում
      let w = keys['0'];
      while (w.parentElement && w.parentElement.children.length < 9) w = w.parentElement;
      let back = w.nextElementSibling;
      if (!back && w.parentElement) back = w.parentElement.lastElementChild;
      keys.back = back;
    } catch (x) { return null; }
    return keys.back ? keys : null;
  }
  // ---- դիրքով սեղմում (հաշվիչի կոճակները՝ դաշտի նկատմամբ հայտնի հեռավորություններով) ----
  const KP_COL = [-430, -198, 34];          // x-շեղում դաշտի կենտրոնից (375px լայնության համար)
  const KP_ROW = [-533, -441, -350, -259];  // y-շեղում
  const KP_MAP = { '7': [0, 0], '8': [1, 0], '9': [2, 0], '4': [0, 1], '5': [1, 1], '6': [2, 1], '1': [0, 2], '2': [1, 2], '3': [2, 2], '.': [0, 3], '0': [1, 3], back: [2, 3], disp: [0, -1] };
  function keyPoint(ch, r) {
    const s = r.width / 375, m = KP_MAP[ch], cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    if (ch === 'disp') return [cx - 314 * s, cy - 724 * s];
    return [cx + KP_COL[m[0]] * s, cy + KP_ROW[m[1]] * s];
  }
  function fireAt(x, y) {
    const t = document.elementFromPoint(x, y);
    if (!t) return null;
    const o = { bubbles: true, cancelable: true, composed: true, clientX: x, clientY: y, view: window };
    ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'].forEach((n) => {
      try { t.dispatchEvent(n.startsWith('pointer') ? new PointerEvent(n, o) : new MouseEvent(n, o)); } catch (e) {}
    });
    return t;
  }
  async function viaPoints(el) {
    const r = el.getBoundingClientRect();
    return r;
  }
  async function typeByPoints(el, str) {
    const r = el.getBoundingClientRect();
    const hit = fireAt(...keyPoint('back', r));
    if (!hit) return 'no-hit';
    for (let i = 0; i < 8; i++) { fireAt(...keyPoint('back', r)); await sleep(25); }
    for (const ch of str) { if (!KP_MAP[ch]) return 'no-key:' + ch; fireAt(...keyPoint(ch, r)); await sleep(40); }
    await sleep(100);
    return 'P';
  }
  async function viaKeypad(el, str) {
    try { fire(el); el.focus && el.focus(); } catch (x) {}
    for (let i = 0; i < 6 && !calcVisible(); i++) await sleep(80);
    await sleep(120);
    const keys = findKeys();
    if (!keys) {
      const rr = await typeByPoints(el, str);
      const closers = [
        () => { try { el.blur && el.blur(); } catch (x) {} },
        () => { try { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); } catch (x) {} }
      ];
      for (const f of closers) f();
      return rr;
    }
    for (let i = 0; i < 9; i++) { fire(keys.back); await sleep(25); }
    for (const ch of str) { if (!keys[ch]) return 'no-key:' + ch; fire(keys[ch]); await sleep(35); }
    await sleep(100);
    // փակել հաշվիչը
    const tries = [
      () => { try { document.activeElement && document.activeElement.blur && document.activeElement.blur(); } catch (x) {} },
      () => { try { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); } catch (x) {} },
      () => { try { const t = document.elementFromPoint(6, Math.round(window.innerHeight * 0.45)); if (t) fire(t); } catch (x) {} }
    ];
    for (const f of tries) { if (!calcVisible()) break; f(); await sleep(150); }
    return 'ok';
  }
  let dumpN = 0;
  function chain(e, n) {
    const out = [];
    let x = e;
    for (let i = 0; i < n && x; i++) { out.push((x.tagName || '?') + '.' + String(x.className || '').toString().slice(0, 24) + '(' + (x.children ? x.children.length : 0) + ')'); x = x.parentElement; }
    return out.join(' < ');
  }
  function dumpDom() {
    dumpN++;
    let out = 'DBG#' + dumpN + ' ' + new Date().toTimeString().slice(0, 8) + '\n';
    try {
      const all = [...document.querySelectorAll('*')];
      const sevens = all.filter((e) => (e.textContent || '').trim() === '7');
      out += '7-երի քանակ՝ ' + sevens.length + ' (տեսանելի ' + sevens.filter(vis).length + ') · iframe ' + document.querySelectorAll('iframe').length + ' · shadow ' + all.filter((e) => e.shadowRoot).length + '\n';
      if (sevens[0]) out += '7: ' + chain(sevens[0], 6) + '\n';
      const vs = sevens.find(vis);
      if (vs) out += '7(vis): ' + chain(vs, 6) + '\n';
      const g = findKeysGeneric();
      out += 'KEYS: ' + (g ? Object.keys(g).join(',') : 'չգտնվեցին') + '\n';
      if (g && g._cont) out += 'CONT: ' + (g._cont.outerHTML || '').replace(/\s+/g, ' ').slice(0, 900) + '\n';
      else if (vs) { let c = vs; for (let i = 0; i < 4 && c.parentElement; i++) c = c.parentElement; out += 'NEAR: ' + (c.outerHTML || '').replace(/\s+/g, ' ').slice(0, 900) + '\n'; }
      const fcd = fieldCenter();
      out += 'VP: ' + window.innerWidth + 'x' + window.innerHeight + ' · anchor=' + fcd.src + ' · calcOpen=' + calcOpenNow(fcd) + ' · fieldNum=' + fieldNum(fcd) + '\n';
      for (const nm of ['field', '7', '0', 'back', 'disp']) {
        const c = kpt(nm, fcd), t = document.elementFromPoint(c[0], c[1]);
        out += 'AT ' + nm + ' (' + Math.round(c[0]) + ',' + Math.round(c[1]) + '): ' + (t ? chain(t, 3) + ' txt=' + (t.textContent || '').trim().slice(0, 8) + ' v=' + (t.value !== undefined ? t.value : '') : 'null') + '\n';
      }
      out += 'IFR: ' + [...document.querySelectorAll('iframe')].map((f) => { let acc = false; try { acc = !!f.contentDocument; } catch (x) {} return (f.src || '').slice(0, 50) + ' acc=' + acc + ' ' + Math.round(f.getBoundingClientRect().width) + 'x' + Math.round(f.getBoundingClientRect().height); }).join(' | ') + '\n';
      const el = stakeEl || findStakeEl();
      out += 'FIELD: ' + (el ? ((el.parentElement || el).outerHTML || '').replace(/\s+/g, ' ').slice(0, 300) : 'չկա');
    } catch (x) { out += 'ERR ' + (x && x.message); }
    try { navigator.clipboard.writeText(out); } catch (x) {}
    return out;
  }
  // ---- դիրքային շարժիչ՝ «Сумма» մակագրությամբ խարսխված, խիստ ստուգումներով ----
  const SSW = 920;
  const KC = [-430, -198, 34], KR = [-533, -441, -350, -259];
  const KM = { '7': [0, 0], '8': [1, 0], '9': [2, 0], '4': [0, 1], '5': [1, 1], '6': [2, 1], '1': [0, 2], '2': [1, 2], '3': [2, 2], '.': [0, 3], '0': [1, 3], back: [2, 3] };
  function fieldCenter() {
    const s = window.innerWidth / SSW;
    try {
      const labels = [...document.querySelectorAll('div,span,label,p')].filter((e) => /^(Сумма|Amount)$/i.test((e.textContent || '').trim()));
      for (const l of labels) {
        const r = l.getBoundingClientRect();
        if (r.width < 10 || r.height < 5 || r.top < 0 || r.top > window.innerHeight) continue;
        return { x: r.left + 187.5 * s, y: r.top + r.height / 2 + 67 * s, s, src: 'label' };
      }
    } catch (x) {}
    return { x: 287 / 402 * window.innerWidth, y: (1281 - 140) / 1634 * window.innerHeight, s, src: 'fixed' };
  }
  function kpt(name, fc) {
    if (name === 'disp') return [fc.x - 314 * fc.s, fc.y - 724 * fc.s];
    if (name === 'field') return [fc.x, fc.y];
    const m = KM[name];
    return [fc.x + KC[m[0]] * fc.s, fc.y + KR[m[1]] * fc.s];
  }
  function hitXY(p) { try { return document.elementFromPoint(p[0], p[1]); } catch (x) { return null; } }
  function dispRaw(fc) { // հաշվիչի ցուցանակի «$…» տեքստը (դատարկ էլ կարող է լինել՝ «$»), եթե հաշվիչը իրոք բաց է
    const t = hitXY(kpt('disp', fc));
    if (!t) return null;
    const re = /^\s*\$\s*[\d.,]*\s*$/;
    const cands = [t.value, t.textContent, t.parentElement && t.parentElement.textContent];
    for (const c of cands) {
      if (c === undefined || c === null) continue;
      const st = String(c).replace(',', '.');
      if (re.test(st)) return st.replace(/[^\d.]/g, '');
    }
    return null;
  }
  function dispNum(fc) { const r = dispRaw(fc); return r === null || r === '' || isNaN(parseFloat(r)) ? null : parseFloat(r); }
  function calcOpenNow(fc) { return dispRaw(fc || fieldCenter()) !== null; }
  function fieldNum(fc) { // «Сумма» դաշտի ընթացիկ թիվը (խիստ ստուգում՝ իսկապես թվային դաշտ է)
    const t = hitXY(kpt('field', fc));
    if (!t) return null;
    const raw = (t.value !== undefined && t.value !== '' ? String(t.value) : String(t.textContent || '')).trim().replace(',', '.');
    const m = raw.match(/^\$?\s*(\d+(?:\.\d+)?)$/);
    return m ? parseFloat(m[1]) : null;
  }
  function tapPt(p) {
    const t = hitXY(p);
    if (!t) return null;
    const o = { bubbles: true, cancelable: true, composed: true, clientX: p[0], clientY: p[1], view: window };
    ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'].forEach((n) => {
      try { t.dispatchEvent(n.startsWith('pointer') ? new PointerEvent(n, o) : new MouseEvent(n, o)); } catch (e) {}
    });
    return t;
  }
  async function typeProp(str) { // վերադարձնում է { ok, info }
    const want = parseFloat(str);
    let fc = fieldCenter();
    if (!calcOpenNow(fc)) {
      const fn = fieldNum(fc);
      if (fn === null) return { ok: false, info: 'Сумма դաշտը չգտնվեց (' + fc.src + ')՝ ոչինչ չեմ սեղմել' };
      if (Math.abs(fn - want) < 1e-9) return { ok: true, info: 'արդեն ' + fn };
      tapPt(kpt('field', fc));
      for (let i = 0; i < 10 && !calcOpenNow(); i++) await sleep(80);
      await sleep(150);
      fc = fieldCenter();
    }
    if (!calcOpenNow(fc)) return { ok: false, info: 'հաշվիչը չբացվեց՝ ստեղները չեմ սեղմել' };
    for (let i = 0; i < 9; i++) { tapPt(kpt('back', fc)); await sleep(25); }
    for (const ch of str) {
      if (!KM[ch]) return { ok: false, info: 'չկա ստեղն ' + ch };
      if (!calcOpenNow(fc)) return { ok: false, info: 'հաշվիչը անհետացավ՝ կանգնեցի' };
      tapPt(kpt(ch, fc)); await sleep(40);
    }
    await sleep(140);
    const shown = dispNum(fc);
    const ok = shown !== null && Math.abs(shown - want) < 1e-9;
    const closers = [
      () => { try { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); } catch (x) {} },
      () => { tapPt(kpt('field', fc)); },
      () => { try { document.activeElement && document.activeElement.blur && document.activeElement.blur(); } catch (x) {} }
    ];
    for (const f of closers) { if (!calcOpenNow(fc)) break; f(); await sleep(180); }
    return { ok, info: 'ցուցանակ=' + shown + (calcOpenNow(fc) ? ' (հաշվիչը բաց մնաց)' : '') };
  }
  async function setStakeAsync(v) { // միայն ստուգված ցուցանակով եղանակ՝ DOM-ի կեղծ հաջողություններ չկան
    const str = String(v);
    const hide = typeof box !== 'undefined' && box && box.style;
    try {
      if (hide) box.style.visibility = 'hidden'; // վահանակը չի ծածկում դաշտը/ստեղները սեղմման ժամանակ
      const pr = await typeProp(str);
      return pr.ok ? { ok: true, how: 'P', info: pr.info } : { ok: false, how: 'fail', info: pr.info };
    } catch (x) { return { ok: false, how: 'err', info: 'սխալ՝ ' + (x && x.message) }; }
    finally { if (hide) box.style.visibility = 'visible'; }
  }
  function readBalance() {
    try {
      const txt = document.body.innerText || '';
      const i = txt.search(/QT\s*(Demo|Real)/i);
      if (i < 0) return null;
      const seg = txt.slice(i, i + 80).replace(/QT\s*(Demo|Real)/i, '').replace(/USD/gi, '');
      const m = seg.match(/(\d[\d,]*(?:\.\d+)?)/);
      if (!m) return null;
      const v = parseFloat(m[1].replace(/,/g, ''));
      return isNaN(v) ? null : v;
    } catch (e) { return null; }
  }
  function applyParlay(res, pay, profit) { // res՝ 1 շահ, -1 կորուստ, 0 ոչ-ոքի
    if (res > 0) {
      par.wins++; par.streak++; par.best = Math.max(par.best, par.streak);
      par.stake = Math.round((profit && profit > 0 ? par.stake + profit : par.stake * (1 + pay / 100)) * 100) / 100;
      if (par.streak >= STEPS) { par.done++; par.streak = 0; par.stake = STAKE0; par.attempts++; parMsg = '🎉 ' + STEPS + '/' + STEPS + ' անցավ!'; try { beep(1); } catch (e) {} }
    } else if (res < 0) {
      par.losses++; par.streak = 0; par.stake = STAKE0; par.attempts++;
    }
    parPend = null; savePar();
    prepareNext(); // անմիջապես դնել հաջորդ գումարը, որ պատրաստ լինի հաջորդ սիգնալին
  }
  function prepareNext() {
    if (!PARLAY || !AUTO || !running) return;
    const a = acct();
    if (a !== 'demo' && !(a === 'real' && ALLOW_REAL && realOk)) return;
    ensureParAcct(a);
    const want = par.stake;
    const task = setStakeAsync(String(want)).then((r) => {
      parMsg = r.ok ? 'պատրաստ՝ հաջորդ գումար $' + want + ' (' + r.how + ')' : '⚠ նախապատրաստումը չստացվեց՝ ' + r.info;
    }).catch((x) => { parMsg = '⚠ նախապատրաստման սխալ՝ ' + (x && x.message); });
    prep = task;
    task.then(() => { if (prep === task) prep = null; });
  }
  function parlayResolve(p, t, asset) { // պահեստային՝ միայն եթե հաշվեկշիռը չի կարդացվում
    if (!parPend || parPend.byBal || parPend.asset !== asset || t < parPend.t + HOLD + 1) return;
    const mv = (p - parPend.entry) * parPend.dir;
    applyParlay(mv > 0 ? 1 : mv < 0 ? -1 : 0, parPend.pay);
  }
  // ---- ավտոմատ սեղմման գործիքներ ----
  let nAuto = 0, autoMsg = '', btnBuy = null, btnSell = null;
  function acct() { // 'demo' | 'real' | 'unknown'
    try {
      const m = (document.body.innerText || '').match(/QT\s*(Demo|Real)/i);
      return m ? m[1].toLowerCase() : 'unknown';
    } catch (e) { return 'unknown'; }
  }
  function payoutNow() {
    try {
      const els = document.querySelectorAll('div,span,p');
      for (const e of els) {
        if (e.children.length) continue;
        const m = (e.textContent || '').trim().match(/^\+(\d{2,3})%$/);
        if (m && e.offsetParent !== null) return Number(m[1]);
      }
    } catch (e) {}
    return null;
  }
  function findBtn(words) {
    const els = document.querySelectorAll('button,div,span,a');
    let best = null;
    for (const e of els) {
      const t = (e.textContent || '').trim().toLowerCase();
      if (words.includes(t) && e.offsetParent !== null) { best = e; if (e.tagName === 'BUTTON') return e; }
    }
    return best;
  }
  function fire(el) {
    const r = el.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
    const o = { bubbles: true, cancelable: true, composed: true, clientX: x, clientY: y, view: window };
    ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'].forEach((n) => {
      try { el.dispatchEvent(n.startsWith('pointer') ? new PointerEvent(n, o) : new MouseEvent(n, o)); } catch (e) {}
    });
  }
  function autoClick(dir, asset) {
    if (!AUTO) return;
    if (!running) { autoMsg = '⏸ կանգնեցված՝ սեղմեք ▶ սկսելու համար'; return; }
    const a = acct();
    if (a === 'unknown') { autoMsg = 'հաշիվը չի որոշվել՝ չեմ սեղմում'; return; }
    ensureParAcct(a);
    if (a === 'real') {
      if (!ALLOW_REAL) { autoMsg = 'REAL հաշիվ՝ ավտոմատ սեղմումը արգելված է (միայն Demo)'; return; }
      if (!realOk) { running = false; autoMsg = 'REAL՝ հաստատված չէ՝ սեղմեք ▶ նորից'; return; }
      if (nAuto >= REAL_MAX_TRADES) { autoMsg = 'REAL գործարքների սահմանը լրացավ (' + REAL_MAX_TRADES + ')'; return; }
      const bnow = readBalance();
      if (sessBal0 !== null && bnow !== null && bnow - par.stake < sessBal0 - REAL_LOSS_LIMIT) { autoMsg = '🛑 կորստի սահմանը ($' + REAL_LOSS_LIMIT + ') հասավ կամ հաջորդ գործարքը կանցնի այն՝ կանգնեցի'; return; }
      if (bnow !== null && bnow < par.stake) { autoMsg = 'հաշվեկշիռը ($' + bnow + ') < գումար $' + par.stake + '՝ կանգնեցի'; return; }
      if (par.stake > REAL_MAX_STAKE) { autoMsg = 'գումարը $' + par.stake + ' > սահմանի $' + REAL_MAX_STAKE + '՝ չեմ սեղմում'; return; }
    }
    if (nAuto >= MAX_AUTO) { autoMsg = 'գործարքների սահմանը լրացավ (' + MAX_AUTO + ')'; return; }
    const pay = payoutNow();
    if (pay !== null && pay < MIN_PAYOUT) { autoMsg = 'եկամտաբերություն ' + pay + '% < ' + MIN_PAYOUT + '%՝ չեմ սեղմում'; return; }
    if (!btnBuy || !document.contains(btnBuy)) btnBuy = findBtn(['купить', 'buy', 'higher']);
    if (!btnSell || !document.contains(btnSell)) btnSell = findBtn(['продать', 'sell', 'lower']);
    const b = dir > 0 ? btnBuy : btnSell;
    if (!b) { autoMsg = 'կոճակը չի գտնվել'; return; }
    if (PARLAY) {
      if (parPend) { autoMsg = 'սպասում եմ նախորդ գործարքի արդյունքին'; return; }
      const bal0 = readBalance();
      const pp = { asset, dir, t: lastTickT, entry: lastTickP, pay: pay || 92, byBal: bal0 !== null };
      parPend = pp; // արգելափակում է նոր սիգնալները, մինչև այս գործարքի արդյունքը
      autoMsg = 'դնում եմ գումար $' + par.stake + '…';
      (prep || Promise.resolve()).then(() => setStakeAsync(String(par.stake))).then((r) => {
        if (parPend !== pp) return;
        if (!r.ok) { parPend = null; parMsg = '⚠ գումարը չդրվեց՝ ' + r.info; autoMsg = 'չսեղմեցի՝ գումարը չի փոխվում (սխալ գումարով գործարք չեմ բացում)'; return; }
        parMsg = 'գումար $' + par.stake + ' դրվեց (' + r.how + ')';
        fire(b);
        if (bal0 !== null) {
          setTimeout(() => {
            if (parPend !== pp) return;
            const bal1 = readBalance();
            if (bal1 === null) { pp.byBal = false; return; }
            const diff = Math.round((bal1 - bal0) * 100) / 100;
            parMsg = 'հաշվեկշիռ ' + bal0 + ' → ' + bal1 + ' (' + (diff > 0 ? '+' : '') + diff + ') ' + (diff > 0 ? 'ՇԱՀ' : diff < 0 ? 'կորուստ' : 'ոչ-ոքի');
            applyParlay(diff > 0.001 ? 1 : diff < -0.001 ? -1 : 0, pp.pay, diff);
          }, HOLD * 1000 + 1600);
        }
        nAuto++;
        autoMsg = 'սեղմվեց ' + (dir > 0 ? 'Купить' : 'Продать') + ' #' + nAuto + ' (գումար $' + par.stake + ')';
      }).catch((x) => { if (parPend === pp) parPend = null; parMsg = '⚠ սխալ՝ ' + (x && x.message); });
      return;
    }
    fire(b);
    nAuto++;
    autoMsg = 'սեղմվեց ' + (dir > 0 ? 'Купить' : 'Продать') + ' #' + nAuto + (pay !== null ? ' (եկամտ. ' + pay + '%)' : '');
  }
  // ---- ձայն (HTML audio՝ չի խլանում անձայն ռեժիմում) + Web Audio պահեստային ----
  let actx = null, soundOn = false, unlocked = false;
  function makeWav(freqs) {
    const sr = 22050, dur = 0.16, gap = 0.03, m = Math.floor(sr * dur), g = Math.floor(sr * gap);
    const total = freqs.length * (m + g), pcm = new Int16Array(total);
    freqs.forEach((f, k) => {
      const o = k * (m + g);
      for (let i = 0; i < m; i++) { const env = Math.min(1, i / 250, (m - i) / 500); pcm[o + i] = Math.sin(2 * Math.PI * f * i / sr) * env * 30000; }
    });
    const bytes = new Uint8Array(44 + pcm.length * 2), dv = new DataView(bytes.buffer);
    const ws = (off, str) => { for (let i = 0; i < str.length; i++) dv.setUint8(off + i, str.charCodeAt(i)); };
    ws(0, 'RIFF'); dv.setUint32(4, 36 + pcm.length * 2, true); ws(8, 'WAVE'); ws(12, 'fmt ');
    dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, 1, true); dv.setUint32(24, sr, true);
    dv.setUint32(28, sr * 2, true); dv.setUint16(32, 2, true); dv.setUint16(34, 16, true); ws(36, 'data'); dv.setUint32(40, pcm.length * 2, true);
    for (let i = 0; i < pcm.length; i++) dv.setInt16(44 + i * 2, pcm[i], true);
    let bin = ''; bytes.forEach((x) => (bin += String.fromCharCode(x)));
    return 'data:audio/wav;base64,' + btoa(bin);
  }
  let upA = null, downA = null;
  try { upA = new Audio(makeWav([660, 990, 1320])); downA = new Audio(makeWav([660, 440, 330])); upA.preload = downA.preload = 'auto'; } catch (e) {}
  function unlock() {
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {}
    try {
      if (!actx) { const AC = window.AudioContext || window.webkitAudioContext; if (AC) actx = new AC(); }
      if (actx && actx.state === 'suspended') actx.resume();
      if (actx) { const bf = actx.createBuffer(1, 1, 22050), sr = actx.createBufferSource(); sr.buffer = bf; sr.connect(actx.destination); sr.start(0); }
    } catch (e) {}
    [upA, downA].forEach((a) => {
      if (!a || a._ok) return;
      try {
        a.muted = true;
        const pr = a.play();
        if (pr && pr.then) pr.then(() => { a.pause(); a.currentTime = 0; a.muted = false; a._ok = true; unlocked = true; }).catch(() => { a.muted = false; });
      } catch (e) { a.muted = false; }
    });
  }
  ['touchend', 'click', 'pointerup'].forEach((ev) => document.addEventListener(ev, unlock, { passive: true, capture: true }));
  function beep(dir) {
    if (!soundOn) return;
    let played = false;
    try {
      const a = dir > 0 ? upA : downA;
      if (a && a._ok) { a.currentTime = 0; a.volume = 1; const pr = a.play(); if (pr && pr.catch) pr.catch(() => {}); played = true; }
    } catch (e) {}
    if (played) return;
    try {
      if (!actx) return;
      const t0 = actx.currentTime, freqs = dir > 0 ? [660, 990, 1320] : [660, 440, 330];
      freqs.forEach((f, i) => {
        const o = actx.createOscillator(), g = actx.createGain(), st = t0 + i * 0.19;
        o.type = 'sine'; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, st); g.gain.exponentialRampToValueAtTime(0.8, st + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, st + 0.17);
        o.connect(g); g.connect(actx.destination); o.start(st); o.stop(st + 0.18);
      });
    } catch (e) {}
  }
  // ---- ցուցանակ ----
  let ov = null, ovTimer = null;
  function showOverlay(dir, asset, ratio) {
    if (!ov) {
      ov = document.createElement('div');
      ov.style.cssText = 'position:fixed;left:22%;right:22%;top:13%;z-index:100000;padding:6px 8px;border-radius:12px;text-align:center;font:700 20px/1.15 -apple-system,sans-serif;color:#fff;opacity:.95;box-shadow:0 0 24px #000a;pointer-events:none';
      document.body.appendChild(ov);
    }
    ov.style.background = dir > 0 ? '#12a34a' : '#d9372a';
    ov.innerHTML = (dir > 0 ? '🟢 ԳՆԵԼ ↑' : '🔴 ՎԱՃԱՌ. ↓') + '<div style="font-size:12px;margin-top:2px;font-weight:600">' + asset + ' · ՀԻՄԱ · ' + HOLD + 'վրկ</div>';
    ov.style.display = 'block';
    beep(dir);
    clearTimeout(ovTimer);
    ovTimer = setTimeout(() => { ov.style.display = 'none'; }, 3500);
  }

  function priceAt(arr, tt) { // վերջին տիկը, որի ժամանակը ≤ tt
    for (let i = arr.length - 1; i >= 0; i--) if (arr[i].t <= tt) return arr[i].p;
    return null;
  }

  function onTick(asset, t, p) {
    const arr = ticks[asset] || (ticks[asset] = []);
    arr.push({ t, p });
    if (arr.length > 900) arr.splice(0, 300);
    nTicks++; lastWall = Date.now();
    if (asset === sel || !sel) { lastTickT = t; lastTickP = p; }
    if (PARLAY) parlayResolve(p, t, asset);
    // ---- արդյունքների հետևում ----
    for (let i = pend.length - 1; i >= 0; i--) {
      const q = pend[i];
      if (q.asset !== asset) continue;
      let open = 0;
      for (const d of DELAYS) {
        if (q.done[d]) continue;
        if (q.entry[d] === undefined) { if (t >= q.t + d) q.entry[d] = p; open++; continue; }
        if (t >= q.t + d + HOLD) {
          const mv = (p - q.entry[d]) * q.dir;
          if (mv > 0) stat[d][0]++; else if (mv < 0) stat[d][1]++;
          if (d === FEAT_D && q.feat && mv !== 0) recordFeat(q.feat, mv > 0, q.pass);
          q.done[d] = true;
        } else open++;
      }
      if (!open) pend.splice(i, 1);
    }
    if ((ONLY_REAL && !isReal(asset)) || (sel && asset !== sel)) return;
    // Bollinger-ի դուրս գալ՝ գինը դուրս է վերջին BB_N վայրկյանի միջինից ±BB_K σ
    if (arr[0].t > t - BB_N) return;
    const wnd = [];
    for (let j = 1; j <= BB_N; j++) { const v = priceAt(arr, t - j); if (v === null) return; wnd.push(v); }
    const mean = wnd.reduce((x, y) => x + y, 0) / BB_N;
    const sd = Math.sqrt(wnd.reduce((x, y) => x + (y - mean) * (y - mean), 0) / BB_N);
    if (!sd) return;
    { const hk = arrKey(arr), hh = sdHist[hk] || (sdHist[hk] = []); hh.push(sd); if (hh.length > 300) hh.shift(); }
    const zv = (p - mean) / sd;
    if (Math.abs(zv) < BB_K) return;
    if (t - (lastSig[asset] || 0) < GAP) return;
    lastSig[asset] = t;
    const ratio = Math.abs(zv);
    const dir = WITH_IMPULSE ? (zv > 0 ? 1 : -1) : (zv > 0 ? -1 : 1);
    const feats = computeFeats(arr, t, p, dir, zv, sd);
    const gd = GATE ? gateDecide(feats) : { pass: true, why: 'ֆիլտրն անջատված է' };
    lastGateMsg = (gd.pass ? 'անցավ՝ ' : 'մերժվեց՝ ') + gd.why + ' [' + feats.sent + ',' + feats.sec + ',' + feats.vol + ']';
    nSig++;
    if (gd.pass) { nPass++; autoClick(dir, asset); showOverlay(dir, asset, ratio); }
    pend.push({ asset, dir, t, entry: { 0: p }, done: {}, feat: feats, pass: gd.pass }); // 0 վրկ՝ ակնթարթային մուտք՝ ընթացիկ գնով
  }

  // ---- պայմանների ուսուցում + ֆիլտր (միայն լավ պահերին սիգնալ) ----
  const GATE = true;        // true՝ սիգնալ/առևտուր միայն ապացուցված լավ պայմաններում
  const GATE_N = 30;        // նվազագույն փորձ՝ պայմանի դույլը «հայտնի» համարելու համար
  const GOOD = 0.56, BAD = 0.48; // լավ/վատ շեմեր (արդյունք ըստ 1 վրկ ուշացման)
  const FEAT_D = 1;
  let feat = {}, gateStat = { pass: [0, 0], fail: [0, 0] }, lastGateMsg = '', lastOutcome = 'na', nPass = 0, featDirty = 0;
  const sdHist = {};
  const FKEY = () => 'po_feat_' + mkt;
  function loadFeat() { feat = {}; gateStat = { pass: [0, 0], fail: [0, 0] }; try { const o = JSON.parse(localStorage.getItem(FKEY()) || 'null'); if (o) { feat = o.feat || {}; gateStat = o.gateStat || gateStat; } } catch (e) {} }
  function saveFeat() { try { localStorage.setItem(FKEY(), JSON.stringify({ feat, gateStat })); } catch (e) {} }
  loadFeat();
  function readSentiment() { // շուկայի տրամադրության ցուցիչ՝ կանաչ (գնել) % ձախից, կարմիր (վաճառել) % աջից
    try {
      const rows = [];
      document.querySelectorAll('div,span').forEach((e) => {
        if (e.children.length) return;
        const tx = (e.textContent || '').trim();
        if (!/^\d{1,2}%$/.test(tx) || !vis(e)) return;
        const r = e.getBoundingClientRect();
        rows.push({ v: parseInt(tx, 10), x: r.left, y: r.top });
      });
      for (let i = 0; i < rows.length; i++) for (let j = 0; j < rows.length; j++) {
        if (i !== j && Math.abs(rows[i].y - rows[j].y) < 8 && rows[i].x < rows[j].x && Math.abs(rows[i].v + rows[j].v - 100) <= 1) return rows[i].v;
      }
    } catch (e) {}
    return null;
  }
  function computeFeats(arr, t, p, dir, zv, sd) {
    const f = {};
    const az = Math.abs(zv);
    f.z = az < 2.5 ? 'z2-2.5' : az < 3 ? 'z2.5-3' : az < 4 ? 'z3-4' : 'z4+';
    f.dir = dir > 0 ? 'up' : 'down';
    const h = sdHist[arrKey(arr)] || [];
    let med = 0; if (h.length >= 30) { const so = h.slice().sort((a, b) => a - b); med = so[Math.floor(so.length / 2)]; }
    const vr = med ? sd / med : 1;
    f.vol = !med ? 'vol?' : vr < 0.8 ? 'vol-low' : vr < 1.3 ? 'vol-mid' : 'vol-high';
    f.sec = 's' + Math.floor((t % 60) / 10);
    let nTk = 0; for (let i = arr.length - 1; i >= 0 && arr[i].t > t - 10; i--) nTk++;
    f.rate = nTk < 8 ? 'tk-low' : nTk < 16 ? 'tk-mid' : 'tk-high';
    const p5 = arr[0].t <= t - 300 ? priceAt(arr, t - 300) : null;
    f.tr5 = p5 === null ? 'tr5?' : ((p - p5) * dir > 0 ? 'tr5-with' : 'tr5-against');
    let hi = -Infinity, lo = Infinity;
    for (let i = arr.length - 1; i >= 0 && arr[i].t > t - 60; i--) { if (arr[i].p > hi) hi = arr[i].p; if (arr[i].p < lo) lo = arr[i].p; }
    if (hi > lo) { let q = (p - lo) / (hi - lo); if (dir < 0) q = 1 - q; f.pos = q > 0.85 ? 'pos-hi' : q < 0.5 ? 'pos-low' : 'pos-mid'; } else f.pos = 'pos?';
    const sb = readSentiment();
    if (sb === null) f.sent = 'sent?'; else { const sh = dir > 0 ? sb : 100 - sb; f.sent = sh >= 60 ? 'sent-with' : sh <= 40 ? 'sent-against' : 'sent-neutral'; }
    f.last = 'last-' + lastOutcome;
    return f;
  }
  function arrKey(arr) { return arr._k || (arr._k = Math.random().toString(36).slice(2)); }
  function gateDecide(f) {
    let known = 0, good = 0, badN = 0, badWhy = '';
    for (const k of Object.keys(f)) {
      const b = f[k], st = feat[k] && feat[k][b];
      if (!st) continue;
      const n = st[0] + st[1];
      if (n < GATE_N) continue;
      known++;
      const r = st[0] / n;
      if (r >= GOOD) good++;
      if (r <= BAD) { badN++; badWhy = badWhy || (b + ' ' + Math.round(r * 100) + '%'); }
    }
    if (known < 4) return { pass: true, why: 'տաքացում (' + known + ' հայտնի դույլ)' };
    if (badN >= 1) return { pass: false, why: 'վատ պայման՝ ' + badWhy };
    if (good < 2) return { pass: false, why: 'քիչ լավ պայման (' + good + '/' + known + ')' };
    return { pass: true, why: good + ' լավ պայման / ' + known };
  }
  function recordFeat(f, win, passed) {
    for (const k of Object.keys(f)) {
      const b = f[k];
      const o = feat[k] || (feat[k] = {});
      const st = o[b] || (o[b] = [0, 0]);
      st[win ? 0 : 1]++;
    }
    gateStat[passed ? 'pass' : 'fail'][win ? 0 : 1]++;
    lastOutcome = win ? 'W' : 'L';
    if (++featDirty >= 10) { featDirty = 0; saveFeat(); }
  }
  function featText() {
    const items = [];
    for (const k of Object.keys(feat)) for (const b of Object.keys(feat[k])) {
      const st = feat[k][b], n = st[0] + st[1];
      if (n >= 25) items.push({ b, n, r: st[0] / n });
    }
    items.sort((a, c) => c.r - a.r);
    const fmt = (x) => x.b + ' ' + Math.round(x.r * 100) + '%(' + x.n + ')';
    const pc = (a) => (a[0] + a[1] ? Math.round(100 * a[0] / (a[0] + a[1])) + '%' : '—');
    return '🎛 ֆիլտր՝ անցած ' + gateStat.pass[0] + '/' + gateStat.pass[1] + ' ' + pc(gateStat.pass) + ' | մերժված ' + gateStat.fail[0] + '/' + gateStat.fail[1] + ' ' + pc(gateStat.fail) +
      '\n✅ ' + (items.slice(0, 4).map(fmt).join(' · ') || 'տվյալ է հավաքվում') +
      '\n⛔ ' + (items.slice(-3).reverse().map(fmt).join(' · ') || '—') +
      '\n📌 ' + (lastGateMsg || '—');
  }
  // ---- watchdog՝ եթե գների հոսքը չի բռնվել կամ կանգնել է, էջը ինքնաբերաբար թարմացնել (առավելագույնը 3 անգամ) ----
  const reloadCount = () => { try { return Number(sessionStorage.getItem('po_rl_f') || 0); } catch (e) { return 0; } };
  const setReload = (n) => { try { sessionStorage.setItem('po_rl_f', String(n)); } catch (e) {} };
  document.addEventListener('DOMContentLoaded', () => setTimeout(() => {
    if (nTicks > 0) { setReload(0); return; }
    const n = reloadCount();
    if (n < 3) { setReload(n + 1); autoMsg = '⚠ հոսքը չբռնվեց, թարմացնում եմ…'; setTimeout(() => location.reload(), 800); }
    else autoMsg = '⚠ հոսքը չի բռնվում՝ թարմացրեք ձեռքով';
  }, 15000));
  setInterval(() => { // հոսքը կանգնել է՞ (45 վրկ առանց տիկի)
    if (nTicks > 0 && lastWall && Date.now() - lastWall > 45000) {
      const n = reloadCount();
      if (n < 3) { setReload(n + 1); autoMsg = '⚠ հոսքը կանգնեց, թարմացնում եմ…'; setTimeout(() => location.reload(), 800); }
    }
  }, 10000);
  // ---- WebSocket ----
  const Orig = window.WebSocket;
  window.WebSocket = function (...a) {
    const ws = new Orig(...a);
    const origSend = ws.send.bind(ws);
    ws.send = function (m) {
      try { if (typeof m === 'string' && m.includes('changeSymbol')) { const o = JSON.parse(m.slice(m.indexOf('{'))); if (o.asset) { sel = o.asset; setMkt(sel); } } } catch (e) {}
      return origSend(m);
    };
    let last = '', chain = Promise.resolve();
    ws.addEventListener('message', (e) => {
      chain = chain.then(async () => {
        let d = e.data;
        if (d instanceof Blob) d = await d.text(); else if (d instanceof ArrayBuffer) d = new TextDecoder().decode(d);
        d = String(d);
        const m = d.match(/^\d*-?\[\s*"([^"]+)"/);
        if (m) { last = m[1]; return; }
        if (last === 'updateStream' && d[0] === '[') {
          try { const a = JSON.parse(d); for (const r of a) if (r && r[0]) onTick(r[0], r[1], r[2]); } catch (e) {}
        } else if (last === 'updateHistoryNewFast' && d[0] === '{') {
          try { const h = JSON.parse(d); if (h.asset) { sel = h.asset; setMkt(sel); } } catch (e) {}
        }
      }).catch(() => {});
    });
    return ws;
  };
  window.WebSocket.prototype = Orig.prototype;
})();
