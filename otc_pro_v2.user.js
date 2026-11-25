// ==UserScript==
// @name         OTC Pro v2
// @match        *://*/*
// @grant        none
// @run-at       document-start
// ==/UserScript==
// Տեղադրում՝ Tampermonkey-ում։ Սկսիր DEMO հաշվով։
// WebSocket hook՝ ներարկվում է էջի աշխարհ (page world), գները ուղարկում postMessage-ով
const OTC_WS = {}, OTC_WT = {}, OTC_TS = {}, OTC_SEEDED = {};
let OTC_MSGS = 0;
const OTC_T0 = Date.now();
(() => {
  const injected = function () {
    if (window.__otcHooked) return; window.__otcHooked = true;
    const re = /\["([A-Za-z0-9_#]+)",\s*(\d{9,11}(?:\.\d+)?),\s*(\d+(?:\.\d+)?)/g;
    const feed = d => {
      const out = []; let m; re.lastIndex = 0;
      const str = String(d);
      while ((m = re.exec(str))) out.push([m[1], parseFloat(m[2]), parseFloat(m[3])]);
      if (out.length) window.postMessage({ __otc: 1, d: out }, '*');
      // Զույգ բացելիս կայքը ուղարկում է գրաֆիկի պատմությունը՝ դրանից անմիջապես լցնում ենք տիկերը
      const hi = str.indexOf('"history"');
      if (hi > -1) {
        const am = str.match(/"asset"\s*:\s*"([A-Za-z0-9_#]+)"/);
        if (am) {
          let end = str.indexOf('"candles"', hi); if (end < 0) end = Math.min(str.length, hi + 400000);
          const seg = str.slice(hi, end), r2 = /\[(\d{9,11}(?:\.\d+)?),\s*(\d+(?:\.\d+)?)\]/g;
          const pts = []; let m2;
          while ((m2 = r2.exec(seg))) pts.push([parseFloat(m2[1]), parseFloat(m2[2])]);
          if (pts.length >= 20) window.postMessage({ __otc: 2, asset: am[1], pts }, '*');
        }
      }
    };
    const handle = d => {
      if (typeof d === 'string') feed(d);
      else if (d instanceof Blob) { const f = new FileReader(); f.onload = () => feed(f.result); f.readAsText(d); }
      else if (d instanceof ArrayBuffer) feed(new TextDecoder().decode(d));
    };
    const W = window.WebSocket;
    const P = function (...a) { const w = new W(...a); w.addEventListener('message', e => { try { void e.data; } catch (_) {} }); return w; };
    P.prototype = W.prototype;
    ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'].forEach(k => P[k] = W[k]);
    window.WebSocket = P;
    try { // ինչ-որ socket էլ ստեղծված լինի մեր սքրիփթից առաջ՝ նրա հաղորդագրությունները կարդում ենք data getter-ով
      const desc = Object.getOwnPropertyDescriptor(MessageEvent.prototype, 'data');
      const seen = new WeakSet();
      Object.defineProperty(MessageEvent.prototype, 'data', {
        configurable: true, enumerable: true,
        get() {
          const d = desc.get.call(this);
          try { if (this.target instanceof W && !seen.has(this)) { seen.add(this); handle(d); } } catch (_) {}
          return d;
        }
      });
    } catch (_) {}
  };
  window.addEventListener('message', e => {
    if (!e.data || !e.data.__otc) return;
    if (e.data.__otc === 2) {
      const sym = e.data.asset, pts = e.data.pts.sort((a, b) => a[0] - b[0]);
      const lastT = pts[pts.length - 1][0];
      const oldP = OTC_WS[sym] || [], oldT = OTC_WT[sym] || [];
      const P = pts.map(x => x[1]), T = pts.map(x => x[0]);
      for (let i = 0; i < oldP.length; i++) if (oldT[i] > lastT) { P.push(oldP[i]); T.push(oldT[i]); }
      OTC_WS[sym] = P.slice(-600); OTC_WT[sym] = T.slice(-600);
      OTC_SEEDED[sym] = pts.length; OTC_MSGS++; // OTC_TS-ը չենք թարմացնում՝ միայն կենդանի տիկերն են ստրիմը «թարմ» դարձնում
      return;
    }
    e.data.d.forEach(([sym, t, p]) => {
      OTC_MSGS++; OTC_TS[sym] = Date.now();
      (OTC_WS[sym] = OTC_WS[sym] || []).push(p);
      (OTC_WT[sym] = OTC_WT[sym] || []).push(t);
      if (OTC_WS[sym].length > 600) { OTC_WS[sym].shift(); OTC_WT[sym].shift(); }
    });
  });
  const s = document.createElement('script');
  s.textContent = '(' + injected.toString() + ')()';
  (document.head || document.documentElement).appendChild(s);
  s.remove();
})();

// ==BRAIN-BEGIN==
// OtcBrain՝ մաքուր (DOM-ից անկախ) ինքնուսուցող շարժիչ.
//  • ամեն վայրկյան ստեղծվում է նմուշ (հատկանիշներ), 10 վրկ հետո հայտնի է արդյունքը՝ մոդելը սովորում է.
//  • կանխատեսումը միշտ արվում է ՄՈԴԵԼԸ ՍՈՎՈՐԵԼՈՒՑ ԱՌԱՋ (out-of-sample) → ազնիվ ճշգրտության չափում.
//  • գործարքի թույլտվություն՝ միայն երբ վստահության շեմի վրա ճշգրտությունը վիճակագրորեն > 52.08%.
const OtcBrain = (() => {
  'use strict';
  const W = 60;              // նայվող պատմության երկարությունը (վրկ)
  const LAT = 2, H = 10;     // մուտքի ուշացում և լրացման ժամանակ (վրկ)
  const STRIDE = 3;          // OOS չափման քայլ (վրկ)
  const DEFF = 3;            // համընկնող 10 վրկ պատուհանների «դիզայնի էֆեկտ»
  const BE = 1 / 1.92;       // շահույթի սահման 92% վճարման դեպքում
  const ZLB = 2.0;           // վստահության սահմանի խստություն (Wilson)
  const ZB = 2.3;            // խմբային միջինների խստություն
  const ZF = 1.0, FWD_MIN = 150, FWD_MAX = 450; // թեկնածուի forward-հաստատում
  const WARM = 300;          // մոդելի «տաքացում» (նմուշներ), մինչև OOS-ը չի հաշվվում
  const TH = [0, 0.01, 0.02, 0.03, 0.04, 0.05, 0.06, 0.08, 0.10, 0.12, 0.15, 0.20];
  const NSTD = 24;           // ստանդարտացվող հատկանիշների թիվը
  const NF = 37;             // հատկանիշների ընդհանուր թիվը
  const PARAMS = { lr: 0.0005, l2: 0.01, avg: 0.001, replayEvery: 20, replayN: 40, bufN: 1500, oosMax: 6000 };

  const clip = (v, a) => v > a ? a : v < -a ? -a : v;

  // ---------- ցանցի կառուցում (1 Հց, ffill) ----------
  function buildGrid(ts, px, endSec, len) {
    const g = new Float64Array(len), start = endSec - len + 1, n = ts.length;
    let i = 0, cur = NaN, cov = 0;
    while (i < n && Math.floor(ts[i]) < start) { cur = px[i]; i++; }
    for (let k = 0; k < len; k++) {
      const s = start + k; let got = false;
      while (i < n && Math.floor(ts[i]) <= s) { cur = px[i]; i++; got = true; }
      if (got) cov++;
      g[k] = cur;
    }
    if (!(g[0] === g[0])) return null;
    return { g, cov: cov / len };
  }
  function priceAt(ts, px, sec) { // վերջին տիկը, որի floor(ts) <= sec
    let lo = 0, hi = ts.length - 1, ans = -1;
    while (lo <= hi) { const mid = (lo + hi) >> 1; if (Math.floor(ts[mid]) <= sec) { ans = mid; lo = mid + 1; } else hi = mid - 1; }
    return ans < 0 ? null : px[ans];
  }

  // ---------- մոմերի նմուշներ (5 վրկ մոմեր ցանցից) ----------
  function candlesOf(g, T) {
    const n = g.length, out = []; let cur = null;
    for (let i = 0; i < n; i++) {
      const s = T - (n - 1 - i), b = Math.floor(s / 5);
      if (!cur || cur.b !== b) { if (cur) out.push(cur); cur = { b, o: g[i], h: g[i], l: g[i], c: g[i], k: 1 }; }
      else { if (g[i] > cur.h) cur.h = g[i]; if (g[i] < cur.l) cur.l = g[i]; cur.c = g[i]; cur.k++; }
    }
    if (cur) out.push(cur);
    return out.filter(c => c.k === 5 && c.b * 5 + 4 <= T); // միայն ամբողջական և փակված
  }
  function patterns(C) {
    if (C.length < 6) return { up: 0, down: 0 };
    const a = C[C.length - 2], b = C[C.length - 1];
    const body = c => Math.abs(c.c - c.o), rng = c => (c.h - c.l) || 1e-12, col = c => Math.sign(c.c - c.o);
    const upW = c => c.h - Math.max(c.o, c.c), loW = c => Math.min(c.o, c.c) - c.l;
    let up = 0, down = 0;
    if (upW(b) >= 2 * body(b) && upW(b) > 0.55 * rng(b)) down++;
    if (loW(b) >= 2 * body(b) && loW(b) > 0.55 * rng(b)) up++;
    if (col(b) > 0 && col(a) < 0 && b.c >= a.o && b.o <= a.c) up++;
    if (col(b) < 0 && col(a) > 0 && b.c <= a.o && b.o >= a.c) down++;
    const prev3 = C.slice(-4, -1);
    if (prev3.every(c => col(c) > 0) && col(b) <= 0) down++;
    if (prev3.every(c => col(c) < 0) && col(b) >= 0) up++;
    const L = C.slice(-12), hiL = Math.max(...L.map(c => c.h)), loL = Math.min(...L.map(c => c.l)), rL = (hiL - loL) || 1e-12;
    const c1 = C[C.length - 3], big = c => body(c) > 0.55 * rng(c);
    if (c1 && col(c1) > 0 && big(c1) && body(a) < 0.35 * body(c1) && col(b) < 0 && b.c < (c1.o + c1.c) / 2) down++;
    if (c1 && col(c1) < 0 && big(c1) && body(a) < 0.35 * body(c1) && col(b) > 0 && b.c > (c1.o + c1.c) / 2) up++;
    const early = L.slice(0, -3);
    if (early.length >= 3) {
      const hiE = Math.max(...early.map(c => c.h)), loE = Math.min(...early.map(c => c.l));
      if (Math.abs(Math.max(a.h, b.h) - hiE) <= 0.12 * rL && col(b) < 0) down++;
      if (Math.abs(Math.min(a.l, b.l) - loE) <= 0.12 * rL && col(b) > 0) up++;
    }
    const r4 = C.slice(-5, -1), dec = r4.every((c, i) => i === 0 || body(c) <= body(r4[i - 1]) * 1.05);
    if (r4.every(c => col(c) > 0) && dec && col(b) <= 0) down++;
    if (r4.every(c => col(c) < 0) && dec && col(b) >= 0) up++;
    return { up, down };
  }

  // ---------- հատկանիշներ ----------
  function features(g, T, extra) {
    const n = g.length; // W + 1
    if (n < W + 1) return null;
    const last = g[n - 1];
    const sdFrom = from => {
      let m = 0, c = 0;
      for (let i = Math.max(1, from); i < n; i++) { m += g[i] - g[i - 1]; c++; }
      m /= c; let v = 0;
      for (let i = Math.max(1, from); i < n; i++) { const d = g[i] - g[i - 1] - m; v += d * d; }
      return Math.sqrt(v / c);
    };
    const sdW = sdFrom(1), sd30 = sdFrom(n - 30), sd10 = sdFrom(n - 10);
    if (!(sdW > 0)) return null;
    const f = [];
    for (const k of [1, 2, 3, 5, 8, 12, 20, 30, 60]) f.push((last - g[n - 1 - k]) / (sdW * Math.sqrt(k)));       // 0-8  իմպուլս/վերադարձ
    for (const w of [20, 40, 61]) {                                                                               // 9-11 z-score
      let m = 0; for (let i = n - w; i < n; i++) m += g[i]; m /= w;
      let v = 0; for (let i = n - w; i < n; i++) v += (g[i] - m) * (g[i] - m); v = Math.sqrt(v / w);
      f.push((last - m) / (v || sdW));
    }
    for (const w of [30, 61]) {                                                                                   // 12-13 դիրք տիրույթում
      let hi = -Infinity, lo = Infinity;
      for (let i = n - w; i < n; i++) { if (g[i] > hi) hi = g[i]; if (g[i] < lo) lo = g[i]; }
      f.push((last - lo) / ((hi - lo) || 1e-12) - 0.5);
    }
    for (const w of [10, 30]) {                                                                                   // 14-15 աճող տիկերի բաժին
      let u = 0, c = 0;
      for (let i = n - w; i < n; i++) { const d = g[i] - g[i - 1]; if (d > 0) u++; if (d !== 0) c++; }
      f.push(c ? u / c - 0.5 : 0);
    }
    { let sg = Math.sign(g[n - 1] - g[n - 2]), run = 0;                                                         // 16 շարք
      for (let i = n - 1; i > 0; i--) { if (sg !== 0 && Math.sign(g[i] - g[i - 1]) === sg) run++; else break; }
      f.push(sg * Math.min(run, 10) / 10); }
    f.push(clip(Math.log((sd10 + 1e-12) / (sdW + 1e-12)), 3));                                                    // 17-18 անկայունության ռեժիմ
    f.push(clip(Math.log((sd30 + 1e-12) / (sdW + 1e-12)), 3));
    const C = candlesOf(g, T), nC = C.length;                                                                     // 19-23 մոմեր
    if (nC >= 6) {
      const b = C[nC - 1], a = C[nC - 2], rg = (b.h - b.l) || 1e-12, sc = sdW * Math.sqrt(5);
      f.push((b.c - b.o) / sc, (b.h - Math.max(b.o, b.c)) / rg, (Math.min(b.o, b.c) - b.l) / rg, (a.c - a.o) / sc,
        C.slice(-6).filter(c => c.c > c.o).length / 6 - 0.5);
    } else f.push(0, 0, 0, 0, 0);
    // ---- չստանդարտացվող հատկանիշներ ----
    const pt = nC >= 6 ? patterns(C) : { up: 0, down: 0 };
    f.push((pt.up - pt.down) / 2);                                                                                // 24 նմուշների զուտ
    { let hi = -Infinity, lo = Infinity;
      for (let i = n - 60; i < n - 2; i++) { if (g[i] > hi) hi = g[i]; if (g[i] < lo) lo = g[i]; }
      const R = (hi - lo) || 1e-12;
      f.push(last >= hi - 0.25 * R ? -1 : last <= lo + 0.25 * R ? 1 : 0); }                                        // 25 մակարդակ
    f.push(extra && typeof extra.crowd === 'number' ? clip(extra.crowd, 1) : 0);                                  // 26 ամբոխի տոկոս
    const ph = ((T % 10) + 10) % 10;
    for (let k = 0; k < 10; k++) f.push(ph === k ? 1 : 0);                                                        // 27-36 փուլ
    return f;
  }

  // ---------- մոդել ----------
  class Norm {
    constructor() { this.mu = new Float64Array(NF); this.va = new Float64Array(NF).fill(1); this.n = 0; }
    update(x) {
      this.n++; const a = Math.max(1 / this.n, 1 / 4000);
      for (let i = 0; i < NSTD; i++) { const d = x[i] - this.mu[i]; this.mu[i] += a * d; this.va[i] = (1 - a) * (this.va[i] + a * d * d); }
    }
    apply(x) {
      const o = new Float64Array(NF);
      for (let i = 0; i < NF; i++) o[i] = i < NSTD ? clip((x[i] - this.mu[i]) / Math.sqrt(this.va[i] + 1e-9), 5) : x[i];
      return o;
    }
  }
  class Logit {
    constructor() { this.w = new Float64Array(NF); this.b = 0; this.wa = new Float64Array(NF); this.ba = 0; this.t = 0; }
    raw(xn) { let z = this.b; for (let i = 0; i < NF; i++) z += this.w[i] * xn[i]; return 1 / (1 + Math.exp(-clip(z, 30))); }
    p(xn) { let z = this.ba; for (let i = 0; i < NF; i++) z += this.wa[i] * xn[i]; return 1 / (1 + Math.exp(-clip(z, 30))); } // միջինացված կշիռներ՝ քիչ աղմուկ
    update(xn, y, lr, l2, avg) {
      const g = this.raw(xn) - y;
      for (let i = 0; i < NF; i++) this.w[i] -= lr * (g * xn[i] + l2 * this.w[i]);
      this.b -= lr * g;
      this.t++; const a = Math.max(avg, 1 / this.t);
      for (let i = 0; i < NF; i++) this.wa[i] += a * (this.w[i] - this.wa[i]);
      this.ba += a * (this.b - this.ba);
    }
  }
  function wilsonLB(w, n, z) {
    if (n <= 0) return 0; const p = w / n, z2 = z * z;
    return (p + z2 / (2 * n) - z * Math.sqrt(p * (1 - p) / n + z2 / (4 * n * n))) / (1 + z2 / n);
  }
  function wilsonUB(w, n, z) { return 1 - wilsonLB(n - w, n, z); }

  class Engine {
    constructor(opts) {
      this.P = Object.assign({}, PARAMS, opts || {});
      this.rnd = (opts && opts.rnd) || Math.random;
      this.m = new Logit(); this.norm = new Norm();
      this.pend = []; this.st = {}; this.oos = []; this.buf = []; this.nTrain = 0; this.nRes = 0;
      this.rows = null; this.rowsAt = 0; this.live = [];
      this.oosBase = 0; this.state = { s: 'none', th: 0, since: 0, cool: 0, certAt: 0 };
    }
    // --- ամեն վայրկյան կանչվում է ընթացիկ զույգի տվյալներով ---
    step(key, ts, px, extra) {
      const n = ts.length; if (n < W + 5) return;
      const endSec = Math.floor(ts[n - 1]) - 1;           // միայն ամբողջական վայրկյաններ
      const st = this.st[key] || (this.st[key] = { done: -1e12 });
      const first = Math.floor(ts[0]);
      const from = Math.max(st.done + 1, first + W, endSec - 240);
      for (let T = from; T <= endSec; T++) {
        const gg = buildGrid(ts, px, T, W + 1);
        if (!gg || gg.cov < 0.5) continue;
        const f = features(gg.g, T, extra);
        if (!f) continue;
        const p = this.m.p(this.norm.apply(f));
        this.pend.push({ key, T, x: f, p, warm: this.nTrain >= WARM });
      }
      if (endSec > st.done) st.done = endSec;
      // --- լուծում ---
      const keep = [];
      for (const q of this.pend) {
        if (q.key !== key) { if (q.T > this.st[q.key].done - 120) keep.push(q); continue; }
        if (q.T + LAT + H > endSec) { keep.push(q); continue; }
        const ent = priceAt(ts, px, q.T + LAT), ext = priceAt(ts, px, q.T + LAT + H);
        if (ent === null || ext === null || ext === ent || q.T + LAT < first) continue; // ոչ-ոքի՝ չի հաշվվում
        const y = ext > ent ? 1 : 0;
        this.nRes++;
        if (q.warm && q.T % STRIDE === 0) {
          const conf = Math.abs(q.p - 0.5);
          this.oos.push([conf, (q.p > 0.5) === (y === 1) ? 1 : 0]);
          if (this.oos.length > this.P.oosMax) { this.oos.shift(); this.oosBase++; }
          this.rows = null;
        }
        this.norm.update(q.x);
        const xn = this.norm.apply(q.x);
        this.m.update(xn, y, this.P.lr, this.P.l2, this.P.avg);
        this.nTrain++;
        this.buf.push([q.x, y]); if (this.buf.length > this.P.bufN) this.buf.shift();
        if (this.nTrain % this.P.replayEvery === 0 && this.buf.length > 100) {
          for (let r = 0; r < this.P.replayN; r++) {
            const e = this.buf[Math.floor(this.rnd() * this.buf.length)];
            this.m.update(this.norm.apply(e[0]), e[1], this.P.lr, this.P.l2, this.P.avg);
          }
        }
      }
      this.pend = keep;
    }
    // --- ընթացիկ կանխատեսում (իրական մուտքի համար) ---
    predictNow(key, ts, px, extra) {
      const n = ts.length; if (n < W + 5) return null;
      const T = Math.floor(ts[n - 1]) - 1;
      const gg = buildGrid(ts, px, T, W + 1);
      if (!gg || gg.cov < 0.5) return null;
      const f = features(gg.g, T, extra);
      if (!f) return null;
      const p = this.m.p(this.norm.apply(f));
      let distinct = new Set(Array.from(gg.g.slice(-30))).size;
      return { p, conf: Math.abs(p - 0.5), dir: p > 0.5 ? 'up' : 'down', T, flat: distinct < 4 };
    }
    // --- շեմերի վիճակագրություն ---
    evalTH() {
      const L = this.oos, rows = [];
      for (const th of TH) {
        const sub = []; for (const e of L) if (e[0] >= th) sub.push(e);
        const n = sub.length;
        if (n < 30) { rows.push({ th, n, neff: n / DEFF, w: 0, wr: 0, lb: 0, rwr: 0, ok: false }); continue; }
        let w = 0; for (const e of sub) w += e[1];
        const k = Math.max(10, Math.floor(n / 3)); let rw = 0; for (let i = n - k; i < n; i++) rw += sub[i][1];
        const neff = n / DEFF, wr = w / n, rwr = rw / k;
        let lb = wilsonLB(w / DEFF, neff, ZLB);
        // խմբային միջինների (batch-means) գնահատական՝ հաշվի է առնում ժամանակային կախվածությունը
        const bs = Math.max(15, Math.min(60, Math.floor(n / 12))), B = Math.floor(n / bs);
        let ok = false;
        if (B >= 10) {
          const off = n - B * bs, means = [];
          for (let j = 0; j < B; j++) { let t = 0; for (let i = off + j * bs; i < off + (j + 1) * bs; i++) t += sub[i][1]; means.push(t / bs); }
          const gm = means.reduce((a, c) => a + c, 0) / B; let v = 0; for (const m of means) v += (m - gm) * (m - gm);
          const se = Math.sqrt(v / (B - 1) / B), lbB = gm - ZB * se;
          lb = Math.min(lb, lbB);
          ok = neff >= 60 && lb > BE && rwr >= BE;
        }
        rows.push({ th, n, neff, w, wr, lb, rwr, ok });
      }
      return rows;
    }
    // ստուգված թեկնածուի կարգավիճակ՝ none → cand (backtest-ok) → cert (forward-test անցավ)
    fwdStats(th, since, lastN) {
      const L = this.oos; let i0 = Math.max(0, since - this.oosBase);
      if (lastN) i0 = Math.max(i0, L.length - lastN);
      let n = 0, w = 0;
      for (let i = i0; i < L.length; i++) if (L[i][0] >= th) { n++; w += L[i][1]; }
      return { n, w, wr: n ? w / n : 0 };
    }
    advance(rows) {
      const S = this.state, N = this.oosBase + this.oos.length;
      if (S.s === 'none') {
        if (N < S.cool) return;
        const ok = rows.filter(r => r.ok).sort((a, b) => b.lb - a.lb)[0];
        if (ok) { S.s = 'cand'; S.th = ok.th; S.since = N; }
        return;
      }
      if (S.s === 'cand') {
        const f = this.fwdStats(S.th, S.since);
        if (f.n >= FWD_MIN) {
          if (wilsonLB(f.w / DEFF, f.n / DEFF, ZF) > BE) { S.s = 'cert'; S.certAt = N; this.live = []; }
          else if (f.wr < BE || f.n >= FWD_MAX) { S.s = 'none'; S.cool = N + 600; }
        }
        return;
      }
      if (S.s === 'cert') {
        const f = this.fwdStats(S.th, 0, 600);
        if ((f.n >= 40 && f.wr < BE) || (f.n < 15 && N - S.certAt >= 600)) { S.s = 'none'; S.cool = N + 300; } // առավելությունը անհետացել է / չի հաստատվում
      }
    }
    tick() { this.rows = this.evalTH(); this.rowsAt = Date.now(); this.advance(this.rows); return this.rows; }
    table() { if (!this.rows || Date.now() - this.rowsAt > 4000) this.tick(); return this.rows; }
    best(mode) {
      const rows = this.table();
      if (mode === 0) { const S = this.state; return S.s === 'cert' ? (rows.find(r => r.th === S.th) || { th: S.th }) : null; }
      const c = rows.filter(r => r.n >= 75 && r.wr >= BE + 0.01).sort((a, b) => (b.wr - BE) * Math.sqrt(b.n) - (a.wr - BE) * Math.sqrt(a.n));
      return c[0] || null;
    }
    // --- իրական գործարքների ինքնաստուգում (kill-switch) ---
    revoke() { this.state = { s: 'none', th: 0, since: 0, cool: this.oosBase + this.oos.length + 600, certAt: 0 }; this.live = []; }
    liveAdd(win) { this.live.push(win ? 1 : 0); if (this.live.length > 60) this.live.shift(); }
    liveBad() { // true՝ եթե վերջին ≥20 իրական գործարքը վիճակագրորեն ապացուցում է, որ ճշգրտությունը < 52.08%
      const L = this.live.slice(-30), n = L.length; if (n < 20) return false;
      const w = L.reduce((a, b) => a + b, 0);
      return wilsonUB(w, n, 1.64) < BE;
    }
    brief() { return 'n=' + this.nTrain + ', OOS=' + this.oos.length; }
    report() {
      const rows = this.table(), out = [];
      out.push('🧠 նմուշ ' + this.nTrain + ' · OOS ' + this.oos.length + ' · շահույթի սահման ' + (BE * 100).toFixed(1) + '%');
      rows.filter(r => r.n >= 30).forEach(r => out.push('θ≥' + r.th.toFixed(2) + ': ' + (100 * r.wr).toFixed(1) + '% n=' + r.n + ' LB ' + (100 * r.lb).toFixed(1) + '%' + (r.ok ? ' ✅' : '')));
      const S = this.state;
      out.push(S.s === 'cert' ? '✅ ապացուցված՝ θ=' + S.th.toFixed(2) : S.s === 'cand' ? '⏳ թեկնածու θ=' + S.th.toFixed(2) + ' (forward-ստուգում)' : '❌ առավելությունը դեռ ապացուցված չէ');
      if (this.live.length) out.push('իրական՝ ' + this.live.reduce((a, c) => a + c, 0) + '/' + this.live.length);
      return out;
    }
    toJSON() {
      return { v: 2, w: Array.from(this.m.w), b: this.m.b, wa: Array.from(this.m.wa), ba: this.m.ba, t: this.m.t, mu: Array.from(this.norm.mu), va: Array.from(this.norm.va), nn: this.norm.n,
        nTrain: this.nTrain, oos: this.oos.slice(-this.P.oosMax).map(e => [Math.round(e[0] * 1000) / 1000, e[1]]), live: this.live, ob: this.oosBase, state: this.state };
    }
    static fromJSON(o, opts) {
      const e = new Engine(opts);
      if (o && o.v === 2 && o.w && o.w.length === NF) {
        e.m.w = Float64Array.from(o.w); e.m.b = o.b; e.m.wa = Float64Array.from(o.wa); e.m.ba = o.ba; e.m.t = o.t; e.norm.mu = Float64Array.from(o.mu); e.norm.va = Float64Array.from(o.va);
        e.norm.n = o.nn; e.nTrain = o.nTrain; e.oos = o.oos || []; e.live = o.live || []; e.oosBase = o.ob || 0; if (o.state) e.state = o.state;
      }
      return e;
    }
  }
  return { Engine, features, buildGrid, priceAt, candlesOf, patterns, wilsonLB, wilsonUB, consts: { W, LAT, H, STRIDE, DEFF, BE, ZLB, WARM, NF, NSTD } };
})();
// ==BRAIN-END==

const main = () => {
  'use strict';
  const CFG = {
    base: 1,            // սկզբնական գումար
    mult: 1.92,         // բազմապատկիչ պարտվելուց հետո
    maxLoss: 4,         // 4 անընդմեջ պարտությունից հետո՝ վերադառնալ base
    expirySec: 10,
    rotate: true,       // ավտոմատ փոխել զույգերը
    chain: 4,           // $1, $1.92, $3.69, $7.08
    minPayout: 92,      // եթե վճարումը սրանից ցածր է՝ չի մտնում
    // Սելեկտորներ (եթե կայքը փոխվի՝ ուղղիր այստեղ)
    sel: {
      amount: '.block--bet-amount input[type=text], input.bet-amount, input.input-control__input, input[type=tel], .value__val input',
      up: 'button.call-btn, .call-btn, .btn-call, .action-high-low .btn-call',
      down: 'button.put-btn, .put-btn, .btn-put, .action-high-low .btn-put',
      balance: '.usermenu__info-balance, .js-balance-demo, .js-balance-real, .balance-info-block__balance',
      price: '.current-symbol__price, .chart-price, .value__val-start', // ընտրովի
    },
  };

  let stats = { w: 0, l: 0 }; try { stats = JSON.parse(localStorage.getItem('otcStats')) || stats; } catch (_) {}
  const showStats = () => { try { localStorage.setItem('otcStats', JSON.stringify(stats)); } catch (_) {} const t = stats.w + stats.l; const e = document.getElementById('otcStats'); if (e) e.textContent = `✅${stats.w} ❌${stats.l} | ` + (t ? Math.round(100 * stats.w / t) + '%' : '—'); };
  let startBal = NaN;
  const loadStep = () => { try { const o = JSON.parse(localStorage.getItem('otcStep') || 'null'); return o && Date.now() - o.t < 3600000 ? o.s : 0; } catch (_) { return 0; } };
  const saveStep = () => { try { localStorage.setItem('otcStep', JSON.stringify({ s: step, t: Date.now() })); } catch (_) {} };
  let running = false, step = loadStep(), streak = 0, ticks = [], timer = null;
  const $ = s => document.querySelector(s);
  const num = el => el ? parseFloat(el.textContent.replace(/[^0-9.]/g, '')) : NaN;
  const vis = e => e && e.getBoundingClientRect().width > 0;
  const all = s => [...document.querySelectorAll(s)];
  function findInput() {
    const ins = all('input').filter(i => vis(i) && !i.closest('#otcBox'));
    return ins.find(i => /сумм|amount|investment/i.test(i.closest('div')?.parentElement?.textContent || '') && /^\$?[\d.,]+$/.test(i.value.trim()))
      || ins.find(i => /^\$?[\d.,]+$/.test(i.value.trim()) && !/:/.test(i.value));
  }
  function findBtn(dir) {
    const re = dir === 'up' ? /^(купить|buy|call|up|higher)$/i : /^(продать|sell|put|down|lower)$/i;
    const el = $(CFG.sel[dir]) || all('button,div,a,span').find(e => vis(e) && re.test(e.textContent.trim()) && e.children.length < 4);
    return el && (el.closest('button,a,[role=button]') || el);
  }
  function bal() {
    const e = $(CFG.sel.balance);
    if (e) return num(e);
    const c = all('span,div,p').find(e => !e.children.length && vis(e) && e.getBoundingClientRect().top < 300 && /^[\d,]+\.\d{2}$/.test(e.textContent.trim()));
    return num(c);
  }
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  const fire = el => ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'].forEach(t =>
    el.dispatchEvent(new (t.startsWith('pointer') && window.PointerEvent ? PointerEvent : MouseEvent)(t, { bubbles: true, cancelable: true, view: window })));
  const keyOf = ch => all('div,button,span').find(e => vis(e) && !e.children.length && e.textContent.trim() === ch && e.getBoundingClientRect().width > 25);
  // Վճարման տոկոս (+92%)
  function payout() {
    const e = all('span,div,p').find(e => !e.children.length && vis(e) && /^\+\s?\d{2,3}\s?%$/.test(e.textContent.trim()));
    return e ? parseInt(e.textContent.replace(/\D/g, '')) : NaN;
  }
  // Գումարը մուտքագրում է հավելվածի հաշվիչի (калькулятор) կոճակներով
  // Իրական ցուցադրվող գումարը՝ «Выплата $X» / (1 + վճարում%)
  function stakeShown() {
    const m = document.body.innerText.match(/Выплата\s*\$?\s*([\d.,]+)/);
    const po = payout();
    if (!m || isNaN(po)) return NaN;
    return parseFloat(m[1].replace(',', '')) / (1 + po / 100);
  }
  const okStake = v => { const x = stakeShown(); return isNaN(x) || Math.abs(x - v) <= 0.02 + v * 0.01; };

  // Իրական հպման սիմուլյացիա (touch + pointer + mouse + click)
  function touchSeq(el) {
    try {
      const r = el.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
      const t = document.createTouch ? document.createTouch(window, el, 1, x, y, x, y) : new Touch({ identifier: 1, target: el, clientX: x, clientY: y, pageX: x, pageY: y });
      const list = document.createTouchList ? document.createTouchList(t) : [t];
      el.dispatchEvent(new TouchEvent('touchstart', { bubbles: true, cancelable: true, touches: list, targetTouches: list, changedTouches: list }));
      el.dispatchEvent(new TouchEvent('touchend', { bubbles: true, cancelable: true, touches: [], targetTouches: [], changedTouches: list }));
    } catch (_) {}
  }
  const pressEvents = el => { touchSeq(el); fire(el); };
  // Ուղիղ կանչում է React/Vue-ի handler-ը
  function pressHandler(el) {
    let n = el;
    for (let d = 0; n && d < 7; d++, n = n.parentElement) {
      const fake = { target: el, currentTarget: n, type: 'click', preventDefault() {}, stopPropagation() {}, persist() {}, nativeEvent: {}, button: 0 };
      const rk = Object.keys(n).find(k => k.startsWith('__reactProps$'));
      if (rk) {
        const pr = n[rk];
        const f = pr.onClick || pr.onMouseDown || pr.onPointerDown || pr.onTouchStart || pr.onTouchEnd || pr.onMouseUp;
        if (f) { try { f(fake); return true; } catch (_) {} }
      }
      const vei = n._vei;
      if (vei) {
        const h = vei.onClick || vei.onMousedown || vei.onPointerdown || vei.onTouchstart || vei.onTouchend;
        if (h) { const f = h.value; try { (Array.isArray(f) ? f : [f]).forEach(g => g && g(fake)); return true; } catch (_) {} }
      }
    }
    return false;
  }
  async function openCalc(i) {
    if (keyOf('7')) return true;
    touchSeq(i); fire(i); try { i.focus(); } catch (_) {}
    for (let t = 0; t < 10 && !keyOf('7'); t++) await sleep(50);
    return !!keyOf('7');
  }
  async function typeVia(press, v) {
    const k0 = keyOf('0'), kd = keyOf('.');
    if (!k0 || !kd) return false;
    const z = k0.getBoundingClientRect(), d = kd.getBoundingClientRect();
    const bx = z.left + z.width / 2 + (z.left + z.width / 2 - (d.left + d.width / 2)), by = z.top + z.height / 2;
    const back = document.elementFromPoint(bx, by);
    if (back) for (let n = 0; n < 6; n++) { press(back); await sleep(30); }
    for (const ch of String(v)) { const k = keyOf(ch); if (!k) return false; press(k); await sleep(35); }
    await sleep(150);
    return okStake(v);
  }
  // Ճիշտ ինչպես ձեռքով՝ սեղմել գումարի դաշտը → հաշվիչի թվանշաններ
  // ---- Աշխատող եղանակ (po-fade սքրիփթից)՝ հաշվիչի ստեղները սեղմվում են կոորդինատներով ----
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

  async function setAmount(v) {
    const dbg = m => log('· ' + m);
    const hide = typeof box !== 'undefined' && box && box.style;
    try {
      if (hide) box.style.visibility = 'hidden'; // վահանակը չծածկի ստեղները
      const r = await typeProp(String(v));
      dbg(r.info);
      return r.ok;
    } catch (e) { dbg('սխալ՝ ' + e.message); return false; }
    finally { if (hide) box.style.visibility = 'visible'; }
  }
  function closeCalc(i) {
    try { i.blur(); } catch (_) {}
    try { window.getSelection().removeAllRanges(); } catch (_) {}
    const c = all('div').find(e => vis(e) && e.children.length === 0 && /Время закрытия|Close time/i.test(e.textContent));
    touchSeq(c || document.body); fire(c || document.body);
  }

  // Պարզ ազդանշան՝ վերջին գների momentum; եթե գին չկա՝ պատահական
  // Գնի սամփլեր՝ գտնում է այն թվային տարրը (1.84523 տիպի), որը ամենաշատ է փոխվում
  const hist = new Map();
  setInterval(() => {
    all('span,div,p,text,tspan').forEach(e => {
      if (e.children.length || !vis(e) || e.closest('#otcBox')) return;
      const t = e.textContent.trim();
      if (!/^\d{1,6}[.,]\d{3,6}$/.test(t)) return;
      const h = hist.get(e) || []; h.push(parseFloat(t.replace(',', '.')));
      hist.set(e, h.slice(-120));
    });
  }, 300);
  function symKey() {
    const m = document.body.innerText.match(/([A-Z]{3})\/([A-Z]{3})\s*OTC/);
    return m ? (m[1] + m[2] + '_otc').toLowerCase() : null;
  }
  // Ընթացիկ զույգի ստրիմը՝ միայն ՀԱՐԱԶԱՏ (<4 վրկ) տվյալով. վերնագրի զույգը և ստրիմը պետք է համընկնեն
  function wsKey() {
    const k = symKey(), now = Date.now();
    const fresh = Object.keys(OTC_WS).filter(n => now - (OTC_TS[n] || 0) < 6000);
    if (!fresh.length) return null;
    if (k) { const m = fresh.find(n => n.toLowerCase().replace('#', '') === k); if (m) return m; }
    if (fresh.length === 1) return fresh[0];
    // մի քանի թարմ ստրիմ և վերնագիրը չհամընկավ՝ վերցնում ենք ամենավերջին թարմացվածը
    return fresh.sort((x, y) => (OTC_TS[y] || 0) - (OTC_TS[x] || 0))[0];
  }
  // Տիկերից կառուցում է մոմեր (OHLC)
  function candles(sec = 5) {
    const k = wsKey(); if (!k) return [];
    const P = OTC_WS[k], T = OTC_WT[k], out = [];
    for (let i = 0; i < P.length; i++) {
      const b = Math.floor(T[i] / sec), c = out[out.length - 1];
      if (c && c.b === b) { c.h = Math.max(c.h, P[i]); c.l = Math.min(c.l, P[i]); c.c = P[i]; }
      else out.push({ b, o: P[i], h: P[i], l: P[i], c: P[i] });
    }
    return out.slice(0, -1); // վերջին (չփակված) մոմը հանում ենք
  }
  function candleSignal() {
    const C = candles(5); if (C.length < 6) return { up: 0, down: 0, n: C.length };
    const a = C[C.length - 2], b = C[C.length - 1];
    const body = c => Math.abs(c.c - c.o), rng = c => (c.h - c.l) || 1e-9;
    const col = c => Math.sign(c.c - c.o);
    const upW = c => c.h - Math.max(c.o, c.c), loW = c => Math.min(c.o, c.c) - c.l;
    let up = 0, down = 0;
    // մերժման ստվերներ (pin bar)
    if (upW(b) >= 2 * body(b) && upW(b) > 0.55 * rng(b)) down++;
    if (loW(b) >= 2 * body(b) && loW(b) > 0.55 * rng(b)) up++;
    // կլանում (engulfing)
    if (col(b) > 0 && col(a) < 0 && b.c >= a.o && b.o <= a.c) up++;
    if (col(b) < 0 && col(a) > 0 && b.c <= a.o && b.o >= a.c) down++;
    // ուժասպառում՝ ≥3 նույն գույնի մոմ, հետո հակառակ
    const prev3 = C.slice(-4, -1);
    if (prev3.every(c => col(c) > 0) && col(b) <= 0) down++;
    if (prev3.every(c => col(c) < 0) && col(b) >= 0) up++;
    // ---- Բոլոր մոմերը (վերջին 12)՝ բազմամոմ նմուշներ և համատեքստ ----
    const L = C.slice(-12);
    const hiL = Math.max(...L.map(c => c.h)), loL = Math.min(...L.map(c => c.l)), rL = (hiL - loL) || 1e-9;
    const c1 = C[C.length - 3];
    const big = c => body(c) > 0.55 * rng(c);
    // Երեկոյան / առավոտյան աստղ (3 մոմ)
    if (c1 && col(c1) > 0 && big(c1) && body(a) < 0.35 * body(c1) && col(b) < 0 && b.c < (c1.o + c1.c) / 2) down++;
    if (c1 && col(c1) < 0 && big(c1) && body(a) < 0.35 * body(c1) && col(b) > 0 && b.c > (c1.o + c1.c) / 2) up++;
    // Կրկնակի գագաթ / հատակ՝ ավելի վաղ ծայրը նորից փորձվել է և մերժվել
    const early = L.slice(0, -3);
    if (early.length >= 3) {
      const hiE = Math.max(...early.map(c => c.h)), loE = Math.min(...early.map(c => c.l));
      if (Math.abs(Math.max(a.h, b.h) - hiE) <= 0.12 * rL && col(b) < 0) down++;
      if (Math.abs(Math.min(a.l, b.l) - loE) <= 0.12 * rL && col(b) > 0) up++;
    }
    // Թուլացող իմպուլս՝ 3-4 նույն գույնի մոմ՝ նվազող մարմնով, հետո հակառակ/դոջի
    const r4 = C.slice(-5, -1), dec = r4.every((c, i) => i === 0 || body(c) <= body(r4[i - 1]) * 1.05);
    if (r4.every(c => col(c) > 0) && dec && col(b) <= 0) down++;
    if (r4.every(c => col(c) < 0) && dec && col(b) >= 0) up++;
    // Համատեքստ (լոգի համար)՝ կանաչ մոմերի թիվը և ընդհանուր թեքությունը
    const ctxG = L.filter(c => col(c) > 0).length, ctxS = +((L[L.length - 1].c - L[0].o) / rL).toFixed(2);
    return { up, down, n: C.length, ctxG, ctxS };
  }
  // 15 վրկանոց մասշտաբ՝ գինը վերջին փակված 15վ մոմերի փակումների նկատմամբ (z-score)
  function z15() {
    const C = candles(15); if (C.length < 8) return null;
    const cl = C.slice(-12).map(c => c.c), m = cl.reduce((x, y) => x + y) / cl.length;
    const sd = Math.sqrt(cl.reduce((x, y) => x + (y - m) ** 2, 0) / cl.length) || 1e-9;
    const k = wsKey(), P = OTC_WS[k]; if (!P || !P.length) return null;
    return (P[P.length - 1] - m) / sd;
  }
  function livePrices() {
    const k = symKey();
    const ws = OTC_WS[wsKey()];
    if (ws && ws.length >= 5) return ws.slice();
    let best = [], bu = 1;
    hist.forEach((h, e) => {
      if (!document.contains(e)) { hist.delete(e); return; }
      const u = new Set(h).size;
      if (u > bu) { bu = u; best = h; }
    });
    return best;
  }
  const ema = (a, n) => { const k = 2 / (n + 1); return a.reduce((e, x, i) => i ? x * k + e * (1 - k) : x, a[0]); };
  function rsi(a, n = 14) {
    let g = 0, l = 0; const s = a.slice(-n - 1);
    for (let i = 1; i < s.length; i++) { const d = s[i] - s[i - 1]; d > 0 ? g += d : l -= d; }
    return l === 0 ? (g === 0 ? 50 : 100) : 100 - 100 / (1 + g / l);
  }
  // OTC ռեժիմ (fade)՝ սինթետիկ գինը հակված է վերադառնալու, ուստի մտնում ենք չափից դուրս շարժման ՀԱԿԱԴԻՐ
  // Վտանգավոր գրաֆիկ՝ ուժեղ թրենդ, թռիչք (spike), քաոսային թրթռոց
  function riskReason(p) {
    const w = p.slice(-60); if (w.length < 30) return null;
    const hi = Math.max(...w), lo = Math.min(...w), R = (hi - lo) || 1e-9;
    const trend = Math.abs(w[w.length - 1] - w[0]) / R;
    if (trend > 0.8) return 'ուժեղ թրենդ (' + trend.toFixed(2) + ')';
    const steps = []; for (let i = 1; i < w.length; i++) steps.push(Math.abs(w[i] - w[i - 1]));
    const med = steps.slice().sort((a, b) => a - b)[Math.floor(steps.length / 2)] || 1e-9;
    if (Math.max(...steps.slice(-6)) > 8 * med) return 'թռիչք (spike)';
    let rev = 0; for (let i = 2; i < w.length; i++) if ((w[i] - w[i - 1]) * (w[i - 1] - w[i - 2]) < 0) rev++;
    if (rev / (w.length - 2) > 0.8) return 'քաոսային «թրթռոց»';
    return null;
  }
  let flatSince = 0;
  const MODE_NAMES = ['Ապացուցված', 'Լավագույն', 'Հին լոգիկա'];
  let modeI = 0; try { modeI = Math.min(2, Math.max(0, +localStorage.getItem('otcProMode') || 0)); } catch (_) {}
  let lastFeat = null, lastPairName = '', pairSince = Date.now();
  const LEG = 0;
  function direction() {
    const nm = curName();
    if (nm !== lastPairName) { lastPairName = nm; pairSince = Date.now(); }
    const seeded = !!OTC_SEEDED[wsKey()];
    if (!seeded && Date.now() - pairSince < 20000) { log('⏳ ' + (nm || 'զույգ') + '՝ հավաքում եմ տվյալ (' + Math.ceil((20000 - (Date.now() - pairSince)) / 1000) + ' վրկ)'); return null; }
    const raw = livePrices();
    const p = raw.filter((x, i) => i === 0 || x !== raw[i - 1]);
    if (p.length < 30) {
      log('սպասում եմ տվյալների (' + p.length + '/30) ws:' + OTC_MSGS + ' ← ' + (wsKey() || 'ստրիմ չկա') + (OTC_SEEDED[wsKey()] ? ' · պատմություն ✓' + OTC_SEEDED[wsKey()] : ' · պատմություն —'));
      if (Date.now() - pairSince > 120000) { forceRot = true; log('⏱ 2 րոպեից ավել տվյալ չի հավաքվում → փոխում եմ զույգը'); }
      try {
        const rc = +(sessionStorage.getItem('otcReloads') || 0);
        if (OTC_MSGS > 0) sessionStorage.removeItem('otcReloads');
        else if (Date.now() - OTC_T0 > 20000 && rc < 3) { sessionStorage.setItem('otcReloads', String(rc + 1)); log('🔁 ws չկա՝ թարմացնում եմ էջը (' + (rc + 1) + '/3)…'); setTimeout(() => location.reload(), 800); }
      } catch (_) {}
      return null;
    }
    const n = p.length, last = p[n - 1];
    const w = p.slice(-30), mean = w.reduce((x, y) => x + y) / w.length;
    const sd = Math.sqrt(w.reduce((x, y) => x + (y - mean) ** 2, 0) / w.length) || 1e-9;
    const z = (last - mean) / sd, r = rsi(p, 10);
    // «Քնած» = գինը գրեթե չի շարժվում (30 տիկում <4 տարբեր արժեք). չափը գնից անկախ է (EUR/RUB-ը առաջ սխալմամբ «քնած» էր)
    if (new Set(w).size < 4) {
      if (!flatSince) flatSince = Date.now();
      log('շուկան «քնած» է' + (Date.now() - flatSince > 10000 ? ' → փոխում եմ զույգը' : ''));
      if (Date.now() - flatSince > 10000) forceRot = true;
      return null;
    }
    flatSince = 0;
    // նախորդ շարժման երկարությունը (նույն ուղղությամբ տիկեր՝ առանց վերջինի)
    let run = 0, dir = Math.sign(p[n - 2] - p[n - 3]);
    for (let i = n - 2; i > 0 && Math.sign(p[i] - p[i - 1]) === dir && dir !== 0; i--) run++;
    const turnedDown = p[n - 1] < p[n - 2], turnedUp = p[n - 1] > p[n - 2]; // շրջման սկիզբ
    const lv = p.slice(-60, -2), hi = Math.max(...lv), lo = Math.min(...lv), R = (hi - lo) || 1e-9;
    const ZN = [0.25, 0.40, 0.50][LEG], nearTop = last >= hi - ZN * R, nearBot = last <= lo + ZN * R; // ճշգրիտ կետ՝ դիմադրություն/աջակցություն
    let rk = riskReason(p);
    if (rk && LEG === 2 && /թրենդ/.test(rk)) rk = null; // «Շատ» ռեժիմում ուժեղ թրենդը չի արգելափակում
    if (rk) { const sw = /թրենդ|թռիչք/.test(rk); log('⛔ ' + rk + (sw ? ' → փոխում եմ զույգը' : '')); if (sw) forceRot = true; return null; }
    const cs = candleSignal();
    const down = [z > 1.0, r > 65, dir > 0 && run >= 4, turnedDown].filter(Boolean).length + 2 * cs.down;
    const up = [z < -1.0, r < 35, dir < 0 && run >= 4, turnedUp].filter(Boolean).length + 2 * cs.up;
    // մոմի նմուշ + ևս 1 հաստատում
    const zz = z15(); // null = 15վ տվյալ դեռ չկա՝ չի արգելափակում
    const okD = zz === null || zz >= 1.5, okU = zz === null || zz <= -1.5; // 15վ՝ եթե տվյալ կա, պետք է համընկնի. չկա՝ չի արգելափակում
    lastFeat = { z: +z.toFixed(2), rsi: Math.round(r), run, z15: zz === null ? '' : +zz.toFixed(2), pat: Math.max(cs.up, cs.down), nearTop: nearTop ? 1 : 0, nearBot: nearBot ? 1 : 0, up, down, mode: LEG, candles: cs.n, ctxG: cs.ctxG === undefined ? '' : cs.ctxG, ctxS: cs.ctxS === undefined ? '' : cs.ctxS };
    if (cs.n < 6 && OTC_MSGS > 0) { log('սպասում եմ մոմերի (' + cs.n + '/6)'); return null; }
    const noC = cs.n < 6; // մոմեր չկան (սոկետ չկա)՝ աշխատում է առանց նմուշի
    const sD = LEG === 2 ? z > 0.5 : (noC ? down >= 3 : cs.down > 0 && down >= 3);
    const sU = LEG === 2 ? z < -0.5 : (noC ? up >= 3 : cs.up > 0 && up >= 3);
    if (sD && (LEG === 2 ? down >= up : down > up) && turnedDown && nearTop && okD) return 'down';
    if (sU && (LEG === 2 ? up >= down : up > down) && turnedUp && nearBot && okU) return 'up';
    log('15վ z=' + (zz === null ? '—' : zz.toFixed(1)) + ' | մոմեր ' + cs.n + (nearTop ? ' | դիմադրության մոտ' : nearBot ? ' | աջակցության մոտ' : ' | մակարդակից հեռու') + ' | ազդանշան չկա (z ' + z.toFixed(1) + ', RSI ' + r.toFixed(0) + ')'); return null;
  }

  // Ճշգրիտ ժամանակ՝ մուտք միայն 5 վրկ մոմի սկզբում (առաջին ~0.4 վրկ)
  async function waitBoundary() {
    while (running && Date.now() % 5000 > 1200) await sleep(40);
  }
  // Շղթա՝ $1 → շահում → $1.92 → $3.69 → $7.08 → վերջ, նորից $1. Պարտության դեպքում՝ $1
  let scanOnly = false;
  let inTrade = false, rotBusy = false, forceRot = false, lastSwitch = Date.now();
  async function trade() { try { await tradeInner(); } finally { inTrade = false; } }
  async function tradeInner() {
    if (rotBusy) { await sleep(400); return; }
    if (scanOnly) { await sleep(1000); return; }
    if (modeI === 2) await waitBoundary();
    if (!running) return;
    const po = payout();
    if (!isNaN(po) && po < CFG.minPayout) { log('վճարումը ' + po + '% < ' + CFG.minPayout + '% → փոխում եմ զույգը'); forceRot = true; await sleep(1500); return; }
    const dir = modeI === 2 ? direction() : decide();
    if (!dir) { await sleep(1000); return; }
    inTrade = true; lastSwitch = Date.now();
    const feat = lastFeat ? Object.assign({}, lastFeat) : {}, step0 = step;
    const amount = +(CFG.base * Math.pow(CFG.mult, step)).toFixed(2);
    if (!okStake(amount) || isNaN(stakeShown())) { if (!(await setAmount(amount))) { log('✗ գումարը չհաստատվեց ($' + amount + ') → չեմ մտնում'); await sleep(1500); return; } }
    const btn = findBtn(dir);
    if (!btn) { running = false; syncBtn(); return log('Կոճակը չգտնվեց'); }
    const before = bal();
    fire(btn);
    log(`Խաղ #${step + 1}: $${amount} ${dir.toUpperCase()} | ${curName()} ← ստրիմ ${wsKey()}`);
    await sleep((CFG.expirySec + 0.8) * 1000);
    let after = bal();
    for (let t = 0; t < 30 && (isNaN(after) || Math.abs(after - before) < 0.001 || Math.abs(after - (before - amount)) < 0.001 && t < 6); t++) { await sleep(200); after = bal(); }
    const profit = after - before;
    const tie = Math.abs(profit) < 0.005;       // գումարը վերադարձվեց (ոչ-ոքի) կամ գործարք չբացվեց
    const win = profit >= 0.005;
    if (tie) { log('🤝 վերադարձ՝ գումարը նույնն է մնում ($' + amount + ')'); }
    else {
      recordTrade(win, dir, amount, feat, step0);
      ENG.liveAdd(win); saveModel();
      if (modeI !== 2 && ENG.liveBad()) { ENG.revoke(); scanOnly = true; syncBtn(); log('🛑 իրական արդյունքները հակասում են մոդելին (վերջին 30-ում ճշգրտությունը < 52%) → անցա SCAN'); }
    }
    if (tie) { /* step-ը չի փոխվում */ }
    else if (win) { stats.w++; step++; if (step >= CFG.chain) { step = 0; log('✅ Շահեց · շղթան ավարտվեց → $1'); } else log('✅ Շահեց → հաջորդը $' + (CFG.base * Math.pow(CFG.mult, step)).toFixed(2)); }
    else { stats.l++; step = 0; log('❌ Պարտվեց → $1'); }
    showStats(); saveStep();
    // անմիջապես նոր գումարը դնել
    const next = +(CFG.base * Math.pow(CFG.mult, step)).toFixed(2);
    try { const ok = await setAmount(next); const i = findInput(); log('գումար → $' + next + (ok && i ? ' (դաշտում՝ ' + i.value + ')' : ' ✗ չստացվեց')); if (i) i.blur(); } catch (e) { log('setAmount սխալ: ' + e.message); }
  }


  // ---- Զույգերի ավտոմատ սկանավորում. եթե ազդանշան չկա՝ անցնում է հաջորդ OTC զույգին ----
  const ROT_SEC = 360;  // վրկ. մեկ զույգի վրա, եթե ազդանշան չկա
  const ROT_FAST = 45;  // վրկ. եթե պատմությունը բռնվել է (տվյալը անմիջապես պատրաստ է)՝ ավելի արագ սկանավորում
  const ROT_PAY = 92;   // նվազագույն վճարում %
  const visited = {};
  const normT = e => String(e.textContent || '').replace(/\s+/g, ' ').trim().toUpperCase();
  const curName = () => { const m = document.body.innerText.match(/([A-Z]{2,4}\/[A-Z]{2,4})\s*OTC/); return m ? m[1] + ' OTC' : ''; };
  const idOf = n => n.replace(/\s*OTC$/i, '').replace('/', '') + '_otc';
  function tapEl(e) { const r = e.getBoundingClientRect(); tapPt([r.left + r.width / 2, r.top + r.height / 2]); fire(e); }
  function clearPair(name) {
    const id = idOf(name).toLowerCase().replace('#', '');
    Object.keys(OTC_WS).forEach(k => { if (k.toLowerCase().replace('#', '') === id) { delete OTC_WS[k]; delete OTC_WT[k]; delete OTC_SEEDED[k]; } });
  }
  async function switchPair() {
    const cur = curName(); if (!cur) return log('🔄 ընթացիկ զույգը չեմ գտնում');
    const openers = all('div,span,p').filter(e => !box.contains(e) && e.children.length < 4 && normT(e) === cur.toUpperCase() && e.getBoundingClientRect().top < innerHeight * 0.4 && vis(e));
    if (!openers.length) return log('🔄 զույգի կոճակը չգտնվեց');
    tapEl(openers[0]); await sleep(900);
    const rows = [];
    all('div,span,p').forEach(e => {
      if (e.children.length > 3 || box.contains(e) || !vis(e)) return;
      const t = normT(e); if (!/^[A-Z]{2,4}\/[A-Z]{2,4} OTC$/.test(t)) return;
      let par = e, pay = null;
      for (let k = 0; k < 5 && par && pay === null; k++) { par = par.parentElement; const m = par && String(par.textContent || '').match(/\+\s*(\d{2,3})\s*%/); if (m) pay = +m[1]; }
      rows.push({ el: e, name: t, pay, top: e.getBoundingClientRect().top });
    });
    rows.sort((a, b) => a.top - b.top);
    const now = Date.now(), ok = r => r.name !== cur.toUpperCase() && r.pay !== null && r.pay >= ROT_PAY && r.top < innerHeight * 0.9;
    const pick = rows.filter(ok).sort((a, b) => (visited[a.name] || 0) - (visited[b.name] || 0) || a.top - b.top)[0];
    if (!pick) { log('🔄 հարմար ≥' + ROT_PAY + '% զույգ չգտա (' + rows.length + ')'); try { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); } catch (_) {} return; }
    clearPair(pick.name); visited[pick.name] = now;
    tapEl(pick.el); await sleep(1500);
    log(curName() === pick.name ? '🔄 անցա ' + pick.name + ' (' + pick.pay + '%)' : '🔄 «' + pick.name + '»-ին չանցավ');
  }
  setInterval(async () => {
    if (!CFG.rotate || !running || inTrade || rotBusy) return;
    const po = payout();
    const k = wsKey(), ready = readyKey === k && k, now = Date.now();
    const learning = scanOnly || !ENG.best(modeI === 1 ? 1 : 0);                       // սովորելու փուլ՝ ավելի երկար մնալ
    const dwell = (learning ? 90 : 60) * 1000;
    const need = forceRot || (!isNaN(po) && po < ROT_PAY)
      || (ready ? now - Math.max(lastSwitch, readyAt) > dwell : now - lastSwitch > 150000); // պատրաստ չէ 2.5 րոպե՝ փոխել
    if (!need) return;
    rotBusy = true;
    try { box.style.visibility = 'hidden'; await switchPair(); } catch (e) { log('🔄 սխալ՝ ' + e.message); }
    finally { box.style.visibility = 'visible'; forceRot = false; lastSwitch = Date.now(); rotBusy = false; }
  }, 3000);


  // ---- Վիճակագրության հավաքում (localStorage) ----
  const LOGKEY = 'otcProTradeLog';
  const readLog = () => { try { return JSON.parse(localStorage.getItem(LOGKEY) || '[]'); } catch (_) { return []; } };
  function recordTrade(win, dir, amount, feat, step0) {
    const L = readLog();
    L.push(Object.assign({ t: new Date().toISOString().slice(0, 19), pair: curName(), dir, stake: amount, step: step0, hr: new Date().getHours(), win: win ? 1 : 0 }, feat || {}));
    try { localStorage.setItem(LOGKEY, JSON.stringify(L.slice(-3000))); } catch (_) {}
  }
  function groupStats(L, keyf) {
    const g = {};
    L.forEach(r => { const k = keyf(r); (g[k] = g[k] || { w: 0, n: 0 }).n++; g[k].w += r.win; });
    return Object.keys(g).sort().map(k => k + ': ' + g[k].w + '/' + g[k].n + ' (' + Math.round(100 * g[k].w / g[k].n) + '%)');
  }
  function showSummary() {
    const L = readLog(); if (!L.length) return log('📊 տվյալ դեռ չկա');
    const w = L.reduce((a, r) => a + r.win, 0);
    log('📊 ընդամենը ' + w + '/' + L.length + ' (' + Math.round(100 * w / L.length) + '%)');
    [['ռեժիմ', r => r.mode === undefined || r.mode === '' ? '—' : MODE_NAMES[r.mode]], ['ուղղ.', r => r.dir], ['զույգ', r => r.pair], ['նմուշ', r => r.pat > 0 ? 'այո' : 'ոչ'], ['15վ z', r => r.z15 === '' ? '—' : (Math.abs(r.z15) >= 2 ? '≥2' : '1.5–2')], ['քայլ', r => '$' + r.stake]].forEach(([nm, f]) =>
      log('· ' + nm + ' | ' + groupStats(L, f).join(' | ')));
  }
  function copyCsv() {
    const L = readLog(); if (!L.length) return log('📊 տվյալ դեռ չկա');
    const cols = Array.from(new Set(L.flatMap(r => Object.keys(r))));
    const csv = cols.join(',') + '\n' + L.map(r => cols.map(c => r[c]).join(',')).join('\n');
    try { navigator.clipboard.writeText(csv); log('📋 պատճենվեց (' + L.length + ' տող)'); } catch (_) { log('📋 չստացվեց'); }
  }

  // =====================================================================
  //  ԻՆՔՆՈՒՍՈՒՑԱՆՈՂ ՇԱՐԺԻՉ (OtcBrain). ամեն վայրկյան նմուշ, 10 վրկ հետո արդյունք, կանխատեսումը՝ մոդելը սովորելուց ԱՌԱՋ.
  //  Իրական գործարք՝ միայն երբ շեմը անցել է backtest + forward-ստուգում (վիճակագրորեն > 52.08%).
  // =====================================================================
  let ENG;
  try { ENG = OtcBrain.Engine.fromJSON(JSON.parse(localStorage.getItem('otcProModel') || 'null')); } catch (_) { ENG = new OtcBrain.Engine(); }
  const saveModel = () => { try { localStorage.setItem('otcProModel', JSON.stringify(ENG.toJSON())); } catch (_) {} };
  setInterval(saveModel, 30000);
  window.addEventListener('pagehide', saveModel);
  document.addEventListener('visibilitychange', () => { if (document.hidden) saveModel(); });

  // «Գնորդների %» (ձախ/աջ տոկոսները գրաֆիկի տակ). -1..+1 (դրական՝ գնորդները շատ են)
  let crowdV = 0;
  function crowdPct() {
    const els = all('span,div,p').filter(e => !e.children.length && /^\d{1,3}\s?%$/.test(e.textContent.trim()) && vis(e) && !box.contains(e))
      .map(e => { const r = e.getBoundingClientRect(); return { v: parseInt(e.textContent, 10), x: r.left, y: r.top }; });
    for (let i = 0; i < els.length; i++) for (let j = 0; j < els.length; j++) {
      if (i !== j && els[i].x < els[j].x && Math.abs(els[i].y - els[j].y) < 8 && Math.abs(els[i].v + els[j].v - 100) <= 1) return (els[i].v - 50) / 50;
    }
    return null;
  }
  setInterval(() => { try { const c = crowdPct(); if (c !== null) crowdV = c; } catch (_) {} }, 2000);

  let readyKey = null, readyAt = 0, flatSince2 = 0;
  setInterval(() => {
    try {
      const key = wsKey(); if (!key) return;
      const ts = OTC_WT[key], px = OTC_WS[key]; if (!ts || !px || ts.length !== px.length) return;
      ENG.step(key, ts, px, { crowd: crowdV });
      const pr = ENG.predictNow(key, ts, px, { crowd: crowdV });
      if (pr) {
        if (readyKey !== key) { readyKey = key; readyAt = Date.now(); }
        if (pr.flat) { if (!flatSince2) flatSince2 = Date.now(); if (Date.now() - flatSince2 > 10000) forceRot = true; } else flatSince2 = 0;
      }
    } catch (e) { if (!ENG._err) { ENG._err = 1; log('⚠ շարժիչ՝ ' + e.message); } }
  }, 500);

  setInterval(() => { try { ENG.tick(); } catch (_) {} }, 5000); // կարգավիճակը (none→cand→cert) թարմացվում է միշտ

  let sayTag = '', sayT = 0;
  const say = (tag, msg) => { const now = Date.now(); if (tag !== sayTag || now - sayT > 8000) { sayTag = tag; sayT = now; log(msg); } };

  // Իրական որոշում
  function decide() {
    const key = wsKey();
    if (!key || !OTC_WT[key]) { say('nodata', 'սպասում եմ տվյալների ws:' + OTC_MSGS); return null; }
    const r = ENG.predictNow(key, OTC_WT[key], OTC_WS[key], { crowd: crowdV });
    if (!r) { say('warm', '⏳ ' + (curName() || 'զույգ') + '՝ տվյալը դեռ բավարար չէ (~65 վրկ)'); return null; }
    if (r.flat) { say('flat', 'շուկան «քնած» է'); return null; }
    const best = ENG.best(modeI === 1 ? 1 : 0);
    if (!best) { say('unproven', '🧠 առավելությունը դեռ ապացուցված չէ (' + ENG.brief() + '). SCAN-ով հավաքիր տվյալ, տես 📈'); return null; }
    if (r.conf < best.th) { say('wait', '🧠 p=' + r.p.toFixed(2) + ' < θ ' + best.th.toFixed(2) + ' · սպասում եմ վստահ պահի'); return null; }
    lastFeat = { p: +r.p.toFixed(3), conf: +r.conf.toFixed(3), th: best.th, mode: modeI, strat: 'model', crowd: +crowdV.toFixed(2), candles: '' };
    log('✔ ' + r.dir.toUpperCase() + ' p=' + r.p.toFixed(3) + ' (θ=' + best.th.toFixed(2) + (best.n ? ', ' + (100 * best.wr).toFixed(0) + '% n=' + best.n : '') + ')');
    return r.dir;
  }
  function showStrats() { ENG.report().forEach(t => log(t)); }
  let looping = false;
  async function loop() {
    if (looping) return; // երկրորդ ցիկլ չբացել
    looping = true;
    try { while (running) { await trade(); await sleep(300); } }
    finally { looping = false; }
  }

  try { window.getSelection().removeAllRanges(); } catch (_) {}
  // UI
  const box = document.createElement('div');
  box.id='otcBox'; box.style.cssText = 'position:fixed;top:80px;right:10px;z-index:99999;background:#111;color:#fff;padding:10px;border-radius:8px;font:12px sans-serif;width:210px';
  box.innerHTML = '<button id="otcBtn" style="width:100%;padding:8px;font-weight:bold;background:#2a2;color:#fff;border:0;border-radius:6px;cursor:pointer">START</button><div style="display:flex;gap:4px;margin-top:6px"><button id="otcSum" style="flex:1;padding:6px;background:#345;color:#fff;border:0;border-radius:6px">📊</button><button id="otcCsv" style="flex:1;padding:6px;background:#345;color:#fff;border:0;border-radius:6px">📋</button></div><div style="display:flex;gap:4px;margin-top:6px"><button id="otcScan" style="flex:1;padding:6px;background:#235;color:#fff;border:0;border-radius:6px">🔍 SCAN</button><button id="otcStr" style="flex:1;padding:6px;background:#235;color:#fff;border:0;border-radius:6px">📈</button></div><button id="otcMode" style="width:100%;margin-top:6px;padding:6px;background:#543;color:#fff;border:0;border-radius:6px">⚙ Ռեժիմ՝ ' + MODE_NAMES[modeI] + '</button><button id="otcTest" style="width:100%;margin-top:6px;padding:6px;background:#345;color:#fff;border:0;border-radius:6px">Թեստ՝ դնել $1.92</button><div id="otcLog" style="margin-top:6px;max-height:140px;overflow:auto"></div>';
  document.body.appendChild(box);
  // Քարշելու բռնակ
  const grip = document.createElement('div');
  grip.textContent = '⠿ տեղափոխել (Pro v2)';
  grip.style.cssText = 'text-align:center;padding:6px;margin-bottom:6px;background:#333;border-radius:6px;cursor:move;touch-action:none;user-select:none';
  box.prepend(grip);
  let dx = 0, dy = 0, drag = false;
  grip.addEventListener('pointerdown', e => { drag = true; const r = box.getBoundingClientRect(); dx = e.clientX - r.left; dy = e.clientY - r.top; grip.setPointerCapture(e.pointerId); e.preventDefault(); });
  grip.addEventListener('pointermove', e => { if (!drag) return; box.style.left = Math.max(0, e.clientX - dx) + 'px'; box.style.top = Math.max(0, e.clientY - dy) + 'px'; box.style.right = 'auto'; });
  grip.addEventListener('pointerup', () => { drag = false; });
  const logEl = box.querySelector('#otcLog'); showStats();
  function log(t) { logEl.insertAdjacentHTML('afterbegin', `<div>${t}</div>`); }
  const syncBtn = () => { const b = box.querySelector('#otcBtn'), c = box.querySelector('#otcScan'); const live = running && !scanOnly, sc = running && scanOnly;
    b.textContent = live ? 'STOP' : 'START'; b.style.background = live ? '#c22' : '#2a2'; c.textContent = sc ? 'STOP SCAN' : '🔍 SCAN'; c.style.background = sc ? '#a52' : '#235'; };
  box.querySelector('#otcMode').onclick = e => { modeI = (modeI + 1) % 3; try { localStorage.setItem('otcProMode', String(modeI)); } catch (_) {} e.target.textContent = '⚙ Ռեժիմ՝ ' + MODE_NAMES[modeI]; log('⚙ ռեժիմ՝ ' + MODE_NAMES[modeI]); };
  box.querySelector('#otcSum').onclick = showSummary;
  box.querySelector('#otcCsv').onclick = copyCsv;
  box.querySelector('#otcTest').onclick = async () => { const ok = await setAmount(1.92); log(ok ? '✅ թեստ OK' : '✗ թեստ ձախողվեց'); };
  box.querySelector('#otcBtn').onclick = () => {
    if (running && scanOnly) { scanOnly = false; syncBtn(); log('▶ իրական ռեժիմ'); return; }
    running = !running; scanOnly = false; syncBtn();
    if (running && !looping) loop();
  };
  box.querySelector('#otcScan').onclick = () => {
    if (running && !scanOnly) { scanOnly = true; syncBtn(); log('🔍 միայն սկանավորում (առանց գործարքի)'); return; }
    if (running && scanOnly) { running = false; syncBtn(); return; }
    scanOnly = true; running = true; syncBtn(); if (!looping) loop();
  };
  box.querySelector('#otcStr').onclick = showStrats;
};
if (document.body) main(); else document.addEventListener('DOMContentLoaded', main);
