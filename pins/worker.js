// 📌 Modern Haven Finds — Pinterest + Amazon affiliate ավտոմատ համակարգ (Cloudflare Worker)
//
// Ինչ է անում.
//   1. Telegram բոտին ուղարկում ես Amazon-ի հղում (+ անուն, ցանկության դեպքում նաև նկար)։
//   2. Cloudflare AI-ը գրում է վերնագիր/նկարագրություն/SEO և ստեղծում է lifestyle նկար։
//   3. Բոտը ցույց է տալիս նախադիտումը. ✅ սեղմում ես, և փինը մտնում է հերթ։
//   4. Ամեն օր նշված ժամերին հերթից հրապարակում է Pinterest-ում
//      (Pinterest API-ով կամ Make.com-ով), ինչպես նաև քո կայքում և RSS-ում։
//
// Bindings: DB (D1), AI (Workers AI). Cron: ամեն ժամ։ Կարգավորումները՝ /setup էջում։

const TEXT_MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";
const IMAGE_MODELS = ["@cf/leonardo/phoenix-1.0", "@cf/black-forest-labs/flux-1-schnell"];
const SITE_NAME = "Modern Haven Finds";
const DISCLOSURE = "As an Amazon Associate I earn from qualifying purchases.";
const PIN_SCOPES = "boards:read,boards:write,pins:read,pins:write,user_accounts:read";
const DEFAULTS = {
  post_hours: "14,19,1", // UTC. = 10:00, 15:00, 21:00 ԱՄՆ Արևելյան ժամով
  niche: "home decor, cozy living, kitchen gadgets, gaming setup",
  link_mode: "amazon", // amazon = փինը տանում է ուղիղ Amazon, site = քո կայքի էջ
  auto_approve: "0",
};

// ---------------------------------------------------------------- utils
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const now = () => new Date().toISOString();
const rid = (n = 24) => [...crypto.getRandomValues(new Uint8Array(n))].map((b) => "abcdefghijkmnpqrstuvwxyz23456789"[b % 32]).join("");
function b64(buf) {
  const u = new Uint8Array(buf); let s = "";
  for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode(...u.subarray(i, i + 0x8000));
  return btoa(s);
}
const unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
const mimeOf = (u) => (u[0] === 0x89 && u[1] === 0x50 ? "image/png" : u[0] === 0x52 && u[1] === 0x49 ? "image/webp" : "image/jpeg");
const html = (body, status = 200) => new Response(body, { status, headers: { "content-type": "text/html; charset=utf-8" } });

async function schema(env) {
  await env.DB.batch([
    env.DB.prepare("CREATE TABLE IF NOT EXISTS settings (k TEXT PRIMARY KEY, v TEXT)"),
    env.DB.prepare("CREATE TABLE IF NOT EXISTS images (id TEXT PRIMARY KEY, mime TEXT, data TEXT)"),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT, url TEXT, name TEXT,
      photo_img TEXT, ai_img TEXT, use_photo INTEGER DEFAULT 0, title TEXT, description TEXT, alt TEXT, board TEXT, prompt TEXT,
      status TEXT DEFAULT 'new', pin_id TEXT, error TEXT, created_at TEXT, published_at TEXT)`),
  ]);
}
async function getS(env) {
  const { results } = await env.DB.prepare("SELECT k, v FROM settings").all();
  const s = { ...DEFAULTS };
  for (const r of results) s[r.k] = r.v;
  return s;
}
const setS = (env, k, v) => env.DB.prepare("INSERT INTO settings (k, v) VALUES (?, ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v").bind(k, v == null ? null : String(v)).run();
async function putImage(env, bytes) {
  const id = rid(16); const u = new Uint8Array(bytes);
  await env.DB.prepare("INSERT INTO images (id, mime, data) VALUES (?, ?, ?)").bind(id, mimeOf(u), b64(u)).run();
  return id;
}
const getImage = (env, id) => env.DB.prepare("SELECT mime, data FROM images WHERE id = ?").bind(id).first();
const getP = (env, id) => env.DB.prepare("SELECT * FROM products WHERE id = ?").bind(id).first();
const pinImg = (p) => (p.use_photo && p.photo_img ? p.photo_img : p.ai_img || p.photo_img);

function withTag(url, tag) {
  try {
    const u = new URL(url);
    if (tag && /(^|\.)amazon\.[a-z.]+$/i.test(u.hostname)) u.searchParams.set("tag", tag);
    return u.toString();
  } catch { return url; }
}
const isAmazon = (url) => /^https?:\/\/([a-z0-9-]+\.)*(amazon\.[a-z.]+|amzn\.to|amzn\.eu|a\.co)\//i.test(url);

// ---------------------------------------------------------------- Telegram
async function tg(env, s, method, body) {
  const isForm = body instanceof FormData;
  const r = await fetch(`https://api.telegram.org/bot${s.tg_token}/${method}`, {
    method: "POST", body: isForm ? body : JSON.stringify(body),
    headers: isForm ? {} : { "content-type": "application/json" },
  });
  return r.json();
}
const say = (env, s, text, extra = {}) => tg(env, s, "sendMessage", { chat_id: s.admin_chat, text, parse_mode: "HTML", disable_web_page_preview: true, ...extra });

async function sendPreview(env, s, p, origin) {
  const img = await getImage(env, pinImg(p));
  const kb = [[{ text: p.status === "queued" ? "✅ Հերթում է" : "✅ Հերթ", callback_data: `q:${p.id}` }, { text: "🚀 Հիմա", callback_data: `now:${p.id}` }],
    [{ text: "🔄 Նոր նկար", callback_data: `ri:${p.id}` }, { text: "✍️ Նոր տեքստ", callback_data: `rt:${p.id}` }]];
  if (p.photo_img) kb.push([{ text: p.use_photo ? "🎨 Օգտագործել AI նկարը" : "📷 Օգտագործել իմ նկարը", callback_data: `tp:${p.id}` }]);
  kb.push([{ text: "🗑 Ջնջել", callback_data: `del:${p.id}` }]);
  const cap = `<b>#${p.id} ${esc(p.title)}</b>\n\n${esc(p.description)}\n\n📋 Բորդ՝ ${esc(p.board || "—")}\n🔗 ${esc(p.url)}`.slice(0, 1020);
  const fd = new FormData();
  fd.append("chat_id", s.admin_chat); fd.append("caption", cap); fd.append("parse_mode", "HTML");
  fd.append("reply_markup", JSON.stringify({ inline_keyboard: kb }));
  if (img) fd.append("photo", new Blob([unb64(img.data)], { type: img.mime }), "pin.jpg");
  else return say(env, s, cap, { reply_markup: { inline_keyboard: kb } });
  return tg(env, s, "sendPhoto", fd);
}

async function tgFile(env, s, fileId) {
  const f = await tg(env, s, "getFile", { file_id: fileId });
  const r = await fetch(`https://api.telegram.org/file/bot${s.tg_token}/${f.result.file_path}`);
  return r.arrayBuffer();
}

const HELP = `📌 <b>Ինչպես օգտագործել</b>

<b>Ապրանք ավելացնել.</b> ուղարկիր Amazon-ի հղումը և ապրանքի անունը, օրինակ՝
<code>https://amzn.to/xxxx Cuckoo rice cooker 6 cup</code>
Կարող ես ուղարկել նաև <b>նկար</b>, իսկ caption-ում գրել հղումը և անունը։

Կստանաս նախադիտումը։ Սեղմիր ✅, և փինը կմտնի հերթ։

<b>Հրամաններ</b>
/queue — հերթը
/next — հիմա հրապարակել հերթի հաջորդը
/stats — վիճակագրություն
/boards — Pinterest-ի բորդերը
/pause, /resume — կանգնեցնել/շարունակել
/panel — կարգավորումների էջը`;

async function onTelegram(req, env) {
  const s = await getS(env);
  if (req.headers.get("x-telegram-bot-api-secret-token") !== s.tg_secret) return new Response("forbidden", { status: 403 });
  const u = await req.json();
  const origin = new URL(req.url).origin;
  const chat = String(u.message?.chat.id ?? u.callback_query?.message.chat.id ?? "");
  if (!s.admin_chat && u.message?.text?.startsWith("/start")) {
    await setS(env, "admin_chat", chat); s.admin_chat = chat;
    await say(env, s, "✅ Դու հիմա այս բոտի տերն ես։\n\n" + HELP);
    return new Response("ok");
  }
  if (chat !== s.admin_chat) return new Response("ok"); // միայն տերը
  try {
    if (u.callback_query) await onCallback(env, s, u.callback_query, origin);
    else if (u.message) await onMessage(env, s, u.message, origin);
  } catch (e) {
    await say(env, s, "⚠️ Սխալ՝ " + esc(e.message || e));
  }
  return new Response("ok");
}

async function onMessage(env, s, m, origin) {
  const text = (m.text || m.caption || "").trim();
  const cmd = text.split(/\s|@/)[0];
  if (cmd === "/start" || cmd === "/help") return say(env, s, HELP);
  if (cmd === "/panel") return say(env, s, `⚙️ Կարգավորումներ (մի կիսվիր այս հղումով)՝\n${origin}/setup?key=${s.admin_key}`);
  if (cmd === "/pause") { await setS(env, "paused", "1"); return say(env, s, "⏸ Ավտոմատ հրապարակումը կանգնեցված է։ /resume՝ շարունակելու համար։"); }
  if (cmd === "/resume") { await setS(env, "paused", "0"); return say(env, s, "▶️ Ավտոմատ հրապարակումը միացված է։"); }
  if (cmd === "/next") return publishNext(env, s, origin, true);
  if (cmd === "/boards") {
    const b = await loadBoards(env, s);
    return say(env, s, b.length ? "📋 Բորդեր՝\n" + b.map((x) => `• ${esc(x.name)}`).join("\n") : "Pinterest-ը միացված չէ կամ բորդեր չկան։ Pinterest-ում ստեղծիր բորդեր, օրինակ՝ Home Decor, Kitchen, Gaming Setup։");
  }
  if (cmd === "/queue") {
    const { results } = await env.DB.prepare("SELECT id, title, name FROM products WHERE status = 'queued' ORDER BY id").all();
    const hours = s.post_hours.split(",").length;
    return say(env, s, results.length ? `🗂 Հերթում՝ ${results.length} (մոտ ${Math.ceil(results.length / hours)} օրվա համար)\n\n` + results.map((r) => `#${r.id} ${esc(r.title || r.name)}`).join("\n") : "Հերթը դատարկ է։ Ուղարկիր Amazon-ի հղումներ։");
  }
  if (cmd === "/stats") {
    const { results } = await env.DB.prepare("SELECT status, COUNT(*) n FROM products GROUP BY status").all();
    const m2 = Object.fromEntries(results.map((r) => [r.status, r.n]));
    return say(env, s, `📊 Հրապարակված՝ ${m2.published || 0}\n🗂 Հերթում՝ ${m2.queued || 0}\n📝 Սպասում են հաստատման՝ ${m2.draft || 0}\n⚠️ Ձախողված՝ ${m2.failed || 0}\n\nPinterest՝ ${s.pin_refresh ? "✅" : "❌"}  Make՝ ${s.make_webhook ? "✅" : "—"}  ${s.paused === "1" ? "⏸ կանգնեցված" : "▶️ աշխատում է"}\nԿայք՝ ${origin}`);
  }
  if (text.startsWith("/")) return say(env, s, "Չհասկացա հրամանը։ /help");

  const photo = m.photo?.at(-1)?.file_id;
  const url = (text.match(/https?:\/\/\S+/) || [])[0];
  const rest = text.replace(/https?:\/\/\S+/g, "").trim();

  // Պատասխան «գրիր անունը» հարցին
  if (!url && s.await_name) {
    const p = await getP(env, s.await_name);
    await setS(env, "await_name", "");
    if (p && rest) {
      await env.DB.prepare("UPDATE products SET name = ? WHERE id = ?").bind(rest, p.id).run();
      return buildAndPreview(env, s, p.id, origin);
    }
  }
  if (!url) return say(env, s, "Ուղարկիր Amazon-ի հղումը և ապրանքի անունը։ /help");
  if (!isAmazon(url)) return say(env, s, "Սա Amazon-ի հղում չէ։ Օգտագործիր amazon.com կամ amzn.to հղում (SiteStripe-ից)։");

  const photoId = photo ? await putImage(env, await tgFile(env, s, photo)) : null;
  const r = await env.DB.prepare("INSERT INTO products (url, name, photo_img, use_photo, status, created_at) VALUES (?, ?, ?, ?, 'new', ?)")
    .bind(withTag(url, s.amazon_tag), rest || null, photoId, photoId ? 1 : 0, now()).run();
  const id = r.meta.last_row_id;
  if (!rest) {
    await setS(env, "await_name", id);
    return say(env, s, "Ի՞նչ ապրանք է սա։ Գրիր կարճ անունը, օրինակ՝ <i>Red striped ceramic vase</i>");
  }
  return buildAndPreview(env, s, id, origin);
}

async function buildAndPreview(env, s, id, origin, what = "all") {
  await tg(env, s, "sendChatAction", { chat_id: s.admin_chat, action: "upload_photo" });
  let p = await getP(env, id);
  if (what === "all" || what === "text") await genText(env, s, p);
  p = await getP(env, id);
  if (what === "all" || what === "image") {
    if (!(what === "all" && p.use_photo && p.photo_img)) await genImage(env, p);
  }
  const status = p.status === "queued" || s.auto_approve === "1" ? "queued" : "draft";
  await env.DB.prepare("UPDATE products SET status = ? WHERE id = ?").bind(status, id).run();
  return sendPreview(env, s, await getP(env, id), origin);
}

async function onCallback(env, s, q, origin) {
  const [act, idStr] = q.data.split(":");
  const id = Number(idStr);
  const p = await getP(env, id);
  const ack = (text) => tg(env, s, "answerCallbackQuery", { callback_query_id: q.id, text });
  if (!p || p.status === "deleted") return ack("Չի գտնվել");
  if (act === "q") {
    await env.DB.prepare("UPDATE products SET status = 'queued' WHERE id = ? AND status != 'published'").bind(id).run();
    const { n } = await env.DB.prepare("SELECT COUNT(*) n FROM products WHERE status = 'queued'").first();
    return ack(`✅ Հերթում է (${n} փին)`);
  }
  if (act === "del") {
    await env.DB.prepare("UPDATE products SET status = 'deleted' WHERE id = ?").bind(id).run();
    await tg(env, s, "deleteMessage", { chat_id: s.admin_chat, message_id: q.message.message_id });
    return ack("🗑 Ջնջված է");
  }
  if (act === "now") { await ack("🚀 Հրապարակում եմ..."); return publish(env, s, p, origin); }
  await ack("⏳ Մի քանի վայրկյան...");
  if (act === "tp") {
    await env.DB.prepare("UPDATE products SET use_photo = 1 - use_photo WHERE id = ?").bind(id).run();
    if (!p.ai_img && p.use_photo) await genImage(env, await getP(env, id));
    return sendPreview(env, s, await getP(env, id), origin);
  }
  if (act === "ri") {
    await env.DB.prepare("UPDATE products SET use_photo = 0 WHERE id = ?").bind(id).run();
    return buildAndPreview(env, s, id, origin, "image");
  }
  if (act === "rt") return buildAndPreview(env, s, id, origin, "text");
}

// ---------------------------------------------------------------- AI
async function genText(env, s, p) {
  const boards = (await loadBoards(env, s).catch(() => [])).map((b) => b.name);
  const prompt = `You write Pinterest pins for "${SITE_NAME}", an affiliate account recommending Amazon products (niche: ${s.niche}).
Product: "${p.name}"
${boards.length ? `Choose the best board from this exact list: ${JSON.stringify(boards)}` : `Suggest a short board name like "Home Decor Ideas".`}
Return ONLY a JSON object with keys:
"title": catchy, keyword-rich, max 90 characters, no emojis, no clickbait claims about price or discounts;
"description": 250-450 characters, natural sentences with Pinterest search keywords about how/where to use it, benefits, who it's for. Do NOT invent specs, prices, ratings or discounts. End with 4-6 relevant hashtags and #affiliate;
"alt": short literal description of the image for accessibility;
"image_prompt": a vertical lifestyle interior/product photograph prompt that shows this kind of product in an aspirational real-life setting, photorealistic, soft natural light, magazine style, no text, no logos, no watermark;
"board": the board name.`;
  const out = await env.AI.run(TEXT_MODEL, { messages: [{ role: "user", content: prompt }], max_tokens: 900 });
  const raw = typeof out.response === "string" ? out.response : JSON.stringify(out.response);
  let j;
  try { j = typeof out.response === "object" ? out.response : JSON.parse(raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1)); }
  catch { throw new Error("AI-ը սխալ պատասխան տվեց, սեղմիր ✍️ Նոր տեքստ"); }
  let desc = String(j.description || "").slice(0, 480);
  if (!/#affiliate|#ad\b/i.test(desc)) desc += " #affiliate";
  await env.DB.prepare("UPDATE products SET title = ?, description = ?, alt = ?, board = ?, prompt = ? WHERE id = ?")
    .bind(String(j.title || p.name).slice(0, 100), desc, String(j.alt || p.name).slice(0, 480), j.board || boards[0] || null, String(j.image_prompt || ""), p.id).run();
}

async function genImage(env, p) {
  const prompt = (p.prompt || `${p.name} in a cozy modern home, lifestyle photography`) + ", photorealistic, high detail, vertical composition, no text";
  let bytes = null, lastErr;
  for (const model of IMAGE_MODELS) {
    try {
      const input = model.includes("phoenix") ? { prompt, width: 1024, height: 1536, num_steps: 25 } : { prompt, steps: 8 };
      const r = await env.AI.run(model, input);
      bytes = await toBytes(r);
      if (bytes?.byteLength > 1000) break;
    } catch (e) { lastErr = e; }
  }
  if (!bytes) throw new Error("Նկարը չստեղծվեց՝ " + (lastErr?.message || "անհայտ"));
  const id = await putImage(env, bytes);
  if (p.ai_img) await env.DB.prepare("DELETE FROM images WHERE id = ?").bind(p.ai_img).run();
  await env.DB.prepare("UPDATE products SET ai_img = ? WHERE id = ?").bind(id, p.id).run();
}
async function toBytes(r) {
  if (!r) return null;
  if (r instanceof ReadableStream) return new Response(r).arrayBuffer();
  if (r instanceof ArrayBuffer) return r;
  if (ArrayBuffer.isView(r)) return r.buffer.slice(r.byteOffset, r.byteOffset + r.byteLength);
  if (typeof r.image === "string") return unb64(r.image).buffer;
  return null;
}

// ---------------------------------------------------------------- Pinterest
async function pinToken(env, s) {
  if (!s.pin_refresh) return null;
  if (s.pin_access && Number(s.pin_expires) > Date.now() + 3600e3) return s.pin_access;
  const r = await fetch("https://api.pinterest.com/v5/oauth/token", {
    method: "POST",
    headers: { authorization: "Basic " + btoa(`${s.pin_app_id}:${s.pin_app_secret}`), "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: s.pin_refresh }),
  });
  const j = await r.json();
  if (!j.access_token) throw new Error("Pinterest-ի տոկենը չթարմացվեց՝ " + JSON.stringify(j).slice(0, 200));
  await setS(env, "pin_access", j.access_token);
  await setS(env, "pin_expires", Date.now() + j.expires_in * 1000);
  if (j.refresh_token) await setS(env, "pin_refresh", j.refresh_token);
  s.pin_access = j.access_token;
  return j.access_token;
}
async function pinApi(env, s, path, opts = {}) {
  const t = await pinToken(env, s);
  if (!t) return null;
  const base = s.pin_sandbox === "1" ? "https://api-sandbox.pinterest.com/v5" : "https://api.pinterest.com/v5";
  const r = await fetch(base + path, { ...opts, headers: { authorization: "Bearer " + t, "content-type": "application/json" } });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`Pinterest ${r.status}: ${j.message || JSON.stringify(j).slice(0, 200)}`);
  return j;
}
async function loadBoards(env, s) {
  if (!s.pin_refresh) return [];
  if (s.boards_json && Date.now() - Number(s.boards_at || 0) < 6 * 3600e3) return JSON.parse(s.boards_json);
  const j = await pinApi(env, s, "/boards?page_size=100");
  const b = (j?.items || []).map((x) => ({ id: x.id, name: x.name }));
  await setS(env, "boards_json", JSON.stringify(b)); await setS(env, "boards_at", Date.now());
  return b;
}

// ---------------------------------------------------------------- publish
async function publishNext(env, s, origin, manual = false) {
  const p = await env.DB.prepare("SELECT * FROM products WHERE status = 'queued' ORDER BY id LIMIT 1").first();
  if (!p) { if (manual) await say(env, s, "Հերթը դատարկ է։"); return; }
  return publish(env, s, p, origin);
}

async function publish(env, s, p, origin) {
  const imgId = pinImg(p);
  const img = await getImage(env, imgId);
  const link = s.link_mode === "site" ? `${origin}/p/${p.id}` : p.url;
  const done = [];
  try {
    if (s.pin_refresh) {
      const boards = await loadBoards(env, s);
      let board = boards.find((b) => b.name.toLowerCase() === String(p.board || "").toLowerCase())
        || boards.find((b) => b.id === s.default_board) || boards[0];
      if (!board) throw new Error("Pinterest-ում բորդ չկա։ Ստեղծիր գոնե մեկ բորդ։");
      const j = await pinApi(env, s, "/pins", { method: "POST", body: JSON.stringify({
        board_id: board.id, title: p.title, description: p.description, link, alt_text: p.alt,
        media_source: { source_type: "image_base64", content_type: img.mime, data: img.data },
      }) });
      p.pin_id = j.id; done.push(`Pinterest → ${board.name}\nhttps://www.pinterest.com/pin/${j.id}/`);
    }
    if (s.make_webhook) {
      const r = await fetch(s.make_webhook, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({
        title: p.title, description: p.description, link, alt_text: p.alt, board: p.board,
        image_url: `${origin}/img/${imgId}.jpg`, amazon_url: p.url, page_url: `${origin}/p/${p.id}`,
      }) });
      if (!r.ok) throw new Error("Make webhook " + r.status);
      done.push("Make.com ✅");
    }
    await env.DB.prepare("UPDATE products SET status = 'published', pin_id = ?, published_at = ?, error = NULL WHERE id = ?").bind(p.pin_id || null, now(), p.id).run();
    done.push(`Կայք/RSS → ${origin}/p/${p.id}`);
    await say(env, s, `📌 Հրապարակված է #${p.id} <b>${esc(p.title)}</b>\n\n${done.map(esc).join("\n")}`);
  } catch (e) {
    await env.DB.prepare("UPDATE products SET status = 'failed', error = ? WHERE id = ?").bind(e.message, p.id).run();
    await say(env, s, `⚠️ #${p.id} չհրապարակվեց՝ ${esc(e.message)}\n\nՀերթ վերադարձնելու համար սեղմիր ✅ նախադիտման տակ։`);
  }
}

async function onCron(env) {
  await schema(env);
  const s = await getS(env);
  if (s.selftest === "1") { // ադմինի թեստ. ստեղծում է փորձնական փին բազայում
    await setS(env, "selftest", "0");
    try {
      const r = await env.DB.prepare("INSERT INTO products (url, name, status, created_at) VALUES (?, ?, 'test', ?)").bind("https://www.amazon.com/dp/B000000000", s.selftest_name || "red striped ceramic vase with dried pampas flowers", now()).run();
      const id = r.meta.last_row_id;
      await genText(env, s, await getP(env, id));
      await genImage(env, await getP(env, id));
    } catch (e) { await setS(env, "selftest_error", String(e.stack || e)); }
  }
  if (!s.tg_token || !s.admin_chat) return;
  const origin = s.origin;
  const h = new Date().getUTCHours();
  const hours = s.post_hours.split(",").map((x) => Number(x.trim()));
  if (s.paused !== "1" && hours.includes(h)) await publishNext(env, s, origin);
  const today = now().slice(0, 10);
  if (h === 7 && s.last_reminder !== today) {
    const { n } = await env.DB.prepare("SELECT COUNT(*) n FROM products WHERE status = 'queued'").first();
    if (n < hours.length * 2) {
      await setS(env, "last_reminder", today);
      await say(env, s, `🔔 Հերթում մնացել է ${n} փին (${(n / hours.length).toFixed(1)} օրվա համար)։ Ուղարկիր նոր Amazon-ի հղումներ։`);
    }
  }
}

// ---------------------------------------------------------------- public site
const css = `:root{--bg:#faf8f5;--fg:#1f1d1a;--mut:#6b655c;--card:#fff;--acc:#c8102e}
@media(prefers-color-scheme:dark){:root{--bg:#141311;--fg:#f2efe9;--mut:#a59e93;--card:#1e1c19}}
*{box-sizing:border-box}body{margin:0;font-family:-apple-system,system-ui,sans-serif;background:var(--bg);color:var(--fg)}
header{padding:28px 16px;text-align:center}h1{margin:0;font-size:26px;letter-spacing:.5px}header p{color:var(--mut);margin:6px 0 0}
.grid{columns:2 220px;gap:14px;padding:0 16px 40px;max-width:1100px;margin:auto}.card{break-inside:avoid;margin-bottom:14px;background:var(--card);border-radius:16px;overflow:hidden;display:block;color:inherit;text-decoration:none}
.card img{width:100%;display:block}.card div{padding:10px 12px;font-size:14px;font-weight:600}
.wrap{max-width:640px;margin:auto;padding:16px}.wrap img{width:100%;border-radius:18px}.btn{display:block;text-align:center;background:var(--acc);color:#fff;padding:14px;border-radius:999px;font-weight:700;text-decoration:none;margin:18px 0}
small,.mut{color:var(--mut)}footer{text-align:center;padding:24px 16px;color:var(--mut);font-size:13px}
form label{display:block;margin:14px 0 4px;font-weight:600}input,select,textarea{width:100%;padding:10px;border-radius:10px;border:1px solid #8884;font:inherit;background:var(--card);color:var(--fg)}
.ok{color:#2a8a3e}.no{color:#c8102e}code{word-break:break-all;background:#8882;padding:2px 5px;border-radius:5px}`;
const page = (title, body, desc = "") => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${esc(desc)}"><style>${css}</style></head><body>${body}
<footer>${esc(SITE_NAME)} · ${DISCLOSURE}</footer></body></html>`;

async function site(env, path, origin) {
  if (path === "/") {
    const { results } = await env.DB.prepare("SELECT id, title, alt, use_photo, photo_img, ai_img FROM products WHERE status = 'published' ORDER BY published_at DESC LIMIT 200").all();
    return html(page(SITE_NAME, `<header><h1>${SITE_NAME}</h1><p>Cozy home, kitchen &amp; setup finds we love</p></header><div class="grid">${
      results.map((p) => `<a class="card" href="/p/${p.id}"><img loading="lazy" src="/img/${pinImg(p)}.jpg" alt="${esc(p.alt)}"><div>${esc(p.title)}</div></a>`).join("") || "<p class=mut>Coming soon.</p>"}</div>`, "Curated Amazon finds for a cozy modern home."));
  }
  const m = path.match(/^\/p\/(\d+)$/);
  if (m) {
    const p = await getP(env, m[1]);
    if (!p || p.status !== "published") return html(page("Not found", "<div class=wrap><p>Not found. <a href='/'>Home</a></p></div>"), 404);
    const d = esc(p.description).replace(/(#\w+)/g, "<small>$1</small>");
    return html(page(`${p.title} | ${SITE_NAME}`, `<div class="wrap"><p><a href="/">← ${SITE_NAME}</a></p><img src="/img/${pinImg(p)}.jpg" alt="${esc(p.alt)}">
<h1 style="font-size:22px">${esc(p.title)}</h1><p>${d}</p><a class="btn" rel="nofollow sponsored" href="${esc(p.url)}">View on Amazon →</a>
<p class="mut" style="font-size:13px">Images are styled illustrations; check the Amazon listing for exact product details and price. ${DISCLOSURE}</p></div>`, p.description));
  }
  if (path === "/privacy") {
    return html(page(`Privacy Policy | ${SITE_NAME}`, `<div class="wrap"><h1>Privacy Policy</h1>
<p>${SITE_NAME} is a personal curation site that shares product ideas on Pinterest. This site does not use cookies, does not run analytics and does not collect personal data from visitors.</p>
<p>Our Pinterest integration is used only by the site owner to publish pins to the owner's own Pinterest account. Pinterest access tokens are stored securely and are never shared or sold. We read the owner's board list solely to choose where to publish.</p>
<p>Some links are affiliate links. ${DISCLOSURE} When you click a link to Amazon, Amazon's own privacy policy applies.</p>
<p>Contact: via our Pinterest profile @ModernHavenFinds_.</p><p><a href="/">← Home</a></p></div>`));
  }
  if (path === "/rss.xml") {
    const { results } = await env.DB.prepare("SELECT * FROM products WHERE status = 'published' ORDER BY published_at DESC LIMIT 50").all();
    const items = results.map((p) => `<item><title>${esc(p.title)}</title><link>${origin}/p/${p.id}</link><guid>${origin}/p/${p.id}</guid>
<pubDate>${new Date(p.published_at).toUTCString()}</pubDate><description>${esc(p.description)}</description>
<enclosure url="${origin}/img/${pinImg(p)}.jpg" type="image/jpeg" length="0"/></item>`).join("");
    return new Response(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${SITE_NAME}</title><link>${origin}/</link><description>Curated Amazon home finds</description>${items}</channel></rss>`, { headers: { "content-type": "application/rss+xml; charset=utf-8" } });
  }
  const im = path.match(/^\/img\/([a-z0-9]+)\.jpg$/);
  if (im) {
    const img = await getImage(env, im[1]);
    if (!img) return new Response("not found", { status: 404 });
    return new Response(unb64(img.data), { headers: { "content-type": img.mime, "cache-control": "public, max-age=31536000, immutable" } });
  }
  return null;
}

// ---------------------------------------------------------------- setup page
async function setup(req, env, url) {
  const s = await getS(env);
  const key = url.searchParams.get("key") || "";
  const authed = !s.tg_token || key === s.admin_key;
  if (!authed) return html(page("Setup", "<div class=wrap><h1>🔒</h1><p>Բոտին գրիր /panel՝ հղումը ստանալու համար։</p></div>"), 403);
  const origin = url.origin;
  let msg = "";
  if (req.method === "POST") {
    const f = await req.formData();
    if (!s.admin_key) { s.admin_key = rid(); await setS(env, "admin_key", s.admin_key); }
    await setS(env, "origin", origin);
    for (const k of ["amazon_tag", "niche", "post_hours", "link_mode", "auto_approve", "pin_app_id", "make_webhook", "default_board", "pin_sandbox"]) {
      if (f.has(k)) await setS(env, k, String(f.get(k)).trim());
    }
    for (const k of ["tg_token", "pin_app_secret"]) { const v = String(f.get(k) || "").trim(); if (v) await setS(env, k, v); }
    const tok = String(f.get("tg_token") || "").trim();
    if (tok) {
      const secret = rid(32); await setS(env, "tg_secret", secret);
      const r = await (await fetch(`https://api.telegram.org/bot${tok}/setWebhook`, { method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: origin + "/tg", secret_token: secret, allowed_updates: ["message", "callback_query"] }) })).json();
      await fetch(`https://api.telegram.org/bot${tok}/setMyCommands`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ commands: [
        { command: "queue", description: "Հերթը" }, { command: "next", description: "Հրապարակել հիմա" }, { command: "stats", description: "Վիճակագրություն" },
        { command: "boards", description: "Pinterest բորդերը" }, { command: "pause", description: "Կանգնեցնել" }, { command: "resume", description: "Շարունակել" },
        { command: "panel", description: "Կարգավորումներ" }, { command: "help", description: "Օգնություն" }] }) });
      msg = r.ok ? "✅ Telegram-ը միացված է։ Բացիր բոտդ և սեղմիր Start։" : "❌ Telegram՝ " + esc(r.description);
    } else msg = "✅ Պահպանված է";
    return Response.redirect(`${origin}/setup?key=${s.admin_key}&msg=${encodeURIComponent(msg)}`, 303);
  }
  msg = url.searchParams.get("msg") || "";
  let boards = [];
  try { boards = await loadBoards(env, s); } catch (e) { msg += " ⚠️ " + e.message; }
  const st = (ok) => (ok ? "<span class=ok>✅</span>" : "<span class=no>❌</span>");
  const v = (k) => esc(s[k] || "");
  const redirect = origin + "/pinterest/callback";
  return html(page("Pins setup", `<div class="wrap"><h1>📌 ${SITE_NAME} — կարգավորումներ</h1>${msg ? `<p><b>${esc(msg)}</b></p>` : ""}
<p>${st(s.tg_token)} Telegram ${s.admin_chat ? "(տերը միացված է)" : "— միացնելուց հետո բոտին գրիր /start"}<br>
${st(s.amazon_tag)} Amazon tag<br>${st(s.pin_refresh)} Pinterest API ${s.pin_sandbox === "1" ? "(sandbox)" : ""}<br>${st(s.make_webhook)} Make.com (ըստ ցանկության)</p>
<form method="post">
<label>1. Telegram բոտի տոկենը (@BotFather)</label><input name="tg_token" placeholder="${s.tg_token ? "միացված է — դատարկ թող" : "123456:ABC..."}">
<label>2. Amazon Associates tracking ID</label><input name="amazon_tag" value="${v("amazon_tag")}" placeholder="modernhaven-20">
<label>Թեմաներ (AI-ի համար)</label><input name="niche" value="${v("niche")}">
<label>Հրապարակման ժամեր (UTC, ստորակետով)</label><input name="post_hours" value="${v("post_hours")}"><small>14,19,1 = 18:00, 23:00, 05:00 Երևանում = ԱՄՆ-ի առավոտ, կեսօր, երեկո</small>
<label>Փինի հղումը տանի</label><select name="link_mode"><option value="amazon" ${s.link_mode === "amazon" ? "selected" : ""}>Ուղիղ Amazon</option><option value="site" ${s.link_mode === "site" ? "selected" : ""}>Իմ կայքի էջը → Amazon</option></select>
<label>Հաստատում</label><select name="auto_approve"><option value="0" ${s.auto_approve !== "1" ? "selected" : ""}>Ես եմ հաստատում ամեն փինը ✅</option><option value="1" ${s.auto_approve === "1" ? "selected" : ""}>Ավտոմատ հերթ (առանց հաստատման)</option></select>
<h2 style="margin-top:28px">3. Pinterest API</h2>
<p class="mut">developers.pinterest.com → My apps → քո հավելվածը։ Redirect URI դաշտում ավելացրու՝<br><code>${esc(redirect)}</code></p>
<label>App ID</label><input name="pin_app_id" value="${v("pin_app_id")}">
<label>App secret key</label><input name="pin_app_secret" placeholder="${s.pin_app_secret ? "պահպանված է — դատարկ թող" : ""}">
<label>Ռեժիմ</label><select name="pin_sandbox"><option value="0" ${s.pin_sandbox !== "1" ? "selected" : ""}>Production (Standard access)</option><option value="1" ${s.pin_sandbox === "1" ? "selected" : ""}>Sandbox (Trial access, թեստ)</option></select>
${boards.length ? `<label>Լռելյայն բորդ</label><select name="default_board">${boards.map((b) => `<option value="${esc(b.id)}" ${s.default_board === b.id ? "selected" : ""}>${esc(b.name)}</option>`).join("")}</select>` : ""}
${s.pin_app_id && s.pin_app_secret ? `<a class="btn" href="/pinterest/connect?key=${esc(s.admin_key)}">${s.pin_refresh ? "🔁 Վերամիացնել Pinterest-ը" : "🔗 Միացնել Pinterest հաշիվը"}</a>` : "<p class=mut>Պահպանիր App ID-ն ու secret-ը, հետո կհայտնվի «Միացնել» կոճակը։</p>"}
<h2 style="margin-top:28px">4. Make.com (այլընտրանք / լրացում)</h2>
<label>Webhook URL</label><input name="make_webhook" value="${v("make_webhook")}" placeholder="https://hook.eu2.make.com/...">
<button class="btn" style="border:0;width:100%;font-size:16px">💾 Պահպանել</button></form>
<p class="mut">Քո կայքը՝ <a href="/">${esc(origin)}/</a> · RSS՝ <code>${esc(origin)}/rss.xml</code></p></div>`));
}

async function pinterestOAuth(env, url) {
  const s = await getS(env);
  const redirect = url.origin + "/pinterest/callback";
  if (url.pathname === "/pinterest/connect") {
    if (url.searchParams.get("key") !== s.admin_key) return new Response("forbidden", { status: 403 });
    const state = rid(); await setS(env, "oauth_state", state);
    return Response.redirect(`https://www.pinterest.com/oauth/?${new URLSearchParams({ client_id: s.pin_app_id, redirect_uri: redirect, response_type: "code", scope: PIN_SCOPES, state })}`, 302);
  }
  if (!s.oauth_state || url.searchParams.get("state") !== s.oauth_state) return new Response("bad state", { status: 400 });
  const r = await fetch("https://api.pinterest.com/v5/oauth/token", {
    method: "POST",
    headers: { authorization: "Basic " + btoa(`${s.pin_app_id}:${s.pin_app_secret}`), "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "authorization_code", code: url.searchParams.get("code") || "", redirect_uri: redirect }),
  });
  const j = await r.json();
  if (!j.access_token) return html(page("Pinterest", `<div class=wrap><h1>❌</h1><pre>${esc(JSON.stringify(j, null, 2))}</pre><a href="/setup?key=${esc(s.admin_key)}">← Հետ</a></div>`), 400);
  await setS(env, "pin_access", j.access_token);
  await setS(env, "pin_refresh", j.refresh_token);
  await setS(env, "pin_expires", Date.now() + j.expires_in * 1000);
  await setS(env, "boards_at", "0"); await setS(env, "oauth_state", "");
  if (s.admin_chat) await say(env, s, "✅ Pinterest-ը միացված է։ /boards");
  return Response.redirect(`${url.origin}/setup?key=${s.admin_key}&msg=${encodeURIComponent("✅ Pinterest-ը միացված է")}`, 303);
}

// ---------------------------------------------------------------- entry
export default {
  async fetch(req, env) {
    await schema(env);
    const url = new URL(req.url);
    if (url.pathname === "/tg" && req.method === "POST") return onTelegram(req, env);
    if (url.pathname === "/setup") return setup(req, env, url);
    if (url.pathname.startsWith("/pinterest/")) return pinterestOAuth(env, url);
    if (url.pathname === "/selftest") {
      const s = await getS(env);
      if (s.admin_key && url.searchParams.get("key") !== s.admin_key) return new Response("forbidden", { status: 403 });
      const r = await env.DB.prepare("INSERT INTO products (url, name, status, created_at) VALUES (?, ?, 'test', ?)").bind("https://www.amazon.com/dp/B000000000", url.searchParams.get("name") || "red striped ceramic vase with dried pampas flowers", now()).run();
      const id = r.meta.last_row_id;
      await genText(env, s, await getP(env, id));
      await genImage(env, await getP(env, id));
      const p = await getP(env, id);
      return html(page("selftest", `<div class=wrap><img src="/img/${p.ai_img}.jpg"><h1>${esc(p.title)}</h1><p>${esc(p.description)}</p><p>board: ${esc(p.board)}</p><p class=mut>${esc(p.prompt)}</p></div>`));
    }
    return (await site(env, url.pathname, url.origin)) || new Response("not found", { status: 404 });
  },
  async scheduled(event, env, ctx) { ctx.waitUntil(onCron(env)); },
};
