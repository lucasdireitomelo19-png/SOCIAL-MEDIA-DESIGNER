import sqlite3
from datetime import datetime, timedelta, timezone
from pathlib import Path

from .models import Offer

SCHEMA = """
CREATE TABLE IF NOT EXISTS precos (
    chave TEXT NOT NULL,
    titulo TEXT NOT NULL,
    preco REAL NOT NULL,
    preco_original REAL,
    link TEXT NOT NULL,
    coletado_em TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_precos_chave ON precos (chave, coletado_em);
CREATE TABLE IF NOT EXISTS alertas (
    chave TEXT PRIMARY KEY,
    preco REAL NOT NULL,
    enviado_em TEXT NOT NULL
);
"""


def _iso(dt: datetime) -> str:
    return dt.astimezone(timezone.utc).isoformat(timespec="seconds")


class Storage:
    def __init__(self, path: str | Path):
        if str(path) != ":memory:":
            Path(path).parent.mkdir(parents=True, exist_ok=True)
        self.db = sqlite3.connect(str(path))
        self.db.executescript(SCHEMA)

    def history(self, key: str, days: int, now: datetime) -> list[float]:
        since = _iso(now - timedelta(days=days))
        rows = self.db.execute(
            "SELECT preco FROM precos WHERE chave = ? AND coletado_em >= ?", (key, since)
        )
        return [price for (price,) in rows]

    def save(self, offer: Offer, now: datetime) -> None:
        self.db.execute(
            "INSERT INTO precos VALUES (?, ?, ?, ?, ?, ?)",
            (offer.key, offer.title, offer.price, offer.original_price, offer.url, _iso(now)),
        )

    def last_alert(self, key: str) -> tuple[float, datetime] | None:
        row = self.db.execute(
            "SELECT preco, enviado_em FROM alertas WHERE chave = ?", (key,)
        ).fetchone()
        if row is None:
            return None
        return row[0], datetime.fromisoformat(row[1])

    def mark_alerted(self, key: str, price: float, now: datetime) -> None:
        self.db.execute(
            "INSERT INTO alertas VALUES (?, ?, ?) "
            "ON CONFLICT(chave) DO UPDATE SET preco = excluded.preco, enviado_em = excluded.enviado_em",
            (key, price, _iso(now)),
        )

    def prune(self, keep_days: int, now: datetime) -> None:
        self.db.execute("DELETE FROM precos WHERE coletado_em < ?", (_iso(now - timedelta(days=keep_days)),))

    def commit(self) -> None:
        self.db.commit()

    def close(self) -> None:
        self.db.close()
