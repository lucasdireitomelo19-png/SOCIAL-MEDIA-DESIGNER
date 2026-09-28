"""Amazon Brasil via Product Advertising API 5.0 (programa Associados).

Precisa de conta de Associado com acesso à API liberado (a Amazon só libera
depois das primeiras vendas qualificadas). A requisição é assinada com AWS
Signature V4; o `DetailPageURL` devolvido já carrega a sua tag de afiliado.
"""

from __future__ import annotations

import datetime as dt
import hashlib
import hmac
import json

from ..http import request_json
from ..models import Offer
from .base import Source

HOST = "webservices.amazon.com.br"
REGION = "us-east-1"
SERVICE = "ProductAdvertisingAPI"
PATH = "/paapi5/searchitems"
TARGET = "com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems"

RESOURCES = [
    "ItemInfo.Title",
    "Images.Primary.Large",
    "Offers.Listings.Price",
    "Offers.Listings.SavingBasis",
    "Offers.Listings.DeliveryInfo.IsFreeShippingEligible",
]


def _hmac(key: bytes, msg: str) -> bytes:
    return hmac.new(key, msg.encode("utf-8"), hashlib.sha256).digest()


def sign_headers(access_key: str, secret_key: str, payload: str, now: dt.datetime) -> dict[str, str]:
    amz_date = now.strftime("%Y%m%dT%H%M%SZ")
    date = now.strftime("%Y%m%d")
    headers = {
        "content-encoding": "amz-1.0",
        "content-type": "application/json; charset=utf-8",
        "host": HOST,
        "x-amz-date": amz_date,
        "x-amz-target": TARGET,
    }
    signed = ";".join(sorted(headers))
    canonical = "\n".join([
        "POST",
        PATH,
        "",
        "".join(f"{k}:{headers[k]}\n" for k in sorted(headers)),
        signed,
        hashlib.sha256(payload.encode("utf-8")).hexdigest(),
    ])
    scope = f"{date}/{REGION}/{SERVICE}/aws4_request"
    to_sign = "\n".join([
        "AWS4-HMAC-SHA256",
        amz_date,
        scope,
        hashlib.sha256(canonical.encode("utf-8")).hexdigest(),
    ])
    key = _hmac(_hmac(_hmac(_hmac(f"AWS4{secret_key}".encode(), date), REGION), SERVICE), "aws4_request")
    signature = hmac.new(key, to_sign.encode("utf-8"), hashlib.sha256).hexdigest()
    headers["Authorization"] = (
        f"AWS4-HMAC-SHA256 Credential={access_key}/{scope}, "
        f"SignedHeaders={signed}, Signature={signature}"
    )
    return headers


def parse_items(data: dict, term: str | None = None) -> list[Offer]:
    offers = []
    for item in data.get("SearchResult", {}).get("Items", []):
        listings = item.get("Offers", {}).get("Listings") or []
        if not listings or "Price" not in listings[0]:
            continue
        listing = listings[0]
        offers.append(Offer(
            source="amazon",
            product_id=item["ASIN"],
            title=item.get("ItemInfo", {}).get("Title", {}).get("DisplayValue", item["ASIN"]),
            price=float(listing["Price"]["Amount"]),
            url=item["DetailPageURL"],
            image_url=item.get("Images", {}).get("Primary", {}).get("Large", {}).get("URL"),
            list_price=(listing.get("SavingBasis") or {}).get("Amount"),
            free_shipping=bool(
                (listing.get("DeliveryInfo") or {}).get("IsFreeShippingEligible")
            ),
            search_term=term,
        ))
    return offers


class AmazonSource(Source):
    name = "amazon"
    required_env = ("AMAZON_ACCESS_KEY", "AMAZON_SECRET_KEY", "AMAZON_PARTNER_TAG")

    def search(self, term: str, limit: int = 10) -> list[Offer]:
        payload = json.dumps({
            "Keywords": term,
            "PartnerTag": self.env["AMAZON_PARTNER_TAG"],
            "PartnerType": "Associates",
            "Marketplace": "www.amazon.com.br",
            "ItemCount": min(limit, 10),  # limite da API
            "Resources": RESOURCES,
        })
        headers = sign_headers(
            self.env["AMAZON_ACCESS_KEY"],
            self.env["AMAZON_SECRET_KEY"],
            payload,
            dt.datetime.now(dt.timezone.utc),
        )
        data = request_json(f"https://{HOST}{PATH}", "POST", headers, payload.encode("utf-8"))
        return parse_items(data, term)
