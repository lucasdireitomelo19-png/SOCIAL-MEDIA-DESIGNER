"""Demonstração offline: simula 30 dias de histórico e mostra o que iria pro canal.

Não chama nenhuma loja nem o Telegram. Serve pra ver as regras funcionando.
"""

from __future__ import annotations

import random
import time

from .db import DAY, PriceDB
from .detector import Rules
from .models import Offer
from .publishers import ConsolePublisher
from .runner import process, publish


def _offer(pid: str, title: str, price: float, **extra) -> Offer:
    return Offer(
        source="demo",
        product_id=pid,
        title=title,
        price=price,
        url=f"https://exemplo.com/produto/{pid}?afiliado=seutag",
        **extra,
    )


# (id, título, preço normal, preço de hoje, extras)
CATALOG = [
    ("fryer", "Air Fryer 4L Antiaderente 1500W", 399.90, 269.90,
     {"free_shipping": True, "rating": 4.7, "sold": 5400}),
    ("fone", "Fone Bluetooth com Cancelamento de Ruído", 249.90, 239.90,
     {"rating": 4.4}),  # desconto pequeno: não passa
    ("smartwatch", "Smartwatch Tela AMOLED 1.43\"", 299.00, 219.00,
     {"list_price": 699.00, "rating": 4.5, "sold": 900}),  # "de R$" inflado pela loja
    ("cadeira", "Cadeira Gamer Reclinável", 899.00, 599.00,
     {"rating": 3.6}),  # avaliação ruim: não passa
]


def run_demo() -> None:
    rng = random.Random(42)
    db = PriceDB(":memory:")
    now = int(time.time())

    for day in range(30, 0, -1):
        for pid, title, normal, _, extra in CATALOG:
            noisy = round(normal * rng.uniform(0.97, 1.03), 2)
            db.record(_offer(pid, title, noisy, **extra), now - day * DAY)

    today = [_offer(pid, title, price, **extra) for pid, title, _, price, extra in CATALOG]
    deals = process(today, db, Rules(), now)
    print(f"{len(today)} produtos coletados, {len(deals)} aprovados pelo detector\n")
    publish(deals, ConsolePublisher("Links de afiliado: você não paga nada a mais e apoia o canal."),
            db, now, max_posts=5)
