"""Mostra os posts no terminal em vez de publicar (modo --teste e demo)."""

from __future__ import annotations

import html
import re

from ..models import Deal
from .format import format_caption


class ConsolePublisher:
    def __init__(self, footer: str = ""):
        self.footer = footer
        self.published: list[Deal] = []

    def publish(self, deal: Deal) -> None:
        text = html.unescape(re.sub(r"<[^>]+>", "", format_caption(deal, self.footer)))
        print("─" * 60)
        print(text)
        print(f"   link: {deal.offer.url}")
        print(f"   nota {deal.score} · {' · '.join(deal.reasons)}")
        self.published.append(deal)
