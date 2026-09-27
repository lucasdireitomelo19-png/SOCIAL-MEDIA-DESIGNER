"""Mercado Livre via API oficial (https://developers.mercadolivre.com.br).

Credenciais (variáveis de ambiente):
  ML_ACCESS_TOKEN                   token pronto, ou
  ML_CLIENT_ID + ML_CLIENT_SECRET   para gerar um token de app automaticamente.
"""

import os
from collections.abc import Iterable

import requests

from ..models import MissingCredentials, Offer

API = "https://api.mercadolibre.com"
SITE = os.environ.get("ML_SITE", "MLB")
TIMEOUT = 20


def _token(session: requests.Session) -> str:
    token = os.environ.get("ML_ACCESS_TOKEN")
    if token:
        return token
    client_id, secret = os.environ.get("ML_CLIENT_ID"), os.environ.get("ML_CLIENT_SECRET")
    if not (client_id and secret):
        raise MissingCredentials("defina ML_ACCESS_TOKEN ou ML_CLIENT_ID + ML_CLIENT_SECRET")
    resp = session.post(
        f"{API}/oauth/token",
        data={"grant_type": "client_credentials", "client_id": client_id, "client_secret": secret},
        timeout=TIMEOUT,
    )
    resp.raise_for_status()
    return resp.json()["access_token"]


def _to_offer(data: dict, query: str | None) -> Offer:
    shipping = data.get("shipping") or {}
    return Offer(
        source="mercadolivre",
        item_id=data["id"],
        title=data["title"],
        price=float(data["price"]),
        original_price=float(data["original_price"]) if data.get("original_price") else None,
        url=data["permalink"],
        free_shipping=bool(shipping.get("free_shipping")),
        sold_quantity=data.get("sold_quantity"),
        image=data.get("thumbnail"),
        query=query,
    )


def fetch(config) -> Iterable[Offer]:
    session = requests.Session()
    session.headers["Authorization"] = f"Bearer {_token(session)}"

    for query in config.queries:
        resp = session.get(
            f"{API}/sites/{SITE}/search",
            params={"q": query, "limit": min(config.limit_per_query, 50)},
            timeout=TIMEOUT,
        )
        resp.raise_for_status()
        for result in resp.json().get("results", []):
            if result.get("price"):
                yield _to_offer(result, query)

    ids = config.items.get("mercadolivre", [])
    for start in range(0, len(ids), 20):
        resp = session.get(f"{API}/items", params={"ids": ",".join(ids[start:start + 20])}, timeout=TIMEOUT)
        resp.raise_for_status()
        for entry in resp.json():
            body = entry.get("body") or {}
            if entry.get("code") == 200 and body.get("price") and body.get("status", "active") == "active":
                yield _to_offer(body, None)
