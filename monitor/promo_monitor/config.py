import os
import tomllib
from dataclasses import dataclass, field
from pathlib import Path


@dataclass
class Rules:
    min_discount: float = 0.20
    history_days: int = 30
    lowest_days: int = 90
    lowest_min_discount: float = 0.10
    min_history: int = 5
    trust_listed_discount: bool = False
    listed_min_discount: float = 0.35
    realert_drop: float = 0.05
    realert_cooldown_days: int = 7
    min_price: float = 0.0
    max_price: float | None = None
    require_free_shipping: bool = False
    exclude_words: list[str] = field(default_factory=list)


@dataclass
class Config:
    queries: list[str]
    items: dict[str, list[str]]
    rules: Rules
    sources: list[str]
    notifiers: list[str]
    db_path: Path
    limit_per_query: int = 50


def load(path: str | Path) -> Config:
    path = Path(path)
    data = tomllib.loads(path.read_text(encoding="utf-8"))
    rules = Rules(**data.get("regras", {}))
    db_path = Path(os.environ.get("PROMO_DB", data.get("banco", "data/precos.db")))
    if not db_path.is_absolute():
        db_path = path.parent / db_path
    return Config(
        queries=data.get("buscas", []),
        items=data.get("itens", {}),
        rules=rules,
        sources=data.get("fontes", ["mercadolivre"]),
        notifiers=data.get("alertas", ["console"]),
        db_path=db_path,
        limit_per_query=data.get("limite_por_busca", 50),
    )
