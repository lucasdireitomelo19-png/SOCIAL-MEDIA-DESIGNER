"""Shopee via Shopee Affiliate Open API (GraphQL).

Precisa de AppId e Secret do painel de afiliados (affiliate.shopee.com.br >
Open API). O `offerLink` devolvido já é o link de afiliado.
"""

from __future__ import annotations

import hashlib
import json
import time

from ..http import request_json
from ..models import Offer
from .base import Source

API = "https://open-api.affiliate.shopee.com.br/graphql"

QUERY = """{
  productOfferV2(keyword: %s, sortType: 2, page: 1, limit: %d) {
    nodes {
      itemId productName priceMin priceDiscountRate imageUrl offerLink
      ratingStar sales
    }
  }
}"""


def auth_header(app_id: str, secret: str, payload: str, timestamp: int) -> str:
    signature = hashlib.sha256(f"{app_id}{timestamp}{payload}{secret}".encode("utf-8")).hexdigest()
    return f"SHA256 Credential={app_id}, Timestamp={timestamp}, Signature={signature}"


def parse_nodes(data: dict, term: str | None = None) -> list[Offer]:
    if data.get("errors"):
        raise RuntimeError(f"Shopee: {data['errors']}")
    nodes = ((data.get("data") or {}).get("productOfferV2") or {}).get("nodes") or []
    offers = []
    for node in nodes:
        price = float(node["priceMin"])
        rate = node.get("priceDiscountRate") or 0
        offers.append(Offer(
            source="shopee",
            product_id=str(node["itemId"]),
            title=node.get("productName", str(node["itemId"])),
            price=price,
            url=node["offerLink"],
            image_url=node.get("imageUrl"),
            list_price=round(price / (1 - rate / 100), 2) if 0 < rate < 100 else None,
            rating=float(node["ratingStar"]) if node.get("ratingStar") else None,
            sold=node.get("sales"),
            search_term=term,
        ))
    return offers


class ShopeeSource(Source):
    name = "shopee"
    required_env = ("SHOPEE_APP_ID", "SHOPEE_SECRET")

    def search(self, term: str, limit: int = 20) -> list[Offer]:
        payload = json.dumps({"query": QUERY % (json.dumps(term), min(limit, 50))})
        headers = {
            "Content-Type": "application/json",
            "Authorization": auth_header(
                self.env["SHOPEE_APP_ID"], self.env["SHOPEE_SECRET"], payload, int(time.time())
            ),
        }
        data = request_json(API, "POST", headers, payload.encode("utf-8"))
        return parse_nodes(data, term)
