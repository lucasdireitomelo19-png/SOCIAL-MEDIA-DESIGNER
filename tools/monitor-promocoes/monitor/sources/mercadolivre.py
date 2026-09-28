"""Mercado Livre via API oficial (site MLB).

Precisa de um app criado em developers.mercadolivre.com.br. O access token
expira a cada 6 horas, então o monitor renova sozinho com o refresh token
(ML_CLIENT_ID, ML_CLIENT_SECRET, ML_REFRESH_TOKEN). O refresh token só pode ser
usado uma vez: o novo fica guardado no banco. Pra um teste rápido dá pra passar
só ML_ACCESS_TOKEN. O link de afiliado é montado a partir do `link_afiliado` do
config.toml: pegue o formato exato no painel do Programa de Afiliados.
"""

from __future__ import annotations

import urllib.parse

from ..http import HttpError, request_json
from ..models import Offer
from .base import Source

API = "https://api.mercadolibre.com/sites/MLB/search"
TOKEN_URL = "https://api.mercadolibre.com/oauth/token"
REFRESH_KEY = "mercadolivre_refresh_token"


def affiliate_url(permalink: str, template: str | None) -> str:
    if not template:
        return permalink
    return template.replace("{url}", permalink).replace(
        "{url_codificada}", urllib.parse.quote(permalink, safe="")
    )


def parse_results(data: dict, template: str | None = None, term: str | None = None) -> list[Offer]:
    offers = []
    for item in data.get("results", []):
        if item.get("price") is None:
            continue
        image = item.get("thumbnail")
        if image:
            # a miniatura "-I" é minúscula; a "-O" é a versão grande
            image = image.replace("http://", "https://").replace("-I.jpg", "-O.jpg")
        offers.append(Offer(
            source="mercadolivre",
            product_id=item["id"],
            title=item.get("title", item["id"]),
            price=float(item["price"]),
            url=affiliate_url(item["permalink"], template),
            image_url=image,
            list_price=item.get("original_price"),
            sold=item.get("sold_quantity"),
            free_shipping=bool((item.get("shipping") or {}).get("free_shipping")),
            search_term=term,
        ))
    return offers


class MercadoLivreSource(Source):
    name = "mercadolivre"
    required_env = ("ML_CLIENT_ID", "ML_CLIENT_SECRET", "ML_REFRESH_TOKEN")

    def __init__(self, config: dict, env: dict[str, str], store=None):
        super().__init__(config, env, store)
        self._access_token = env.get("ML_ACCESS_TOKEN")

    @classmethod
    def missing_env(cls, env: dict[str, str]) -> list[str]:
        return [] if env.get("ML_ACCESS_TOKEN") else super().missing_env(env)

    def _refresh(self, refresh_token: str) -> dict:
        body = urllib.parse.urlencode({
            "grant_type": "refresh_token",
            "client_id": self.env["ML_CLIENT_ID"],
            "client_secret": self.env["ML_CLIENT_SECRET"],
            "refresh_token": refresh_token,
        }).encode("utf-8")
        return request_json(
            TOKEN_URL, "POST", {"Content-Type": "application/x-www-form-urlencoded"}, body
        )

    def access_token(self) -> str:
        if self._access_token:
            return self._access_token
        stored = self.store.get_setting(REFRESH_KEY) if self.store else None
        candidates = [t for t in (stored, self.env["ML_REFRESH_TOKEN"]) if t]
        last_error: Exception | None = None
        for refresh_token in dict.fromkeys(candidates):
            try:
                data = self._refresh(refresh_token)
            except HttpError as err:
                last_error = err
                continue
            if self.store:
                self.store.set_setting(REFRESH_KEY, data["refresh_token"])
            self._access_token = data["access_token"]
            return self._access_token
        raise RuntimeError(
            f"não consegui renovar o token (gere um novo ML_REFRESH_TOKEN): {last_error}"
        )

    def search(self, term: str, limit: int = 20) -> list[Offer]:
        query = urllib.parse.urlencode({"q": term, "limit": min(limit, 50)})
        data = request_json(
            f"{API}?{query}",
            headers={"Authorization": f"Bearer {self.access_token()}"},
        )
        return parse_results(data, self.config.get("link_afiliado"), term)
