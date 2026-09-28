"""Shopee via Shopee Affiliate Open API (https://affiliate.shopee.com.br/open_api).

Credenciais (variáveis de ambiente): SHOPEE_APP_ID e SHOPEE_SECRET.
Os links retornados já são links de afiliado.
"""

import hashlib
import json
import os
import time
from collections.abc import Iterable

import requests

from ..models import MissingCredentials, Offer

API = os.environ.get("SHOPEE_API", "https://open-api.affiliate.shopee.com.br/graphql")
TIMEOUT = 20

QUERY = """
query ($keyword: String, $itemId: Int64, $limit: Int) {
  productOfferV2(keyword: $keyword, itemId: $itemId, limit: $limit) {
    nodes { itemId productName priceMin priceDiscountRate offerLink imageUrl sales }
  }
}
"""


def _request(app_id: str, secret: str, variables: dict) -> list[dict]:
    payload = json.dumps({"query": QUERY, "variables": variables}, separators=(",", ":"))
    timestamp = str(int(time.time()))
    signature = hashlib.sha256(f"{app_id}{timestamp}{payload}{secret}".encode()).hexdigest()
    resp = requests.post(
        API,
        data=payload,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"SHA256 Credential={app_id}, Timestamp={timestamp}, Signature={signature}",
        },
        timeout=TIMEOUT,
    )
    resp.raise_for_status()
    body = resp.json()
    if body.get("errors"):
        raise RuntimeError(f"Shopee: {body['errors']}")
    return body["data"]["productOfferV2"]["nodes"]


def _to_offer(node: dict, query: str | None) -> Offer:
    price = float(node["priceMin"])
    rate = float(node.get("priceDiscountRate") or 0)
    original = round(price / (1 - rate / 100), 2) if 0 < rate < 100 else None
    return Offer(
        source="shopee",
        item_id=str(node["itemId"]),
        title=node["productName"],
        price=price,
        original_price=original,
        url=node["offerLink"],
        sold_quantity=node.get("sales"),
        image=node.get("imageUrl"),
        query=query,
    )


def fetch(config) -> Iterable[Offer]:
    app_id, secret = os.environ.get("SHOPEE_APP_ID"), os.environ.get("SHOPEE_SECRET")
    if not (app_id and secret):
        raise MissingCredentials("defina SHOPEE_APP_ID e SHOPEE_SECRET")

    for query in config.queries:
        for node in _request(app_id, secret, {"keyword": query, "limit": min(config.limit_per_query, 50)}):
            yield _to_offer(node, query)

    for item_id in config.items.get("shopee", []):
        for node in _request(app_id, secret, {"itemId": int(item_id), "limit": 1}):
            yield _to_offer(node, None)
