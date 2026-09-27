"""Fontes de dados. Cada fonte expõe `fetch(config) -> Iterable[Offer]`."""

from . import mercadolivre, shopee

SOURCES = {
    "mercadolivre": mercadolivre,
    "shopee": shopee,
}

