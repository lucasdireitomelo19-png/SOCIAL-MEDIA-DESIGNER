"""Estruturas de dados compartilhadas entre coletores, banco, detector e publicadores."""

from __future__ import annotations

from dataclasses import dataclass, field

LOJAS = {
    "amazon": "Amazon",
    "mercadolivre": "Mercado Livre",
    "shopee": "Shopee",
    "demo": "Loja Demo",
}


@dataclass
class Offer:
    """Um produto como veio da loja, já no formato comum."""

    source: str  # "amazon", "mercadolivre", "shopee"
    product_id: str
    title: str
    price: float
    url: str  # link de afiliado (é o que vai pro canal)
    image_url: str | None = None
    list_price: float | None = None  # o "de R$" que a própria loja anuncia
    rating: float | None = None
    sold: int | None = None
    free_shipping: bool = False
    search_term: str | None = None

    @property
    def key(self) -> str:
        return f"{self.source}:{self.product_id}"

    @property
    def store_name(self) -> str:
        return LOJAS.get(self.source, self.source)


@dataclass
class PriceStats:
    """Resumo do histórico de preço de um produto (sem contar a coleta atual)."""

    samples_30d: int
    history_days: float
    median_30d: float | None
    median_90d: float | None
    min_90d: float | None


@dataclass
class Deal:
    """Uma oferta aprovada pelo detector, pronta pra publicar."""

    offer: Offer
    reference_price: float  # preço "normal" calculado pelo histórico
    real_discount: float  # 0.25 = 25% abaixo do preço normal
    score: float
    is_new_low: bool = False  # menor preço dos últimos 90 dias
    is_all_time_low: bool = False  # menor preço já registrado
    inflated_list_price: bool = False  # loja anuncia um "de R$" maquiado
    reasons: list[str] = field(default_factory=list)
