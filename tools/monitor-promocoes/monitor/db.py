"""Histórico de preços e de publicações em SQLite."""

from __future__ import annotations

import sqlite3
import statistics
from pathlib import Path

from .models import Offer, PriceStats

DAY = 86400

SCHEMA = """
CREATE TABLE IF NOT EXISTS products (
    key TEXT PRIMARY KEY,
    source TEXT NOT NULL,
    product_id TEXT NOT NULL,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    image_url TEXT,
    first_seen INTEGER NOT NULL,
    last_seen INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS prices (
    key TEXT NOT NULL,
    ts INTEGER NOT NULL,
    price REAL NOT NULL
);
CREATE INDEX IF NOT EXISTS prices_key_ts ON prices (key, ts);
CREATE TABLE IF NOT EXISTS posts (
    key TEXT NOT NULL,
    ts INTEGER NOT NULL,
    price REAL NOT NULL
);
CREATE INDEX IF NOT EXISTS posts_key_ts ON posts (key, ts);
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);
"""


class PriceDB:
    def __init__(self, path: str | Path):
        if str(path) != ":memory:":
            Path(path).parent.mkdir(parents=True, exist_ok=True)
        self.conn = sqlite3.connect(str(path))
        self.conn.executescript(SCHEMA)

    def close(self) -> None:
        self.conn.commit()
        self.conn.close()

    def record(self, offer: Offer, ts: int) -> None:
        self.conn.execute(
            """
            INSERT INTO products (key, source, product_id, title, url, image_url, first_seen, last_seen)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT (key) DO UPDATE SET
                title = excluded.title, url = excluded.url,
                image_url = COALESCE(excluded.image_url, products.image_url),
                last_seen = excluded.last_seen
            """,
            (offer.key, offer.source, offer.product_id, offer.title, offer.url,
             offer.image_url, ts, ts),
        )
        self.conn.execute(
            "INSERT INTO prices (key, ts, price) VALUES (?, ?, ?)", (offer.key, ts, offer.price)
        )

    def stats(self, key: str, now: int) -> PriceStats:
        rows = self.conn.execute(
            "SELECT ts, price FROM prices WHERE key = ? AND ts >= ? AND ts < ?",
            (key, now - 90 * DAY, now),
        ).fetchall()
        first = self.conn.execute(
            "SELECT MIN(ts) FROM prices WHERE key = ? AND ts < ?", (key, now)
        ).fetchone()[0]
        p90 = [p for _, p in rows]
        p30 = [p for ts, p in rows if ts >= now - 30 * DAY]
        return PriceStats(
            samples_30d=len(p30),
            history_days=(now - first) / DAY if first is not None else 0.0,
            median_30d=statistics.median(p30) if p30 else None,
            median_90d=statistics.median(p90) if p90 else None,
            min_90d=min(p90) if p90 else None,
        )

    def all_time_low(self, key: str, now: int) -> float | None:
        return self.conn.execute(
            "SELECT MIN(price) FROM prices WHERE key = ? AND ts < ?", (key, now)
        ).fetchone()[0]

    def last_post(self, key: str) -> tuple[int, float] | None:
        row = self.conn.execute(
            "SELECT ts, price FROM posts WHERE key = ? ORDER BY ts DESC LIMIT 1", (key,)
        ).fetchone()
        return (row[0], row[1]) if row else None

    def mark_posted(self, offer: Offer, ts: int) -> None:
        self.conn.execute(
            "INSERT INTO posts (key, ts, price) VALUES (?, ?, ?)", (offer.key, ts, offer.price)
        )
        self.conn.commit()

    def get_setting(self, key: str) -> str | None:
        row = self.conn.execute("SELECT value FROM settings WHERE key = ?", (key,)).fetchone()
        return row[0] if row else None

    def set_setting(self, key: str, value: str) -> None:
        self.conn.execute(
            "INSERT INTO settings (key, value) VALUES (?, ?) "
            "ON CONFLICT (key) DO UPDATE SET value = excluded.value",
            (key, value),
        )
        self.conn.commit()

    def prune(self, now: int, keep_days: int = 180) -> None:
        """Apaga preços antigos pra o banco não crescer sem limite."""
        self.conn.execute("DELETE FROM prices WHERE ts < ?", (now - keep_days * DAY,))
        self.conn.commit()
