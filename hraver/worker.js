// Hraver — self-service digital invitations.
// Customer builds an invitation on the site → order is saved → owner gets a Telegram message
// → customer pays → owner taps "✅ Paid" → invitation goes live, guests' RSVPs are collected.
import LANDING from "../invite/index.html";
import INVITE from "../invite/i.html";
import BUILDER from "../invite/create.html";
import ORDER from "./order.html";

const PLANS = { mini: { name: "Մինի", price: 9900 }, standard: { name: "Ստանդարտ", price: 19900 } };
const STATUS = { pending: "⏳ Սպասում է վճարման", claimed: "🔎 Վճարումը ստուգվում է", paid: "✅ Ակտիվ", cancelled: "❌ Չեղարկված" };
const MAX_PHOTO = 700 * 1024;

// ---------------------------------------------------------------- helpers
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json; charset=utf-8" } });
const html = (s, status = 200) => new Response(s, { status, headers: { "content-type": "text/html; charset=utf-8" } });
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const inject = (page, obj) => page.replace("<script>\n", `<script>window.__HRAVER=${JSON.stringify(obj).replace(/</g, "\\u003c")};</script>\n<script>\n`);
const rand = (n, abc = "abcdefghijkmnpqrstuvwxyz23456789") => [...crypto.getRandomValues(new Uint8Array(n))].map((b) => abc[b % abc.length]).join("");
const amd = (n) => n.toLocaleString("en-US").replace(/,/g, " ") + " ֏";
const fmtPhone = (p) => (p && p.length === 12 && p.startsWith("+374") ? `+374 ${p.slice(4, 6)} ${p.slice(6)}` : p || "");
function normPhone(raw) {
  let d = String(raw || "").replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  if (d.length === 9 && d[0] === "0") d = "374" + d.slice(1);
  else if (d.length === 8) d = "374" + d;
  return d.length >= 10 && d.length <= 15 ? "+" + d : null;
}

let ready = false;
async function init(env) {
  if (ready) return;
  await env.DB.batch([
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, k TEXT, data TEXT, plan TEXT, price INTEGER,
      phone TEXT, status TEXT, created INTEGER, paid_at INTEGER, photo BLOB, photo_type TEXT, photo_v INTEGER DEFAULT 0)`),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS rsvps (id INTEGER PRIMARY KEY AUTOINCREMENT, oid TEXT, name TEXT, go INTEGER,
      n INTEGER, msg TEXT, created INTEGER)`),
    env.DB.prepare("CREATE TABLE IF NOT EXISTS settings (k TEXT PRIMARY KEY, v TEXT)"),
  ]);
  ready = true;
}
async function getSetting(env, k) {
  const r = await env.DB.prepare("SELECT v FROM settings WHERE k=?").bind(k).first();
  return r ? r.v : null;
}
const setSetting = (env, k, v) =>
  env.DB.prepare("INSERT INTO settings (k, v) VALUES (?, ?) ON CONFLICT(k) DO UPDATE SET v=excluded.v").bind(k, v).run();

// Keep only known fields with sane lengths.
function cleanData(d, plan) {
  const s = (v, n = 300) => String(v ?? "").slice(0, n);
  const out = {
    type: s(d.type, 60), theme: ["classic", "garden", "rose", "night"].includes(d.theme) ? d.theme : "classic",
    n1: s(d.n1, 60), n2: s(d.n2, 60), date: s(d.date, 20), text: s(d.text, 1500),
    dress: s(d.dress, 200), music: /^https:\/\//.test(d.music || "") ? s(d.music, 500) : "",
    rsvpBy: s(d.rsvpBy, 10), rsvp: d.rsvp ? "site" : "",
    colors: (Array.isArray(d.colors) ? d.colors : []).slice(0, 8).map((c) => s(c, 30)).filter((c) => /^#?[\w(),.% ]+$/.test(c)),
    timeline: (Array.isArray(d.timeline) ? d.timeline : []).slice(0, 15).map((t) => [s(t?.[0], 20), s(t?.[1], 120)]),
    places: (Array.isArray(d.places) ? d.places : []).slice(0, 5).map((p) => ({
      time: s(p?.time, 20), title: s(p?.title, 80), name: s(p?.name, 120), addr: s(p?.addr, 200),
      map: /^https:\/\//.test(p?.map || "") ? s(p.map, 500) : "",
    })),
  };
  if (plan === "mini") { out.music = ""; out.rsvp = ""; }
  return out;
}
function decodePhoto(dataUrl) {
  const m = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/.exec(dataUrl || "");
  if (!m) return null;
  const bytes = Uint8Array.from(atob(m[2]), (c) => c.charCodeAt(0));
  return bytes.length <= MAX_PHOTO ? { bytes, type: m[1] } : null;
}
async function loadOrder(env, id, k) {
  const o = await env.DB.prepare("SELECT id,k,data,plan,price,phone,status,created,paid_at,photo_v FROM orders WHERE id=?").bind(id).first();
  return o && (k === undefined || o.k === k) ? o : null;
}
const publicData = (o) => {
  const d = JSON.parse(o.data);
  if (o.photo_v) d.photo = `/p/${o.id}?v=${o.photo_v}`;
  return d;
};
const title = (d) => `${d.type}՝ ${d.n2 ? d.n1 + " & " + d.n2 : d.n1}`;

// ---------------------------------------------------------------- telegram
async function tg(env, method, body) {
  const token = await getSetting(env, "bot_token");
  if (!token) return { ok: false };
  const r = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body),
  });
  const data = await r.json().catch(() => ({ ok: false }));
  if (!data.ok) console.log("telegram error", method, JSON.stringify(data));
  return data;
}
async function notifyOwner(env, text, markup) {
  const owner = await getSetting(env, "owner_id");
  if (owner) await tg(env, "sendMessage", { chat_id: +owner, text, disable_web_page_preview: true, ...(markup && { reply_markup: markup }) });
}
const orderButtons = (o, origin) => ({ inline_keyboard: [
  [{ text: "✅ Վճարված է", callback_data: "paid:" + o.id }, { text: "❌ Չեղարկել", callback_data: "cancel:" + o.id }],
  [{ text: "👁 Բացել պատվերը", url: `${origin}/o/${o.id}?k=${o.k}` }],
] });
const orderText = (o, head) => {
  const d = JSON.parse(o.data);
  return `${head}\n\n🆔 #${o.id}\n💌 ${title(d)}\n📅 ${d.date.replace("T", " ")}\n📦 ${PLANS[o.plan].name} · ${amd(o.price)}\n📞 ${fmtPhone(o.phone)}\n${STATUS[o.status]}`;
};
async function webhookSecret(env) {
  const h = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("hook:" + (await getSetting(env, "bot_token"))));
  return [...new Uint8Array(h)].slice(0, 16).map((x) => x.toString(16).padStart(2, "0")).join("");
}

async function onUpdate(env, u, origin) {
  if (u.callback_query) {
    const q = u.callback_query, owner = await getSetting(env, "owner_id");
    if (String(q.from.id) !== owner) return tg(env, "answerCallbackQuery", { callback_query_id: q.id, text: "⛔" });
    const [act, id] = String(q.data).split(":");
    const status = act === "paid" ? "paid" : act === "cancel" ? "cancelled" : null;
    if (status) await env.DB.prepare("UPDATE orders SET status=?, paid_at=? WHERE id=?").bind(status, status === "paid" ? Date.now() : null, id).run();
    const o = await loadOrder(env, id);
    await tg(env, "answerCallbackQuery", { callback_query_id: q.id, text: status === "paid" ? "Ակտիվացված է ✅" : "Չեղարկված է" });
    if (o) await tg(env, "editMessageText", {
      chat_id: q.message.chat.id, message_id: q.message.message_id, text: orderText(o, "📬 Պատվեր"), disable_web_page_preview: true,
      reply_markup: o.status === "paid" ? { inline_keyboard: [[{ text: "👁 Բացել պատվերը", url: `${origin}/o/${o.id}?k=${o.k}` }],
        [{ text: "📲 Գրել հաճախորդին WhatsApp-ով", url: `https://wa.me/${o.phone.slice(1)}?text=${encodeURIComponent(`Բարև Ձեզ։ Ձեր հրավերը ակտիվ է ✅\n\nՀրավերի հղումը (ուղարկեք հյուրերին)՝\n${origin}/i/${o.id}\n\nՁեր էջը (խմբագրում և հյուրերի պատասխաններ)՝\n${origin}/o/${o.id}?k=${o.k}`)}` }]] }
        : orderButtons(o, origin),
    });
    return;
  }
  const m = u.message;
  if (!m || !m.text) return;
  const text = m.text.trim(), owner = await getSetting(env, "owner_id");
  if (text.startsWith("/start admin_")) {
    if (!owner && text.slice(13) === (await getSetting(env, "admin_code"))) {
      await setSetting(env, "owner_id", String(m.chat.id));
      return tg(env, "sendMessage", { chat_id: m.chat.id, text: "✅ Դու Hraver-ի ադմինն ես։ Նոր պատվերները կգան այստեղ։\n\nՀրամաններ՝\n/orders — չվճարված պատվերներ\n/stats — վիճակագրություն\n/pay ՏԵՔՍՏ — վճարման տվյալներ (քարտ, Idram), որոնք կտեսնի հաճախորդը" });
    }
  }
  if (String(m.chat.id) !== owner) return tg(env, "sendMessage", { chat_id: m.chat.id, text: `Բարև 👋 Հրավեր պատվիրելու համար բացեք ${origin}` });
  if (text.startsWith("/pay")) {
    const v = text.slice(4).trim();
    if (v) await setSetting(env, "pay_info", v.slice(0, 1000));
    return tg(env, "sendMessage", { chat_id: m.chat.id, text: v ? "✅ Պահպանված է։ Հաճախորդները կտեսնեն՝\n\n" + v : "Գրիր այսպես՝\n/pay Քարտ՝ 4318 0000 0000 0000 (Անուն Ազգանուն)\nIdram ID՝ 123456789\n\nՀիմա՝\n" + ((await getSetting(env, "pay_info")) || "—") });
  }
  if (text === "/orders") {
    const rows = (await env.DB.prepare("SELECT id,k,data,plan,price,phone,status FROM orders WHERE status IN ('pending','claimed') ORDER BY created DESC LIMIT 10").all()).results;
    if (!rows.length) return tg(env, "sendMessage", { chat_id: m.chat.id, text: "Չվճարված պատվերներ չկան 👌" });
    for (const o of rows) await tg(env, "sendMessage", { chat_id: m.chat.id, text: orderText(o, "📬 Պատվեր"), reply_markup: orderButtons(o, origin), disable_web_page_preview: true });
    return;
  }
  if (text === "/stats") {
    const month = new Date(); month.setDate(1); month.setHours(0, 0, 0, 0);
    const q = (sql, ...b) => env.DB.prepare(sql).bind(...b).first();
    const all = await q("SELECT COUNT(*) c, COALESCE(SUM(price),0) s FROM orders WHERE status='paid'");
    const mon = await q("SELECT COUNT(*) c, COALESCE(SUM(price),0) s FROM orders WHERE status='paid' AND paid_at>=?", month.getTime());
    const pend = await q("SELECT COUNT(*) c FROM orders WHERE status IN ('pending','claimed')");
    return tg(env, "sendMessage", { chat_id: m.chat.id, text: `📊 Այս ամիս՝ ${mon.c} պատվեր · ${amd(mon.s)}\nԸնդամենը՝ ${all.c} պատվեր · ${amd(all.s)}\nՉվճարված՝ ${pend.c}` });
  }
  return tg(env, "sendMessage", { chat_id: m.chat.id, text: "/orders — չվճարված պատվերներ\n/stats — վիճակագրություն\n/pay ՏԵՔՍՏ — վճարման տվյալներ" });
}

// ---------------------------------------------------------------- setup page
const page = (body) => html(`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Hraver setup</title><body style="font:18px system-ui;padding:24px;line-height:1.5;max-width:560px;margin:auto">${body}</body>`);
const TOKEN_FORM = `<h2>💌 Hraver-ի Telegram բոտի միացում</h2><form method="post"><p>Տեղադրիր @BotFather-ի տոկենը.</p>
<input name="token" autocomplete="off" placeholder="123456789:AA..." style="width:100%;font-size:18px;padding:12px;box-sizing:border-box">
<p><button style="font-size:18px;padding:12px 20px;width:100%">Միացնել</button></p></form>`;
async function setup(request, env, origin) {
  const token = await getSetting(env, "bot_token");
  const hook = async (t) => {
    const r = await fetch(`https://api.telegram.org/bot${t}/getMe`).then((r) => r.json()).catch(() => ({}));
    if (!r.ok) return null;
    await setSetting(env, "bot_token", t);
    await tg(env, "setWebhook", { url: origin + "/webhook", secret_token: await webhookSecret(env), allowed_updates: ["message", "callback_query"] });
    return r.result.username;
  };
  if (token) {
    const u = await hook(token);
    const owner = await getSetting(env, "owner_id");
    if (u && !owner) return page(`<p>✅ Բոտը միացված է։ Սեղմիր, որ դառնաս ադմին՝</p><p><a style="display:block;text-align:center;background:#b08d57;color:#fff;padding:14px;border-radius:10px;text-decoration:none" href="https://t.me/${u}?start=admin_${await getSetting(env, "admin_code")}">Դառնալ ադմին Telegram-ում</a></p>`);
    return page(u ? `✅ Բոտն աշխատում է՝ <a href="https://t.me/${u}">@${u}</a>` : "❌ Տոկենն այլևս չի աշխատում։");
  }
  if (request.method !== "POST") return page(TOKEN_FORM);
  const t = String((await request.formData()).get("token") || "").trim();
  if (!/^\d+:[\w-]{20,}$/.test(t)) return page("❌ Սա տոկեն չի նմանվում։<br>" + TOKEN_FORM);
  const u = await hook(t);
  if (!u) return page("❌ Տոկենը սխալ է։<br>" + TOKEN_FORM);
  const code = rand(12);
  await setSetting(env, "admin_code", code);
  return page(`<h2>✅ Բոտը միացված է</h2><p>Վերջին քայլ. սեղմիր կոճակը և Telegram-ում սեղմիր Start։</p><p><a style="display:block;text-align:center;background:#b08d57;color:#fff;padding:14px;border-radius:10px;text-decoration:none" href="https://t.me/${u}?start=admin_${code}">Դառնալ ադմին Telegram-ում</a></p>`);
}

// ---------------------------------------------------------------- API
async function api(request, env, url, parts) {
  const [, , what, id, extra] = parts; // /api/<what>/<id>/<extra>
  const k = url.searchParams.get("k") || undefined;
  const body = request.method === "POST" || request.method === "PUT" ? await request.json().catch(() => ({})) : {};

  if (what === "order" && !id && request.method === "POST") {
    if (body.website) return json({ error: "spam" }, 400); // honeypot
    const plan = PLANS[body.plan] ? body.plan : "standard";
    const phone = normPhone(body.phone);
    if (!phone) return json({ error: "Գրեք ճիշտ հեռախոսահամար" }, 400);
    const data = cleanData(body.data || {}, plan);
    if (!data.n1 || !data.date) return json({ error: "Լրացրեք անունը և ամսաթիվը" }, 400);
    const photo = plan === "mini" ? null : decodePhoto(body.photo);
    if (body.photo && plan !== "mini" && !photo) return json({ error: "Լուսանկարը չափազանց մեծ է" }, 400);
    const o = { id: rand(6), k: rand(16), data: JSON.stringify(data), plan, price: PLANS[plan].price, phone, status: "pending" };
    await env.DB.prepare("INSERT INTO orders (id,k,data,plan,price,phone,status,created,photo,photo_type,photo_v) VALUES (?,?,?,?,?,?,?,?,?,?,?)")
      .bind(o.id, o.k, o.data, plan, o.price, phone, "pending", Date.now(), photo ? photo.bytes : null, photo ? photo.type : null, photo ? 1 : 0).run();
    await notifyOwner(env, orderText(o, "🆕 Նոր պատվեր"), orderButtons(o, url.origin));
    return json({ id: o.id, k: o.k });
  }

  if (what === "order" && id) {
    const o = await loadOrder(env, id, k);
    if (!o) return json({ error: "not found" }, 404);
    if (request.method === "GET") {
      const guests = (await env.DB.prepare("SELECT name,go,n,msg,created FROM rsvps WHERE oid=? ORDER BY created DESC").bind(id).all()).results;
      return json({ id: o.id, status: o.status, statusText: STATUS[o.status], plan: o.plan, planName: PLANS[o.plan].name, price: amd(o.price),
        data: publicData(o), guests, payInfo: (await getSetting(env, "pay_info")) || "" });
    }
    if (request.method === "POST" && extra === "claim") {
      if (o.status === "pending") {
        await env.DB.prepare("UPDATE orders SET status='claimed' WHERE id=?").bind(id).run();
        o.status = "claimed";
        await notifyOwner(env, orderText(o, "💰 Հաճախորդն ասում է, որ վճարել է։ Ստուգիր և հաստատիր"), orderButtons(o, url.origin));
      }
      return json({ ok: true });
    }
    if (request.method === "PUT") {
      if (o.status === "cancelled") return json({ error: "Պատվերը չեղարկված է" }, 400);
      const data = cleanData(body.data || {}, o.plan);
      if (!data.n1 || !data.date) return json({ error: "Լրացրեք անունը և ամսաթիվը" }, 400);
      if (body.photo === null) {
        await env.DB.prepare("UPDATE orders SET data=?, photo=NULL, photo_v=0 WHERE id=?").bind(JSON.stringify(data), id).run();
      } else if (body.photo && o.plan !== "mini") {
        const p = decodePhoto(body.photo);
        if (!p) return json({ error: "Լուսանկարը չափազանց մեծ է" }, 400);
        await env.DB.prepare("UPDATE orders SET data=?, photo=?, photo_type=?, photo_v=photo_v+1 WHERE id=?").bind(JSON.stringify(data), p.bytes, p.type, id).run();
      } else {
        await env.DB.prepare("UPDATE orders SET data=? WHERE id=?").bind(JSON.stringify(data), id).run();
      }
      return json({ ok: true });
    }
  }

  if (what === "rsvp" && id && request.method === "POST") {
    const o = await loadOrder(env, id);
    if (!o || o.status !== "paid") return json({ error: "Հրավերը դեռ ակտիվ չէ" }, 400);
    const name = String(body.name || "").trim().slice(0, 80);
    if (!name) return json({ error: "Գրեք անունը" }, 400);
    const cnt = await env.DB.prepare("SELECT COUNT(*) c FROM rsvps WHERE oid=?").bind(id).first();
    if (cnt.c >= 1000) return json({ error: "limit" }, 429);
    await env.DB.prepare("INSERT INTO rsvps (oid,name,go,n,msg,created) VALUES (?,?,?,?,?,?)")
      .bind(id, name, body.go ? 1 : 0, Math.min(20, Math.max(1, parseInt(body.n) || 1)), String(body.msg || "").slice(0, 500), Date.now()).run();
    return json({ ok: true });
  }
  return json({ error: "not found" }, 404);
}

// ---------------------------------------------------------------- router
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const parts = url.pathname.split("/");
    await init(env);
    try {
      if (url.pathname === "/" || url.pathname === "/index.html") return html(LANDING);
      if (url.pathname === "/i.html") return html(INVITE);
      if (url.pathname === "/create.html") return html(inject(BUILDER, { server: true, plans: PLANS }));
      if (url.pathname === "/setup") return setup(request, env, url.origin);
      if (url.pathname === "/webhook" && request.method === "POST") {
        if (request.headers.get("X-Telegram-Bot-Api-Secret-Token") !== await webhookSecret(env)) return new Response("forbidden", { status: 403 });
        try { await onUpdate(env, await request.json(), url.origin); } catch (e) { console.log("update error", e?.stack || e); }
        return new Response("ok");
      }
      if (parts[1] === "api") return await api(request, env, url, parts);
      if (parts[1] === "i" && parts[2]) {
        const o = await loadOrder(env, parts[2]);
        if (!o || o.status === "cancelled") return html("<meta charset=utf-8><p style='font:18px system-ui;padding:24px'>Հրավերը չի գտնվել։</p>", 404);
        return html(inject(INVITE, { id: o.id, paid: o.status === "paid", data: publicData(o) }));
      }
      if (parts[1] === "o" && parts[2]) return html(ORDER);
      if (parts[1] === "p" && parts[2]) {
        const r = await env.DB.prepare("SELECT photo, photo_type FROM orders WHERE id=? AND photo IS NOT NULL").bind(parts[2]).first();
        if (!r) return new Response("not found", { status: 404 });
        return new Response(new Uint8Array(r.photo), { headers: { "content-type": r.photo_type, "cache-control": "public, max-age=31536000, immutable" } });
      }
      if (url.pathname === "/robots.txt") return new Response("User-agent: *\nDisallow: /i/\nDisallow: /o/\nDisallow: /api/\n");
      return Response.redirect(url.origin + "/", 302);
    } catch (e) {
      console.log("error", e?.stack || e);
      return json({ error: "Սխալ տեղի ունեցավ, փորձեք նորից" }, 500);
    }
  },
};
