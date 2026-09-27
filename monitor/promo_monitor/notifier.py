"""Canais de alerta. Cada canal recebe a mensagem já formatada."""

import os

import requests

from .models import Deal

SOURCE_NAMES = {"mercadolivre": "Mercado Livre", "shopee": "Shopee"}


def brl(value: float) -> str:
    return f"R$ {value:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")


def format_deal(deal: Deal) -> str:
    offer = deal.offer
    lines = [
        f"🔥 {offer.title}",
        "",
        f"De {brl(deal.reference_price)} por {brl(offer.price)} (-{deal.discount:.0%})",
        f"🛒 {SOURCE_NAMES.get(offer.source, offer.source)} · {deal.reason}",
    ]
    if "frete-gratis" in deal.tags:
        lines.append("🚚 Frete grátis")
    if "nao-verificado" in deal.tags:
        lines.append("⚠️ Desconto anunciado pela loja, ainda sem histórico para confirmar")
    lines += ["", offer.url]
    return "\n".join(lines)


def console(text: str, deal: Deal) -> None:
    print(text, end="\n\n" + "-" * 40 + "\n")


def telegram(text: str, deal: Deal) -> None:
    token, chat = os.environ["TELEGRAM_BOT_TOKEN"], os.environ["TELEGRAM_CHAT_ID"]
    resp = requests.post(
        f"https://api.telegram.org/bot{token}/sendMessage",
        data={"chat_id": chat, "text": text},
        timeout=20,
    )
    resp.raise_for_status()


def discord(text: str, deal: Deal) -> None:
    resp = requests.post(os.environ["DISCORD_WEBHOOK_URL"], json={"content": text[:2000]}, timeout=20)
    resp.raise_for_status()


NOTIFIERS = {"console": console, "telegram": telegram, "discord": discord}
