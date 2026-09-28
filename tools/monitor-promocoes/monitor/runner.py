"""Uma execução do monitor: coleta, registra histórico, detecta e publica."""

from __future__ import annotations

from typing import Protocol

from .db import PriceDB
from .detector import Rules, evaluate
from .models import Deal, Offer
from .sources import Source


class Publisher(Protocol):
    def publish(self, deal: Deal) -> None: ...


def collect(sources: dict[str, Source], searches: list[dict], limit: int) -> list[Offer]:
    """Roda todas as buscas em todas as lojas. Uma loja com erro não derruba as outras."""
    seen: dict[str, Offer] = {}
    for search in searches:
        term = search["termo"]
        stores = search.get("lojas") or list(sources)
        max_price = search.get("preco_maximo")
        for store in stores:
            source = sources.get(store)
            if source is None:
                continue
            try:
                offers = source.search(term, limit)
            except Exception as err:  # noqa: BLE001 - loja fora do ar não pode parar o resto
                print(f"[{store}] erro buscando '{term}': {err}")
                continue
            for offer in offers:
                if max_price and offer.price > max_price:
                    continue
                seen.setdefault(offer.key, offer)
            print(f"[{store}] '{term}': {len(offers)} produtos")
    return list(seen.values())


def process(
    offers: list[Offer],
    db: PriceDB,
    rules: Rules,
    now: int,
) -> list[Deal]:
    """Compara cada oferta com o histórico e depois grava o preço atual."""
    deals = []
    for offer in offers:
        deal = evaluate(
            offer,
            db.stats(offer.key, now),
            rules,
            now,
            last_post=db.last_post(offer.key),
            all_time_low=db.all_time_low(offer.key, now),
        )
        db.record(offer, now)
        if deal:
            deals.append(deal)
    db.conn.commit()
    deals.sort(key=lambda d: d.score, reverse=True)
    return deals


def publish(
    deals: list[Deal],
    publisher: Publisher,
    db: PriceDB,
    now: int,
    max_posts: int,
    mark_posted: bool = True,
) -> int:
    count = 0
    for deal in deals[:max_posts]:
        try:
            publisher.publish(deal)
        except Exception as err:  # noqa: BLE001
            print(f"[publicar] falhou para {deal.offer.key}: {err}")
            continue
        if mark_posted:
            db.mark_posted(deal.offer, now)
        count += 1
    return count
