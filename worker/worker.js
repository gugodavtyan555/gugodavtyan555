// 💈 Հերթագրման Telegram բոտ՝ Cloudflare Workers-ի համար (անվճար, 24/7)։
//
// Կարգավորումներ Cloudflare-ում (տե՛ս worker/README.md).
//   • Secret  BOT_TOKEN — BotFather-ի տոկենը
//   • D1 binding  DB — տվյալների բազա
//   • Cron trigger «ամեն րոպե» — հիշեցումների համար
//
// ======================= ՓՈԽԻՐ ԱՅՍՏԵՂ =======================
const CONFIG = {
  name: "Demo Barbershop",
  address: "Երևան, Աբովյան 1",
  phone: "+374 00 000000",
  // Telegram ID-ներ, որոնք ստանում են ծանուցումներ (բոտին գրիր /myid)
  adminIds: [],
  slotMinutes: 30,       // ժամերի քայլը
  daysAhead: 7,          // քանի օր առաջ կարելի է գրանցվել
  minLeadMinutes: 30,    // ամենաքիչը քանի րոպե առաջ
  reminderMinutes: 60,   // հիշեցումը՝ քանի րոպե առաջ
  tzOffsetMinutes: 240,  // Երևան = UTC+4
  hours: {               // null = փակ է
    mon: ["10:00", "20:00"],
    tue: ["10:00", "20:00"],
    wed: ["10:00", "20:00"],
    thu: ["10:00", "20:00"],
    fri: ["10:00", "20:00"],
    sat: ["10:00", "18:00"],
    sun: null,
  },
  services: [
    { name: "Տղամարդու սանրվածք", price: 4000, duration: 30 },
    { name: "Մորուքի ձևավորում", price: 2500, duration: 30 },
    { name: "Սանրվածք + մորուք", price: 6000, duration: 60 },
    { name: "Մանկական սանրվածք", price: 3000, duration: 30 },
  ],
};
// ============================================================

const WEEKDAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const DAY_NAMES = ["Երկ", "Երք", "Չրք", "Հնգ", "Ուրբ", "Շբթ", "Կիր"];
const BTN_BOOK = "📅 Գրանցվել";
const BTN_MINE = "🗂 Իմ գրանցումները";
const BTN_PRICES = "💈 Ծառայություններ և գներ";
const BTN_CONTACT = "📍 Կապ";
const MENU = {
  keyboard: [[BTN_BOOK, BTN_MINE], [BTN_PRICES, BTN_CONTACT]],
  resize_keyboard: true,
};
const MIN = 60_000;
const DAY = 86_400_000;

// ---------------------------------------------------------------- time
// Times are ms since epoch; day keys are local "YYYYMMDD".
const pad = (n) => String(n).padStart(2, "0");
const off = () => CONFIG.tzOffsetMinutes * MIN;

function local(ts) {
  const d = new Date(ts + off());
  return {
    y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate(),
    wd: (d.getUTCDay() + 6) % 7, H: d.getUTCHours(), M: d.getUTCMinutes(),
  };
}
const dayKey = (ts) => { const l = local(ts); return `${l.y}${pad(l.m)}${pad(l.d)}`; };
function dayStart(key) {
  return Date.UTC(+key.slice(0, 4), +key.slice(4, 6) - 1, +key.slice(6, 8)) - off();
}
const dayLabel = (key) => { const l = local(dayStart(key)); return `${DAY_NAMES[l.wd]} ${pad(l.d)}.${pad(l.m)}`; };
const hhmm = (ts) => { const l = local(ts); return `${pad(l.H)}:${pad(l.M)}`; };
const fmt = (ts) => `${dayLabel(dayKey(ts))}, ${hhmm(ts)}`;
const money = (n) => `${n.toLocaleString("en-US").replace(/,/g, " ")} ֏`;

function workingHours(key) {
  const start = dayStart(key);
  const h = CONFIG.hours[WEEKDAYS[local(start).wd]];
  if (!h) return null;
  const at = (s) => start + (+s.slice(0, 2) * 60 + +s.slice(3, 5)) * MIN;
  return [at(h[0]), at(h[1])];
}

function freeSlots(key, durationMin, busy, now) {
  const wh = workingHours(key);
  if (!wh) return [];
  const [opens, closes] = wh;
  const step = CONFIG.slotMinutes * MIN, dur = durationMin * MIN;
  const earliest = now + CONFIG.minLeadMinutes * MIN;
  const out = [];
  for (let t = opens; t + dur <= closes; t += step) {
    if (t >= earliest && busy.every(([b0, b1]) => t + dur <= b0 || t >= b1)) out.push(t);
  }
  return out;
}

function bookableDays(now) {
  const days = [];
  for (let i = 0; i < CONFIG.daysAhead; i++) {
    const k = dayKey(now + i * DAY);
    if (workingHours(k)) days.push(k);
  }
  return days;
}

// ---------------------------------------------------------------- storage (D1)
// Times stored as unix seconds.
let ready = false;
async function init(env) {
  if (ready) return;
  await env.DB.prepare(
    "CREATE TABLE IF NOT EXISTS bookings (id INTEGER PRIMARY KEY, user_id INTEGER, user_name TEXT, " +
    "service TEXT, price INTEGER, start INTEGER, end INTEGER, status TEXT DEFAULT 'active', reminded INTEGER DEFAULT 0)"
  ).run();
  ready = true;
}
const sec = (ms) => Math.floor(ms / 1000);
const all = async (stmt) => (await stmt.all()).results;

async function busy(env, start, end) {
  const rows = await all(env.DB.prepare(
    "SELECT start, end FROM bookings WHERE status='active' AND start < ? AND end > ?").bind(sec(end), sec(start)));
  return rows.map((r) => [r.start * 1000, r.end * 1000]);
}

// ---------------------------------------------------------------- telegram
async function tg(env, method, body) {
  const base = env.API_BASE || "https://api.telegram.org";
  const r = await fetch(`${base}/bot${env.BOT_TOKEN}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await r.json().catch(() => ({ ok: false }));
  if (!data.ok) console.log("telegram error", method, JSON.stringify(data));
  return data;
}
const send = (env, chatId, text, markup) =>
  tg(env, "sendMessage", { chat_id: chatId, text, ...(markup && { reply_markup: markup }) });
const btn = (text, data) => ({ text, callback_data: data });
const inline = (rows) => ({ inline_keyboard: rows });

function userLabel(u) {
  const name = [u.first_name, u.last_name].filter(Boolean).join(" ") || "Հաճախորդ";
  return u.username ? `${name} (@${u.username})` : name;
}
async function notifyAdmins(env, text) {
  for (const id of CONFIG.adminIds) await send(env, id, text);
}
const servicesKb = () =>
  inline(CONFIG.services.map((s, i) => [btn(`${s.name} — ${money(s.price)}`, `svc:${i}`)]));

// ---------------------------------------------------------------- handlers
async function onMessage(env, msg) {
  const chat = msg.chat.id, text = (msg.text || "").trim(), user = msg.from;
  const cmd = text.split(/[\s@]/)[0];

  if (cmd === "/start") {
    return send(env, chat, `Բարի գալուստ ${CONFIG.name} 💈\n\nԱյստեղ կարող եք գրանցվել մի քանի վայրկյանում։`, MENU);
  }
  if (cmd === "/myid") return send(env, chat, `Ձեր ID-ն՝ ${user.id}`);
  if (cmd === "/today" || cmd === "/tomorrow") return schedule(env, chat, user, cmd === "/today" ? 0 : 1);
  if (cmd === "/book" || text === BTN_BOOK) return send(env, chat, "Ընտրեք ծառայությունը.", servicesKb());
  if (text === BTN_PRICES) {
    const lines = CONFIG.services.map((s) => `• ${s.name} — ${money(s.price)} (${s.duration} րոպե)`);
    return send(env, chat, "Ծառայություններ և գներ\n\n" + lines.join("\n"));
  }
  if (text === BTN_CONTACT) {
    const hours = WEEKDAYS.map((k, i) => {
      const h = CONFIG.hours[k];
      return h ? `🕒 ${DAY_NAMES[i]}՝ ${h[0]}–${h[1]}` : `🕒 ${DAY_NAMES[i]}՝ փակ է`;
    });
    return send(env, chat, `${CONFIG.name}\n📍 ${CONFIG.address}\n📞 ${CONFIG.phone}\n\n${hours.join("\n")}`);
  }
  if (text === BTN_MINE) {
    const rows = await all(env.DB.prepare(
      "SELECT * FROM bookings WHERE user_id=? AND status='active' AND start>=? ORDER BY start"
    ).bind(user.id, sec(Date.now())));
    if (!rows.length) return send(env, chat, "Դուք ակտիվ գրանցումներ չունեք։", MENU);
    for (const r of rows) {
      await send(env, chat, `✂️ ${r.service}\n🕒 ${fmt(r.start * 1000)}`,
        inline([[btn("❌ Չեղարկել", `cancel:${r.id}`)]]));
    }
    return;
  }
  return send(env, chat, "Ընտրեք ներքևի ընտրացանկից 👇", MENU);
}

async function schedule(env, chat, user, offsetDays) {
  if (!CONFIG.adminIds.includes(user.id)) return;
  const key = dayKey(Date.now() + offsetDays * DAY);
  const start = dayStart(key);
  const rows = await all(env.DB.prepare(
    "SELECT * FROM bookings WHERE status='active' AND start>=? AND start<? ORDER BY start"
  ).bind(sec(start), sec(start + DAY)));
  if (!rows.length) return send(env, chat, `${dayLabel(key)}՝ գրանցումներ չկան։`);
  const total = rows.reduce((s, r) => s + r.price, 0);
  const lines = rows.map((r) => `${hhmm(r.start * 1000)} — ${r.service} — ${r.user_name}`);
  return send(env, chat, `📋 ${dayLabel(key)} (${rows.length} գրանցում, ${money(total)})\n\n${lines.join("\n")}`);
}

async function onCallback(env, q) {
  await tg(env, "answerCallbackQuery", { callback_query_id: q.id });
  if (!q.message) return;
  const edit = (text, markup) => tg(env, "editMessageText", {
    chat_id: q.message.chat.id, message_id: q.message.message_id, text,
    ...(markup && { reply_markup: markup }),
  });
  const [kind, a, b] = (q.data || "").split(":");
  const now = Date.now();

  if (kind === "back") return edit("Ընտրեք ծառայությունը.", servicesKb());

  if (kind === "svc") {
    const i = +a, rows = [];
    const days = bookableDays(now);
    for (let k = 0; k < days.length; k += 3) {
      rows.push(days.slice(k, k + 3).map((d) => btn(dayLabel(d), `day:${i}:${d}`)));
    }
    rows.push([btn("⬅️ Հետ", "back")]);
    return edit(`${CONFIG.services[i].name}\nԸնտրեք օրը.`, inline(rows));
  }

  if (kind === "day") {
    const i = +a, key = b, svc = CONFIG.services[i];
    const wh = workingHours(key);
    const slots = wh ? freeSlots(key, svc.duration, await busy(env, wh[0], wh[1]), now) : [];
    const rows = [];
    for (let k = 0; k < slots.length; k += 4) {
      rows.push(slots.slice(k, k + 4).map((t) => btn(hhmm(t), `slot:${i}:${sec(t)}`)));
    }
    rows.push([btn("⬅️ Այլ օր", `svc:${i}`)]);
    return edit(slots.length ? `${svc.name}, ${dayLabel(key)}\nԸնտրեք ժամը.`
      : "Այս օրը ազատ ժամ չկա 😔 Ընտրեք այլ օր։", inline(rows));
  }

  if (kind === "slot") {
    const i = +a, ts = +b * 1000, svc = CONFIG.services[i];
    return edit(`Հաստատե՞լ գրանցումը\n\n✂️ ${svc.name} — ${money(svc.price)}\n🕒 ${fmt(ts)}`,
      inline([[btn("✅ Հաստատել", `ok:${i}:${b}`), btn("⬅️ Հետ", `svc:${i}`)]]));
  }

  if (kind === "ok") {
    const i = +a, ts = +b * 1000, svc = CONFIG.services[i];
    const key = dayKey(ts), wh = workingHours(key);
    // Re-check: someone may have taken the slot meanwhile.
    const free = wh && freeSlots(key, svc.duration, await busy(env, wh[0], wh[1]), now).includes(ts);
    if (!free) {
      return edit("Այս ժամն արդեն զբաղված է 😔 Ընտրեք այլ ժամ։",
        inline([[btn("⬅️ Ընտրել այլ ժամ", `svc:${i}`)]]));
    }
    const who = userLabel(q.from);
    await env.DB.prepare(
      "INSERT INTO bookings (user_id, user_name, service, price, start, end) VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(q.from.id, who, svc.name, svc.price, sec(ts), sec(ts + svc.duration * MIN)).run();
    await edit(`✅ Դուք գրանցված եք\n\n✂️ ${svc.name}\n🕒 ${fmt(ts)}\n📍 ${CONFIG.address}\n\n` +
      `Կհիշեցնենք ${CONFIG.reminderMinutes} րոպե առաջ։`);
    return notifyAdmins(env, `🆕 Նոր գրանցում\n👤 ${who}\n✂️ ${svc.name} — ${money(svc.price)}\n🕒 ${fmt(ts)}`);
  }

  if (kind === "cancel") {
    const row = await env.DB.prepare(
      "SELECT * FROM bookings WHERE id=? AND user_id=? AND status='active' AND start>=?"
    ).bind(+a, q.from.id, sec(now)).first();
    if (!row) return edit("Այս գրանցումն այլևս ակտիվ չէ։");
    await env.DB.prepare("UPDATE bookings SET status='cancelled' WHERE id=?").bind(row.id).run();
    await edit(`❌ Գրանցումը չեղարկված է (${row.service}, ${fmt(row.start * 1000)})`);
    return notifyAdmins(env, `❌ Չեղարկում\n👤 ${row.user_name}\n✂️ ${row.service}\n🕒 ${fmt(row.start * 1000)}`);
  }
}

async function sendReminders(env) {
  const now = Date.now();
  const rows = await all(env.DB.prepare(
    "SELECT * FROM bookings WHERE status='active' AND reminded=0 AND start>? AND start<=?"
  ).bind(sec(now), sec(now + CONFIG.reminderMinutes * MIN)));
  for (const r of rows) {
    await send(env, r.user_id, `⏰ Հիշեցում\n\n✂️ ${r.service}\n🕒 ${fmt(r.start * 1000)}\n📍 ${CONFIG.address}`);
    await env.DB.prepare("UPDATE bookings SET reminded=1 WHERE id=?").bind(r.id).run();
  }
}

// ---------------------------------------------------------------- entry points
async function webhookSecret(env) {
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("hook:" + env.BOT_TOKEN));
  return [...new Uint8Array(hash)].slice(0, 16).map((x) => x.toString(16).padStart(2, "0")).join("");
}

function page(text, status = 200) {
  return new Response(`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width">` +
    `<body style="font:18px system-ui;padding:24px;line-height:1.5">${text}</body>`,
    { status, headers: { "content-type": "text/html; charset=utf-8" } });
}

async function setup(env, origin) {
  if (!env.BOT_TOKEN) return page("❌ BOT_TOKEN secret-ը չկա։ Ավելացրու այն Settings → Variables and Secrets բաժնում։");
  if (!env.DB) return page("❌ DB binding-ը չկա։ Ավելացրու D1 բազան Settings → Bindings բաժնում՝ DB անունով։");
  await init(env);
  const me = await tg(env, "getMe", {});
  if (!me.ok) return page("❌ Տոկենը սխալ է։ Ստուգիր BOT_TOKEN-ը։");
  const hook = await tg(env, "setWebhook", {
    url: `${origin}/webhook`, secret_token: await webhookSecret(env),
    allowed_updates: ["message", "callback_query"],
  });
  if (!hook.ok) return page("❌ Webhook-ը չմիացավ․ " + (hook.description || ""));
  return page(`✅ Պատրաստ է։ Բոտը՝ <a href="https://t.me/${me.result.username}">@${me.result.username}</a><br>` +
    `Բացիր այն Telegram-ում և գրիր /start`);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/setup") return setup(env, url.origin);
    if (url.pathname === "/webhook" && request.method === "POST") {
      if (request.headers.get("X-Telegram-Bot-Api-Secret-Token") !== await webhookSecret(env)) {
        return new Response("forbidden", { status: 403 });
      }
      const update = await request.json();
      try {
        await init(env);
        if (update.message) await onMessage(env, update.message);
        else if (update.callback_query) await onCallback(env, update.callback_query);
      } catch (e) {
        console.log("handler error", e && e.stack || e);
      }
      return new Response("ok");
    }
    return page(`💈 ${CONFIG.name} բոտն աշխատում է։ Առաջին անգամ բացիր <a href="/setup">/setup</a>։`);
  },

  async scheduled(event, env) {
    await init(env);
    await sendReminders(env);
  },
};
