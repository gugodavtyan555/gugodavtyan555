// ==UserScript==
// @name         PO smart-copy 1m -> Telegram
// @match        https://*.pocketoption.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==
(function () {
  // ===== կարգավորումներ =====
  const NMIN = 15;        // թրեյդերի նվազագույն 1ր գործարք՝ «ապացուցված» համարվելու համար
  const RMIN = 0.65;      // թրեյդերի նվազագույն շահի տոկոսը
  const MAX_AGE = 8;      // վրկ. թրեյդերի գործարքից հետո սիգնալը չի տրվում, եթե ավելի ուշ է
  const GAP_MS = 8000;    // նույն ակտիվի համար սիգնալների միջև նվազագույն ընդմիջում
  // ==========================

  let BOT = '', CHAT = '';
  try { BOT = localStorage.getItem('po_bot') || ''; CHAT = localStorage.getItem('po_chat') || ''; } catch (e) {}
  document.addEventListener('DOMContentLoaded', () => setTimeout(() => {
    if (BOT && CHAT) return;
    BOT = (prompt('Bot token:') || '').trim().replace(/^bot/i, ''); CHAT = (prompt('Chat id:') || '').trim();
    try { localStorage.setItem('po_bot', BOT); localStorage.setItem('po_chat', CHAT); } catch (e) {}
  }, 1500));
  function send(msg) {
    if (!BOT || !CHAT) return;
    fetch('https://api.telegram.org/bot' + BOT + '/sendMessage?chat_id=' + encodeURIComponent(CHAT) + '&text=' + encodeURIComponent(msg), { mode: 'no-cors' }).catch(() => {});
  }

  // ---- վիճակ ----
  let users = {};                       // uid -> [w, l]  (միայն 1ր գործարքներ)
  let calib = { lo: [0, 0], mid: [0, 0], hi: [0, 0], top: [0, 0] }; // անցյալի տոկոսի դույլ -> հաջորդ գործարքի արդյունք
  let copy = { w: 0, l: 0 };            // ուղարկված սիգնալների (թրեյդերի) իրական արդյունք
  try {
    const o = JSON.parse(localStorage.getItem('po_copy1') || 'null');
    if (o) { users = o.users || {}; calib = Object.assign(calib, o.calib || {}); copy = o.copy || copy; }
  } catch (e) {}
  const seenOpen = new Set(), seenClosed = new Set();
  const pend = {};                      // id -> {uid, bucket, sent}
  const lastSent = {};
  let nOpen = 0, nClosed = 0, lastMsg = '';

  const isOneMin = (o) => { const d = o.closeTimestamp - o.openTimestamp; return d >= 50 && d <= 70; };
  const bucketOf = (r) => (r < 0.45 ? 'lo' : r < 0.55 ? 'mid' : r < 0.65 ? 'hi' : 'top');

  function onOpened(o) {
    if (!o || !o.id || seenOpen.has(o.id) || o.isDemo || !isOneMin(o)) return;
    seenOpen.add(o.id); if (seenOpen.size > 20000) seenOpen.clear();
    nOpen++;
    const st = users[o.uid] || [0, 0], n = st[0] + st[1];
    if (n < 10) return;
    const rate = st[0] / n, bucket = bucketOf(rate);
    const p = { uid: o.uid, bucket, sent: false };
    if (n >= NMIN && rate >= RMIN) {
      const age = Date.now() / 1000 - o.openTimestamp;
      const now = Date.now();
      if ((age < -60 || age <= MAX_AGE) && now - (lastSent[o.asset] || 0) >= GAP_MS) {
        lastSent[o.asset] = now;
        p.sent = true;
        const buy = o.command === 0;
        lastMsg = (buy ? '🟢 ' : '🔴 ') + o.asset + ' ' + Math.round(rate * 100) + '% (' + n + ') | 1 րոպե, մտեք ՀԻՄԱ';
        send(lastMsg);
      }
    }
    pend[o.id] = p;
    const keys = Object.keys(pend); if (keys.length > 5000) for (let i = 0; i < 1000; i++) delete pend[keys[i]];
  }
  function onClosed(o) {
    if (!o || !o.id || seenClosed.has(o.id) || o.isDemo || !isOneMin(o)) return;
    seenClosed.add(o.id); if (seenClosed.size > 20000) seenClosed.clear();
    nClosed++;
    const win = o.profit > 0, loss = o.profit < 0;
    if (!win && !loss) return;
    const p = pend[o.id];
    if (p) {
      calib[p.bucket][win ? 0 : 1]++;
      if (p.sent) { if (win) copy.w++; else copy.l++; }
      delete pend[o.id];
    }
    const st = users[o.uid] || (users[o.uid] = [0, 0]);
    st[win ? 0 : 1]++;
  }

  // ---- վահանակ ----
  const box = document.createElement('div');
  box.style.cssText = 'position:fixed;bottom:90px;left:4px;z-index:99999;background:#000c;color:#0f0;font:11px monospace;padding:4px;max-width:80vw;white-space:pre-wrap';
  const body = document.createElement('div');
  const grip = document.createElement('span');
  grip.textContent = ' ✥ ';
  grip.style.cssText = 'padding:4px 8px;background:#333;font-size:14px';
  grip.addEventListener('touchmove', (e) => { const t = e.touches[0]; box.style.bottom = 'auto'; box.style.left = Math.max(0, t.clientX - 20) + 'px'; box.style.top = Math.max(0, t.clientY - 10) + 'px'; e.preventDefault(); }, { passive: false });
  const reset = document.createElement('span');
  reset.textContent = ' ⟲ ';
  reset.style.cssText = 'padding:4px 8px;background:#533;font-size:14px;margin-left:4px';
  reset.onclick = () => { if (confirm('Մաքրե՞լ վիճակագրությունը')) { users = {}; calib = { lo: [0, 0], mid: [0, 0], hi: [0, 0], top: [0, 0] }; copy = { w: 0, l: 0 }; } };
  box.append(grip, reset, body);
  document.addEventListener('DOMContentLoaded', () => document.body.appendChild(box));
  const fmt = (a) => a[0] + '/' + a[1] + (a[0] + a[1] ? ' ' + Math.round(100 * a[0] / (a[0] + a[1])) + '%' : '');
  setInterval(() => {
    const uids = Object.keys(users);
    let qual = 0;
    for (const u of uids) { const s = users[u], n = s[0] + s[1]; if (n >= NMIN && s[0] / n >= RMIN) qual++; }
    body.textContent = '1ր smart-copy | բաց ' + nOpen + ' · փակ ' + nClosed + ' | թրեյդերներ ' + uids.length + ' · ապացուցված ' + qual +
      '\n📈 կանխատեսում (անցյալ % → հաջորդ գործարք)' +
      '\n <45%: ' + fmt(calib.lo) + '\n 45–55%: ' + fmt(calib.mid) + '\n 55–65%: ' + fmt(calib.hi) + '\n ≥65%: ' + fmt(calib.top) +
      '\n📊 ուղարկվածների արդյունք՝ ' + fmt([copy.w, copy.l]) + (lastMsg ? '\n' + lastMsg : '') +
      (nOpen === 0 && nClosed === 0 ? '\n⚠ ամբոխի գործարքներ չեն գալիս. միացրեք մարդկանց պատկերակը' : '');
    if (uids.length > 4000) { // մաքրում՝ թողնել ամենաշատ գործարքներ ունեցողներին
      const keep = uids.sort((a, b) => (users[b][0] + users[b][1]) - (users[a][0] + users[a][1])).slice(0, 2500);
      const nu = {}; for (const k of keep) nu[k] = users[k]; users = nu;
    }
    try { localStorage.setItem('po_copy1', JSON.stringify({ users, calib, copy })); } catch (e) {}
  }, 5000);

  // ---- WebSocket ----
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
        if (d[0] !== '[' && d[0] !== '{') return;
        if (last === 'updateOpenedSocialDeals') { try { const a = JSON.parse(d); (Array.isArray(a) ? a : [a]).forEach(onOpened); } catch (e) {} }
        else if (last === 'updateClosedSocialDeals') { try { const a = JSON.parse(d); (Array.isArray(a) ? a : [a]).forEach(onClosed); } catch (e) {} }
      }).catch(() => {});
    });
    return ws;
  };
  window.WebSocket.prototype = Orig.prototype;
})();
