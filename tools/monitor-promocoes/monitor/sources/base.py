from __future__ import annotations

from ..models import Offer


class Source:
    name = ""
    required_env: tuple[str, ...] = ()

    def __init__(self, config: dict, env: dict[str, str], store=None):
        self.config = config
        self.env = env
        self.store = store  # PriceDB, pra guardar tokens que a loja renova

    @classmethod
    def missing_env(cls, env: dict[str, str]) -> list[str]:
        return [var for var in cls.required_env if not env.get(var)]

    def search(self, term: str, limit: int = 20) -> list[Offer]:
        raise NotImplementedError
