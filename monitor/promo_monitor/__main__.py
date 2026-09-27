"""Uso: python -m promo_monitor [--config config.toml] [--dry-run]"""

import argparse
import logging
import sys
from datetime import datetime, timezone
from pathlib import Path

import requests

from . import config as config_mod
from .detector import evaluate, should_alert
from .models import MissingCredentials
from .notifier import NOTIFIERS, format_deal
from .sources import SOURCES
from .storage import Storage

log = logging.getLogger("promo_monitor")


def run(cfg: config_mod.Config, storage: Storage, notifiers: list[str], dry_run: bool, now: datetime) -> int:
    seen: set[str] = set()
    deals = alerts = failures = 0

    for name in cfg.sources:
        source = SOURCES.get(name)
        if source is None:
            log.error("fonte desconhecida: %s", name)
            failures += 1
            continue
        try:
            for offer in source.fetch(cfg):
                if offer.key in seen:
                    continue
                seen.add(offer.key)

                deal = evaluate(offer, storage, cfg.rules, now)
                storage.save(offer, now)
                if deal is None:
                    continue
                deals += 1
                if not should_alert(deal, storage, cfg.rules, now):
                    continue

                text = format_deal(deal)
                for channel in notifiers:
                    try:
                        NOTIFIERS[channel](text, deal)
                    except (requests.RequestException, KeyError) as exc:
                        log.error("falha ao alertar via %s: %s", channel, exc)
                if not dry_run:
                    storage.mark_alerted(offer.key, offer.price, now)
                alerts += 1
        except MissingCredentials as exc:
            log.warning("%s ignorado: %s", name, exc)
        except requests.RequestException as exc:
            log.error("erro ao consultar %s: %s", name, exc)
            failures += 1
        storage.commit()

    storage.prune(cfg.rules.lowest_days + 1, now)
    storage.commit()
    log.info("%d produtos coletados, %d promoções, %d alertas enviados", len(seen), deals, alerts)
    return failures


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Monitor de promoções em marketplaces")
    parser.add_argument("--config", default=Path(__file__).resolve().parent.parent / "config.toml")
    parser.add_argument("--dry-run", action="store_true", help="só imprime os alertas, sem enviar nem marcar")
    args = parser.parse_args(argv)

    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
    cfg = config_mod.load(args.config)

    unknown = [n for n in cfg.notifiers if n not in NOTIFIERS]
    if unknown:
        parser.error(f"canal de alerta desconhecido: {', '.join(unknown)}")
    notifiers = ["console"] if args.dry_run else cfg.notifiers

    storage = Storage(cfg.db_path)
    try:
        failures = run(cfg, storage, notifiers, args.dry_run, datetime.now(timezone.utc))
    finally:
        storage.close()
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
