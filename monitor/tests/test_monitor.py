import io
import unittest
from contextlib import redirect_stdout
from datetime import datetime, timedelta, timezone

from promo_monitor import __main__ as cli
from promo_monitor.config import Config, Rules
from promo_monitor.detector import evaluate, should_alert
from promo_monitor.models import MissingCredentials, Offer
from promo_monitor.notifier import brl, format_deal
from promo_monitor.storage import Storage

NOW = datetime(2026, 9, 27, 12, tzinfo=timezone.utc)


def offer(price, original=None, title="Fone Bluetooth X", item_id="MLB1"):
    return Offer(source="mercadolivre", item_id=item_id, title=title, price=price,
                 original_price=original, url="https://example.com/p")


def seed(storage, prices, key_offer=None, days_ago_start=20):
    base = key_offer or offer(0)
    for i, price in enumerate(prices):
        o = offer(price, title=base.title, item_id=base.item_id)
        storage.save(o, NOW - timedelta(days=days_ago_start - i))


class DetectorTest(unittest.TestCase):
    def setUp(self):
        self.storage = Storage(":memory:")
        self.rules = Rules(min_price=0)

    def test_real_discount_against_median(self):
        seed(self.storage, [100, 100, 102, 98, 100])
        deal = evaluate(offer(75), self.storage, self.rules, NOW)
        self.assertIsNotNone(deal)
        self.assertAlmostEqual(deal.reference_price, 100)
        self.assertAlmostEqual(deal.discount, 0.25)

    def test_small_drop_is_ignored(self):
        seed(self.storage, [100] * 5)
        self.assertIsNone(evaluate(offer(95), self.storage, self.rules, NOW))

    def test_lowest_in_period(self):
        seed(self.storage, [100, 100, 100, 100, 100, 88])
        deal = evaluate(offer(87), self.storage, self.rules, NOW)
        self.assertIsNotNone(deal)
        self.assertIn("menor preço", deal.reason)

    def test_inflated_listed_discount_ignored_by_default(self):
        self.assertIsNone(evaluate(offer(50, original=200), self.storage, self.rules, NOW))

    def test_listed_discount_when_trusted(self):
        rules = Rules(min_price=0, trust_listed_discount=True)
        deal = evaluate(offer(50, original=100), self.storage, rules, NOW)
        self.assertIn("nao-verificado", deal.tags)

    def test_history_outside_window_is_ignored(self):
        seed(self.storage, [200] * 5, days_ago_start=60)
        self.assertIsNone(evaluate(offer(100), self.storage, self.rules, NOW))

    def test_filters(self):
        seed(self.storage, [100] * 5, key_offer=offer(0, title="Capa para fone"))
        rules = Rules(min_price=0, exclude_words=["capa"])
        self.assertIsNone(evaluate(offer(50, title="Capa para fone"), self.storage, rules, NOW))
        self.assertIsNone(evaluate(offer(50), self.storage, Rules(min_price=60), NOW))

    def test_realert_rules(self):
        seed(self.storage, [100] * 5)
        deal = evaluate(offer(75), self.storage, self.rules, NOW)
        self.assertTrue(should_alert(deal, self.storage, self.rules, NOW))
        self.storage.mark_alerted(deal.offer.key, 75, NOW)

        same = evaluate(offer(74), self.storage, self.rules, NOW + timedelta(hours=1))
        self.assertFalse(should_alert(same, self.storage, self.rules, NOW + timedelta(hours=1)))

        lower = evaluate(offer(70), self.storage, self.rules, NOW + timedelta(hours=1))
        self.assertTrue(should_alert(lower, self.storage, self.rules, NOW + timedelta(hours=1)))

        later = NOW + timedelta(days=8)
        self.assertTrue(should_alert(same, self.storage, self.rules, later))


class FormatTest(unittest.TestCase):
    def test_brl(self):
        self.assertEqual(brl(1234.5), "R$ 1.234,50")

    def test_message(self):
        storage = Storage(":memory:")
        seed(storage, [100] * 5)
        text = format_deal(evaluate(offer(75), storage, Rules(min_price=0), NOW))
        self.assertIn("De R$ 100,00 por R$ 75,00 (-25%)", text)
        self.assertIn("Mercado Livre", text)


class FakeSource:
    def __init__(self, prices):
        self.prices = prices

    def fetch(self, cfg):
        yield offer(self.prices.pop(0))
        yield offer(1, item_id="MLB1")  # duplicado na mesma execução: ignorado


class NoCredsSource:
    def fetch(self, cfg):
        raise MissingCredentials("sem token")
        yield  # pragma: no cover


class RunTest(unittest.TestCase):
    def test_end_to_end(self):
        storage = Storage(":memory:")
        cfg = Config(queries=[], items={}, rules=Rules(min_price=0), sources=["fake", "nocreds"],
                     notifiers=["console"], db_path=None)
        prices = [100, 100, 100, 100, 100, 70, 70]
        original = dict(cli.SOURCES)
        cli.SOURCES.update(fake=FakeSource(prices), nocreds=NoCredsSource())
        try:
            out = io.StringIO()
            with redirect_stdout(out), self.assertLogs("promo_monitor", "INFO"):
                for hour in range(7):
                    failures = cli.run(cfg, storage, ["console"], False, NOW + timedelta(hours=hour))
                    self.assertEqual(failures, 0)
        finally:
            cli.SOURCES.clear()
            cli.SOURCES.update(original)
        self.assertEqual(out.getvalue().count("🔥"), 1)
        self.assertEqual(len(storage.history("mercadolivre:MLB1", 30, NOW + timedelta(days=1))), 7)


if __name__ == "__main__":
    unittest.main()
