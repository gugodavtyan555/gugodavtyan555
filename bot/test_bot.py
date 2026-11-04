import os
import tempfile
import unittest
from datetime import date, datetime, timedelta
from zoneinfo import ZoneInfo

import bot

CFG = bot.load_config(os.path.join(os.path.dirname(__file__), "config.example.json"))
TZ = ZoneInfo("Asia/Yerevan")
MONDAY = date(2026, 11, 9)
SUNDAY = date(2026, 11, 8)


def at(d, hh, mm=0):
    return datetime(d.year, d.month, d.day, hh, mm, tzinfo=TZ)


class SlotTests(unittest.TestCase):
    def test_closed_day(self):
        self.assertEqual(bot.free_slots(CFG, SUNDAY, 30, [], at(SUNDAY, 0)), [])

    def test_full_open_day(self):
        slots = bot.free_slots(CFG, MONDAY, 30, [], at(MONDAY, 0))
        self.assertEqual(slots[0], at(MONDAY, 10))
        self.assertEqual(slots[-1], at(MONDAY, 19, 30))
        self.assertEqual(len(slots), 20)

    def test_long_service_must_fit_before_close(self):
        slots = bot.free_slots(CFG, MONDAY, 60, [], at(MONDAY, 0))
        self.assertEqual(slots[-1], at(MONDAY, 19))

    def test_busy_slots_excluded(self):
        busy = [(at(MONDAY, 12), at(MONDAY, 13))]
        slots = bot.free_slots(CFG, MONDAY, 60, busy, at(MONDAY, 0))
        self.assertNotIn(at(MONDAY, 11, 30), slots)  # would overlap 12:00
        self.assertNotIn(at(MONDAY, 12), slots)
        self.assertNotIn(at(MONDAY, 12, 30), slots)
        self.assertIn(at(MONDAY, 11), slots)
        self.assertIn(at(MONDAY, 13), slots)

    def test_lead_time(self):
        slots = bot.free_slots(CFG, MONDAY, 30, [], at(MONDAY, 14, 10))
        self.assertEqual(slots[0], at(MONDAY, 15))

    def test_bookable_days_skip_sunday(self):
        days = bot.bookable_days(CFG, at(SUNDAY, 9))
        self.assertNotIn(SUNDAY, days)
        self.assertEqual(len(days), 6)


class StoreTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.store = bot.Store(os.path.join(self.tmp.name, "t.db"))

    def tearDown(self):
        self.store.db.close()
        self.tmp.cleanup()

    def test_add_busy_cancel_remind(self):
        s, e = at(MONDAY, 12), at(MONDAY, 13)
        bid = self.store.add(1, "Ani", "Սանրվածք", 4000, s, e)
        self.assertEqual(self.store.busy(at(MONDAY, 10), at(MONDAY, 20)), [(s, e)])
        self.assertEqual(len(self.store.due_reminders(at(MONDAY, 11, 5), 60)), 1)
        self.assertEqual(len(self.store.due_reminders(at(MONDAY, 10), 60)), 0)
        self.store.mark_reminded(bid)
        self.assertEqual(len(self.store.due_reminders(at(MONDAY, 11, 5), 60)), 0)
        self.assertIsNone(self.store.cancel(bid, 2, at(MONDAY, 9)))  # other user
        self.assertIsNotNone(self.store.cancel(bid, 1, at(MONDAY, 9)))
        self.assertEqual(self.store.busy(at(MONDAY, 10), at(MONDAY, 20)), [])

    def test_app_builds(self):
        app = bot.build_app("123:TEST", CFG, self.store)
        self.assertEqual(app.bot_data["cfg"]["name"], "Demo Barbershop")


if __name__ == "__main__":
    unittest.main()
