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
  daysAhead: 365,        // քանի օր առաջ կարելի է գրանցվել (365 = մեկ տարի)
  minLeadMinutes: 30,    // ամենաքիչը քանի րոպե առաջ
  reminderMinutes: 60,   // հիշեցումը՝ քանի րոպե առաջ
  requireApproval: true, // վարսավիրը պետք է հաստատի յուրաքանչյուր գրանցում
  approvalTimeoutMinutes: 120, // չհաստատված հայտը չեղարկվում է այսքան րոպեից
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
const MONTH_NAMES = ["Հունվար", "Փետրվար", "Մարտ", "Ապրիլ", "Մայիս", "Հունիս",
  "Հուլիս", "Օգոստոս", "Սեպտեմբեր", "Հոկտեմբեր", "Նոյեմբեր", "Դեկտեմբեր"];
const BTN_BOOK = "📅 Գրանցվել";
const BTN_MINE = "🗂 Իմ գրանցումները";
const BTN_PRICES = "💈 Ծառայություններ և գներ";
const BTN_CONTACT = "📍 Կապ";
const MENU = {
  keyboard: [[BTN_BOOK, BTN_MINE], [BTN_PRICES, BTN_CONTACT]],
  resize_keyboard: true,
  is_persistent: true, // always visible, never collapses
};
const BTN_TODAY = "📋 Այսօր";
const BTN_TOMORROW = "📋 Վաղը";
const BTN_WEEK = "📆 Շաբաթ";
const BTN_ADD_ADMIN = "➕ Ավելացնել ադմին";
const ADMIN_MENU = {
  keyboard: [[BTN_TODAY, BTN_TOMORROW, BTN_WEEK], [BTN_BOOK, BTN_MINE], [BTN_PRICES, BTN_CONTACT], [BTN_ADD_ADMIN]],
  resize_keyboard: true,
  is_persistent: true,
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

// First moment at/after ts when the barbershop is open.
function nextOpen(ts) {
  for (let i = 0; i < 8; i++) {
    const wh = workingHours(dayKey(ts + i * DAY));
    if (!wh) continue;
    if (ts < wh[0]) return wh[0];
    if (ts < wh[1]) return ts;
  }
  return ts;
}
// ts + `minutes` of working time (closed hours and days are skipped).
function addWorkingMinutes(ts, minutes) {
  let t = ts, left = minutes * MIN;
  for (let i = 0; i < 16; i++) {
    t = nextOpen(t);
    const wh = workingHours(dayKey(t));
    if (!wh) return t + left;
    if (t + left <= wh[1]) return t + left;
    left -= wh[1] - t;
    t = wh[1];
  }
  return t + left;
}
// When an unanswered request is cancelled: after approvalTimeoutMinutes of working time,
// but always at least 30 minutes before the visit.
function approvalDeadline(createdMs, startMs) {
  return Math.min(addWorkingMinutes(createdMs, CONFIG.approvalTimeoutMinutes), startMs - 30 * MIN);
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
  await env.DB.prepare("CREATE TABLE IF NOT EXISTS profiles (user_id INTEGER PRIMARY KEY, name TEXT, phone TEXT)").run();
  await env.DB.prepare("CREATE TABLE IF NOT EXISTS states (user_id INTEGER PRIMARY KEY, step TEXT, data TEXT, updated INTEGER)").run();
  for (const col of ["phone TEXT", "tg TEXT", "created INTEGER"]) {
    try { await env.DB.prepare(`ALTER TABLE bookings ADD COLUMN ${col}`).run(); } catch (e) { /* already exists */ }
  }
  ready = true;
}

// Client contact details, asked once and remembered.
async function getProfile(env, userId) {
  return env.DB.prepare("SELECT name, phone FROM profiles WHERE user_id=?").bind(userId).first();
}
async function saveProfile(env, userId, name, phone) {
  await env.DB.prepare("INSERT INTO profiles (user_id, name, phone) VALUES (?, ?, ?) " +
    "ON CONFLICT(user_id) DO UPDATE SET name=excluded.name, phone=excluded.phone").bind(userId, name, phone).run();
}
// Conversation state while collecting name/phone (expires after 30 minutes).
async function getState(env, userId) {
  const r = await env.DB.prepare("SELECT * FROM states WHERE user_id=? AND updated>?")
    .bind(userId, sec(Date.now() - 30 * MIN)).first();
  return r ? { step: r.step, data: JSON.parse(r.data) } : null;
}
async function setState(env, userId, step, data) {
  await env.DB.prepare("INSERT INTO states (user_id, step, data, updated) VALUES (?, ?, ?, ?) " +
    "ON CONFLICT(user_id) DO UPDATE SET step=excluded.step, data=excluded.data, updated=excluded.updated")
    .bind(userId, step, JSON.stringify(data), sec(Date.now())).run();
}
async function clearState(env, userId) {
  await env.DB.prepare("DELETE FROM states WHERE user_id=?").bind(userId).run();
}

function normalizeName(s) {
  const name = String(s || "").replace(/\s+/g, " ").trim();
  return /^\p{L}[\p{L}'’\-]+( [\p{L}'’\-]+){0,2}$/u.test(name) && name.length <= 50 ? name : null;
}
// Armenian numbers: 091123456, 91 123456, +374 91 123456. Foreign: + and 10–15 digits.
function normalizePhone(s) {
  const raw = String(s || "").trim();
  let d = raw.replace(/\D/g, "");
  if (raw.startsWith("00")) d = d.slice(2);
  if (d.length === 9 && d[0] === "0") d = "374" + d.slice(1);
  else if (d.length === 8) d = "374" + d;
  if (d.startsWith("374") ? d.length !== 11 : d.length < 10 || d.length > 15) return null;
  return "+" + d;
}
const fmtPhone = (p) => (p && p.startsWith("+374") && p.length === 12 ? `+374 ${p.slice(4, 6)} ${p.slice(6)}` : p || "");
const clientInfo = (r) =>
  `👤 ${r.user_name}${r.tg ? ` (${r.tg})` : ""}${r.phone ? `\n📞 ${fmtPhone(r.phone)}` : ""}`;
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
    "SELECT start, end FROM bookings WHERE status IN ('active','pending') AND start < ? AND end > ?").bind(sec(end), sec(start)));
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

const BTN_SEND_PHONE = "📱 Ուղարկել իմ համարը";
const BTN_STOP = "❌ Չեղարկել գրանցումը";
const NAME_KB = { keyboard: [[BTN_STOP]], resize_keyboard: true };
const PHONE_KB = {
  keyboard: [[{ text: BTN_SEND_PHONE, request_contact: true }], [BTN_STOP]],
  resize_keyboard: true,
};
const NAME_PROMPT = "✍️ Գրեք Ձեր անունը և ազգանունը\n(ազգանունը պարտադիր չէ)\n\nՕրինակ՝ Անի Պետրոսյան";
const PHONE_PROMPT = "📞 Ձեր հեռախոսահամարը\n\nՍեղմեք ներքևի «📱 Ուղարկել իմ համարը» կոճակը " +
  "կամ գրեք համարը, օրինակ՝ 091 123456";

// Create the booking after the client's details are known.
async function finalizeBooking(env, user, i, ts, profile) {
  const svc = CONFIG.services[i];
  if (!svc) return { ok: false, text: "Ծառայությունը չի գտնվել։ Սկսեք նորից 👇" };
  const key = dayKey(ts), wh = workingHours(key);
  // Re-check: someone may have taken the slot meanwhile.
  const free = wh && freeSlots(key, svc.duration, await busy(env, wh[0], wh[1]), Date.now()).includes(ts);
  if (!free) return { ok: false, text: "Այս ժամն արդեն զբաղված է 😔 Ընտրեք այլ ժամ։", svc: i };
  const tgName = user.username ? "@" + user.username : null;
  const pending = CONFIG.requireApproval;
  const res = await env.DB.prepare(
    "INSERT INTO bookings (user_id, user_name, phone, tg, service, price, start, end, status, created) " +
    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  ).bind(user.id, profile.name, profile.phone, tgName, svc.name, svc.price, sec(ts), sec(ts + svc.duration * MIN),
    pending ? "pending" : "active", sec(Date.now())).run();
  const id = res.meta.last_row_id;
  const info = `${clientInfo({ user_name: profile.name, phone: profile.phone, tg: tgName })}` +
    `\n✂️ ${svc.name} — ${money(svc.price)}\n🕒 ${fmt(ts)}`;
  const details = `✂️ ${svc.name}\n🕒 ${fmt(ts)}\n📍 ${CONFIG.address}\n👤 ${profile.name}, ${fmtPhone(profile.phone)}`;
  if (pending) {
    const deadline = approvalDeadline(Date.now(), ts);
    await notifyAdmins(env, `🔔 Նոր հայտ. հաստատե՞լ\n\n${info}\n\n` +
      `Եթե մինչև ${fmt(deadline)} չպատասխանեք, հայտն ավտոմատ կչեղարկվի։`,
      inline([[btn("✅ Հաստատել", `appr:${id}`), btn("❌ Մերժել", `rej:${id}`)]]));
    return {
      ok: true,
      text: `⏳ Ձեր հայտն ուղարկված է վարսավիրանոցին\n\n${details}\n\n` +
        "Հաստատվելուց հետո անմիջապես կստանաք ծանուցում։",
    };
  }
  await notifyAdmins(env, `🆕 Նոր գրանցում\n${info}`);
  return {
    ok: true,
    text: `✅ Դուք գրանցված եք\n\n${details}\n\nԿհիշեցնենք ${CONFIG.reminderMinutes} րոպե առաջ։`,
  };
}

// Text typed while the bot waits for name or phone.
async function onInput(env, msg, state, menu) {
  const chat = msg.chat.id, user = msg.from;
  if (state.step === "name") {
    const name = normalizeName(msg.text);
    if (!name) return send(env, chat, "Խնդրում ենք գրել միայն անունը և ազգանունը (տառերով)։\n\nՕրինակ՝ Անի Պետրոսյան", NAME_KB);
    await setState(env, user.id, "phone", { ...state.data, name });
    return send(env, chat, `Շնորհակալություն, ${name.split(" ")[0]} 🙂\n\n${PHONE_PROMPT}`, PHONE_KB);
  }
  if (state.step === "phone") {
    const phone = normalizePhone(msg.contact ? msg.contact.phone_number : msg.text);
    if (!phone) return send(env, chat, "Համարը սխալ է 🤔 Գրեք այսպես՝ 091 123456 կամ սեղմեք ներքևի կոճակը։", PHONE_KB);
    await saveProfile(env, user.id, state.data.name, phone);
    await clearState(env, user.id);
    if (state.data.ts == null) return send(env, chat, "✅ Տվյալները պահպանված են։", menu);
    if (user.id !== (await ownerId(env)) && !(await subscriptionActive(env))) {
      return send(env, chat, `😔 Առցանց գրանցումը ժամանակավորապես հասանելի չէ։\nԳրանցվելու համար զանգահարեք՝ ${CONFIG.phone}`, menu);
    }
    const res = await finalizeBooking(env, user, state.data.svc, state.data.ts, { name: state.data.name, phone });
    await send(env, chat, res.text, menu);
    if (!res.ok && res.svc != null) return send(env, chat, "Ընտրեք այլ ժամ 👇", inline([[btn("📅 Ընտրել ժամ", `svc:${res.svc}`)]]));
  }
}
// Booking notifications go to the barbershop's admins only, not to the owner.
// While the barbershop has no admin yet (demo bot), the owner gets them so requests are not lost.
async function notifyAdmins(env, text, markup) {
  const shop = await shopAdmins(env);
  for (const id of shop.length ? shop : await adminIds(env)) await send(env, id, text, markup);
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

  // Waiting for name/phone? Any menu button or command interrupts it.
  const state = await getState(env, user.id);
  if (state) {
    const isButton = text.startsWith("/") || [...MENU.keyboard.flat(), ...OWNER_MENU.keyboard.flat()].includes(text);
    if (text === BTN_STOP) {
      await clearState(env, user.id);
      return send(env, chat, "Գրանցումը չեղարկվեց։", menu);
    }
    if (msg.contact || !isButton) return onInput(env, msg, state, menu);
    await clearState(env, user.id);
  }

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
      "SELECT * FROM bookings WHERE user_id=? AND status IN ('active','pending') AND start>=? ORDER BY start"
    ).bind(user.id, sec(Date.now())));
    if (!rows.length) return send(env, chat, "Դուք ակտիվ գրանցումներ չունեք։", menu);
    for (const r of rows) {
      const st = r.status === "pending" ? "⏳ Սպասում է հաստատման" : "✅ Հաստատված է";
      await send(env, chat, `✂️ ${r.service}\n🕒 ${fmt(r.start * 1000)}\n${st}`,
        inline([[btn("❌ Չեղարկել", `cancel:${r.id}`)]]));
    }
    return;
  }
  return send(env, chat, "Ընտրեք ներքևի ընտրացանկից 👇", menu);
}

// Admin views. Callers must check admin rights first.
async function bookingsBetween(env, start, end) {
  return all(env.DB.prepare(
    "SELECT * FROM bookings WHERE status IN ('active','pending') AND start>=? AND start<? ORDER BY start"
  ).bind(sec(start), sec(end)));
}

async function schedule(env, chat, offsetDays) {
  const key = dayKey(Date.now() + offsetDays * DAY);
  const start = dayStart(key);
  const rows = await bookingsBetween(env, start, start + DAY);
  if (!rows.length) return send(env, chat, `📋 ${dayLabel(key)}՝ գրանցումներ չկան։`);
  const active = rows.filter((r) => r.status === "active");
  const waiting = rows.length - active.length;
  const total = active.reduce((s, r) => s + r.price, 0);
  const lines = rows.map((r) => (r.status === "pending" ? "⏳ ՍՊԱՍՈՒՄ Է ՀԱՍՏԱՏՄԱՆ\n" : "") +
    `🕒 ${hhmm(r.start * 1000)} — ${r.service} (${money(r.price)})\n${clientInfo(r)}`);
  const kb = rows.map((r) => r.status === "pending"
    ? [btn(`✅ ${hhmm(r.start * 1000)}`, `appr:${r.id}`), btn(`❌ ${hhmm(r.start * 1000)}`, `rej:${r.id}`)]
    : [btn(`❌ Չեղարկել ${hhmm(r.start * 1000)}`, `acancel:${r.id}`)]);
  return send(env, chat, `📋 ${dayLabel(key)}\n${active.length} գրանցում, ընդամենը՝ ${money(total)}` +
    (waiting ? `\n⏳ ${waiting} հայտ սպասում է Ձեր հաստատմանը` : "") + `\n\n${lines.join("\n\n")}`, inline(kb));
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
    const day = rows.filter((r) => r.status === "active" && dayKey(r.start * 1000) === key);
    const sum = day.reduce((s, r) => s + r.price, 0);
    count += day.length; total += sum;
    lines.push(workingHours(key)
      ? `${dayLabel(key)} — ${day.length} գրանցում, ${money(sum)}`
      : `${dayLabel(key)} — փակ է`);
  }
  return send(env, chat, `📆 Առաջիկա 7 օրը\n\n${lines.join("\n")}\n\nԸնդամենը՝ ${count} գրանցում, ${money(total)}`);
}

// Month calendar: available days are buttons, others are dots. ◀️ ▶️ switch months.
const BLANK = "\u2800";
async function calendarKb(env, i, ym, now) {
  const svc = CONFIG.services[i];
  const y = +ym.slice(0, 4), m = +ym.slice(4, 6);
  const todayKey = dayKey(now), lastKey = dayKey(now + (CONFIG.daysAhead - 1) * DAY);
  const firstKey = `${ym}01`, days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const monthStart = dayStart(firstKey);
  const taken = await busy(env, monthStart, monthStart + days * DAY);
  const rows = [
    [btn(`${MONTH_NAMES[m - 1]} ${y}`, "x")],
    ["Եկ", "Եք", "Չք", "Հգ", "Ու", "Շբ", "Կր"].map((d) => btn(d, "x")),
  ];
  let row = Array(local(monthStart).wd).fill(btn(BLANK, "x"));
  for (let d = 1; d <= days; d++) {
    const key = `${ym}${pad(d)}`;
    let b;
    if (key < todayKey || key > lastKey || !workingHours(key)) b = btn("·", "x");
    else if (!freeSlots(key, svc.duration, taken, now).length) b = btn("✖", "x");
    else b = btn(String(d), `day:${i}:${key}`);
    row.push(b);
    if (row.length === 7) { rows.push(row); row = []; }
  }
  if (row.length) rows.push([...row, ...Array(7 - row.length).fill(btn(BLANK, "x"))]);
  const prev = m === 1 ? `${y - 1}12` : `${y}${pad(m - 1)}`;
  const next = m === 12 ? `${y + 1}01` : `${y}${pad(m + 1)}`;
  rows.push([
    prev >= todayKey.slice(0, 6) ? btn("◀️", `cal:${i}:${prev}`) : btn(BLANK, "x"),
    btn("⬅️ Ծառայություններ", "back"),
    `${next}01` <= lastKey ? btn("▶️", `cal:${i}:${next}`) : btn(BLANK, "x"),
  ]);
  return inline(rows);
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
  if (["svc", "cal", "day", "slot", "ok", "edit", "back"].includes(kind) && !isOwner && !(await subscriptionActive(env))) {
    return edit(`😔 Առցանց գրանցումը ժամանակավորապես հասանելի չէ։\nԳրանցվելու համար զանգահարեք՝ ${CONFIG.phone}`);
  }

  if (kind === "back") return edit("Ընտրեք ծառայությունը.", servicesKb());

  if (kind === "svc" || kind === "cal") {
    const i = +a;
    const ym = kind === "cal" ? b : dayKey(now).slice(0, 6);
    return edit(`${CONFIG.services[i].name}\nԸնտրեք օրը 📅\n\n✖ — ազատ ժամ չկա\n· — փակ է կամ հասանելի չէ`,
      await calendarKb(env, i, ym, now));
  }

  if (kind === "day") {
    const i = +a, key = b, svc = CONFIG.services[i];
    const wh = workingHours(key);
    const slots = wh ? freeSlots(key, svc.duration, await busy(env, wh[0], wh[1]), now) : [];
    const rows = [];
    for (let k = 0; k < slots.length; k += 4) {
      rows.push(slots.slice(k, k + 4).map((t) => btn(hhmm(t), `slot:${i}:${sec(t)}`)));
    }
    rows.push([btn("⬅️ Այլ օր", `cal:${i}:${key.slice(0, 6)}`)]);
    return edit(slots.length ? `${svc.name}, ${dayLabel(key)}\nԸնտրեք ժամը.`
      : "Այս օրը ազատ ժամ չկա 😔 Ընտրեք այլ օր։", inline(rows));
  }

  if (kind === "slot") {
    const i = +a, ts = +b * 1000, svc = CONFIG.services[i];
    const profile = await getProfile(env, q.from.id);
    const who = profile ? `\n👤 ${profile.name}, ${fmtPhone(profile.phone)}` : "";
    const rows = [[btn("✅ Հաստատել", `ok:${i}:${b}`), btn("⬅️ Հետ", `svc:${i}`)]];
    if (profile) rows.push([btn("✏️ Փոխել անունը/համարը", `edit:${i}:${b}`)]);
    return edit(`Հաստատե՞լ գրանցումը\n\n✂️ ${svc.name} — ${money(svc.price)}\n🕒 ${fmt(ts)}${who}`, inline(rows));
  }

  if (kind === "ok" || kind === "edit") {
    const i = +a, ts = +b * 1000;
    const profile = kind === "ok" ? await getProfile(env, q.from.id) : null;
    if (!profile) {
      // First booking (or editing details): ask for name, then phone.
      await setState(env, q.from.id, "name", { svc: i, ts });
      await edit(`🕒 ${fmt(ts)} — ${CONFIG.services[i].name}\n\nԳրանցումն ավարտելու համար մնաց 2 քայլ 👇`);
      return send(env, q.message.chat.id, NAME_PROMPT, NAME_KB);
    }
    const res = await finalizeBooking(env, q.from, i, ts, profile);
    return edit(res.text, res.ok ? undefined : inline([[btn("⬅️ Ընտրել այլ ժամ", `svc:${i}`)]]));
  }

  if (kind === "acancel" || kind === "acx" || kind === "anop") {
    if (!(await adminIds(env)).includes(q.from.id)) return;
    if (kind === "anop") return edit("👌 Գրանցումը մնաց ակտիվ։");
    const row = await env.DB.prepare("SELECT * FROM bookings WHERE id=? AND status='active'").bind(+a).first();
    if (!row) return edit("Այս գրանցումն արդեն ակտիվ չէ։");
    const info = `✂️ ${row.service}\n🕒 ${fmt(row.start * 1000)}\n${clientInfo(row)}`;
    if (kind === "acancel") {
      return edit(`Չեղարկե՞լ այս գրանցումը։ Հաճախորդը կստանա ծանուցում։\n\n${info}`,
        inline([[btn("✅ Այո, չեղարկել", `acx:${row.id}`), btn("⬅️ Ոչ", "anop")]]));
    }
    await env.DB.prepare("UPDATE bookings SET status='cancelled' WHERE id=?").bind(row.id).run();
    await send(env, row.user_id, `❌ Ձեր գրանցումը չեղարկվել է ${CONFIG.name}-ի կողմից\n\n✂️ ${row.service}\n` +
      `🕒 ${fmt(row.start * 1000)}\n\nԽնդրում ենք ընտրել այլ ժամ 👇`, MENU);
    return edit(`❌ Չեղարկված է, հաճախորդը տեղեկացված է\n\n${info}`);
  }

  if (kind === "appr" || kind === "rej") {
    if (!(await adminIds(env)).includes(q.from.id)) return;
    const row = await env.DB.prepare("SELECT * FROM bookings WHERE id=?").bind(+a).first();
    if (!row) return edit("Հայտը չի գտնվել։");
    const info = `${clientInfo(row)}\n✂️ ${row.service}\n🕒 ${fmt(row.start * 1000)}`;
    if (row.status !== "pending") {
      const was = { active: "✅ արդեն հաստատված է", rejected: "❌ արդեն մերժված է",
        cancelled: "❌ չեղարկվել է հաճախորդի կողմից", expired: "⌛ ավտոմատ չեղարկվել է" }[row.status] || row.status;
      return edit(`Այս հայտը ${was}\n\n${info}`);
    }
    if (row.start * 1000 <= now) {
      await env.DB.prepare("UPDATE bookings SET status='expired' WHERE id=?").bind(row.id).run();
      return edit(`⌛ Ժամն արդեն անցել է\n\n${info}`);
    }
    if (kind === "appr") {
      await env.DB.prepare("UPDATE bookings SET status='active' WHERE id=? AND status='pending'").bind(row.id).run();
      await send(env, row.user_id, `✅ Ձեր գրանցումը հաստատված է\n\n✂️ ${row.service}\n🕒 ${fmt(row.start * 1000)}\n` +
        `📍 ${CONFIG.address}\n\nԿհիշեցնենք ${CONFIG.reminderMinutes} րոպե առաջ։ Սպասում ենք Ձեզ 💈`);
      return edit(`✅ Հաստատված է, հաճախորդը տեղեկացված է\n\n${info}`);
    }
    await env.DB.prepare("UPDATE bookings SET status='rejected' WHERE id=? AND status='pending'").bind(row.id).run();
    const si = CONFIG.services.findIndex((s) => s.name === row.service);
    await send(env, row.user_id, `😔 Ցավոք, վարսավիրանոցը չի կարող ընդունել Ձեզ այս ժամին\n\n✂️ ${row.service}\n` +
      `🕒 ${fmt(row.start * 1000)}\n\nԽնդրում ենք ընտրել այլ ժամ 👇`,
      inline([[btn("📅 Ընտրել այլ ժամ", si >= 0 ? `svc:${si}` : "back")]]));
    return edit(`❌ Մերժված է, հաճախորդը տեղեկացված է\n\n${info}`);
  }

  if (kind === "cancel") {
    const row = await env.DB.prepare(
      "SELECT * FROM bookings WHERE id=? AND user_id=? AND status IN ('active','pending') AND start>=?"
    ).bind(+a, q.from.id, sec(now)).first();
    if (!row) return edit("Այս գրանցումն այլևս ակտիվ չէ։");
    await env.DB.prepare("UPDATE bookings SET status='cancelled' WHERE id=?").bind(row.id).run();
    await edit(`❌ Գրանցումը չեղարկված է (${row.service}, ${fmt(row.start * 1000)})`);
    return notifyAdmins(env, `❌ Չեղարկում\n${clientInfo(row)}\n✂️ ${row.service}\n🕒 ${fmt(row.start * 1000)}`);
  }
}

// Requests the barbershop did not answer in time (or whose time has come) are cancelled.
async function expirePending(env) {
  const now = Date.now();
  const rows = (await all(env.DB.prepare("SELECT * FROM bookings WHERE status='pending'")))
    .filter((r) => now >= approvalDeadline((r.created || 0) * 1000, r.start * 1000));
  for (const r of rows) {
    await env.DB.prepare("UPDATE bookings SET status='expired' WHERE id=? AND status='pending'").bind(r.id).run();
    const si = CONFIG.services.findIndex((s) => s.name === r.service);
    await send(env, r.user_id, `😔 Վարսավիրանոցը չհասցրեց հաստատել Ձեր հայտը\n\n✂️ ${r.service}\n🕒 ${fmt(r.start * 1000)}\n\n` +
      `Ընտրեք այլ ժամ կամ զանգահարեք՝ ${CONFIG.phone}`,
      inline([[btn("📅 Ընտրել այլ ժամ", si >= 0 ? `svc:${si}` : "back")]]));
    await notifyAdmins(env, `⌛ Հայտն ավտոմատ չեղարկվեց, քանի որ չհաստատվեց\n\n${clientInfo(r)}\n✂️ ${r.service}\n🕒 ${fmt(r.start * 1000)}`);
  }
}

// Telegram "Menu" button next to the input field: /start and /book for everyone,
// plus admin commands for admins. Re-synced whenever the admin list changes.
const COMMANDS_VERSION = 1;
async function syncCommands(env) {
  const owner = await ownerId(env), admins = await adminIds(env);
  const tag = JSON.stringify([COMMANDS_VERSION, owner, admins]);
  if ((await getSetting(env, "commands_synced")) === tag) return;
  const base = [
    { command: "start", description: "🏠 Գլխավոր մենյու" },
    { command: "book", description: "📅 Գրանցվել" },
  ];
  const admin = [
    ...base,
    { command: "today", description: "📋 Այսօրվա գրանցումները" },
    { command: "tomorrow", description: "📋 Վաղվա գրանցումները" },
    { command: "week", description: "📆 Առաջիկա 7 օրը" },
  ];
  const ok = (await tg(env, "setMyCommands", { commands: base })).ok;
  for (const id of admins) {
    const cmds = id === owner ? [...admin, { command: "sub", description: "💳 Բաժանորդագրություն" }] : admin;
    await tg(env, "setMyCommands", { commands: cmds, scope: { type: "chat", chat_id: id } });
  }
  await tg(env, "setChatMenuButton", { menu_button: { type: "commands" } });
  if (ok) await setSetting(env, "commands_synced", tag);
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
    await syncCommands(env);
    await expirePending(env);
    await sendReminders(env);
    await checkSubscription(env);
  },
};
