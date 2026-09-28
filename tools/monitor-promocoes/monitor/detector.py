"""Decide se uma oferta é promoção de verdade e dá uma nota pra ela.

A regra central: o desconto é medido contra o histórico que o próprio monitor
coletou, nunca contra o "de R$" que a loja anuncia (que costuma ser maquiado).
"""

from __future__ import annotations

import math
from dataclasses import dataclass

from .models import Deal, Offer, PriceStats

DAY = 86400


@dataclass
class Rules:
    desconto_real_minimo: float = 0.15  # 15% abaixo do preço normal
    amostras_minimas: int = 6  # coletas nos últimos 30 dias antes de confiar no histórico
    dias_minimos_historico: float = 3.0
    tolerancia_menor_preco: float = 0.02  # até 2% acima do menor preço de 90 dias ainda conta
    nota_minima_loja: float = 4.0  # avaliação mínima do produto, quando a loja informa
    nota_minima: float = 20.0  # nota mínima da oferta pra ir pro canal
    dias_sem_repostar: int = 7
    queda_extra_pra_repostar: float = 0.05  # reposta antes do prazo se cair mais 5%
    preco_minimo: float = 20.0  # ignora produtos baratinhos demais

    @classmethod
    def from_dict(cls, data: dict) -> "Rules":
        known = {k: v for k, v in data.items() if k in cls.__dataclass_fields__}
        return cls(**known)


def evaluate(
    offer: Offer,
    stats: PriceStats,
    rules: Rules,
    now: int,
    last_post: tuple[int, float] | None = None,
    all_time_low: float | None = None,
) -> Deal | None:
    if offer.price < rules.preco_minimo:
        return None

    # Sem histórico suficiente não dá pra saber se é promoção de verdade.
    if (
        stats.samples_30d < rules.amostras_minimas
        or stats.history_days < rules.dias_minimos_historico
        or stats.median_30d is None
    ):
        return None

    if offer.rating is not None and offer.rating < rules.nota_minima_loja:
        return None

    # Usar o menor entre a mediana de 30 e de 90 dias protege contra o truque de
    # subir o preço umas semanas antes e depois "baixar".
    reference = min(stats.median_30d, stats.median_90d or stats.median_30d)
    real_discount = 1 - offer.price / reference
    if real_discount < rules.desconto_real_minimo:
        return None

    if last_post is not None:
        posted_ts, posted_price = last_post
        recent = now - posted_ts < rules.dias_sem_repostar * DAY
        much_cheaper = offer.price <= posted_price * (1 - rules.queda_extra_pra_repostar)
        if recent and not much_cheaper:
            return None

    reasons = [f"{real_discount:.0%} abaixo do preço normal (R$ {reference:.2f})"]
    is_new_low = (
        stats.min_90d is not None
        and offer.price <= stats.min_90d * (1 + rules.tolerancia_menor_preco)
    )
    is_all_time_low = all_time_low is not None and offer.price < all_time_low
    if is_all_time_low:
        reasons.append("menor preço já registrado")
    elif is_new_low:
        reasons.append("menor preço dos últimos 90 dias")

    inflated = offer.list_price is not None and offer.list_price > reference * 1.25
    if inflated:
        reasons.append(f"loja anuncia 'de R$ {offer.list_price:.2f}', valor inflado")

    score = real_discount * 100
    if is_all_time_low:
        score += 20
    elif is_new_low:
        score += 15
    if offer.free_shipping:
        score += 5
    if offer.rating is not None and offer.rating >= 4.5:
        score += 5
    if offer.sold:
        score += min(math.log10(offer.sold + 1), 4) * 2

    if score < rules.nota_minima:
        return None

    return Deal(
        offer=offer,
        reference_price=reference,
        real_discount=real_discount,
        score=round(score, 1),
        is_new_low=is_new_low,
        is_all_time_low=is_all_time_low,
        inflated_list_price=inflated,
        reasons=reasons,
    )
