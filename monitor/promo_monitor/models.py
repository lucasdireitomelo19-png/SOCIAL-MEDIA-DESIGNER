from dataclasses import dataclass, field


class MissingCredentials(RuntimeError):
    """A fonte não tem as variáveis de ambiente necessárias."""


@dataclass
class Offer:
    """Um produto coletado de um marketplace num dado momento."""

    source: str
    item_id: str
    title: str
    price: float
    url: str
    original_price: float | None = None
    free_shipping: bool = False
    sold_quantity: int | None = None
    image: str | None = None
    query: str | None = None

    @property
    def key(self) -> str:
        return f"{self.source}:{self.item_id}"


@dataclass
class Deal:
    """Uma promoção detectada, pronta para alertar."""

    offer: Offer
    reference_price: float
    discount: float
    reason: str
    tags: list[str] = field(default_factory=list)
