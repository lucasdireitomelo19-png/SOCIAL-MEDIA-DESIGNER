"""Texto do post no canal (HTML do Telegram)."""

from __future__ import annotations

import html

from ..models import Deal

MAX_TITLE = 120
MAX_CAPTION = 1024  # limite de legenda de foto no Telegram


def brl(value: float) -> str:
    text = f"{value:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
    return f"R$ {text}"


def format_caption(deal: Deal, footer: str = "") -> str:
    offer = deal.offer
    title = offer.title if len(offer.title) <= MAX_TITLE else offer.title[: MAX_TITLE - 1] + "…"

    lines = [
        f"🔥 <b>{html.escape(title)}</b>",
        "",
        f"💸 <b>{brl(offer.price)}</b>  (-{deal.real_discount:.0%})",
        f"<i>Preço normal nas últimas semanas: {brl(deal.reference_price)}</i>",
    ]
    if deal.is_all_time_low:
        lines.append("📉 Menor preço que já vimos")
    elif deal.is_new_low:
        lines.append("📉 Menor preço dos últimos 90 dias")
    if offer.free_shipping:
        lines.append("🚚 Frete grátis")
    if offer.rating:
        lines.append(f"⭐ {offer.rating:.1f}".replace(".", ","))
    lines += [
        f"🏪 {html.escape(offer.store_name)}",
        "",
        f'👉 <a href="{html.escape(offer.url, quote=True)}">Ver oferta</a>',
    ]
    text = "\n".join(lines)
    if footer:
        with_footer = f"{text}\n\n{html.escape(footer)}"
        # cortar no meio quebraria as tags HTML; se estourar, sai o rodapé
        if len(with_footer) <= MAX_CAPTION:
            return with_footer
    return text
