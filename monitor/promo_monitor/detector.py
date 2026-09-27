"""Regras que decidem se uma queda de preço é promoção de verdade."""

import statistics
from datetime import datetime, timedelta

from .config import Rules
from .models import Deal, Offer
from .storage import Storage


def passes_filters(offer: Offer, rules: Rules) -> bool:
    if offer.price <= 0 or offer.price < rules.min_price:
        return False
    if rules.max_price is not None and offer.price > rules.max_price:
        return False
    if rules.require_free_shipping and not offer.free_shipping:
        return False
    title = offer.title.lower()
    return not any(word.lower() in title for word in rules.exclude_words)


def evaluate(offer: Offer, storage: Storage, rules: Rules, now: datetime) -> Deal | None:
    """Compara o preço atual com o histórico (antes de salvar a coleta atual)."""
    if not passes_filters(offer, rules):
        return None

    recent = storage.history(offer.key, rules.history_days, now)
    if len(recent) >= rules.min_history:
        median = statistics.median(recent)
        discount = 1 - offer.price / median
        if discount >= rules.min_discount:
            return _deal(offer, median, discount, f"{discount:.0%} abaixo da mediana de {rules.history_days} dias")

        longer = storage.history(offer.key, rules.lowest_days, now)
        if offer.price < min(longer) and discount >= rules.lowest_min_discount:
            return _deal(offer, median, discount, f"menor preço dos últimos {rules.lowest_days} dias")
        return None

    # Sem histórico suficiente: só confia no "de/por" da loja se o usuário permitir.
    if rules.trust_listed_discount and offer.original_price and offer.original_price > offer.price:
        discount = 1 - offer.price / offer.original_price
        if discount >= rules.listed_min_discount:
            deal = _deal(offer, offer.original_price, discount, "desconto anunciado pela loja (sem histórico ainda)")
            deal.tags.append("nao-verificado")
            return deal
    return None


def should_alert(deal: Deal, storage: Storage, rules: Rules, now: datetime) -> bool:
    """Evita repetir o mesmo alerta: só avisa de novo se o preço cair mais ou o cooldown passar."""
    last = storage.last_alert(deal.offer.key)
    if last is None:
        return True
    last_price, sent_at = last
    if deal.offer.price <= last_price * (1 - rules.realert_drop):
        return True
    return now - sent_at >= timedelta(days=rules.realert_cooldown_days)


def _deal(offer: Offer, reference: float, discount: float, reason: str) -> Deal:
    tags = ["frete-gratis"] if offer.free_shipping else []
    return Deal(offer=offer, reference_price=reference, discount=discount, reason=reason, tags=tags)
