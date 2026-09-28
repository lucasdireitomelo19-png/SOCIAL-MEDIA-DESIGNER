import hashlib
import json
import unittest
from pathlib import Path

from monitor.db import DAY, PriceDB
from monitor.detector import Rules, evaluate
from monitor.models import Offer, PriceStats
from monitor.publishers import ConsolePublisher, format_caption
from monitor.publishers.format import MAX_CAPTION, brl
from monitor.runner import collect, process, publish
from monitor.sources import build_sources
from monitor.sources.amazon import parse_items, sign_headers
from monitor.sources.mercadolivre import affiliate_url, parse_results
from monitor.sources.shopee import auth_header, parse_nodes

NOW = 1_800_000_000


def offer(price, pid="p1", **kw):
    return Offer(source="amazon", product_id=pid, title="Produto", price=price,
                 url="https://amzn.to/x", **kw)


def stats(median=100.0, min90=95.0, samples=30, days=30.0, median90=None):
    return PriceStats(samples_30d=samples, history_days=days, median_30d=median,
                      median_90d=median90 if median90 is not None else median, min_90d=min90)


class DetectorTest(unittest.TestCase):
    def test_real_discount_passes(self):
        deal = evaluate(offer(80), stats(), Rules(), NOW)
        self.assertIsNotNone(deal)
        self.assertAlmostEqual(deal.real_discount, 0.20)
        self.assertTrue(deal.is_new_low)

    def test_small_discount_rejected(self):
        self.assertIsNone(evaluate(offer(90), stats(), Rules(), NOW))

    def test_without_history_rejected(self):
        self.assertIsNone(evaluate(offer(50), stats(samples=2), Rules(), NOW))
        self.assertIsNone(evaluate(offer(50), stats(days=1), Rules(), NOW))

    def test_store_list_price_is_ignored(self):
        # a loja diz "de 300 por 95", mas o preço normal é 100: 5% de desconto real
        self.assertIsNone(evaluate(offer(95, list_price=300), stats(), Rules(), NOW))

    def test_inflated_list_price_flagged(self):
        deal = evaluate(offer(80, list_price=300), stats(), Rules(), NOW)
        self.assertTrue(deal.inflated_list_price)

    def test_raise_then_drop_uses_90d_median(self):
        # subiu pra 130 no último mês e "caiu" pra 110: contra 90 dias (100) não é promoção
        self.assertIsNone(evaluate(offer(110), stats(median=130, median90=100), Rules(), NOW))

    def test_bad_rating_rejected(self):
        self.assertIsNone(evaluate(offer(70, rating=3.5), stats(), Rules(), NOW))

    def test_no_repost_within_window_unless_cheaper(self):
        last = (NOW - 2 * DAY, 80.0)
        self.assertIsNone(evaluate(offer(80), stats(), Rules(), NOW, last_post=last))
        self.assertIsNotNone(evaluate(offer(75), stats(), Rules(), NOW, last_post=last))
        old = (NOW - 10 * DAY, 80.0)
        self.assertIsNotNone(evaluate(offer(80), stats(), Rules(), NOW, last_post=old))

    def test_rules_from_dict_ignores_unknown(self):
        rules = Rules.from_dict({"desconto_real_minimo": 0.3, "xyz": 1})
        self.assertEqual(rules.desconto_real_minimo, 0.3)


class DBTest(unittest.TestCase):
    def test_stats_exclude_current_and_window(self):
        db = PriceDB(":memory:")
        for d, price in [(100, 10.0), (40, 50.0), (20, 100.0), (10, 110.0), (5, 90.0)]:
            db.record(offer(price), NOW - d * DAY)
        db.record(offer(1.0), NOW)  # coleta atual não entra nas estatísticas
        s = db.stats("amazon:p1", NOW)
        self.assertEqual(s.samples_30d, 3)
        self.assertEqual(s.median_30d, 100.0)
        self.assertEqual(s.median_90d, 95.0)
        self.assertEqual(s.min_90d, 50.0)
        self.assertEqual(s.history_days, 100)
        self.assertEqual(db.all_time_low("amazon:p1", NOW), 10.0)

    def test_posts(self):
        db = PriceDB(":memory:")
        self.assertIsNone(db.last_post("amazon:p1"))
        db.mark_posted(offer(80), NOW)
        self.assertEqual(db.last_post("amazon:p1"), (NOW, 80.0))


class FakeSource:
    def __init__(self, offers, fail=False):
        self.offers, self.fail = offers, fail

    def search(self, term, limit=20):
        if self.fail:
            raise RuntimeError("fora do ar")
        return self.offers


class RunnerTest(unittest.TestCase):
    def test_end_to_end(self):
        db = PriceDB(":memory:")
        for d in range(20, 0, -1):
            db.record(offer(100.0), NOW - d * DAY)

        sources = {"amazon": FakeSource([offer(70.0), offer(70.0)]),
                   "shopee": FakeSource([], fail=True)}
        offers = collect(sources, [{"termo": "x"}], 20)
        self.assertEqual(len(offers), 1)  # duplicado removido; loja com erro ignorada

        deals = process(offers, db, Rules(), NOW)
        self.assertEqual(len(deals), 1)
        pub = ConsolePublisher()
        self.assertEqual(publish(deals, pub, db, NOW, 5), 1)

        # na próxima execução, mesmo preço: não reposta
        self.assertEqual(process(offers, db, Rules(), NOW + 3600), [])

    def test_max_price_filter(self):
        sources = {"amazon": FakeSource([offer(500.0)])}
        self.assertEqual(collect(sources, [{"termo": "x", "preco_maximo": 100}], 20), [])

    def test_build_sources_needs_credentials(self):
        built = build_sources({}, {"SHOPEE_APP_ID": "a", "SHOPEE_SECRET": "b"})
        self.assertEqual(list(built), ["shopee"])
        built = build_sources({"shopee": {"ativo": False}}, {"SHOPEE_APP_ID": "a", "SHOPEE_SECRET": "b"})
        self.assertEqual(built, {})


class FormatTest(unittest.TestCase):
    def test_brl(self):
        self.assertEqual(brl(1234.5), "R$ 1.234,50")

    def test_caption_escapes_and_limits(self):
        o = offer(80, free_shipping=True)
        o.title = "<b>Fone & Cia</b>" * 30
        deal = evaluate(o, stats(), Rules(), NOW)
        caption = format_caption(deal, "rodapé " * 300)
        self.assertLessEqual(len(caption), MAX_CAPTION)
        self.assertNotIn("<b><b>", caption)
        self.assertIn("&amp;", caption)
        self.assertIn("R$ 80,00", caption)
        self.assertIn("Frete grátis", caption)
        self.assertIn('href="https://amzn.to/x"', caption)


class SourceParsingTest(unittest.TestCase):
    def test_amazon_parse(self):
        data = {"SearchResult": {"Items": [
            {"ASIN": "B01", "DetailPageURL": "https://www.amazon.com.br/dp/B01?tag=t-20",
             "ItemInfo": {"Title": {"DisplayValue": "Air Fryer"}},
             "Images": {"Primary": {"Large": {"URL": "https://img/1.jpg"}}},
             "Offers": {"Listings": [{"Price": {"Amount": 299.9},
                                      "SavingBasis": {"Amount": 499.9},
                                      "DeliveryInfo": {"IsFreeShippingEligible": True}}]}},
            {"ASIN": "B02", "DetailPageURL": "x"},  # sem oferta: ignorado
        ]}}
        [o] = parse_items(data, "air fryer")
        self.assertEqual((o.product_id, o.price, o.list_price, o.free_shipping),
                         ("B01", 299.9, 499.9, True))

    def test_amazon_signature_shape(self):
        import datetime as dt
        h = sign_headers("AK", "SK", "{}", dt.datetime(2026, 1, 2, 3, 4, 5, tzinfo=dt.timezone.utc))
        self.assertEqual(h["x-amz-date"], "20260102T030405Z")
        self.assertTrue(h["Authorization"].startswith(
            "AWS4-HMAC-SHA256 Credential=AK/20260102/us-east-1/ProductAdvertisingAPI/aws4_request, "
            "SignedHeaders=content-encoding;content-type;host;x-amz-date;x-amz-target, Signature="))

    def test_mercadolivre_parse(self):
        data = {"results": [{"id": "MLB1", "title": "Fone", "price": 99.0, "original_price": 149.0,
                             "permalink": "https://produto.mercadolivre.com.br/MLB1",
                             "thumbnail": "http://http2.mlstatic.com/D_1-I.jpg",
                             "shipping": {"free_shipping": True}, "sold_quantity": 50}]}
        [o] = parse_results(data, "{url}?matt_tool=123")
        self.assertEqual(o.url, "https://produto.mercadolivre.com.br/MLB1?matt_tool=123")
        self.assertEqual(o.image_url, "https://http2.mlstatic.com/D_1-O.jpg")
        self.assertTrue(o.free_shipping)
        self.assertEqual(affiliate_url("https://a/b", "https://x?u={url_codificada}"),
                         "https://x?u=https%3A%2F%2Fa%2Fb")

    def test_shopee_parse_and_auth(self):
        data = {"data": {"productOfferV2": {"nodes": [
            {"itemId": 123, "productName": "Smartwatch", "priceMin": "80.00",
             "priceDiscountRate": 20, "imageUrl": "https://img", "offerLink": "https://s.shopee.com.br/x",
             "ratingStar": "4.8", "sales": 1000}]}}}
        [o] = parse_nodes(data)
        self.assertEqual((o.product_id, o.price, o.list_price, o.rating), ("123", 80.0, 100.0, 4.8))
        with self.assertRaises(RuntimeError):
            parse_nodes({"errors": [{"message": "bad sign"}]})

        payload = json.dumps({"query": "{}"})
        expected = hashlib.sha256(f"id1700{payload}sec".encode()).hexdigest()
        self.assertEqual(auth_header("id", "sec", payload, 1700),
                         f"SHA256 Credential=id, Timestamp=1700, Signature={expected}")


class MercadoLivreTokenTest(unittest.TestCase):
    ENV = {"ML_CLIENT_ID": "id", "ML_CLIENT_SECRET": "sec", "ML_REFRESH_TOKEN": "original"}

    def make(self, db, valid):
        from monitor.http import HttpError
        from monitor.sources.mercadolivre import MercadoLivreSource

        source = MercadoLivreSource({}, self.ENV, db)
        calls = []

        def fake_refresh(token):
            calls.append(token)
            if token not in valid:
                raise HttpError("invalid_grant")
            return {"access_token": f"acc-{token}", "refresh_token": f"next-{token}"}

        source._refresh = fake_refresh
        return source, calls

    def test_rotates_and_stores_refresh_token(self):
        db = PriceDB(":memory:")
        source, _ = self.make(db, {"original"})
        self.assertEqual(source.access_token(), "acc-original")
        self.assertEqual(db.get_setting("mercadolivre_refresh_token"), "next-original")

        # próxima execução usa o token guardado, não o do secret (que já foi consumido)
        source, calls = self.make(db, {"next-original"})
        self.assertEqual(source.access_token(), "acc-next-original")
        self.assertEqual(calls, ["next-original"])

    def test_falls_back_to_env_token_and_reports_failure(self):
        db = PriceDB(":memory:")
        db.set_setting("mercadolivre_refresh_token", "velho")
        source, calls = self.make(db, {"original"})
        self.assertEqual(source.access_token(), "acc-original")
        self.assertEqual(calls, ["velho", "original"])

        source, _ = self.make(PriceDB(":memory:"), set())
        with self.assertRaises(RuntimeError):
            source.access_token()

    def test_access_token_env_skips_refresh(self):
        from monitor.sources import build_sources
        built = build_sources({}, {"ML_ACCESS_TOKEN": "tok"})
        self.assertEqual(built["mercadolivre"].access_token(), "tok")


class ConfigTest(unittest.TestCase):
    def test_shipped_config_is_valid(self):
        import tomllib
        with open(Path(__file__).parent.parent / "config.toml", "rb") as f:
            config = tomllib.load(f)
        Rules.from_dict(config["regras"])
        self.assertTrue(all("termo" in b for b in config["buscas"]))


if __name__ == "__main__":
    unittest.main()
