// ==UserScript==
// @name         PO fast 10s signal
// @match        https://*.pocketoption.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==
(function () {
  // ===== ԼՐԱՑՐԵՔ =====
  let BOT_TOKEN = '', CHAT_ID = '';
  try {
    BOT_TOKEN = localStorage.getItem('po_bot') || '';
    CHAT_ID = localStorage.getItem('po_chat') || '';
  } catch (e) {}
  document.addEventListener('DOMContentLoaded', () => setTimeout(() => {
    if (BOT_TOKEN && CHAT_ID) return;
    BOT_TOKEN = prompt('Bot token:') || '';
    CHAT_ID = prompt('Chat id:') || '';
    try { localStorage.setItem('po_bot', BOT_TOKEN); localStorage.setItem('po_chat', CHAT_ID); } catch (e) {}
  }, 1500));
  const WINDOW_MS = 5000;    // ժամանակահատված
  const MIN_TOTAL = 3;       // նվազագույն գործարք պատուհանում
  const THRESH = 0.65;       // ամբոխի մեկ կողմի մասնաբաժինը
  const WEIGHT_BY_AMOUNT = false; // true՝ ըստ գումարի, false՝ ըստ քանակի
  // ====================

  const deals = [];
  const buckets = {}; const seen = new Set();        // asset -> {buy, sell, nb, ns}
  const raw = [];
  const box = document.createElement('div');
  box.style.cssText = 'position:fixed;bottom:90px;left:4px;z-index:99999;background:#000c;color:#0f0;font:11px monospace;padding:4px;max-width:75vw';
  const info = document.createElement('span');
  info.textContent = 'WS:0 deals:0 ';
  const btn = document.createElement('button');
  btn.textContent = 'Copy';
  const counts = {}, samples = {};
  const SKIP = /updateStream|updateHistory|updateCharts|chat_room|Balance|updateClosedDeals|updateOpenedDeals|updateOpenedDynamic|Express|indicator|favorite|alert|ai-strategy|Pending|Express|serverName/i;
  btn.onclick = () => {
    navigator.clipboard.writeText(report());
  };
  const box2 = document.createElement('div');
  box2.style.whiteSpace = 'pre-wrap';
  info.onclick = () => {
    const b = prompt('Bot token (123456:ABC...):', BOT_TOKEN), c = prompt('Chat id:', CHAT_ID);
    if (b !== null && c !== null) {
      BOT_TOKEN = b.trim().replace(/^bot/i, ''); CHAT_ID = c.trim();
      try { localStorage.setItem('po_bot', BOT_TOKEN); localStorage.setItem('po_chat', CHAT_ID); } catch (e) {}
      send('✅ test');
    }
  };
  const grip = document.createElement('span');
  grip.textContent = ' ✥ ';
  grip.style.cssText = 'padding:4px 8px;background:#333;margin-left:4px;font-size:14px';
  grip.addEventListener('touchmove', (e) => {
    const t = e.touches[0];
    box.style.bottom = 'auto';
    box.style.left = Math.max(0, t.clientX - 20) + 'px';
    box.style.top = Math.max(0, t.clientY - 10) + 'px';
    e.preventDefault();
  }, { passive: false });
  box.append(info, btn, grip, box2);
  document.addEventListener('DOMContentLoaded', () => document.body.appendChild(box));
  let nWs = 0, nDeals = 0, lastName = '';
  const EXPIRY_MS = 60000;
  // ---- 5s tick analysis: many variants, every tick, persisted ----
  const TF = 10; // մոմի տևողություն (վրկ)
  const HZ = TF, OVL = HZ * 2, BUF = TF <= 60 ? 1300 : 2600;
  const K = { an: TF === 60 ? 'po_an60' : 'po_an' + TF, cond: TF === 60 ? 'po_cond2' : 'po_cond' + TF, sig: TF === 60 ? 'po_sig2' : 'po_sig' + TF };
  let market = 'otc'; // 'otc' կամ 'real'՝ վիճակագրությունը առանձին է
  const marketOf = (a) => (/_otc$/i.test(a || '') ? 'otc' : 'real');
  const KM = (n) => K[n] + (market === 'real' ? '_real' : '');
  const ticks = {}, tq = {}, tstat = {}, cstat = {}, rec = {};
  let curAsset = '', selAsset = '', bestName = '', lastSig = null, sentMin = -1;
  const sg = (x) => (x > 0 ? 1 : x < 0 ? -1 : 0);
  const VARS = {};
  for (const L of [1, 2, 3, 4, 6, 10, 20]) {
    VARS['mom' + L] = (t) => { const n = t.length; return n > L ? sg(t[n-1].p - t[n-1-L].p) : 0; };
    VARS['rev' + L] = (t) => -VARS['mom' + L](t);
  }
  for (const W of [10, 20, 40, 80]) {
    const dev = (t) => { const n = t.length; if (n < W) return 0; let sum = 0; for (let i = n - W; i < n; i++) sum += t[i].p; return sg(t[n-1].p - sum / W); };
    VARS['meanrev' + W] = (t) => -dev(t);
    VARS['trend' + W] = (t) => dev(t);
  }
  for (const W of [150, 300, 600, 1200]) {
    const dev = (t) => { const n = t.length; if (n < W) return 0; let sum = 0; for (let i = n - W; i < n; i++) sum += t[i].p; return sg(t[n-1].p - sum / W); };
    VARS['meanrev' + W] = (t) => -dev(t);
    VARS['trend' + W] = (t) => dev(t);
  }
  for (const W of [300, 900]) {
    const pos = (t) => { const n = t.length; if (n < W) return 0; let hi = -Infinity, lo = Infinity; for (let i = n - W; i < n; i++) { const p = t[i].p; if (p > hi) hi = p; if (p < lo) lo = p; } const r = hi - lo; if (!r) return 0; const q = (t[n-1].p - lo) / r; return q > 0.9 ? 1 : q < 0.1 ? -1 : 0; };
    VARS['rngRev' + W] = (t) => -pos(t); // վերևում՝ կիջնի, ներքևում՝ կբարձրանա
    VARS['rngBrk' + W] = (t) => pos(t);  // շարունակում է
  }
  try { Object.assign(tstat, JSON.parse(localStorage.getItem(KM('an')) || '{}').t || {}); Object.assign(cstat, JSON.parse(localStorage.getItem(KM('an')) || '{}').c || {}); } catch (e) {}
  const WIN = 600, DECAY = 1 - 1 / WIN;
  for (const k in VARS) if (!tstat[k]) tstat[k] = { w: 0, l: 0 };
  for (const k in tstat) { const v = tstat[k], t = v.w + v.l; if (t > WIN) { v.w *= WIN / t; v.l *= WIN / t; } }
  function onTick(asset, ts, price) {
    if (marketOf(asset) !== market) return; // մյուս շուկայի տիկերը չեն խառնվում
    const arr = ticks[asset] || (ticks[asset] = []);
    if (!selAsset) curAsset = asset;
    if (arr.length) {
      const sv = secVol[asset] || (secVol[asset] = new Array(60).fill(null));
      const sec = Math.floor(ts % 60), dlt = Math.abs(price - arr[arr.length - 1].p);
      sv[sec] = sv[sec] === null ? dlt : sv[sec] * 0.98 + dlt * 0.02;
    }
    arr.push({ ts, p: price });
    if (arr.length > BUF) arr.shift();
    if (TF === 60) { upBuf.push([asset, ts, price]); if (upBuf.length > 20000) upBuf.splice(0, 5000); }
    tickCount++; lastTickAt = Date.now(); tickLog.push(lastTickAt); if (tickLog.length > 400) tickLog.shift();
    trackList(vsig, asset, ts, price, (q, win) => { for (const k of q.keys) { const c = cond[k] || (cond[k] = { w: 0, l: 0 }); if (win) c.w++; else c.l++; } });
    trackList(latPend, asset, ts, price, (q, win) => { if (win) sigStat.lat.w++; else sigStat.lat.l++; });
    trackList(sigPend, asset, ts, price, (q, win) => { const z = sigStat[q.src]; if (win) z.w++; else z.l++; });
    const q = tq[asset] || (tq[asset] = []);
    while (q.length && ts >= q[0].ts + HZ) {
      const e = q.shift();
      if (e.k === bestName && price !== e.p) { const r = rec[asset] || (rec[asset] = []); r.push({ ts, ok: (price > e.p) === (e.dir > 0) }); if (r.length > 400) r.shift(); }
      if (price !== e.p) {
        const v = tstat[e.k];
        v.w *= DECAY; v.l *= DECAY; // շարժվող պատուհան՝ տոկոսը արձագանքում է վերջին շուկային
        if ((price > e.p) === (e.dir > 0)) v.w++; else v.l++;
      }
    }
    for (const k in VARS) {
      const d = VARS[k](arr);
      if (d) q.push({ k, ts, p: price, dir: d });
    }
    if (TSEND && ts % TF >= TF - Math.min(10, TF / 5) && sentMin !== Math.floor(ts / TF) && asset === (selAsset || curAsset)) {
      sentMin = Math.floor(ts / TF);
      try { minuteEnd(asset, ts); } catch (e) {}
    }
  }
  const TSEND = true;
  const CSEND = false;
  const MIN_RATE = 0.52, MIN_TRIALS = TF === 60 ? 500 : 150, GAP_MS = 60000;
  let lastSent = 0;
  // ---- պայմանային վիճակագրություն ----
  const COND_N = 50, COND_RATE = 0.60;
  let cond = {};
  try { cond = JSON.parse(localStorage.getItem(KM('cond')) || '{}'); } catch (e) {}
  const vsig = [];
  let lastCand = null;
  const sgn = (x) => (x > 0 ? 1 : x < 0 ? -1 : 0);
  function candlesOf(arr) {
    const g = {};
    for (const x of arr) { const m = Math.floor(x.ts / TF); (g[m] || (g[m] = [])).push(x.p); }
    return Object.keys(g).map(Number).sort((a, b) => a - b).map((m) => { const w = g[m]; return { m, o: w[0], c: w[w.length - 1], h: Math.max(...w), l: Math.min(...w), n: w.length }; });
  }
  function trackList(list, asset, ts, price, cb) {
    for (let i = list.length - 1; i >= 0; i--) {
      const q = list[i];
      if (Date.now() - q.t > 900000) { list.splice(i, 1); continue; }
      if (q.asset !== asset) continue;
      if (q.entry === undefined) { if (ts >= q.ts0) q.entry = price; }
      else if (ts >= q.ts0 + TF) { if (price !== q.entry) cb(q, (price > q.entry) === (q.dir > 0)); list.splice(i, 1); }
    }
  }
  let ovEl = null, ovTimer = null;
  function showOverlay(dir, asset, ts0, tsNow) {
    const t0 = Date.now();
    if (!ovEl) {
      ovEl = document.createElement('div');
      ovEl.style.cssText = 'position:fixed;left:22%;right:22%;top:13%;z-index:100000;padding:6px 8px;border-radius:12px;text-align:center;font:700 20px/1.15 -apple-system,sans-serif;opacity:.93;color:#fff;box-shadow:0 0 30px #000a;pointer-events:none';
      document.body.appendChild(ovEl);
    }
    ovEl.style.background = dir > 0 ? '#12a34a' : '#d9372a';
    ovEl.style.display = 'block';
    const tick = () => {
      const left = Math.ceil(ts0 - (tsNow + (Date.now() - t0) / 1000));
      ovEl.innerHTML = (dir > 0 ? '🟢 ԳՆԵԼ ↑' : '🔴 ՎԱՃԱՌ. ↓') + '<div style="font-size:12px;margin-top:2px;font-weight:600">' + asset + (left > 0 ? ' · սեղմել ' + left + ' վրկ հետո' : ' · ՀԻՄԱ') + '</div>';
      if (left < -4) { ovEl.style.display = 'none'; clearInterval(ovTimer); }
    };
    clearInterval(ovTimer); tick(); ovTimer = setInterval(tick, 400);
  }
  function minuteEnd(asset, ts) {
    const arr = ticks[asset];
    if (!arr || arr.length < 100) return;
    const now = Date.now(), ts0 = (Math.floor(ts / TF) + 1) * TF;
    const cs = candlesOf(arr), done = cs.slice(0, -1).filter((c) => c.n >= (TF === 10 ? 4 : TF)), cur = cs[cs.length - 1];
    const px = lastPrice[asset];
    const ol = outlook(arr);
    const cands = []; // {name, dir, keys, joint, main}
    const add = (name, dir, extra, joint, main) => { if (dir) cands.push({ name, dir, keys: [name].concat(extra, [joint]), joint, main: !!main }); };
    // ---- 1) համաձայնություն (5 լավագույն կանոն) ----
    const ranked = Object.entries(tstat).map(([n, v]) => ({ n, t: v.w + v.l, r: v.w / Math.max(1, v.w + v.l) })).filter((x) => x.t >= MIN_TRIALS).sort((a, b) => b.r - a.r).slice(0, 5);
    // ---- մոմերի հատկանիշներ ----
    let lastDir = 0, streak = 0, bodyB = 'na';
    if (done.length >= 2) {
      const L = done[done.length - 1];
      lastDir = sgn(L.c - L.o);
      for (let i = done.length - 1; i >= 0 && lastDir && sgn(done[i].c - done[i].o) === lastDir; i--) streak++;
      streak = Math.min(streak, 4);
      const bodies = done.map((c) => Math.abs(c.c - c.o)), mean = bodies.reduce((x, y) => x + y, 0) / bodies.length || 1;
      const r = Math.abs(L.c - L.o) / mean;
      bodyB = r < 0.7 ? 'small' : r > 1.5 ? 'large' : 'med';
    }
    if (lastDir) {
      add('cont', lastDir, ['cont|st' + streak], 'cont|st' + streak + '|' + bodyB, false);
      add('rev', -lastDir, ['rev|st' + streak], 'rev|st' + streak + '|' + bodyB, false);
    }
    // ---- ամբոխ և փորձառու թրեյդերներ ----
    let buy = 0, sell = 0, sb = 0, ss = 0;
    for (const d of deals) if (d.asset === asset && now - d.t <= 60000) { if (d.sd === 'buy') buy++; else sell++; if (d.pp >= 55) { if (d.sd === 'buy') sb++; else ss++; } }
    const cn = buy + sell, sn = sb + ss;
    const nb = (n) => (n >= 6 ? '6+' : '3-5');
    if (cn >= 3 && Math.max(buy, sell) / cn >= 0.6) {
      const cd = buy > sell ? 1 : -1;
      add('crowdFollow', cd, [], 'crowdFollow|n' + nb(cn), false);
      add('crowdFade', -cd, [], 'crowdFade|n' + nb(cn), false);
    }
    if (sn >= 3 && Math.max(sb, ss) / sn >= 0.6) {
      const kd = sb > ss ? 1 : -1;
      add('skillFollow', kd, [], 'skillFollow|n' + nb(sn), false);
      add('skillFade', -kd, [], 'skillFade|n' + nb(sn), false);
    }
    // ---- հիմնական (համաձայնության) սիգնալ ----
    let mainDir = 0;
    if (ranked.length >= 3) {
      const dirs = ranked.map((x) => VARS[x.n](arr));
      mainDir = sgn(dirs.reduce((a, b) => a + b, 0));
      if (mainDir) {
        const agree = dirs.filter((x) => x === mainDir).length;
        const ob = ol ? (ol.bad <= 1 ? '0-1' : ol.bad === 2 ? '2' : '3+') : '?';
        const lts = arr[arr.length - 1].ts;
        const rr = (rec[asset] || []).filter((x) => lts - x.ts <= 180);
        const hr = rr.length >= 30 ? rr.filter((x) => x.ok).length / rr.length : null;
        const hb = hr === null ? 'na' : hr < 0.5 ? 'lo' : hr < 0.6 ? 'mid' : 'hi';
        const share = cn ? Math.max(buy, sell) / cn : 0;
        const cb = cn < 5 ? 'none' : share < 0.6 ? 'mixed' : ((buy > sell) === (mainDir > 0) ? 'with' : 'against');
        const kb = sn < 3 ? 'none' : (sb === ss ? 'mixed' : ((sb > ss) === (mainDir > 0) ? 'with' : 'against'));
        const lw = lastDir === 0 ? 'doji' : (lastDir === mainDir ? 'with' : 'against');
        let pos = 'na';
        if (cur && cur.h > cur.l) { let q = (arr[arr.length - 1].p - cur.l) / (cur.h - cur.l); if (mainDir < 0) q = 1 - q; pos = q > 0.7 ? 'hi' : q < 0.3 ? 'lo' : 'mid'; }
        const joint = 'A' + agree + '|O' + ob + '|H' + hb + '|C' + cb;
        add('main', mainDir, ['agree=' + agree, 'out=' + ob, 'hr=' + hb, 'crowd=' + cb, 'skill=' + kb, 'last=' + lw, 'pos=' + pos], joint, true);
      }
    }
    // ---- լաբորատորիա՝ ամեն կանոն առանձին վիրտուալ գործարք ----
    for (const k in VARS) { const dv = VARS[k](arr); if (dv) add('v:' + k, dv, [], 'v:' + k + '|', false); }
    // ---- գրանցում (բոլորը, վիրտուալ) ----
    for (const c of cands) vsig.push({ keys: c.keys, dir: c.dir, asset, ts0, t: now });
    // ---- Telegram ----
    const stat = (j) => { const x = cond[j] || { w: 0, l: 0 }, n = x.w + x.l; return { n, rate: n ? x.w / n : 0 }; };
    const bad = Q.asset === asset && Q.state === 'bad';
    const calm = !bad && !(ol && ol.bad >= 3);
    let best = null;
    for (const c of cands) { const st = stat(c.joint); c.st = st; if (st.n >= (c.main ? COND_N : 150) && st.rate >= COND_RATE && (!best || st.rate > best.st.rate)) best = c; }
    const main = cands.find((c) => c.main);
    if (main) lastCand = { joint: main.joint, dir: main.dir, n: main.st ? main.st.n : stat(main.joint).n, rate: main.st ? main.st.rate : stat(main.joint).rate };
    let pick = null, proven = false;
    let lead = null, lp = 0;
    for (const c of cands) {
      if (!c.name.startsWith('v:') || !c.st || c.st.n < 60) continue;
      const w = c.st.rate * c.st.n, pnl = w * 0.92 - (c.st.n - w);
      if (pnl > lp) { lp = pnl; lead = c; c.pnl = pnl; }
    }
    if (best) { pick = best; proven = true; }
    else if (lead) pick = lead;
    else if (main) { const st = main.st || stat(main.joint); if (!(st.n >= COND_N && st.rate < 0.5)) pick = main; }
    if (pick && calm) {
      const st = pick.st || stat(pick.joint);
      const msgText = (pick.dir > 0 ? '🟢 ' : '🔴 ') + asset + (pick.main ? '' : ' [' + pick.name + ']') + (st.n >= 10 ? ' ' + Math.round(st.rate * 100) + '% (' + st.n + ')' : '') + (proven ? ' ⭐' : '') + (pick.pnl !== undefined ? ' P&L ' + (pick.pnl > 0 ? '+' : '') + pick.pnl.toFixed(1) : '') + ' | ' + (TF === 60 ? '1' : '5') + ' րոպեանոց մոմի վերջ, մտեք հաջորդի սկզբին' + (TF === 60 ? '' : ', ժամկետ 5ր');
      if (TF === 10) showOverlay(pick.dir, asset, ts0, ts); else send(msgText);
      if (TF === 10) latPend.push({ asset, dir: pick.dir, ts0: ts0 + 3, t: now });
      sigPend.push({ asset, dir: pick.dir, d: pick.dir, ts0, t: now, src: 'cond' });
      if (px !== undefined) oldPend.push({ asset, dir: pick.dir, p: px, t: now });
      lastSig = { asset, d: pick.dir, p: px !== undefined ? px : arr[arr.length - 1].p, t: now };
    }
  }
  function resolveCond() {
    try { localStorage.setItem(KM('cond'), JSON.stringify(cond)); } catch (e) {}
  }
  function condText() {
    const top = Object.entries(cond).filter(([k, v]) => k.includes('|') && !k.startsWith('v:') && v.w + v.l >= 20)
      .map(([k, v]) => ({ k, n: v.w + v.l, r: v.w / (v.w + v.l) })).sort((a, b) => b.r - a.r).slice(0, 2);
    const tot = Object.entries(cond).filter(([k]) => k.includes('|')).reduce((a, [, v]) => a + v.w + v.l, 0);
    const lb = Object.entries(cond).filter(([k]) => k.startsWith('v:') && !k.includes('|')).map(([k, v]) => { const n = v.w + v.l; return { k: k.slice(2), n, pnl: v.w * 0.92 - v.l, r: v.w / n, z: (v.w - n / 2) / Math.sqrt(n / 4) }; })
      .filter((x) => x.n >= 20).sort((a, b) => b.pnl - a.pnl).slice(0, 3);
    return '🏁 ' + (lb.length ? lb.map((x) => x.k + ' ' + Math.round(x.r * 100) + '% n' + x.n + ' P&L ' + (x.pnl > 0 ? '+' : '') + x.pnl.toFixed(1) + ' z' + x.z.toFixed(1)).join(' | ') : 'լաբորատորիա՝ տվյալ է հավաքվում') +
      '\n🎯 ընթացիկ ' + (lastCand ? lastCand.joint + ' ' + Math.round(lastCand.rate * 100) + '% (' + lastCand.n + ')' : '—') +
      '\n🏆 ' + (top.length ? top.map((x) => x.k + ' ' + Math.round(x.r * 100) + '% (' + x.n + ')').join(' | ') : 'դեռ քիչ տվյալ (' + tot + ')');
  }
  function tsignal(asset, k, d) {
    let best = null, bz = 0;
    for (const n in tstat) {
      const v = tstat[n], t = v.w + v.l;
      if (t < MIN_TRIALS) continue;
      const z = (v.w - t / 2) / Math.sqrt(t / 4) / Math.sqrt(OVL);
      if (z > bz) { bz = z; best = n; }
    }
    const v = tstat[k], t = v.w + v.l;
    if (best !== k) return false;
    const ta = ticks[asset], lts = ta[ta.length - 1].ts;
    const rr = (rec[asset] || []).filter((x) => lts - x.ts <= 180);
    const hr = rr.length ? rr.filter((x) => x.ok).length / rr.length : null;
    let src = null;
    if (v.w / t >= MIN_RATE) src = 'global';
    else if (hr !== null && rr.length >= 60 && hr >= 0.60) src = 'recent';
    if (!src) return false;
    if (Q.asset === asset && (Q.state === 'bad' || Q.outBad >= 3)) return false; // անկանոն շարժման ժամանակ սիգնալ չենք տալիս
    const now = Date.now();
    send((d > 0 ? '🟢 ' : '🔴 ') + asset + ' ' + Math.round(100 * v.w / t) + '% | մոմի վերջ, մտեք հաջորդի սկզբին');
    sigPend.push({ asset, d, p: ticks[asset][ticks[asset].length - 1].p, t: Date.now(), src });
    lastSig = { asset, d, p: ticks[asset][ticks[asset].length - 1].p, t: now };
    return true;
  }
  function rows() {
    return Object.entries(tstat).map(([k, v]) => { const n = v.w + v.l; return { k, n, w: v.w, r: n ? v.w / n : 0, z: n ? (v.w - n / 2) / Math.sqrt(n / 4) / Math.sqrt(OVL) : 0 }; })
      .sort((a, b) => Math.abs(b.z) - Math.abs(a.z));
  }
  function bestVar() {
    let best = '', bz = -1e9;
    for (const n in tstat) { const v = tstat[n], t = v.w + v.l; if (t < MIN_TRIALS) continue; const z = (v.w - t / 2) / Math.sqrt(t / 4); if (z > bz) { bz = z; best = n; } }
    return best;
  }
  const DIAG = { maxRatio: 0, n: 0 };
  const secVol = {};
  const INGEST = 'https://po-collect.gugodavtyan555.workers.dev/ingest?k=cc2563ad2efaefe5eec1a91f';
  const upBuf = [];
  if (TF === 60) setInterval(() => {
    if (!upBuf.length) return;
    const body = JSON.stringify(upBuf.splice(0));
    try { fetch(INGEST, { method: 'POST', mode: 'no-cors', body }).catch(() => {}); } catch (e) {}
  }, 180000);
  let tickCount = 0, lastTickAt = 0;
  const tickLog = [];
  const sigPend = [];
  let sigStat = { global: { w: 0, l: 0 }, recent: { w: 0, l: 0 }, cond: { w: 0, l: 0 }, old: { w: 0, l: 0 }, lat: { w: 0, l: 0 } };
  const oldPend = [], latPend = [];
  try { const o = JSON.parse(localStorage.getItem(KM('sig')) || 'null'); if (o) sigStat = Object.assign(sigStat, o); } catch (e) {}
  function resolveSigs() {
    const nowo = Date.now();
    for (let i = oldPend.length - 1; i >= 0; i--) {
      const q = oldPend[i];
      if (nowo - q.t < (TF + 5) * 1000) continue;
      const cur = lastPrice[q.asset];
      if (cur !== undefined && cur !== q.p) { if ((cur > q.p) === (q.dir > 0)) sigStat.old.w++; else sigStat.old.l++; }
      oldPend.splice(i, 1);
    }
    try { localStorage.setItem(KM('sig'), JSON.stringify(sigStat)); } catch (e) {}
  }
  function saveAll() {
    try {
      localStorage.setItem(KM('an'), JSON.stringify({ t: tstat, c: cstat }));
      localStorage.setItem(KM('cond'), JSON.stringify(cond));
      localStorage.setItem(KM('sig'), JSON.stringify(sigStat));
    } catch (e) {}
  }
  function setMarket(m) {
    if (m === market) return;
    saveAll();
    market = m;
    for (const k in tstat) delete tstat[k];
    for (const k in cstat) delete cstat[k];
    let an = {};
    try { an = JSON.parse(localStorage.getItem(KM('an')) || '{}'); } catch (e) {}
    Object.assign(tstat, an.t || {}); Object.assign(cstat, an.c || {});
    for (const k in VARS) if (!tstat[k]) tstat[k] = { w: 0, l: 0 };
    for (const k in tstat) { const v = tstat[k], t = v.w + v.l; if (t > WIN) { v.w *= WIN / t; v.l *= WIN / t; } }
    try { cond = JSON.parse(localStorage.getItem(KM('cond')) || '{}'); } catch (e) { cond = {}; }
    sigStat = { global: { w: 0, l: 0 }, recent: { w: 0, l: 0 }, cond: { w: 0, l: 0 }, old: { w: 0, l: 0 }, lat: { w: 0, l: 0 } };
    try { const o = JSON.parse(localStorage.getItem(KM('sig')) || 'null'); if (o) sigStat = Object.assign(sigStat, o); } catch (e) {}
    lastCand = null; vsig.length = 0; sigPend.length = 0; oldPend.length = 0; latPend.length = 0;
    for (const a in tq) tq[a] = [];
    for (const a in rec) delete rec[a];
  }
  function outlook(arr) {
    const g = {};
    for (const x of arr) { const m = Math.floor(x.ts / 60); (g[m] || (g[m] = [])).push(x.p); }
    const keys = Object.keys(g).map(Number).sort((a, b) => a - b);
    keys.pop(); // ընթացիկ (թերի) րոպեն չենք հաշվում
    const rows = keys.filter((m) => g[m].length >= 60).map((m) => {
      const w = g[m]; let path = 0;
      for (let i = 1; i < w.length; i++) path += Math.abs(w[i] - w[i-1]);
      return { er: path ? Math.abs(w[w.length-1] - w[0]) / path : 0, v: path / (w.length - 1) };
    });
    if (rows.length < 3) return null;
    const vs = rows.map((r) => r.v).sort((a, b) => a - b), med = vs[Math.floor(vs.length / 2)];
    const last = rows.slice(-5).map((r) => r.er < 0.03 || r.v > 1.6 * med);
    return { marks: last.map((b) => (b ? '⛔' : '✅')).join(''), bad: last.filter(Boolean).length, n: last.length };
  }
  const Q = { asset: '', outBad: 0, state: 'ok', bad: 0, good: 0, since: 0 };
  function statusText() {
    bestName = bestVar();
    resolveSigs();
    resolveCond();
    const ca = selAsset || curAsset;
    const arr = ticks[ca] || [];
    if (arr.length < 60) return '⏳ ' + ca + ' տվյալ է հավաքվում';
    if (Q.asset !== ca) { Q.asset = ca; Q.state = 'ok'; Q.bad = 0; Q.good = 0; Q.since = 0; }
    const mad = (w) => { let sum = 0; for (let i = 1; i < w.length; i++) sum += Math.abs(w[i].p - w[i-1].p); return w.length > 1 ? sum / (w.length - 1) : 0; };
    const v180 = mad(arr.slice(-360)), v30 = mad(arr.slice(-60));
    const svs = secVol[ca] || [];
    const lastSec = Math.floor(arr[arr.length - 1].ts % 60);
    let esum = 0, ecnt = 0;
    for (let i = 0; i < 30; i++) { const x = svs[(lastSec - i + 60) % 60]; if (x !== null && x !== undefined) { esum += x; ecnt++; } }
    const expected = ecnt >= 15 ? esum / ecnt : v180; // նույն վայրկյանների սովորական տատանումը
    const ratio = expected ? v30 / expected : 1;
    const prof = [];
    for (let b = 0; b < 6; b++) { let sm = 0, c = 0; for (let i = b * 10; i < b * 10 + 10; i++) if (svs[i] !== null && svs[i] !== undefined) { sm += svs[i]; c++; } prof.push(c ? sm / c : 0); }
    const pm = prof.reduce((x, y) => x + y, 0) / 6 || 1;
    DIAG.profile = prof.map((x) => +(x / pm).toFixed(2));
    const lastTs = arr[arr.length - 1].ts;
    const rr = (rec[ca] || []).filter((x) => lastTs - x.ts <= 180);
    const hr = rr.length ? rr.filter((x) => x.ok).length / rr.length : null;
    DIAG.sel = ca; DIAG.ticks = arr.length; DIAG.ratio = +ratio.toFixed(2); DIAG.maxRatio = Math.max(DIAG.maxRatio, ratio); DIAG.hr = hr === null ? null : +hr.toFixed(2); DIAG.hrN = rr.length; DIAG.n++;
    const w100 = arr.slice(-100);
    let path = 0;
    for (let i = 1; i < w100.length; i++) path += Math.abs(w100[i].p - w100[i-1].p);
    const er = path ? Math.abs(w100[w100.length-1].p - w100[0].p) / path : 0;
    DIAG.er = +er.toFixed(3);
    const badNow = arr.length >= 360 && (ratio > 1.8) || (hr !== null && rr.length >= 20 && hr < 0.40);
    // կայունացում՝ վիճակը փոխվում է միայն եթե նույն պայմանը պահպանվում է (վատ՝ 15 վրկ, լավ՝ 40 վրկ)
    if (badNow) { Q.bad++; Q.good = 0; } else { Q.good++; Q.bad = 0; }
    if (Q.state === 'ok' && Q.bad >= 2) { Q.state = 'bad'; Q.since = Date.now(); }
    else if (Q.state === 'bad' && Q.good >= 8) { Q.state = 'ok'; Q.since = 0; }
    const ol = outlook(arr);
    Q.outBad = ol ? ol.bad : 0;
    DIAG.outlook = ol;
    let flag = '✅ հարմար՝ կարող եք մտնել';
    if (Q.state === 'bad') flag = (Date.now() - Q.since > 120000) ? '⛔ երկար անկանոն՝ փոխեք զույգը' : '⛔ անկանոն՝ սպասեք';
    let sig = '';
    if (lastSig && lastSig.asset === ca && Date.now() - lastSig.t < 70000) {
      const mv = arr[arr.length - 1].p - lastSig.p;
      sig = ' | սիգնալ ' + (lastSig.d > 0 ? '🟢' : '🔴') + ' ' + ((mv > 0) === (lastSig.d > 0) && mv !== 0 ? '✔' : mv === 0 ? '=' : '✖');
    }
    const fc = ol ? '\n🔮 վերջին րոպեներ ' + ol.marks + ' → ' + (ol.bad <= 1 ? 'հաջորդները կայուն' : ol.bad === 2 ? 'միջին' : 'խառը, զգուշ') : '\n🔮 հավաքվում է';
    let why = '';
    if (Q.state === 'bad') why = 'անկանոն շարժում՝ սիգնալ չի տրվի';
    else if (Q.outBad >= 3) why = 'խառը ռեժիմ՝ սիգնալ չի տրվի';
    else if (lastCand && lastCand.n >= COND_N && lastCand.rate < 0.5) why = 'ընթացիկ պայմանը ապացուցված վատ է (' + Math.round(lastCand.rate * 100) + '%)՝ սիգնալ չի տրվի';
    else if (!lastCand) {
      let mx = 0;
      for (const n in tstat) mx = Math.max(mx, tstat[n].w + tstat[n].l);
      why = 'տաքացում՝ վիճակագրություն ' + Math.round(mx) + '/' + MIN_TRIALS + (TF === 60 ? '' : ' (առաջին արդյունքը 5 րոպե հետո)');
    }
    else why = 'սիգնալ կգա մոմի վերջին վայրկյաններին' + (lastCand && lastCand.n >= COND_N && lastCand.rate >= COND_RATE ? ' ⭐ ապացուցված պայման' : '');
    const nowT = Date.now(), age = lastTickAt ? Math.round((nowT - lastTickAt) / 1000) : -1;
    const lastMin = tickLog.filter((x) => nowT - x <= 60000).length;
    const alive = '\n📡 տիկեր ' + tickCount + ' · վերջինը ' + (age < 0 ? '—' : age + ' վրկ առաջ') + ' · վերջին րոպե ' + lastMin + ' · հերթ ' + ((tq[ca] || []).length) + (age > 15 ? ' ⚠ հոսքը կանգնել է' : '');
    const sl = alive + '\nℹ️ ' + why + '\n📊 սիգնալների արդյունք՝ global ' + sigStat.global.w + '/' + sigStat.global.l + ' · recent ' + sigStat.recent.w + '/' + sigStat.recent.l + ' · cond ' + sigStat.cond.w + '/' + sigStat.cond.l + ' · հին եղանակ ' + sigStat.old.w + '/' + sigStat.old.l + (TF === 10 ? ' · 3վրկ ուշացումով ' + sigStat.lat.w + '/' + sigStat.lat.l : '');
    return flag + ' | ER ' + er.toFixed(2) + (hr !== null ? ' | 3ր ' + Math.round(hr * 100) + '% (' + rr.length + ')' : '') + sig + fc + '\n' + condText() + sl;
  }
  function tickText() {
    return rows().slice(0, 3).map((x) => x.k + ' ' + (x.r * 100).toFixed(1) + '% n' + Math.round(x.n)).join(' | ');
  }
  function report() {
    return 'VARIANTS (sorted by |z|, 60s horizon, z corrected for overlap):\n' +
      rows().map((x) => x.k + ' ' + x.w + '/' + (x.n - x.w) + ' ' + (x.r * 100).toFixed(1) + '% z' + x.z.toFixed(1)).join('\n') +
      '\nCROWD (up/down after 5s & 60s) ' + JSON.stringify(cstat) + '\nCROWDWL ' + stat() + ' deals=' + nDeals + '\nCOND ' + JSON.stringify(cond) + '\nCOUNTS ' + JSON.stringify(counts) + '\nDIAG ' + JSON.stringify(Object.assign({}, DIAG, { state: Q.state, bad: Q.bad, good: Q.good, bestName }));
  }
  const lastPrice = {}, pending = [], cpend = [], st = { w: 0, l: 0 };

  function side(v) {
    const s = String(v).toLowerCase();
    if (['call', 'buy', 'up', 'higher', '0'].includes(s)) return 'buy';
    if (['put', 'sell', 'down', 'lower', '1'].includes(s)) return 'sell';
    return null;
  }

  function walk(o) {
    if (!o || typeof o !== 'object') return;
    if (Array.isArray(o)) return o.forEach(walk);
    const sd = o.command !== undefined ? side(o.command) : null;
    const amt = Number(o.amount);
    if (sd && amt > 0 && o.asset && o.id && !seen.has(o.id)) {
      seen.add(o.id);
      if (seen.size > 5000) seen.clear();
      const asset = o.asset ?? o.symbol ?? o.active ?? 'all';
      const b = buckets[asset] || (buckets[asset] = { buy: 0, sell: 0, n: 0 });
      b.n++;
      b[sd] += WEIGHT_BY_AMOUNT ? amt : 1;
      deals.push({ asset, sd, t: Date.now(), pp: Number(o.percentProfitable) || 0 });
      nDeals++;
    }
    Object.values(o).forEach(walk);
  }

  function parse(text) {
    const i = text.search(/[\[{]/);
    if (i < 0) return;
    try { walk(JSON.parse(text.slice(i))); } catch (e) { /* ոչ JSON */ }
  }

  const SEND = true;
  function send(msg) {
    if (!SEND || !BOT_TOKEN || !CHAT_ID) return;
    const u = 'https://api.telegram.org/bot' + BOT_TOKEN + '/sendMessage?chat_id=' +
      encodeURIComponent(CHAT_ID) + '&text=' + encodeURIComponent(msg);
    fetch(u, { mode: 'no-cors' }).catch(() => {});
  }

  function stat() { return st.w + '/' + st.l + ' (W/L)'; }
  setInterval(() => {
    const now = Date.now();
    for (let i = pending.length - 1; i >= 0; i--) {
      const p = pending[i];
      if (now - p.t < EXPIRY_MS) continue;
      const cur = lastPrice[p.asset];
      if (cur !== undefined && cur !== p.price) {
        const up = cur > p.price;
        if ((p.dir === 'buy') === up) st.w++; else st.l++;
      }
      pending.splice(i, 1);
    }
    for (let i = cpend.length - 1; i >= 0; i--) {
      const c = cpend[i];
      if (now - c.t < c.h) continue;
      const cur = lastPrice[c.asset];
      if (cur !== undefined && cur !== c.p) {
        const key = c.bin + '_' + c.h / 1000, o = cstat[key] || (cstat[key] = { up: 0, dn: 0 });
        if (cur > c.p) o.up++; else o.dn++;
      }
      cpend.splice(i, 1);
    }
    for (const [asset, b] of Object.entries(buckets)) {
      const t = b.buy + b.sell;
      if (b.n >= MIN_TOTAL && t > 0) {
        const sb = b.buy / t, ss = b.sell / t;
        const px = lastPrice[asset];
        if (px !== undefined) {
          const bin = sb >= 0.65 ? 'crowdBUY' : ss >= 0.65 ? 'crowdSELL' : 'mixed';
          cpend.push({ asset, bin, p: px, t: now, h: 5000 }, { asset, bin, p: px, t: now, h: 60000 });
        }
      }
      delete buckets[asset];
    }
    info.firstChild.textContent = (TF === 60 ? '1ր ' : TF === 10 ? '10վրկ ' : '5ր ') + (market === 'real' ? 'REAL ' : 'OTC ') + 'WS:' + nWs + ' deals:' + nDeals + ' crowd ' + stat() + ' ';
    box2.textContent = statusText() + '\n' + tickText();
    try { localStorage.setItem(KM('an'), JSON.stringify({ t: tstat, c: cstat })); } catch (e) {}
  }, WINDOW_MS);

  // ---- ամեն րոպե՝ ամենաուժեղ ամբոխի դեմ սիգնալ ----
  setInterval(() => {
    const now = Date.now();
    while (deals.length && now - deals[0].t > 60000) deals.shift();
    const g = {};
    for (const d of deals) { const o = g[d.asset] || (g[d.asset] = { buy: 0, sell: 0 }); o[d.sd]++; }
    let best = null, bs = 0;
    for (const [asset, o] of Object.entries(g)) {
      const n = o.buy + o.sell;
      if (n < 5) continue;
      const share = Math.max(o.buy, o.sell) / n;
      if (share < 0.65) continue;
      const score = Math.abs(o.buy - o.sell) / Math.sqrt(n);
      if (score > bs) { bs = score; best = { asset, o, n, share, crowd: o.buy > o.sell ? 'buy' : 'sell' }; }
    }
    if (!best) return;
    const mine = best.crowd === 'buy' ? 'sell' : 'buy';
    if (CSEND) send((mine === 'buy' ? '🟢 BUY ' : '🔴 SELL ') + best.asset + ' | crowd ' + best.crowd.toUpperCase() + ' ' + Math.round(best.share * 100) + '% (' + best.n + ')');
    const px = lastPrice[best.asset];
    if (px !== undefined) pending.push({ asset: best.asset, dir: mine, price: px, t: now });
  }, 60000);

  // ---- watchdog: եթե գնի հոսքը չի բռնվել, էջը ինքնաբերաբար թարմացնել (առավելագույնը 3 անգամ) ----
  document.addEventListener('DOMContentLoaded', () => setTimeout(() => {
    let n = 0;
    try { n = Number(sessionStorage.getItem('po_rl') || 0); } catch (e) {}
    if (counts.updateStream) { try { sessionStorage.setItem('po_rl', '0'); } catch (e) {} return; }
    if (n < 3) {
      try { sessionStorage.setItem('po_rl', String(n + 1)); } catch (e) {}
      info.firstChild.textContent = '⚠ հոսքը չբռնվեց, թարմացնում եմ… ';
      setTimeout(() => location.reload(), 800);
    } else info.firstChild.textContent = '⚠ հոսքը չի բռնվում, թարմացրեք ձեռքով ';
  }, 15000));

  const Orig = window.WebSocket;
  window.WebSocket = function (...a) {
    const ws = new Orig(...a);
    let last = '';
    const origSend = ws.send.bind(ws);
    ws.send = function (m) {
      try {
        if (typeof m === 'string' && m.includes('changeSymbol')) {
          const o = JSON.parse(m.slice(m.indexOf('{')));
          if (o.asset) { selAsset = o.asset; curAsset = o.asset; setMarket(marketOf(o.asset)); }
        }
      } catch (e) {}
      return origSend(m);
    };
    let chain = Promise.resolve();
    ws.addEventListener('message', (e) => {
      chain = chain.then(async () => {
        let d = e.data;
        if (d instanceof Blob) d = await d.text();
        else if (d instanceof ArrayBuffer) d = new TextDecoder().decode(d);
        d = String(d);
        nWs++;
        const m = d.match(/^\d*-?\[\s*"([^"]+)"/);
        if (m) { last = m[1]; counts[last] = (counts[last] || 0) + 1; }
        else if (last) { const a = samples[last] || (samples[last] = []); a.push(d.slice(0, 500)); if (a.length > 3) a.shift(); }
        if (last === 'updateStream' && d[0] === '[') {
          try { const a = JSON.parse(d); for (const r of a) if (r && r[0]) { lastPrice[r[0]] = r[2]; onTick(r[0], r[1], r[2]); } } catch (e) {}
        }
        if (last === 'updateHistoryNewFast' && d[0] === '{') {
          try {
            const h = JSON.parse(d);
            if (h.asset && Array.isArray(h.history) && h.history.length) {
              const arr = h.history.slice(-BUF).map((r) => ({ ts: r[0], p: r[1] }));
              const old = ticks[h.asset];
              if (!old || old.length < 100 || old[old.length - 1].ts < arr[0].ts) ticks[h.asset] = arr; // գոյություն ունեցող տվյալները և սպասվող կանխատեսումները չենք ջնջում
              curAsset = h.asset;
              selAsset = h.asset;
              setMarket(marketOf(h.asset));
              lastPrice[h.asset] = arr[arr.length - 1].p;
            }
          } catch (e) {}
        }
        if (/OpenedSocialDeals/.test(last)) parse(d);
      }).catch(() => {});
    });
    return ws;
  };
  window.WebSocket.prototype = Orig.prototype;
})();
