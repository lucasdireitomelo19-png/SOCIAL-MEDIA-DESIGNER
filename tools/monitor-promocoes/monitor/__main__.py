"""Uso:

    python -m monitor rodar  --config config.toml          # coleta e publica no Telegram
    python -m monitor rodar  --config config.toml --teste  # coleta e só mostra no terminal
    python -m monitor demo                                 # simulação offline
"""

from __future__ import annotations

import argparse
import os
import sys
import time
import tomllib
from pathlib import Path

from .db import PriceDB
from .demo import run_demo
from .detector import Rules
from .publishers import ConsolePublisher, TelegramPublisher
from .runner import collect, process, publish
from .sources import build_sources


def cmd_run(config_path: Path, dry_run: bool) -> int:
    with open(config_path, "rb") as f:
        config = tomllib.load(f)

    canal = config.get("canal", {})
    footer = canal.get("rodape", "")
    if dry_run:
        publisher = ConsolePublisher(footer)
    else:
        token = os.environ.get("TELEGRAM_BOT_TOKEN")
        chat_id = os.environ.get("TELEGRAM_CHAT_ID") or canal.get("chat_id")
        if not token or not chat_id:
            print("Faltam TELEGRAM_BOT_TOKEN e/ou o chat_id do canal. Use --teste pra rodar sem publicar.")
            return 1
        publisher = TelegramPublisher(token, chat_id, footer)

    db_path = config_path.parent / config.get("banco", {}).get("caminho", "data/precos.sqlite3")
    db = PriceDB(db_path)
    now = int(time.time())
    try:
        sources = build_sources(config, store=db)
        if not sources:
            print("Nenhuma loja com credenciais configuradas. Veja o README.")
            return 1
        offers = collect(sources, config.get("buscas", []), canal.get("produtos_por_busca", 20))
        deals = process(offers, db, Rules.from_dict(config.get("regras", {})), now)
        print(f"{len(offers)} produtos coletados, {len(deals)} promoções aprovadas")
        posted = publish(
            deals, publisher, db, now, canal.get("max_posts_por_execucao", 5),
            mark_posted=not dry_run,  # no teste não marca, pra não bloquear o post de verdade
        )
        print(f"{posted} publicadas")
        db.prune(now)
    finally:
        db.close()
    return 0


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="monitor", description="Monitor de promoções")
    sub = parser.add_subparsers(dest="cmd", required=True)
    run = sub.add_parser("rodar", help="coleta, detecta e publica")
    run.add_argument("--config", type=Path, default=Path("config.toml"))
    run.add_argument("--teste", action="store_true", help="mostra no terminal em vez de publicar")
    sub.add_parser("demo", help="simulação offline com dados de exemplo")
    args = parser.parse_args(argv)

    if args.cmd == "demo":
        run_demo()
        return 0
    return cmd_run(args.config, args.teste)


if __name__ == "__main__":
    sys.exit(main())
