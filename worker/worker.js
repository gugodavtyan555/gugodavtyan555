// 💈 Հերթագրման Telegram բոտ՝ Cloudflare Workers-ի համար (անվճար, 24/7)։
//
// Կարգավորումներ Cloudflare-ում (տե՛ս worker/README.md).
//   • BotFather-ի տոկենը՝ /setup էջում (կամ Secret BOT_TOKEN)
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
  subscriptionPrice: 10000, // ամսական վճարը քեզ
  paymentInfo: "Վճարման մանրամասների համար կապվեք ադմինի հետ։", // օր.՝ "Idram ID՝ 123456789"
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
const BTN_TODAY = "📋 Այսօր";
const BTN_TOMORROW = "📋 Վաղը";
const BTN_WEEK = "📆 Շաբաթ";
const BTN_ADD_ADMIN = "➕ Ավելացնել ադմին";
const ADMIN_MENU = {
  keyboard: [[BTN_TODAY, BTN_TOMORROW, BTN_WEEK], [BTN_BOOK, BTN_MINE], [BTN_PRICES, BTN_CONTACT], [BTN_ADD_ADMIN]],
  resize_keyboard: true,
};
const ADMIN_HELP = "👑 Ադմինի վահանակ\n\n" +
  "📋 Այսօր / Վաղը — գրանցումների ցանկը, գումարը և չեղարկման կոճակները\n" +
  "📆 Շաբաթ — առաջիկա 7 օրվա ամփոփումը\n" +
  "➕ Ավելացնել ադմին — հղում վարսավիրանոցի տիրոջ կամ վարպետի համար\n\n" +
  "🆕 Ամեն նոր գրանցման և չեղարկման մասին ծանուցումը կգա այստեղ։";
const BTN_SUB = "💳 Բաժանորդագրություն";
const OWNER_MENU = { ...ADMIN_MENU, keyboard: [...ADMIN_MENU.keyboard, [BTN_SUB]] };
const OWNER_HELP = ADMIN_HELP + "\n\n💳 Բաժանորդագրություն — միայն դու ես տեսնում։ " +
  "Երկարացնում կամ անջատում ես բոտը, եթե վարսավիրանոցը չի վճարել։";
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
const fmtDate = (ts) => { const l = local(ts); return `${pad(l.d)}.${pad(l.m)}.${l.y}`; };
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
  await env.DB.prepare("CREATE TABLE IF NOT EXISTS settings (k TEXT PRIMARY KEY, v TEXT)").run();
  ready = true;
}
async function getSetting(env, k) {
  const r = await env.DB.prepare("SELECT v FROM settings WHERE k=?").bind(k).first();
  return r ? r.v : null;
}
async function setSetting(env, k, v) {
  await env.DB.prepare("INSERT INTO settings (k, v) VALUES (?, ?) ON CONFLICT(k) DO UPDATE SET v=excluded.v")
    .bind(k, v).run();
}
async function adminIds(env) {
  const extra = JSON.parse((await getSetting(env, "admin_ids")) || "[]");
  return [...new Set([...CONFIG.adminIds, ...extra])];
}
// Token comes from the BOT_TOKEN secret, or from the /setup form (stored in D1).
async function withToken(env) {
  return { ...env, BOT_TOKEN: env.BOT_TOKEN || (await getSetting(env, "bot_token")) };
}
// The bot owner (you) — the first person who became admin via /setup.
async function ownerId(env) {
  let o = await getSetting(env, "owner_id");
  if (!o) {
    const ids = JSON.parse((await getSetting(env, "admin_ids")) || "[]");
    if (!ids.length) return null;
    o = String(ids[0]);
    await setSetting(env, "owner_id", o);
  }
  return +o;
}
// Admins of the barbershop (everyone except the owner).
async function shopAdmins(env) {
  const owner = await ownerId(env);
  return (await adminIds(env)).filter((id) => id !== owner);
}
// Subscription end in ms, or null = no limit (demo bot).
async function paidUntil(env) {
  const v = await getSetting(env, "paid_until");
  return v ? +v : null;
}
async function subscriptionActive(env) {
  const pu = await paidUntil(env);
  return pu === null || Date.now() < pu;
}
const newCode = () => crypto.randomUUID().replace(/-/g, "").slice(0, 12);
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
  for (const id of await adminIds(env)) await send(env, id, text);
}
const servicesKb = () =>
  inline(CONFIG.services.map((s, i) => [btn(`${s.name} — ${money(s.price)}`, `svc:${i}`)]));

// ---------------------------------------------------------------- handlers
async function onMessage(env, msg) {
  const chat = msg.chat.id, text = (msg.text || "").trim(), user = msg.from;
  const cmd = text.split(/[\s@]/)[0];
  const isAdmin = (await adminIds(env)).includes(user.id);
  const isOwner = user.id === (await ownerId(env));
  const menu = isOwner ? OWNER_MENU : isAdmin ? ADMIN_MENU : MENU;

  if (isOwner && (cmd === "/sub" || text === BTN_SUB)) return subStatus(env, chat);
  if (isAdmin) {
    if (cmd === "/today" || text === BTN_TODAY) return schedule(env, chat, 0);
    if (cmd === "/tomorrow" || text === BTN_TOMORROW) return schedule(env, chat, 1);
    if (cmd === "/week" || text === BTN_WEEK) return week(env, chat);
    if (cmd === "/addadmin" || text === BTN_ADD_ADMIN) {
      const code = newCode();
      await setSetting(env, "admin_code", code);
      const me = await tg(env, "getMe", {});
      return send(env, chat, "Ուղարկեք այս հղումը նոր ադմինին (օր.՝ վարսավիրանոցի տիրոջը կամ վարպետին)։ " +
        "Հղումը մեկանգամյա է.\n\n" + `https://t.me/${me.result && me.result.username}?start=admin_${code}`);
    }
  }

  if (cmd === "/start") {
    const payload = text.split(/\s+/)[1] || "";
    const code = await getSetting(env, "admin_code");
    if (code && payload === `admin_${code}`) {
      const ids = JSON.parse((await getSetting(env, "admin_ids")) || "[]");
      if (!ids.includes(user.id)) ids.push(user.id);
      await setSetting(env, "admin_ids", JSON.stringify(ids));
      await setSetting(env, "admin_code", newCode()); // one-time link
      const owner = (await ownerId(env)) || user.id; // first admin owns the bot
      if (owner === user.id) await setSetting(env, "owner_id", String(user.id));
      return send(env, chat, owner === user.id ? OWNER_HELP : ADMIN_HELP, owner === user.id ? OWNER_MENU : ADMIN_MENU);
    }
    if (isAdmin) return send(env, chat, isOwner ? OWNER_HELP : ADMIN_HELP, menu);
  }
  if (cmd === "/myid") return send(env, chat, `Ձեր ID-ն՝ ${user.id}`);

  // Subscription expired: no new bookings (the owner can still test everything).
  if (!isOwner && !(await subscriptionActive(env))) {
    return send(env, chat, isAdmin
      ? `⛔ Բաժանորդագրությունն ավարտվել է, բոտը նոր գրանցումներ չի ընդունում։\n\n` +
        `Վերականգնելու համար վճարեք ${money(CONFIG.subscriptionPrice)}։\n${CONFIG.paymentInfo}`
      : `😔 Առցանց գրանցումը ժամանակավորապես հասանելի չէ։\nԳրանցվելու համար զանգահարեք՝ ${CONFIG.phone}`, menu);
  }
  if (cmd === "/start") {
    return send(env, chat, `Բարի գալուստ ${CONFIG.name} 💈\n\nԱյստեղ կարող եք գրանցվել մի քանի վայրկյանում։`, MENU);
  }
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
    if (!rows.length) return send(env, chat, "Դուք ակտիվ գրանցումներ չունեք։", menu);
    for (const r of rows) {
      await send(env, chat, `✂️ ${r.service}\n🕒 ${fmt(r.start * 1000)}`,
        inline([[btn("❌ Չեղարկել", `cancel:${r.id}`)]]));
    }
    return;
  }
  return send(env, chat, "Ընտրեք ներքևի ընտրացանկից 👇", menu);
}

// Admin views. Callers must check admin rights first.
async function bookingsBetween(env, start, end) {
  return all(env.DB.prepare(
    "SELECT * FROM bookings WHERE status='active' AND start>=? AND start<? ORDER BY start"
  ).bind(sec(start), sec(end)));
}

async function schedule(env, chat, offsetDays) {
  const key = dayKey(Date.now() + offsetDays * DAY);
  const start = dayStart(key);
  const rows = await bookingsBetween(env, start, start + DAY);
  if (!rows.length) return send(env, chat, `📋 ${dayLabel(key)}՝ գրանցումներ չկան։`);
  const total = rows.reduce((s, r) => s + r.price, 0);
  const lines = rows.map((r) => `🕒 ${hhmm(r.start * 1000)} — ${r.service} (${money(r.price)})\n     👤 ${r.user_name}`);
  const kb = rows.map((r) => [btn(`❌ Չեղարկել ${hhmm(r.start * 1000)}`, `acancel:${r.id}`)]);
  return send(env, chat,
    `📋 ${dayLabel(key)}\n${rows.length} գրանցում, ընդամենը՝ ${money(total)}\n\n${lines.join("\n\n")}`, inline(kb));
}

async function subText(env) {
  const pu = await paidUntil(env), now = Date.now();
  let state;
  if (pu === null) state = "♾ Առանց սահմանի (ցուցադրական ռեժիմ)";
  else if (now < pu) state = `✅ Ակտիվ է մինչև ${fmtDate(pu)} (${Math.ceil((pu - now) / DAY)} օր)`;
  else state = `⛔ Անջատված է (${fmtDate(pu)}-ից)։ Հաճախորդները չեն կարող գրանցվել։`;
  const admins = await shopAdmins(env);
  return {
    text: `💳 Բաժանորդագրություն — ${CONFIG.name}\n\n${state}\n\n` +
      `Ամսական վճար՝ ${money(CONFIG.subscriptionPrice)}\n` +
      `Վարսավիրանոցի ադմիններ՝ ${admins.length ? admins.length : "դեռ չկան (➕ Ավելացնել ադմին)"}\n\n` +
      "Երբ վճարում են, սեղմիր «+1 ամիս»։ Ժամկետից 3 օր առաջ և ավարտվելու օրը վարսավիրանոցն ավտոմատ կստանա հիշեցում։",
    kb: inline([
      [btn("➕ 1 ամիս", "sub:add:30"), btn("➕ 3 ամիս", "sub:add:90")],
      [btn("⛔ Անջատել հիմա", "sub:off"), btn("♾ Առանց սահմանի", "sub:inf")],
    ]),
  };
}
async function subStatus(env, chat) {
  const s = await subText(env);
  return send(env, chat, s.text, s.kb);
}

// Warn the barbershop 3 days before and when the subscription ends (once per stage).
async function checkSubscription(env) {
  const pu = await paidUntil(env);
  if (pu === null) return;
  const now = Date.now();
  const stage = now >= pu ? "expired" : pu - now <= 3 * DAY ? "soon" : null;
  if (!stage) return;
  const tag = `${pu}:${stage}`;
  if ((await getSetting(env, "sub_warned")) === tag) return;
  await setSetting(env, "sub_warned", tag);
  const pay = `վճարեք ${money(CONFIG.subscriptionPrice)}։\n${CONFIG.paymentInfo}`;
  const shopText = stage === "soon"
    ? `⚠️ Բոտի բաժանորդագրությունն ավարտվում է ${fmtDate(pu)}-ին։\nՈրպեսզի այն շարունակի ընդունել գրանցումներ, ${pay}`
    : `⛔ Բոտի բաժանորդագրությունն ավարտվել է։ Հաճախորդներն այլևս չեն կարող գրանցվել։\nՎերականգնելու համար ${pay}`;
  for (const id of await shopAdmins(env)) await send(env, id, shopText);
  const owner = await ownerId(env);
  if (owner) {
    await send(env, owner, stage === "soon"
      ? `💳 ${CONFIG.name}. բաժանորդագրությունն ավարտվում է ${fmtDate(pu)}-ին։ Վարսավիրանոցը ստացել է հիշեցում։`
      : `⛔ ${CONFIG.name}. բաժանորդագրությունն ավարտվեց, բոտը նոր գրանցումներ չի ընդունում։\n` +
        `Երբ վճարեն, սեղմիր ${BTN_SUB} → «+1 ամիս»։`);
  }
}

async function week(env, chat) {
  const first = dayStart(dayKey(Date.now()));
  const rows = await bookingsBetween(env, first, first + 7 * DAY);
  const lines = [];
  let count = 0, total = 0;
  for (let i = 0; i < 7; i++) {
    const key = dayKey(first + i * DAY + 12 * 3600_000);
    const day = rows.filter((r) => dayKey(r.start * 1000) === key);
    const sum = day.reduce((s, r) => s + r.price, 0);
    count += day.length; total += sum;
    lines.push(workingHours(key)
      ? `${dayLabel(key)} — ${day.length} գրանցում, ${money(sum)}`
      : `${dayLabel(key)} — փակ է`);
  }
  return send(env, chat, `📆 Առաջիկա 7 օրը\n\n${lines.join("\n")}\n\nԸնդամենը՝ ${count} գրանցում, ${money(total)}`);
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
  const isOwner = q.from.id === (await ownerId(env));

  if (kind === "sub") {
    if (!isOwner) return;
    const pu = await paidUntil(env);
    if (a === "add") {
      const until = Math.max(now, pu || now) + +b * DAY;
      await setSetting(env, "paid_until", String(until));
      for (const id of await shopAdmins(env)) {
        await send(env, id, `✅ Վճարումը ստացված է, շնորհակալություն։\nԲոտը ակտիվ է մինչև ${fmtDate(until)}։`);
      }
    } else if (a === "off") {
      await setSetting(env, "paid_until", String(now));
      for (const id of await shopAdmins(env)) {
        await send(env, id, `⛔ Բաժանորդագրությունը դադարեցված է, բոտը նոր գրանցումներ չի ընդունում։\n` +
          `Վերականգնելու համար վճարեք ${money(CONFIG.subscriptionPrice)}։\n${CONFIG.paymentInfo}`);
      }
    } else if (a === "inf") {
      await env.DB.prepare("DELETE FROM settings WHERE k='paid_until'").run();
    }
    const s = await subText(env);
    return edit(s.text, s.kb);
  }

  // Subscription expired: block new bookings (owner can still test).
  if (["svc", "day", "slot", "ok", "back"].includes(kind) && !isOwner && !(await subscriptionActive(env))) {
    return edit(`😔 Առցանց գրանցումը ժամանակավորապես հասանելի չէ։\nԳրանցվելու համար զանգահարեք՝ ${CONFIG.phone}`);
  }

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

  if (kind === "acancel" || kind === "acx" || kind === "anop") {
    if (!(await adminIds(env)).includes(q.from.id)) return;
    if (kind === "anop") return edit("👌 Գրանցումը մնաց ակտիվ։");
    const row = await env.DB.prepare("SELECT * FROM bookings WHERE id=? AND status='active'").bind(+a).first();
    if (!row) return edit("Այս գրանցումն արդեն ակտիվ չէ։");
    const info = `✂️ ${row.service}\n🕒 ${fmt(row.start * 1000)}\n👤 ${row.user_name}`;
    if (kind === "acancel") {
      return edit(`Չեղարկե՞լ այս գրանցումը։ Հաճախորդը կստանա ծանուցում։\n\n${info}`,
        inline([[btn("✅ Այո, չեղարկել", `acx:${row.id}`), btn("⬅️ Ոչ", "anop")]]));
    }
    await env.DB.prepare("UPDATE bookings SET status='cancelled' WHERE id=?").bind(row.id).run();
    await send(env, row.user_id, `❌ Ձեր գրանցումը չեղարկվել է ${CONFIG.name}-ի կողմից\n\n✂️ ${row.service}\n` +
      `🕒 ${fmt(row.start * 1000)}\n\nԽնդրում ենք ընտրել այլ ժամ 👇`, MENU);
    return edit(`❌ Չեղարկված է, հաճախորդը տեղեկացված է\n\n${info}`);
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

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

const TOKEN_FORM = `<h2>💈 Բոտի միացում</h2>
<form method="post" action="/setup">
<p>Տեղադրիր BotFather-ի տոկենը.</p>
<input name="token" autocomplete="off" placeholder="123456789:AA..." style="width:100%;font-size:18px;padding:12px;box-sizing:border-box">
<p><button style="font-size:18px;padding:12px 20px;width:100%">Միացնել</button></p>
</form>`;

async function connect(env, origin) {
  const me = await tg(env, "getMe", {});
  if (!me.ok) return { error: "❌ Տոկենը սխալ է։ Պատճենիր այն BotFather-ից ամբողջությամբ։" };
  const hook = await tg(env, "setWebhook", {
    url: `${origin}/webhook`, secret_token: await webhookSecret(env),
    allowed_updates: ["message", "callback_query"],
  });
  if (!hook.ok) return { error: "❌ Webhook-ը չմիացավ․ " + esc(hook.description || "") };
  return { username: me.result.username };
}

async function setup(request, rawEnv, origin) {
  if (!rawEnv.DB) return page("❌ DB binding-ը չկա։ Ավելացրու D1 բազան Settings → Bindings բաժնում՝ DB անունով։");
  await init(rawEnv);
  const env = await withToken(rawEnv);

  if (!env.BOT_TOKEN) {
    if (request.method !== "POST") return page(TOKEN_FORM);
    const token = String((await request.formData()).get("token") || "").trim();
    if (!/^\d+:[\w-]{20,}$/.test(token)) return page("❌ Սա տոկեն չի նմանվում։<br><br>" + TOKEN_FORM);
    const res = await connect({ ...env, BOT_TOKEN: token }, origin);
    if (res.error) return page(res.error + "<br><br>" + TOKEN_FORM);
    await setSetting(env, "bot_token", token);
    const code = newCode();
    await setSetting(env, "admin_code", code);
    const link = `https://t.me/${res.username}?start=admin_${code}`;
    return page(`<h2>✅ Բոտը միացված է</h2><p>Վերջին քայլ. սեղմիր կոճակը, որ դառնաս բոտի ադմինը և ստանաս գրանցումների ծանուցումները։</p>` +
      `<p><a href="${link}" style="display:block;text-align:center;background:#e8590c;color:#fff;padding:14px;border-radius:10px;text-decoration:none">Դառնալ ադմին Telegram-ում</a></p>`);
  }

  const res = await connect(env, origin);
  if (res.error) return page(res.error);
  return page(`✅ Բոտն աշխատում է՝ <a href="https://t.me/${res.username}">@${res.username}</a>`);
}

export default {
  async fetch(request, rawEnv) {
    const url = new URL(request.url);
    if (url.pathname === "/setup") return setup(request, rawEnv, url.origin);
    if (url.pathname === "/webhook" && request.method === "POST") {
      await init(rawEnv);
      const env = await withToken(rawEnv);
      if (!env.BOT_TOKEN || request.headers.get("X-Telegram-Bot-Api-Secret-Token") !== await webhookSecret(env)) {
        return new Response("forbidden", { status: 403 });
      }
      const update = await request.json();
      try {
        if (update.message) await onMessage(env, update.message);
        else if (update.callback_query) await onCallback(env, update.callback_query);
      } catch (e) {
        console.log("handler error", e && e.stack || e);
      }
      return new Response("ok");
    }
    return page(`💈 ${esc(CONFIG.name)} բոտն աշխատում է։ Առաջին անգամ բացիր <a href="/setup">/setup</a>։`);
  },

  async scheduled(event, rawEnv) {
    await init(rawEnv);
    const env = await withToken(rawEnv);
    if (!env.BOT_TOKEN) return;
    await sendReminders(env);
    await checkSubscription(env);
  },
};
