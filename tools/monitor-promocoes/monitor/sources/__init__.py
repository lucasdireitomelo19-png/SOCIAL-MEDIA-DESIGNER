"""Coletores: cada loja vira uma classe com `search(termo) -> list[Offer]`.

As credenciais vêm de variáveis de ambiente (no GitHub, de Secrets). Uma loja
sem credencial fica desligada e o monitor segue com as outras.
"""

from __future__ import annotations

import os

from .amazon import AmazonSource
from .base import Source
from .mercadolivre import MercadoLivreSource
from .shopee import ShopeeSource

SOURCE_CLASSES: dict[str, type[Source]] = {
    "amazon": AmazonSource,
    "mercadolivre": MercadoLivreSource,
    "shopee": ShopeeSource,
}


def build_sources(config: dict, env: dict[str, str] | None = None, store=None) -> dict[str, Source]:
    env = dict(os.environ) if env is None else env
    sources: dict[str, Source] = {}
    for name, cls in SOURCE_CLASSES.items():
        section = config.get(name, {})
        if not section.get("ativo", True):
            continue
        missing = cls.missing_env(env)
        if missing:
            print(f"[{name}] desligada: faltam as variáveis {', '.join(missing)}")
            continue
        sources[name] = cls(section, env, store)
    return sources


__all__ = ["Source", "build_sources", "SOURCE_CLASSES"]
