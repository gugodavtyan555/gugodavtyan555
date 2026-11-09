// Penny & Plan pin publisher: one pin per day -> Make.com webhook -> Pinterest.
// Settings live in KV: webhook, next (index of the next pin), paused, log.
// Admin page: /setup?key=SETUP_KEY (secret).
import PINS from '../pins/pins.json';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

async function state(env) {
  const [webhook, next, paused, log] = await Promise.all(['webhook', 'next', 'paused', 'log'].map((k) => env.KV.get(k)));
  return { webhook, next: Number(next || 0), paused: paused === '1', log: JSON.parse(log || '[]') };
}

async function addLog(env, st, line) {
  const log = [`${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC  ${line}`, ...st.log].slice(0, 40);
  await env.KV.put('log', JSON.stringify(log));
}

async function send(env, st, idx, sample = false) {
  const pin = { ...PINS[idx] };
  // Pinterest search reads keywords from the description; hashtags no longer help.
  if (pin.keywords) {
    const extra = `\n\nIdeas for: ${pin.keywords}.`;
    if ((pin.description + extra).length <= 500) pin.description += extra;
  }
  const r = await fetch(st.webhook, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ...pin, number: idx + 1, total: PINS.length, sample }),
  });
  const ok = r.ok;
  await addLog(env, st, `${sample ? 'sample ' : ''}#${idx + 1} "${pin.title}" -> ${r.status}`);
  return ok;
}

async function publishNext(env) {
  const st = await state(env);
  if (!st.webhook || st.paused) return 'skipped (no webhook or paused)';
  if (st.next >= PINS.length) return 'all pins published';
  const ok = await send(env, st, st.next);
  if (ok) await env.KV.put('next', String(st.next + 1));
  return ok ? `sent #${st.next + 1}` : 'webhook error';
}

function page(st, key, msg) {
  const k = encodeURIComponent(key);
  const btn = (action, label) => `<button name="action" value="${action}">${label}</button>`;
  return new Response(`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Penny Pins</title><style>
body{font-family:system-ui,sans-serif;max-width:640px;margin:0 auto;padding:20px 16px;background:#F7FAF8;color:#1F2A37}
input{width:100%;padding:12px;font-size:16px;border:1px solid #ccc;border-radius:8px;box-sizing:border-box}
button{padding:12px 16px;font-size:16px;border:0;border-radius:8px;background:#2F7D5B;color:#fff;margin:6px 6px 0 0}
.card{background:#fff;border:1px solid #DDE3E0;border-radius:12px;padding:16px;margin:14px 0}
.msg{background:#E3F1EA;padding:10px 12px;border-radius:8px}pre{white-space:pre-wrap;font-size:13px}
</style></head><body><h1>📌 Penny Pins</h1>
${msg ? `<p class="msg">${esc(msg)}</p>` : ''}
<div class="card"><b>Վիճակ</b><br>Make webhook՝ ${st.webhook ? '✅' : '❌ դեռ չկա'}<br>
Հրապարակված՝ ${st.next} / ${PINS.length}<br>${st.paused ? '⏸ կանգնեցված' : '▶️ աշխատում է (օրական 2 անգամ՝ 15:00 և 23:00 UTC)'}<br>
Հաջորդը՝ ${esc(PINS[st.next]?.title || '—')}</div>
<form method="post" action="/setup?key=${k}" class="card">
<label><b>Make.com Webhook URL</b></label><br><br>
<input name="webhook" value="${esc(st.webhook || '')}" placeholder="https://hook.eu2.make.com/...">
${btn('save', '💾 Պահպանել')}${btn('sample', '🧪 Ուղարկել նմուշ')}${btn('now', '🚀 Հրապարակել հաջորդը հիմա')}
${st.paused ? btn('resume', '▶️ Շարունակել') : btn('pause', '⏸ Կանգնեցնել')}
</form><div class="card"><b>Մատյան</b><pre>${esc(st.log.join('\n') || '—')}</pre></div></body></html>`,
  { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex' } });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== '/setup') return new Response('Not found', { status: 404 });
    const key = url.searchParams.get('key') || '';
    if (!env.SETUP_KEY || key !== env.SETUP_KEY) return new Response('Forbidden', { status: 403 });
    let msg = '';
    if (request.method === 'POST') {
      const form = await request.formData();
      const action = form.get('action');
      const webhook = String(form.get('webhook') || '').trim();
      if (webhook && webhook !== (await env.KV.get('webhook'))) {
        if (!/^https:\/\/hook\.[a-z0-9.-]+\.make\.com\/[A-Za-z0-9]+$/.test(webhook)) msg = '⚠️ Սա Make-ի webhook հղում չի թվում (https://hook....make.com/...)';
        else { await env.KV.put('webhook', webhook); msg = '✅ Webhook-ը պահպանված է։ '; }
      }
      const st = await state(env);
      if (action === 'sample' && st.webhook) msg += (await send(env, st, st.next < PINS.length ? st.next : 0, true)) ? 'Նմուշը ուղարկվեց Make-ին։' : 'Make-ը սխալ վերադարձրեց (տե՛ս մատյանը)։';
      if (action === 'now') msg += await publishNext(env);
      if (action === 'pause') { await env.KV.put('paused', '1'); msg += 'Կանգնեցված է։'; }
      if (action === 'resume') { await env.KV.put('paused', '0'); msg += 'Շարունակվում է։'; }
    }
    return page(await state(env), key, msg);
  },
  async scheduled(event, env, ctx) {
    ctx.waitUntil(publishNext(env));
  },
};
