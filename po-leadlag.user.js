// ==UserScript==
// @name         PO lead-lag test (real vs OTC)
// @match        https://*.pocketoption.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==
(function () {
  // Ստուգում է՝ արդյո՞ք X_otc գինը իրական X գնի ուշացած պատճենն է (lead-lag հարաբերակցություն)
  const MAXLAG = 8;   // վրկ.
  const MINOV = 90;   // նվազագույն համընկնող վրկ.
  const S = {};       // asset -> Map(sec -> last price)
  const seen = {};
  let nTicks = 0;

  const box = document.createElement('div');
  box.style.cssText = 'position:fixed;bottom:90px;left:4px;z-index:99999;background:#000c;color:#0f0;font:11px monospace;padding:4px;max-width:90vw;white-space:pre-wrap';
  const grip = document.createElement('span');
  grip.textContent = ' ✥ ';
  grip.style.cssText = 'padding:4px 8px;background:#333;font-size:14px';
  grip.addEventListener('touchmove', (e) => { const t = e.touches[0]; box.style.bottom = 'auto'; box.style.left = Math.max(0, t.clientX - 20) + 'px'; box.style.top = Math.max(0, t.clientY - 10) + 'px'; e.preventDefault(); }, { passive: false });
  const body = document.createElement('div');
  box.append(grip, body);
  document.addEventListener('DOMContentLoaded', () => document.body.appendChild(box));

  function corr(x, y) {
    const n = x.length; if (n < 20) return NaN;
    let mx = 0, my = 0; for (let i = 0; i < n; i++) { mx += x[i]; my += y[i]; } mx /= n; my /= n;
    let sxy = 0, sx = 0, sy = 0;
    for (let i = 0; i < n; i++) { const a = x[i] - mx, b = y[i] - my; sxy += a * b; sx += a * a; sy += b * b; }
    return sx && sy ? sxy / Math.sqrt(sx * sy) : NaN;
  }
  function grid(m, lo, hi) { // forward-fill 1 վրկ ցանց
    const out = []; let last = null;
    for (let t = lo; t <= hi; t++) { if (m.has(t)) last = m.get(t); out.push(last); }
    return out;
  }
  function analyze(base) {
    const a = S[base], o = S[base + '_otc'];
    if (!a || !o) return null;
    const lo = Math.max(Math.min(...a.keys()), Math.min(...o.keys())), hi = Math.min(Math.max(...a.keys()), Math.max(...o.keys()));
    if (hi - lo < MINOV) return { base, msg: 'համընկնում ' + Math.max(0, Math.round(hi - lo)) + ' վրկ (պետք է ' + MINOV + ')' };
    const A = grid(a, lo, hi), O = grid(o, lo, hi);
    if (A.includes(null) || O.includes(null)) { const k = Math.max(A.findIndex((x) => x !== null), O.findIndex((x) => x !== null)); A.splice(0, k); O.splice(0, k); }
    const ra = [], ro = [];
    for (let i = 1; i < Math.min(A.length, O.length); i++) { ra.push(A[i] - A[i - 1]); ro.push(O[i] - O[i - 1]); }
    let best = null; const rows = [];
    for (let lag = -MAXLAG; lag <= MAXLAG; lag++) {
      let x, y;
      if (lag >= 0) { x = ro.slice(lag); y = ra.slice(0, ra.length - lag); } else { x = ro.slice(0, ro.length + lag); y = ra.slice(-lag); }
      const c = corr(x, y); rows.push([lag, c]);
      if (!isNaN(c) && (!best || Math.abs(c) > Math.abs(best[1]))) best = [lag, c];
    }
    return { base, n: ra.length, best, rows };
  }
  setInterval(() => {
    const bases = Object.keys(S).filter((k) => !/_otc$/i.test(k) && S['' + k + '_otc']);
    let txt = 'lead-lag թեստ | տիկեր ' + nTicks + ' | հետևվող՝ ' + Object.keys(S).length + ' ակտիվ';
    if (!bases.length) txt += '\n⚠ դեռ չկա զույգ, որի և՛ իրական, և՛ OTC տարբերակը գալիս է.\nբացեք երկու գրաֆիկ (օր. EUR/USD և EUR/USD OTC)։';
    for (const b of bases) {
      const r = analyze(b);
      if (!r) continue;
      if (r.msg) { txt += '\n' + b + ': ' + r.msg; continue; }
      txt += '\n' + b + ' (n=' + r.n + 'վրկ): լավագույն lag ' + r.best[0] + 'վրկ, կորելացիա ' + r.best[1].toFixed(2) +
        '\n ' + r.rows.filter((x) => Math.abs(x[0]) <= 4).map((x) => x[0] + ':' + (isNaN(x[1]) ? '—' : x[1].toFixed(2))).join('  ') +
        '\n' + (Math.abs(r.best[1]) > 0.5 ? '‼ ՈՒԺԵՂ կապ (OTC-ն հետևում է իրականին)' : Math.abs(r.best[1]) > 0.2 ? '~ թույլ կապ' : 'կապ չկա (OTC-ն անկախ է)');
    }
    body.textContent = txt;
  }, 3000);

  function onTick(asset, t, p) {
    nTicks++;
    const m = S[asset] || (S[asset] = new Map());
    m.set(Math.floor(t), p);
    if (m.size > 1200) { const ks = [...m.keys()].sort((a, b) => a - b); for (let i = 0; i < 300; i++) m.delete(ks[i]); }
  }
  const Orig = window.WebSocket;
  window.WebSocket = function (...a) {
    const ws = new Orig(...a);
    let last = '', chain = Promise.resolve();
    ws.addEventListener('message', (e) => {
      chain = chain.then(async () => {
        let d = e.data;
        if (d instanceof Blob) d = await d.text(); else if (d instanceof ArrayBuffer) d = new TextDecoder().decode(d);
        d = String(d);
        const m = d.match(/^\d*-?\[\s*"([^"]+)"/);
        if (m) { last = m[1]; return; }
        if (last === 'updateStream' && d[0] === '[') {
          try { const arr = JSON.parse(d); for (const r of arr) if (r && r[0]) onTick(r[0], r[1], r[2]); } catch (e) {}
        }
      }).catch(() => {});
    });
    return ws;
  };
  window.WebSocket.prototype = Orig.prototype;
})();
