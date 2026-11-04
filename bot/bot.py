"""Telegram բոտ վարսավիրանոցների համար՝ առցանց հերթագրում և հիշեցումներ։

Գործարկում.
    BOT_TOKEN=123:ABC python bot.py

Կարգավորումները՝ config.json (տե՛ս config.example.json)։
"""
import json
import logging
import os
import sqlite3
from datetime import date, datetime, time, timedelta, timezone
from zoneinfo import ZoneInfo

from telegram import (
    InlineKeyboardButton as Btn,
    InlineKeyboardMarkup as Kb,
    ReplyKeyboardMarkup,
    Update,
)
from telegram.ext import (
    Application,
    CallbackQueryHandler,
    CommandHandler,
    ContextTypes,
    MessageHandler,
    filters,
)

BASE = os.path.dirname(os.path.abspath(__file__))
WEEKDAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
DAY_NAMES = ["Երկ", "Երք", "Չրք", "Հնգ", "Ուրբ", "Շբթ", "Կիր"]

BTN_BOOK = "📅 Գրանցվել"
BTN_MINE = "🗂 Իմ գրանցումները"
BTN_PRICES = "💈 Ծառայություններ և գներ"
BTN_CONTACT = "📍 Կապ"
MENU = ReplyKeyboardMarkup([[BTN_BOOK, BTN_MINE], [BTN_PRICES, BTN_CONTACT]], resize_keyboard=True)

log = logging.getLogger("barberbot")


# ---------------------------------------------------------------- logic

def load_config(path):
    with open(path, encoding="utf-8") as f:
        cfg = json.load(f)
    cfg.setdefault("timezone", "Asia/Yerevan")
    cfg.setdefault("slot_minutes", 30)
    cfg.setdefault("days_ahead", 7)
    cfg.setdefault("min_lead_minutes", 30)
    cfg.setdefault("reminder_minutes", 60)
    cfg.setdefault("admin_ids", [])
    return cfg


def working_hours(cfg, day):
    """(open, close) aware datetimes for the day, or None when closed."""
    h = cfg["hours"].get(WEEKDAYS[day.weekday()])
    if not h:
        return None
    tz = ZoneInfo(cfg["timezone"])
    return (datetime.combine(day, time.fromisoformat(h[0]), tzinfo=tz),
            datetime.combine(day, time.fromisoformat(h[1]), tzinfo=tz))


def free_slots(cfg, day, duration_min, busy, now):
    """Start times on `day` where a service of `duration_min` fits.

    busy: list of (start, end) aware datetimes already booked.
    """
    hours = working_hours(cfg, day)
    if not hours:
        return []
    opens, closes = hours
    step = timedelta(minutes=cfg["slot_minutes"])
    dur = timedelta(minutes=duration_min)
    earliest = now + timedelta(minutes=cfg["min_lead_minutes"])
    out, t = [], opens
    while t + dur <= closes:
        if t >= earliest and all(t + dur <= b0 or t >= b1 for b0, b1 in busy):
            out.append(t)
        t += step
    return out


def bookable_days(cfg, now):
    today = now.astimezone(ZoneInfo(cfg["timezone"])).date()
    days = [today + timedelta(days=i) for i in range(cfg["days_ahead"])]
    return [d for d in days if working_hours(cfg, d)]


def fmt_dt(dt, cfg):
    dt = dt.astimezone(ZoneInfo(cfg["timezone"]))
    return f"{DAY_NAMES[dt.weekday()]} {dt:%d.%m}, {dt:%H:%M}"


class Store:
    """SQLite storage. Times are UTC unix seconds."""

    def __init__(self, path):
        self.db = sqlite3.connect(path, check_same_thread=False)
        self.db.row_factory = sqlite3.Row
        self.db.execute("""CREATE TABLE IF NOT EXISTS bookings(
            id INTEGER PRIMARY KEY,
            user_id INTEGER, user_name TEXT, service TEXT, price INTEGER,
            start INTEGER, end INTEGER,
            status TEXT DEFAULT 'active', reminded INTEGER DEFAULT 0)""")
        self.db.commit()

    @staticmethod
    def _ts(dt):
        return int(dt.timestamp())

    @staticmethod
    def dt(ts):
        return datetime.fromtimestamp(ts, timezone.utc)

    def busy(self, start, end):
        rows = self.db.execute(
            "SELECT start, end FROM bookings WHERE status='active' AND start < ? AND end > ?",
            (self._ts(end), self._ts(start))).fetchall()
        return [(self.dt(r["start"]), self.dt(r["end"])) for r in rows]

    def add(self, user_id, user_name, service, price, start, end):
        cur = self.db.execute(
            "INSERT INTO bookings(user_id, user_name, service, price, start, end) VALUES (?,?,?,?,?,?)",
            (user_id, user_name, service, price, self._ts(start), self._ts(end)))
        self.db.commit()
        return cur.lastrowid

    def upcoming_for(self, user_id, now):
        return self.db.execute(
            "SELECT * FROM bookings WHERE user_id=? AND status='active' AND start>=? ORDER BY start",
            (user_id, self._ts(now))).fetchall()

    def cancel(self, booking_id, user_id, now):
        row = self.db.execute(
            "SELECT * FROM bookings WHERE id=? AND user_id=? AND status='active' AND start>=?",
            (booking_id, user_id, self._ts(now))).fetchone()
        if row:
            self.db.execute("UPDATE bookings SET status='cancelled' WHERE id=?", (booking_id,))
            self.db.commit()
        return row

    def between(self, start, end):
        return self.db.execute(
            "SELECT * FROM bookings WHERE status='active' AND start>=? AND start<? ORDER BY start",
            (self._ts(start), self._ts(end))).fetchall()

    def due_reminders(self, now, minutes):
        return self.db.execute(
            "SELECT * FROM bookings WHERE status='active' AND reminded=0 AND start>? AND start<=?",
            (self._ts(now), self._ts(now + timedelta(minutes=minutes)))).fetchall()

    def mark_reminded(self, booking_id):
        self.db.execute("UPDATE bookings SET reminded=1 WHERE id=?", (booking_id,))
        self.db.commit()


# ---------------------------------------------------------------- handlers

def cfg_of(ctx):
    return ctx.application.bot_data["cfg"]


def store_of(ctx):
    return ctx.application.bot_data["store"]


def now_utc():
    return datetime.now(timezone.utc)


def user_label(user):
    name = user.full_name or "Հաճախորդ"
    return f"{name} (@{user.username})" if user.username else name


async def notify_admins(ctx, text):
    for chat_id in cfg_of(ctx)["admin_ids"]:
        try:
            await ctx.bot.send_message(chat_id, text)
        except Exception as e:  # admin blocked bot, wrong id, etc.
            log.warning("admin notify failed for %s: %s", chat_id, e)


async def start(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    cfg = cfg_of(ctx)
    await update.message.reply_text(
        f"Բարի գալուստ {cfg['name']} 💈\n\nԱյստեղ կարող եք գրանցվել մի քանի վայրկյանում։",
        reply_markup=MENU)


async def prices(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    lines = [f"• {s['name']} — {s['price']:,} ֏ ({s['duration']} րոպե)".replace(",", " ")
             for s in cfg_of(ctx)["services"]]
    await update.message.reply_text("Ծառայություններ և գներ\n\n" + "\n".join(lines))


async def contact(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    cfg = cfg_of(ctx)
    hours = []
    for i, key in enumerate(WEEKDAYS):
        h = cfg["hours"].get(key)
        hours.append(f"{DAY_NAMES[i]}՝ {h[0]}–{h[1]}" if h else f"{DAY_NAMES[i]}՝ փակ է")
    text = f"{cfg['name']}\n📍 {cfg.get('address', '')}\n📞 {cfg.get('phone', '')}\n\n🕒 " + "\n🕒 ".join(hours)
    await update.message.reply_text(text)


def services_kb(cfg):
    return Kb([[Btn(f"{s['name']} — {s['price']} ֏", callback_data=f"svc:{i}")]
               for i, s in enumerate(cfg["services"])])


async def book(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("Ընտրեք ծառայությունը.", reply_markup=services_kb(cfg_of(ctx)))


async def mine(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    cfg, store = cfg_of(ctx), store_of(ctx)
    rows = store.upcoming_for(update.effective_user.id, now_utc())
    if not rows:
        await update.message.reply_text("Դուք ակտիվ գրանցումներ չունեք։", reply_markup=MENU)
        return
    for r in rows:
        await update.message.reply_text(
            f"✂️ {r['service']}\n🕒 {fmt_dt(store.dt(r['start']), cfg)}",
            reply_markup=Kb([[Btn("❌ Չեղարկել", callback_data=f"cancel:{r['id']}")]]))


async def on_callback(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    q = update.callback_query
    await q.answer()
    cfg, store = cfg_of(ctx), store_of(ctx)
    parts = q.data.split(":")
    kind = parts[0]

    if kind == "back":
        await q.edit_message_text("Ընտրեք ծառայությունը.", reply_markup=services_kb(cfg))

    elif kind == "svc":
        i = int(parts[1])
        rows, row = [], []
        for d in bookable_days(cfg, now_utc()):
            row.append(Btn(f"{DAY_NAMES[d.weekday()]} {d:%d.%m}", callback_data=f"day:{i}:{d:%Y%m%d}"))
            if len(row) == 3:
                rows.append(row)
                row = []
        if row:
            rows.append(row)
        rows.append([Btn("⬅️ Հետ", callback_data="back")])
        await q.edit_message_text(f"{cfg['services'][i]['name']}\nԸնտրեք օրը.", reply_markup=Kb(rows))

    elif kind == "day":
        i, d = int(parts[1]), datetime.strptime(parts[2], "%Y%m%d").date()
        svc = cfg["services"][i]
        opens, closes = working_hours(cfg, d)
        slots = free_slots(cfg, d, svc["duration"], store.busy(opens, closes), now_utc())
        rows = [[Btn(f"{t:%H:%M}", callback_data=f"slot:{i}:{int(t.timestamp())}") for t in slots[k:k + 4]]
                for k in range(0, len(slots), 4)]
        rows.append([Btn("⬅️ Այլ օր", callback_data=f"svc:{i}")])
        text = (f"{svc['name']}, {DAY_NAMES[d.weekday()]} {d:%d.%m}\nԸնտրեք ժամը."
                if slots else "Այս օրը ազատ ժամ չկա 😔 Ընտրեք այլ օր։")
        await q.edit_message_text(text, reply_markup=Kb(rows))

    elif kind == "slot":
        i, ts = int(parts[1]), int(parts[2])
        svc = cfg["services"][i]
        await q.edit_message_text(
            f"Հաստատե՞լ գրանցումը\n\n✂️ {svc['name']} — {svc['price']} ֏\n🕒 {fmt_dt(store.dt(ts), cfg)}",
            reply_markup=Kb([[Btn("✅ Հաստատել", callback_data=f"ok:{i}:{ts}"),
                              Btn("⬅️ Հետ", callback_data=f"svc:{i}")]]))

    elif kind == "ok":
        i, ts = int(parts[1]), int(parts[2])
        svc = cfg["services"][i]
        start_dt = store.dt(ts)
        end_dt = start_dt + timedelta(minutes=svc["duration"])
        local_day = start_dt.astimezone(ZoneInfo(cfg["timezone"])).date()
        opens, closes = working_hours(cfg, local_day) or (start_dt, start_dt)
        # Re-check: someone may have taken the slot meanwhile.
        if start_dt not in free_slots(cfg, local_day, svc["duration"], store.busy(opens, closes), now_utc()):
            await q.edit_message_text("Այս ժամն արդեն զբաղված է 😔 Ընտրեք այլ ժամ։",
                                      reply_markup=Kb([[Btn("⬅️ Ընտրել այլ ժամ", callback_data=f"svc:{i}")]]))
            return
        user = update.effective_user
        store.add(user.id, user_label(user), svc["name"], svc["price"], start_dt, end_dt)
        when = fmt_dt(start_dt, cfg)
        await q.edit_message_text(
            f"✅ Դուք գրանցված եք\n\n✂️ {svc['name']}\n🕒 {when}\n📍 {cfg.get('address', '')}\n\n"
            f"Կհիշեցնենք {cfg['reminder_minutes']} րոպե առաջ։")
        await notify_admins(ctx, f"🆕 Նոր գրանցում\n👤 {user_label(user)}\n✂️ {svc['name']} — {svc['price']} ֏\n🕒 {when}")

    elif kind == "cancel":
        row = store.cancel(int(parts[1]), update.effective_user.id, now_utc())
        if not row:
            await q.edit_message_text("Այս գրանցումն այլևս ակտիվ չէ։")
            return
        when = fmt_dt(store.dt(row["start"]), cfg)
        await q.edit_message_text(f"❌ Գրանցումը չեղարկված է ({row['service']}, {when})")
        await notify_admins(ctx, f"❌ Չեղարկում\n👤 {row['user_name']}\n✂️ {row['service']}\n🕒 {when}")


async def schedule(update: Update, ctx: ContextTypes.DEFAULT_TYPE, offset_days):
    cfg, store = cfg_of(ctx), store_of(ctx)
    if update.effective_user.id not in cfg["admin_ids"]:
        return
    tz = ZoneInfo(cfg["timezone"])
    d = now_utc().astimezone(tz).date() + timedelta(days=offset_days)
    start = datetime.combine(d, time(0), tzinfo=tz)
    rows = store.between(start, start + timedelta(days=1))
    if not rows:
        await update.message.reply_text(f"{d:%d.%m}՝ գրանցումներ չկան։")
        return
    total = sum(r["price"] for r in rows)
    lines = [f"{store.dt(r['start']).astimezone(tz):%H:%M} — {r['service']} — {r['user_name']}" for r in rows]
    await update.message.reply_text(f"📋 {d:%d.%m} ({len(rows)} գրանցում, {total} ֏)\n\n" + "\n".join(lines))


async def today(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    await schedule(update, ctx, 0)


async def tomorrow(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    await schedule(update, ctx, 1)


async def myid(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(f"Ձեր ID-ն՝ {update.effective_user.id}")


async def send_reminders(ctx: ContextTypes.DEFAULT_TYPE):
    cfg, store = cfg_of(ctx), store_of(ctx)
    for r in store.due_reminders(now_utc(), cfg["reminder_minutes"]):
        try:
            await ctx.bot.send_message(
                r["user_id"],
                f"⏰ Հիշեցում\n\n✂️ {r['service']}\n🕒 {fmt_dt(store.dt(r['start']), cfg)}\n📍 {cfg.get('address', '')}")
        except Exception as e:
            log.warning("reminder failed for booking %s: %s", r["id"], e)
        store.mark_reminded(r["id"])


async def on_text(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    handler = {BTN_BOOK: book, BTN_MINE: mine, BTN_PRICES: prices, BTN_CONTACT: contact}.get(update.message.text)
    if handler:
        await handler(update, ctx)
    else:
        await update.message.reply_text("Ընտրեք ներքևի ընտրացանկից 👇", reply_markup=MENU)


def build_app(token, cfg, store):
    app = Application.builder().token(token).build()
    app.bot_data.update(cfg=cfg, store=store)
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("book", book))
    app.add_handler(CommandHandler("today", today))
    app.add_handler(CommandHandler("tomorrow", tomorrow))
    app.add_handler(CommandHandler("myid", myid))
    app.add_handler(CallbackQueryHandler(on_callback))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, on_text))
    app.job_queue.run_repeating(send_reminders, interval=60, first=5)
    return app


def main():
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
    token = os.environ.get("BOT_TOKEN")
    if not token:
        raise SystemExit("BOT_TOKEN չկա։ Գործարկիր՝ BOT_TOKEN=քո_տոկենը python bot.py")
    cfg = load_config(os.environ.get("BOT_CONFIG", os.path.join(BASE, "config.json")))
    store = Store(os.environ.get("BOT_DB", os.path.join(BASE, "bookings.db")))
    log.info("Starting bot for %s", cfg["name"])
    build_app(token, cfg, store).run_polling()


if __name__ == "__main__":
    main()
