// ==UserScript==
// @name         Keno · Hot Triple v11
// @match        *://*/*
// @grant        none
// ==/UserScript==
// Կենո՝ ամեն փուլում մաքրում է աղյուսակը, ընտրում «տաք» եռյակ (վերջին փուլերում ամենահաճախ եկած թվերը) և սեղմում խաղադրույքը.
// Պանելում ցուցադրվում է իրական համեմատություն՝ տաք եռյակ / սառը եռյակ / պատահական եռյակ (ինչքան հիթ ունեին նույն փուլերում).
// Լռելյայն աշխատում է ՄԻԱՅՆ FUN (խաղային) փողով. իրական փողի համար պետք է նշել առանձին վանդակը:
// Սա չի բարելավում շանսերը (յուրաքանչյուր վիճակահանություն անկախ է):
(() => {
  'use strict';
  const CFG = Object.assign({
    pick: 3,          // քանի թիվ ընտրել
    window: 12,       // քանի վերջին փուլն է հաշվվում
    decay: 0.85,      // նոր փուլերի կշիռը (1 = բոլորը հավասար)
    minRounds: 3,     // պատմության նվազագույն երկարություն՝ տաք ընտրության համար
    quietMs: 1100,    // փուլի ավարտ = այսքան ժամանակ DOM-ում փոփոխություն չկա
    startWaitMs: 500, // փուլի սկզբից նվազագույն սպասում
    maxWaitMs: 25000, // փուլի առավելագույն սպասում
    settleMs: 450,    // առավելագույն սպասում սեղմումից հետո (ստուգվում է ամեն 40 մվ)    // սեղմումից հետո սպասում՝ վիճակը ստուգելու համար
    maxBets: 40       // լռելյայն սահման՝ խաղադրույքների քանակ (փոխվում է պանելից)
  }, window.__KENO_CFG || {});
  const BET_EXACT = /^(bet|place bet|ставка|ставить|play|играть|start|խաղադրույք|խաղալ|սկսել)(\s+[\d.,]+\s*\w*)?$/i;
  const BET_LOOSE = /ставк|ставить|играть|bet|play|start|խաղադրույք|խաղալ|սկսել/i;
  const BET_BAD = /top|history|auto|risk|info|rules|table|հիստոր/i;
  const CLEAR_EXACT = /^(clear( table| all| selection)?|очист\S*( стол)?|reset|сброс|մաքր\S*|ջնջ\S*)$/i;
  const CLEAR_LOOSE = /clear|очист|reset|сброс|մաքր|ջնջ/i;
  const KENO_RE = /keno|кено|կենո/i;
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  try { localStorage.removeItem('kenoPick'); } catch (_) {} // ընտրվող թվերի քանակը միշտ CFG.pick (3) է, RTP սկանը այն չի փոխում
  const rect = e => { try { return e.getBoundingClientRect(); } catch (_) { return { left: 0, top: 0, width: 0, height: 0 }; } };
  const vis = e => { const r = rect(e); return r.width > 0 && r.height > 0; };
  const cls = e => (e.getAttribute && e.getAttribute('class')) || '';
  const parentOf = e => e.parentElement || ((e.getRootNode && e.getRootNode().host) || null);
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (_) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) {} }
  };

  // ---------- DOM-ի հայտնաբերում (նաև shadow DOM) ----------
  let panel = null;
  function deepAll() {
    const out = [], stack = [document];
    while (stack.length) {
      const r = stack.pop(), els = r.querySelectorAll ? r.querySelectorAll('*') : [];
      for (let i = 0; i < els.length; i++) { if (panel && (panel === els[i] || panel.contains(els[i]))) continue; out.push(els[i]); if (els[i].shadowRoot) stack.push(els[i].shadowRoot); } // սեփական պանելը չի ներառվում
    }
    return out;
  }
  function hostOf(e, t) { // «բջիջ»՝ թվի տարրից վեր՝ քանի դեռ ծնողի տեքստը նույն թիվն է
    let p = e;
    while (p.parentElement && (p.parentElement.textContent || '').trim() === t) { const r = rect(p.parentElement); if (r.width > 170 || r.height > 170) break; p = p.parentElement; }
    return p;
  }
  function findGrid() { // գտնում է 1..N թվերի ցանցը (N ≥ 20). { cells:{n:element}, N } կամ cells:null
    const byAnc = new Map(); let numeric = 0;
    for (const e of deepAll()) {
      if (e.children.length > 2) continue;
      const t = (e.textContent || '').trim();
      if (!/^\d{1,2}$/.test(t)) continue;
      const n = +t; if (n < 1 || n > 99) continue;
      numeric++;
      const host = hostOf(e, t), r = rect(host);
      if (r.width < 6 || r.height < 6 || r.width > 170 || r.height > 170) continue;
      let a = parentOf(host), d = 0;
      while (a && d < 8) { let m = byAnc.get(a); if (!m) byAnc.set(a, m = new Map()); if (!m.has(n)) m.set(n, host); a = parentOf(a); d++; }
    }
    let best = null, bn = 0, bsize = 1e9;
    byAnc.forEach((m, a) => {
      let k = 0; while (m.has(k + 1)) k++;
      const size = (a.querySelectorAll ? a.querySelectorAll('*').length : 1e6);
      if (k > bn || (k === bn && k >= 20 && size < bsize)) { bn = k; best = m; bsize = size; }
    });
    if (bn < 20) return { cells: null, N: 0, numeric };
    const cells = {}; for (let n = 1; n <= bn; n++) cells[n] = best.get(n);
    return { cells, N: bn, numeric };
  }
  function findBtn(exact, loose) {
    const txt = e => (e.textContent || '').trim();
    const all = deepAll().filter(e => vis(e) && e.children.length <= 3 && txt(e).length > 0 && txt(e).length < 30 && !/^\d{1,2}$/.test(txt(e)));
    const byArea = (a, b) => { const ra = rect(a), rb = rect(b); return rb.width * rb.height - ra.width * ra.height; };
    let c = all.filter(e => exact.test(txt(e))).sort(byArea);
    if (!c.length && loose) c = all.filter(e => loose.test(txt(e)) && !BET_BAD.test(txt(e))).sort(byArea);
    const top = c[0]; return top ? ((top.closest && top.closest('button,[role="button"],a')) || top) : null;
  }
  const findBet = () => findBtn(BET_EXACT, BET_LOOSE);
  const findClear = () => findBtn(CLEAR_EXACT, CLEAR_LOOSE);

  // ---------- իրական «հպում» (pointer/touch/mouse/click), թիրախը՝ կետի վերևի տարրը ----------
  function touchSeq(t, x, y, kind) {
    let list = [];
    try { const touch = document.createTouch ? document.createTouch(window, t, 1, x, y, x, y) : new Touch({ identifier: 1, target: t, clientX: x, clientY: y, pageX: x, pageY: y }); list = document.createTouchList ? document.createTouchList(touch) : [touch]; } catch (_) {}
    try { t.dispatchEvent(new TouchEvent(kind === 'start' ? 'touchstart' : 'touchend', { bubbles: true, cancelable: true, touches: kind === 'start' ? list : [], targetTouches: kind === 'start' ? list : [], changedTouches: list })); } catch (_) {}
  }
  function tap(el, mode) {
    const r = rect(el), x = r.left + r.width / 2, y = r.top + r.height / 2;
    let t = null; try { t = document.elementFromPoint(x, y); } catch (_) {}
    if (!t || !(t === el || el.contains(t))) t = el;
    const base = { bubbles: true, cancelable: true, composed: true, clientX: x, clientY: y, screenX: x, screenY: y, view: window };
    const ptr = (type, down) => { const o = Object.assign({}, base, { pointerId: 1, pointerType: 'touch', isPrimary: true, width: 1, height: 1, pressure: down ? 0.5 : 0, button: 0, buttons: down ? 1 : 0 }); return window.PointerEvent ? new PointerEvent(type, o) : new MouseEvent(type, o); };
    const mouse = (type, down, detail) => new MouseEvent(type, Object.assign({}, base, { button: 0, buttons: down ? 1 : 0, detail: detail || 0 }));
    const send = e => { try { t.dispatchEvent(e); } catch (_) {} };
    if (mode === 2) { try { (t.click ? t : el).click(); } catch (_) {} return; }
    send(ptr('pointerover', false));
    send(ptr('pointerdown', true));
    if (mode === 1) touchSeq(t, x, y, 'start');
    send(ptr('pointerup', false));
    if (mode === 1) touchSeq(t, x, y, 'end');
    send(mouse('mousedown', true)); send(mouse('mouseup', false)); send(mouse('click', false, 1));
  }
  let MODE = store.get('kenoMode', 0);

  // ---------- վիճակների ստորագրություններ ----------
  function sig(e) {
    let cs = null; try { cs = getComputedStyle(e); } catch (_) {}
    const k = e.firstElementChild;
    return cls(e) + '|' + (cs ? cs.backgroundColor + '|' + cs.color + '|' + cs.borderColor + '|' + cs.opacity : '') + '|' + (e.getAttribute('aria-pressed') || '') + '|' + (k ? cls(k) : '');
  }
  function vsig(e) { // տեսողական ստորագրություն (առանց class-երի). անտեսանելի class-փոփոխությունները չեն խանգարում
    let cs = null; try { cs = getComputedStyle(e); } catch (_) {}
    const r = rect(e);
    return (cs ? cs.backgroundColor + '|' + cs.borderTopColor + '|' + cs.opacity + '|' + (cs.backgroundImage || '').slice(0, 40) : '') + '|' + Math.round(r.width / 4) + 'x' + Math.round(r.height / 4) + '|' + ((e.textContent || '').trim() ? 1 : 0);
  }
  const norm = s => s.replace(/\d+/g, '#');
  const snapshot = (cells, N) => { const o = {}; for (let n = 1; n <= N; n++) o[n] = sig(cells[n]); return o; };
  const tok = e => { // class-նշիչներ (բջիջ + առաջին երեխա)՝ թվերը նորմալացված
    const s = new Set();
    cls(e).split(/\s+/).filter(Boolean).forEach(t => s.add('c:' + t.replace(/\d+/g, '#')));
    const k = e.firstElementChild; if (k) cls(k).split(/\s+/).filter(Boolean).forEach(t => s.add('k:' + t.replace(/\d+/g, '#')));
    const a = e.getAttribute('aria-pressed'); if (a) s.add('a:' + a);
    return s;
  };
  let IDLE = null, SELTOK = null, IDLETOK = null, IDLEV = null; // «անգործուն» բջիջի նորմալացված ստորագրությունը և «ընտրված» նշիչները (սովորվում են)
  const hasSel = e => !!SELTOK && SELTOK.size > 0 && Array.from(SELTOK).every(t => tok(e).has(t));
  function learnInitial(cells, N) { // START-ի պահին՝ անգործուն տեսքը + (եթե կան նախապես նշված թվեր) «ընտրված» նշիչները
    const cnt = {}, snap = snapshot(cells, N), keys = {};
    for (let n = 1; n <= N; n++) { const k = norm(snap[n]); cnt[k] = (cnt[k] || 0) + 1; }
    IDLE = Object.keys(cnt).sort((a, b) => cnt[b] - cnt[a])[0];
    const tc = {};
    for (let n = 1; n <= N; n++) { keys[n] = Array.from(tok(cells[n])).sort().join(' '); tc[keys[n]] = (tc[keys[n]] || 0) + 1; }
    const idleKey = Object.keys(tc).sort((a, b) => tc[b] - tc[a])[0], others = Object.keys(tc).filter(k => k !== idleKey);
    IDLETOK = new Set(idleKey.split(' ').filter(Boolean));
    { const vc = {}; for (let n = 1; n <= N; n++) { const v = vsig(cells[n]); vc[v] = (vc[v] || 0) + 1; } IDLEV = Object.keys(vc).sort((a, b) => vc[b] - vc[a])[0]; } // անգործուն բջջի տեսողական տեսքը
    if (others.length === 1 && tc[others[0]] <= 12) { const idleSet = new Set(idleKey.split(' ')), diff = others[0].split(' ').filter(t => t && !idleSet.has(t)); if (diff.length) SELTOK = new Set(diff); }
  }
  const selectedNow = (cells, N) => { const o = []; if (!SELTOK) return o; for (let n = 1; n <= N; n++) if (hasSel(cells[n])) o.push(n); return o; };
  let lastMut = Date.now();
  try { new MutationObserver(() => { lastMut = Date.now(); }).observe(document.documentElement, { subtree: true, attributes: true, childList: true, characterData: true }); } catch (_) {}
  // Փուլի ընթացքում՝ ո՞ր բջիջներն են փոխվել (class/style/ենթատարր). օգնում է բռնել կրկին եկած թվերը, որոնց «նշումը» նույնն է մնում
  let REC = null;
  const recMO = (() => { try { return new MutationObserver(ms => { if (!REC) return; for (const m of ms) { let t = m.target; while (t && !REC.cellOf.has(t)) t = parentOf(t); if (t) REC.touched.add(REC.cellOf.get(t)); } }); } catch (_) { return null; } })();
  function startRec(cells, N) { REC = { touched: new Set(), cellOf: new Map() }; if (!recMO) return; recMO.disconnect(); for (let n = 1; n <= N; n++) { REC.cellOf.set(cells[n], n); recMO.observe(cells[n], { attributes: true, subtree: true, childList: true, characterData: true }); } }
  function stopRec() { const r = REC; REC = null; if (recMO) recMO.disconnect(); return r; }

  // ---------- մնացորդ / արժույթ ----------
  const CUR_RE = /^(\d[\d\s.,]*)\s?(FUN|AMD|USD|EUR|RUB|GEL|₽|\$|€|դր)\.?$/i;
  function readBalanceInfo() {
    const pill = deepAll().filter(e => !e.children.length && CUR_RE.test((e.textContent || '').trim()) && rect(e).top < 260)[0];
    if (pill) { const m = (pill.textContent || '').trim().match(CUR_RE); return { value: parseFloat(m[1].replace(/\s/g, '').replace(',', '.')), cur: m[2].toUpperCase() }; }
    const cand = deepAll().filter(e => e.children.length < 3 && (e.textContent || '').length < 60 && /(баланс|balance|մնացորդ|balans)/i.test(e.textContent || ''));
    for (const e of cand) for (const t of [e.textContent, e.nextElementSibling && e.nextElementSibling.textContent, e.parentElement && e.parentElement.textContent]) {
      const m = String(t || '').replace(/\s/g, '').match(/(\d+(?:[.,]\d+)?)/);
      if (m) return { value: parseFloat(m[1].replace(',', '.')), cur: null };
    }
    return { value: null, cur: null };
  }
  const readBalance = () => readBalanceInfo().value;

  // ---------- ընտրություն ----------
  const hist = () => store.get('kenoHist', []);
  // Վիճակագրական թեստ. եկած թիվը հաջորդ փուլում կրկնվո՞ւմ է ավելի հաճախ, քան պատահականությունից է սպասվում (lag 1 և 2)
  function analyze(N) {
    const H = hist(), out = { n: 0, z1: 0, r1: 0, p0: 0, z2: 0, r2: 0, ok: false };
    if (H.length < 8) return out;
    const p0 = H.reduce((a, d) => a + d.length, 0) / H.length / N; out.p0 = p0;
    const lag = L => { let hit = 0, tot = 0; for (let i = L; i < H.length; i++) { const prev = new Set(H[i - L]); H[i].forEach(n => { if (prev.has(n)) hit++; }); tot += H[i - L].length; } return { r: tot ? hit / tot : 0, z: tot ? (hit / tot - p0) / Math.sqrt(p0 * (1 - p0) / tot) : 0, tot }; };
    const a = lag(1), b = lag(2);
    out.n = a.tot; out.r1 = a.r; out.z1 = a.z; out.r2 = b.r; out.z2 = b.z; out.ok = a.tot >= 200;
    return out;
  }
  function verdict(N) {
    const A = analyze(N); if (!A.ok) return { A, dir: 0, text: '🔬 տվյալը քիչ է (փուլ ' + hist().length + '), թեստի համար պետք է ~25+ փուլ' };
    const dir = A.z1 > 2.58 ? 1 : A.z1 < -2.58 ? -1 : 0;
    return { A, dir, text: '🔬 եկած թիվը կրկնվում է ' + (A.r1 * 100).toFixed(1) + '% vs պատահական ' + (A.p0 * 100).toFixed(1) + '% (z=' + A.z1.toFixed(2) + ', n=' + A.n + ') → ' + (dir > 0 ? '✅ «տաք» էֆեկտ կա' : dir < 0 ? '⚠ հակառակ էֆեկտ (սառը)' : 'էֆեկտ չկա (պատահական)') };
  }
  function choose(N) {
    // Նոր տրամաբանություն՝ թեկնածուները ՄԻԱՅՆ նախորդ փուլի դուրս եկած թվերն են (10-ը), և դրանցից ընտրվում է ամենա«տաք» եռյակը
    // (տաքություն = վերջին փուլերում հաճախականություն՝ նոր փուլերի ավելի մեծ կշռով). Հավասարության դեպքում՝ պատահական
    const H = hist(), W = H.slice(-CFG.window), score = {};
    for (let n = 1; n <= N; n++) score[n] = 0;
    W.slice().reverse().forEach((d, i) => { const w = Math.pow(CFG.decay, i); d.forEach(n => { if (score[n] !== undefined) score[n] += w; }); });
    const nums = Object.keys(score).map(Number), j = {};
    nums.forEach(n => { j[n] = Math.random(); });
    const byScore = (arr, desc) => arr.slice().sort((a, b) => (desc ? score[b] - score[a] : score[a] - score[b]) || j[b] - j[a]);
    const last = H.length ? H[H.length - 1].filter(n => n >= 1 && n <= N) : [];
    const rnd = nums.slice().sort(() => Math.random() - 0.5);
    const warm = last.length >= CFG.pick && H.length >= CFG.minRounds;
    const hot = warm ? byScore(last, true).slice(0, CFG.pick) : rnd.slice(0, CFG.pick);
    return { hot, cold: byScore(nums, false).slice(0, CFG.pick), rnd: rnd.slice(0, CFG.pick), warm, verdict: 0 };
  }

  // ---------- վիճակագրություն ----------
  let S = store.get('kenoStats', { rounds: 0, hotHits: 0, coldHits: 0, rndHits: 0, expHits: 0, bets: 0 });
  const saveS = () => store.set('kenoStats', S);

  // ---------- RTP-ի մաթեմատիկա (հիպերերկրաչափական բաշխում) ----------
  const lnC = (n, k) => { if (k < 0 || k > n) return -Infinity; let r = 0; for (let i = 1; i <= k; i++) r += Math.log(n - k + i) - Math.log(i); return r; };
  const pHit = (N, D, k, h) => Math.exp(lnC(D, h) + lnC(N - D, k - h) - lnC(N, k));
  const drawSize = () => { const H = hist(); return H.length >= 5 ? Math.round(H.reduce((a, d) => a + d.length, 0) / H.length) : 10; };
  const rtpOf = (N, D, k, pay) => { let r = 0, m2 = 0; for (let h = 0; h <= k; h++) { const p = pHit(N, D, k, h), m = pay[h] || 0; r += p * m; m2 += p * m * m; } return { rtp: r, sd: Math.sqrt(Math.max(0, m2 - r * r)) }; };
  function readPayouts() { // «N×»-ի վերնագրերը և նրանց վերևի «x.xx x» արժեքները՝ x-կենտրոնով զուգակցված
    const els = deepAll().filter(e => !e.children.length && vis(e)), labels = [], vals = [], cx = e => { const r = rect(e); return r.left + r.width / 2; };
    for (const e of els) {
      const t = (e.textContent || '').trim();
      let m = t.match(/^(\d{1,2})\s?[×x]$/); if (m) { labels.push({ h: +m[1], x: cx(e), y: rect(e).top }); continue; }
      m = t.match(/^(\d[\d\s]*[.,]\d+)\s?[xX×]$/); if (m) vals.push({ v: parseFloat(m[1].replace(/\s/g, '').replace(',', '.')), x: cx(e), y: rect(e).top });
    }
    if (labels.length < 2 || !vals.length) return null;
    const pay = {};
    for (const l of labels) { const c = vals.filter(v => v.y <= l.y + 4).sort((a, b) => Math.abs(a.x - l.x) - Math.abs(b.x - l.x))[0]; if (c && Math.abs(c.x - l.x) < 45) pay[l.h] = c.v; }
    return Object.keys(pay).length >= 2 ? pay : null;
  }
  async function scanRTP() {
    const g = findGrid(); if (!g.cells) return log('⚠ թվերի ցանցը չգտնվեց');
    const cells = g.cells, N = g.N, D = drawSize(); learnInitial(cells, N);
    const risks = [['Low', /^low$/i], ['Medium', /^medium$/i], ['High', /^(risk:?\s*)?high$/i]].map(([n, re]) => [n, findBtn(re, null)]).filter(x => x[1]);
    if (!risks.length) risks.push(['ընթացիկ', null]);
    const res = []; log('📐 RTP սկան (N=' + N + ', դուրս եկած ' + D + ')…');
    const clearBoard = async () => { // մաքրում՝ Clear կոճակով, ապա (եթե անհրաժեշտ է) ձեռքով հանելով
      const clr = findClear();
      if (clr) { tap(clr, MODE); await sleep(200); }
      for (let t = 0; t < 2 && SELTOK && selectedNow(cells, N).length; t++) {
        if (clr) await tapUntil(clr, () => selectedNow(cells, N).length === 0, 'Clear Table');
        for (const n of selectedNow(cells, N)) await tapUntil(cells[n], () => !hasSel(cells[n]), 'հանել ' + n);
      }
    };
    for (const [rn, rb] of risks) {
      if (rb) { tap(rb, MODE); await sleep(350); }
      await clearBoard();
      for (let k = 1; k <= 10; k++) { // աստիճանաբար՝ ամեն քայլին ավելացնում ենք ևս մեկ թիվ (մաքրում միջանկյալ չի պահանջվում)
        const bt = tok(cells[k]), bs = sig(cells[k]);
        await tapUntil(cells[k], () => (SELTOK ? hasSel(cells[k]) : sig(cells[k]) !== bs), 'ընտրել ' + k);
        if (!SELTOK && sig(cells[k]) !== bs) { const added = Array.from(tok(cells[k])).filter(t => !bt.has(t)); if (added.length) SELTOK = new Set(added); }
        await sleep(250);
        const pay = readPayouts(); if (!pay) { log('⚠ մուլտիպլիկատորները չկարդացվեցին (k=' + k + ')'); continue; }
        const r = rtpOf(N, D, k, pay); res.push({ risk: rn, k, rtp: r.rtp, sd: r.sd });
      }
      await clearBoard();
    }
    await clearBoard();
    if (!res.length) return log('⚠ RTP-ը չհաշվվեց');
    res.forEach(r => log('· ' + r.risk + ' k=' + r.k + ': RTP ' + (r.rtp * 100).toFixed(2) + '% · ստանդարտ շեղում ' + r.sd.toFixed(1) + '×'));
    const best = res.slice().sort((a, b) => b.rtp - a.rtp)[0];
    log('✅ լավագույնը՝ ' + best.risk + ', ' + best.k + ' թիվ (RTP ' + (best.rtp * 100).toFixed(2) + '%)՝ միայն տեղեկատվություն. ընտրությունը մնում է ' + CFG.pick + ' թիվ' + (best.rtp < 1 ? '. RTP < 100% նշանակում է՝ միջինում միշտ կորուստ է' : ''));
  }

  // ---------- UI ----------
  let logEl = null, statEl = null, btn = null, inBets = null, inReal = null, running = false, G = null, startBal = null;
  function log(t) { if (!logEl) return; const d = document.createElement('div'); d.textContent = t; logEl.insertBefore(d, logEl.firstChild); while (logEl.childNodes.length > 40) logEl.removeChild(logEl.lastChild); }
  function showStats() {
    if (!statEl) return;
    const r = S.rounds || 1;
    statEl.textContent = 'փուլ ' + S.rounds + ' · հիթ/փուլ՝ տաք ' + (S.hotHits / r).toFixed(2) + ' · սառը ' + (S.coldHits / r).toFixed(2) + ' · պատահական ' + (S.rndHits / r).toFixed(2) + ' · սպասվող ' + (S.expHits / r).toFixed(2);
  }
  const INP = 'background:#222;color:#fff;border:1px solid #555;border-radius:4px;padding:2px';
  function build() {
    panel = document.createElement('div');
    panel.id = 'kenoPanel';
    panel.style.cssText = 'position:fixed;top:60px;right:8px;z-index:2147483647;background:#111;color:#fff;padding:8px;border-radius:8px;font:12px sans-serif;width:230px';
    panel.innerHTML = '<div id="kGrip" style="text-align:center;padding:6px;margin-bottom:6px;background:#333;border-radius:6px;cursor:move;touch-action:none;user-select:none">⠿ Կենո · տաք եռյակ v11</div>' +
      '<button id="kBtn" style="width:100%;padding:8px;font-weight:bold;background:#2a2;color:#fff;border:0;border-radius:6px">START</button>' +
      '<div style="display:flex;gap:4px;margin-top:6px;align-items:center"><span style="flex:1">խաղադրույք ≤</span><input id="kBets" type="number" style="width:70px;' + INP + '"></div>' +
      '<label style="display:flex;gap:6px;margin-top:6px;align-items:center"><input id="kReal" type="checkbox"> թույլատրել իրական փողով (լռելյայն՝ միայն FUN)</label>' +
      '<div style="display:flex;gap:4px;margin-top:6px"><button id="kDbg" style="flex:1;padding:6px;background:#345;color:#fff;border:0;border-radius:6px">🔍 Debug</button><button id="kRst" style="flex:1;padding:6px;background:#345;color:#fff;border:0;border-radius:6px">↺ Զրո</button><button id="kTest" style="flex:1;padding:6px;background:#345;color:#fff;border:0;border-radius:6px">🔬 Թեստ</button><button id="kRtp" style="flex:1;padding:6px;background:#345;color:#fff;border:0;border-radius:6px">📐 RTP</button></div>' +
      '<div id="kStat" style="margin-top:6px;font-weight:bold"></div><div id="kLog" style="margin-top:6px;max-height:160px;overflow:auto"></div>';
    document.body.appendChild(panel);
    logEl = panel.querySelector('#kLog'); statEl = panel.querySelector('#kStat'); btn = panel.querySelector('#kBtn');
    inBets = panel.querySelector('#kBets'); inReal = panel.querySelector('#kReal');
    inBets.value = store.get('kenoMaxBets', CFG.maxBets); inReal.checked = !!store.get('kenoRealOK', false);
    inBets.onchange = () => store.set('kenoMaxBets', +inBets.value || CFG.maxBets);
    inReal.onchange = () => store.set('kenoRealOK', !!inReal.checked);
    const grip = panel.querySelector('#kGrip'); let dx = 0, dy = 0, drag = false;
    grip.addEventListener('pointerdown', e => { drag = true; const r = panel.getBoundingClientRect(); dx = e.clientX - r.left; dy = e.clientY - r.top; try { grip.setPointerCapture(e.pointerId); } catch (_) {} e.preventDefault(); });
    grip.addEventListener('pointermove', e => { if (!drag) return; panel.style.left = Math.max(0, e.clientX - dx) + 'px'; panel.style.top = Math.max(0, e.clientY - dy) + 'px'; panel.style.right = 'auto'; });
    grip.addEventListener('pointerup', () => { drag = false; });
    btn.onclick = () => { if (running) stop('կանգնեցված'); else start(); };
    panel.querySelector('#kRst').onclick = () => { store.set('kenoHist', []); S = { rounds: 0, hotHits: 0, coldHits: 0, rndHits: 0, expHits: 0, bets: 0 }; saveS(); showStats(); log('↺ պատմությունը և վիճակագրությունը մաքրվեց'); };
    panel.querySelector('#kDbg').onclick = debugDump;
    panel.querySelector('#kRtp').onclick = () => { if (!running) scanRTP(); else log('⚠ նախ սեղմիր STOP'); };
    panel.querySelector('#kTest').onclick = () => log(verdict(G && G.N || 40).text);
    showStats();
    log('✅ սքրիփթը աշխատում է (' + (window.top === window ? 'հիմնական էջ' : 'iframe') + ')');
    try { if (window.top !== window) window.top.postMessage({ __kenoPanel: 1 }, '*'); } catch (_) {}
  }
  function debugDump() {
    const g = findGrid(), b = findBet(), k = findClear(), bi = readBalanceInfo();
    if (g.cells && IDLE === null) learnInitial(g.cells, g.N);
    const ifr = Array.from(document.querySelectorAll('iframe')).map(f => (f.src || '').slice(0, 60));
    const out = [
      'frame=' + (window.top === window ? 'top' : 'iframe') + ' url=' + location.hostname + ' mode=' + MODE,
      'grid=' + (g.cells ? 'OK N=' + g.N + ' ընտրված=' + selectedNow(g.cells, g.N).join(',') : 'ՉԳՏՆՎԵՑ (թվային տարրեր՝ ' + g.numeric + ')'),
      'bet=' + (b ? '«' + (b.textContent || '').trim().slice(0, 20) + '» ' + b.tagName + '.' + cls(b).slice(0, 30) : 'ՉԳՏՆՎԵՑ'),
      'clear=' + (k ? '«' + (k.textContent || '').trim().slice(0, 20) + '»' : 'ՉԳՏՆՎԵՑ'),
      'balance=' + bi.value + ' ' + bi.cur, 'hist=' + hist().length, 'iframes=' + (ifr.length ? ifr.join(' | ') : '0'),
      'idle=' + (IDLE || '?').slice(0, 70), 'selTok=' + (SELTOK ? Array.from(SELTOK).join(' ').slice(0, 70) : '?')
    ];
    out.forEach(x => log(x));
    try { navigator.clipboard.writeText(out.join('\n')); } catch (_) {}
  }

  // ---------- խաղային ցիկլ ----------
  function stop(why) { running = false; if (btn) { btn.textContent = 'START'; btn.style.background = '#2a2'; } log('⏹ ' + why); }
  function start() {
    G = findGrid(); if (!G.cells) return log('⚠ թվերի ցանցը չգտնվեց՝ սեղմիր 🔍 Debug');
    if (!findBet()) return log('⚠ խաղադրույքի կոճակը չգտնվեց՝ սեղմիր 🔍 Debug');
    const bi = readBalanceInfo(), isFun = bi.cur === 'FUN';
    if (!isFun && !inReal.checked) return log('🔒 ' + (bi.cur ? 'իրական արժույթ (' + bi.cur + ')' : 'FUN ռեժիմը չճանաչվեց') + ' → լռելյայն չեմ խաղում. Եթե ուզում ես՝ նշիր «թույլատրել իրական փողով»');
    learnInitial(G.cells, G.N);
    running = true; S.bets = 0; saveS(); startBal = bi.value;
    btn.textContent = 'STOP'; btn.style.background = '#c22';
    log('▶ սկսեցի · թվեր 1–' + G.N + (startBal !== null ? ' · մնացորդ ' + startBal + (bi.cur ? ' ' + bi.cur : '') : ' · մնացորդը չի կարդացվում՝ միայն քանակի սահման'));
    loop();
  }
  async function loop() {
    while (running) {
      const maxBets = +inBets.value || CFG.maxBets;
      if (S.bets >= maxBets) { stop('սահմանաչափ՝ ' + maxBets + ' խաղադրույք'); break; }
      try { await playRound(); } catch (e) { log('⚠ ' + e.message); await sleep(1500); }
      await sleep(150);
    }
  }
  // Սեղմում՝ մինչև պայմանը կատարվի (փորձում է հպման 3 տարբեր եղանակ)
  async function tapUntil(el, ok, what) {
    for (let k = 0; k < 3; k++) {
      const mode = (MODE + k) % 3;
      tap(el, mode);
      for (let w = 0; w < CFG.settleMs; w += 40) { await sleep(40); if (ok()) break; }
      if (ok()) { if (mode !== MODE) { MODE = mode; store.set('kenoMode', MODE); log('ℹ հպման եղանակ՝ ' + mode); } return true; }
    }
    log('⚠ չհաջողվեց՝ ' + what);
    return false;
  }
  async function playRound() {
    G = findGrid(); if (!G.cells) throw new Error('ցանցը կորավ');
    const cells = G.cells, N = G.N;
    if (IDLE === null) learnInitial(cells, N);
    // 1) աղյուսակի մաքրում (նախորդ ընտրությունը)
    const clr = findClear();
    if (clr) { tap(clr, MODE); await sleep(150); }
    let sel = selectedNow(cells, N);
    if (sel.length) {
      if (clr) await tapUntil(clr, () => selectedNow(cells, N).length === 0, 'Clear Table');
      for (const n of selectedNow(cells, N)) await tapUntil(cells[n], () => !hasSel(cells[n]), 'հանել ' + n); // Clear չկա/չաշխատեց՝ ձեռքով հանում ենք
      sel = selectedNow(cells, N);
      if (sel.length) log('⚠ աղյուսակը չմաքրվեց՝ մնացին ' + sel.join(','));
    }
    const clean = snapshot(cells, N);
    // 2) ընտրություն
    const pk = choose(N);
    for (const n of pk.hot) {
      const beforeTok = tok(cells[n]), beforeSig = sig(cells[n]);
      await tapUntil(cells[n], () => (SELTOK ? hasSel(cells[n]) : sig(cells[n]) !== beforeSig), 'ընտրել ' + n);
      if (!SELTOK && sig(cells[n]) !== beforeSig) { const added = Array.from(tok(cells[n])).filter(t => !beforeTok.has(t)); if (added.length) { SELTOK = new Set(added); log('ℹ «ընտրված» տեսքը սովորվեց՝ ' + added.join(' ').slice(0, 40)); } }
    }
    await sleep(100);
    const isPicked = n => (SELTOK ? hasSel(cells[n]) : sig(cells[n]) !== clean[n]);
    const notPicked = pk.hot.filter(n => !isPicked(n));
    if (notPicked.length) throw new Error('թվերը չընտրվեցին (' + notPicked.join(',') + ')՝ խաղադրույք չեմ անում');
    if (SELTOK) { const extra = selectedNow(cells, N).filter(n => !pk.hot.includes(n)); if (extra.length) log('⚠ ավելորդ նշված՝ ' + extra.join(',')); }
    // 3) խաղադրույք
    const bet = findBet(); if (!bet) throw new Error('խաղադրույքի կոճակը կորավ');
    log((pk.warm ? '🔥 ' : '🎲 ') + pk.hot.join('-') + ' · խաղադրույք');
    const base = snapshot(cells, N), allowed = {}, seen = {}, peak = new Set(), fresh = new Set();
    for (let n = 1; n <= N; n++) { allowed[n] = new Set([base[n], clean[n]]); seen[n] = new Set([base[n], clean[n]]); }
    // «նշված» = class-նշիչներ, որոնք ոչ անգործուն են, ոչ «ընտրված» (այլապես՝ ստորագրությամբ)
    const isHL = (n, sg) => {
      if (IDLETOK && IDLETOK.size) { const t = tok(cells[n]); for (const x of t) if (!IDLETOK.has(x) && !(SELTOK && SELTOK.has(x))) return true; return false; }
      return norm(sg) !== IDLE && !(pk.hot.includes(n) && sg === base[n]);
    };
    const vsnap = () => { const o = {}; for (let n = 1; n <= N; n++) o[n] = vsig(cells[n]); return o; };
    const modal = (vs, ns) => { const c = {}; ns.forEach(n => { c[vs[n]] = (c[vs[n]] || 0) + 1; }); return Object.keys(c).sort((a, b) => c[b] - c[a])[0]; };
    const nonPick = []; for (let n = 1; n <= N; n++) if (!pk.hot.includes(n)) nonPick.push(n);
    const baseV = vsnap(), bgV0 = (IDLEV && nonPick.some(n => baseV[n] === IDLEV)) ? IDLEV : modal(baseV, nonPick), stale = new Set(nonPick.filter(n => baseV[n] !== bgV0));
    // ընտրվածների «հիթը»՝ class-նշիչներով (եթե հնարավոր է). տեսողականը շփոթվում է, երբ նախորդ փուլի նշումը հանվում է
    const tokOK = () => !!(IDLETOK && IDLETOK.size);
    const pickHit = (n, vs) => tokOK() ? (!!REC && REC.touched.has(n) && Array.from(tok(cells[n])).some(x => !IDLETOK.has(x) && !(SELTOK && SELTOK.has(x)))) : vs[n] !== baseV[n]; // փոփոխված և հիմա «նշված» (նաև նախորդ փուլի նույն նշումով դեպքում)
    const dWith = (vs, bg) => { const d = nonPick.filter(n => vs[n] !== bg); pk.hot.forEach(n => { if (pickHit(n, vs)) d.push(n); }); return d; };
    const plausible = d => d.length >= 3 && d.length <= N * 0.6;
    // ֆոն՝ նախ՝ նախքան խաղադրույքը եղած անգործուն տեսքը (չի շփոթվում, երբ դուրս եկածները ~կեսն են). եթե անհավանական է՝ ընթացիկ ամենահաճախ տեսքը
    const dOf = vs => { const a = dWith(vs, bgV0); if (plausible(a)) return a; const b = dWith(vs, modal(vs, nonPick)); return plausible(b) ? b : a; };
    let bestD = [], finalD = [];
    startRec(cells, N);
    const m0 = lastMut;
    let lastChange = Date.now(), cur = base;
    const sample = () => { // նմուշառում՝ ամբողջ փուլի ընթացքում (նաև անցողիկ նշումները բռնելու համար)
      cur = snapshot(cells, N);
      for (let n = 1; n <= N; n++) {
        if (!seen[n].has(cur[n])) { seen[n].add(cur[n]); lastChange = Date.now(); if (!allowed[n].has(cur[n])) fresh.add(n); }
        if (isHL(n, cur[n])) peak.add(n); // գոնե մեկ անգամ՝ «նշված» (դուրս եկած) վիճակում
      }
      finalD = dOf(vsnap());
      if (plausible(finalD) && finalD.length >= bestD.length) bestD = finalD.slice();
    };
    let started = false;
    for (let k = 0; k < 3 && !started; k++) {
      const mode = (MODE + k) % 3;
      tap(bet, mode); if (k === 0) { S.bets++; saveS(); }
      const tEnd = Date.now() + 900;
      while (Date.now() < tEnd && !started) { await sleep(60); sample(); started = lastMut !== m0 || Object.keys(cur).some(n => cur[n] !== base[n]); }
      if (started && mode !== MODE) { MODE = mode; store.set('kenoMode', MODE); log('ℹ հպման եղանակ՝ ' + mode); }
      if (!started) log('⚠ խաղադրույքը չաշխատեց (եղանակ ' + mode + ')՝ փորձում եմ ուրիշը');
    }
    if (!started) { stopRec(); throw new Error('խաղադրույքի կոճակը չի արձագանքում'); }
    const t0 = Date.now(); lastChange = Date.now();
    while (Date.now() - t0 < CFG.maxWaitMs) {
      await sleep(80);
      sample();
      if (Date.now() - t0 > CFG.startWaitMs && Date.now() - lastChange > CFG.quietMs && Date.now() - lastMut > CFG.quietMs) break;
    }
    const rec = stopRec();
    // դուրս եկած թվեր՝ ա) փոփոխված (mutation) և երբևէ «նշված» վիճակում եղած բջիջներ. բ) պահեստային՝ նոր ստորագրություն ստացածները
    // ա) տեսողական վերլուծություն (նախապատվություն). բ) mutation+class. գ) նոր ստորագրություններ
    const keep = n => !stale.has(n) || (rec && rec.touched.has(n)); // նախորդ փուլի մնացած նշումները չհաշվել (եթե չեն թարմացվել)
    let drawn = (plausible(finalD) ? finalD : bestD).filter(keep);
    let how = 'v';
    if (!plausible(drawn)) { drawn = rec ? Array.from(rec.touched).filter(n => peak.has(n)) : []; how = 'm'; }
    if (!plausible(drawn)) { drawn = Array.from(fresh); how = 'f'; }
    drawn.sort((a, b) => a - b);
    if (!plausible(drawn)) {
      const vs = vsnap(), c = {}; for (let n = 1; n <= N; n++) c[vs[n]] = (c[vs[n]] || 0) + 1;
      log('⚠ դուրս եկած թվերը չկարդացվեցին (' + drawn.length + ')՝ տեսքերի խմբեր՝ ' + Object.keys(c).map(k => c[k]).sort((a, b) => b - a).join('/') + ' · տես 🔍 Debug');
      return;
    }
    const H = hist(); H.push(drawn); store.set('kenoHist', H.slice(-200));
    const hit = a => a.filter(n => drawn.includes(n)).length, hh = hit(pk.hot);
    S.rounds++; S.hotHits += hh; S.coldHits += hit(pk.cold); S.rndHits += hit(pk.rnd); S.expHits += CFG.pick * drawn.length / N; saveS();
    log('→ դուրս եկավ ' + drawn.length + ' թիվ (' + how + ') · հիթ ' + hh + '/' + CFG.pick);
    if (S.rounds % 10 === 0) log(verdict(N).text);
    showStats();
  }

  // ---------- պանելը՝ երևում է, երբ էջը Կենո է թվում ----------
  const looksKeno = () => {
    try {
      if (KENO_RE.test(document.title + ' ' + location.href)) return true;
      const txt = (document.body && document.body.innerText || '').slice(0, 4000);
      if (KENO_RE.test(txt)) return true;
    } catch (_) {}
    return false;
  };
  let tries = 0, waitTicks = 0, childPanel = false;
  if (window.top === window) window.addEventListener('message', e => { if (e.data && e.data.__kenoPanel) childPanel = true; });
  const watcher = setInterval(() => {
    if (panel) return clearInterval(watcher);
    if (!document.body) return;
    tries++;
    const g = findGrid(), want = g.cells || looksKeno() || g.numeric >= 25;
    if (!want) { if (tries > 90) clearInterval(watcher); return; }   // 3 րոպե՝ կարծես Կենո էջ չէ
    if (g.cells || window.top !== window) build();                  // ցանցը այս շրջանակում է / iframe, որ Կենո է թվում
    else if (++waitTicks > 5 && !childPanel) build();               // հիմնական էջ՝ պահեստային, եթե iframe-ի պանել չկա
  }, 2000);
})();
