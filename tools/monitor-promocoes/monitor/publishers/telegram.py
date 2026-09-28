"""Publica no canal do Telegram via Bot API.

Crie o bot no @BotFather, adicione ele como administrador do canal e use o
@ do canal (ou o id numérico) como chat_id.
"""

from __future__ import annotations

import time
import urllib.parse

from ..http import HttpError, request_json
from ..models import Deal
from .format import format_caption


class TelegramPublisher:
    def __init__(self, token: str, chat_id: str, footer: str = "", pause_seconds: float = 3.0):
        self.base = f"https://api.telegram.org/bot{token}"
        self.chat_id = chat_id
        self.footer = footer
        self.pause_seconds = pause_seconds  # o Telegram limita ~20 mensagens/min por canal

    def _call(self, method: str, params: dict) -> dict:
        body = urllib.parse.urlencode(params).encode("utf-8")
        return request_json(
            f"{self.base}/{method}",
            "POST",
            {"Content-Type": "application/x-www-form-urlencoded"},
            body,
        )

    def publish(self, deal: Deal) -> None:
        caption = format_caption(deal, self.footer)
        sent = False
        if deal.offer.image_url:
            try:
                self._call("sendPhoto", {
                    "chat_id": self.chat_id,
                    "photo": deal.offer.image_url,
                    "caption": caption,
                    "parse_mode": "HTML",
                })
                sent = True
            except HttpError as err:
                print(f"[telegram] foto falhou, mandando só texto: {err}")
        if not sent:
            self._call("sendMessage", {
                "chat_id": self.chat_id,
                "text": caption,
                "parse_mode": "HTML",
            })
        time.sleep(self.pause_seconds)
