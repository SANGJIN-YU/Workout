"""SQLite storage for watch conditions and seen items.

MVP scope only: one platform, two condition fields (keyword + max_price).
PostgreSQL migration is a Phase-1 concern, not handled here.
"""
import sqlite3
from contextlib import contextmanager
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Iterator, Optional

SCHEMA = """
CREATE TABLE IF NOT EXISTS conditions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chat_id INTEGER NOT NULL,
    keyword TEXT NOT NULL,
    max_price INTEGER NOT NULL,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS seen_items (
    condition_id INTEGER NOT NULL,
    item_id TEXT NOT NULL,
    notified_at TEXT NOT NULL,
    PRIMARY KEY (condition_id, item_id),
    FOREIGN KEY (condition_id) REFERENCES conditions(id)
);
"""


@dataclass(frozen=True)
class Condition:
    id: int
    chat_id: int
    keyword: str
    max_price: int
    active: bool
    created_at: str


class Store:
    def __init__(self, db_path: str):
        self._db_path = db_path
        with self._connect() as conn:
            conn.executescript(SCHEMA)

    @contextmanager
    def _connect(self) -> Iterator[sqlite3.Connection]:
        conn = sqlite3.connect(self._db_path)
        conn.row_factory = sqlite3.Row
        try:
            yield conn
            conn.commit()
        finally:
            conn.close()

    def count_active_conditions(self, chat_id: int) -> int:
        with self._connect() as conn:
            row = conn.execute(
                "SELECT COUNT(*) AS n FROM conditions WHERE chat_id = ? AND active = 1",
                (chat_id,),
            ).fetchone()
            return row["n"]

    def add_condition(self, chat_id: int, keyword: str, max_price: int) -> Condition:
        now = datetime.now(timezone.utc).isoformat()
        with self._connect() as conn:
            cur = conn.execute(
                "INSERT INTO conditions (chat_id, keyword, max_price, active, created_at) "
                "VALUES (?, ?, ?, 1, ?)",
                (chat_id, keyword, max_price, now),
            )
            return Condition(cur.lastrowid, chat_id, keyword, max_price, True, now)

    def list_conditions(self, chat_id: Optional[int] = None, active_only: bool = True) -> list[Condition]:
        query = "SELECT * FROM conditions"
        clauses = []
        params: list = []
        if chat_id is not None:
            clauses.append("chat_id = ?")
            params.append(chat_id)
        if active_only:
            clauses.append("active = 1")
        if clauses:
            query += " WHERE " + " AND ".join(clauses)
        query += " ORDER BY id"
        with self._connect() as conn:
            rows = conn.execute(query, params).fetchall()
            return [
                Condition(r["id"], r["chat_id"], r["keyword"], r["max_price"], bool(r["active"]), r["created_at"])
                for r in rows
            ]

    def deactivate_condition(self, chat_id: int, condition_id: int) -> bool:
        with self._connect() as conn:
            cur = conn.execute(
                "UPDATE conditions SET active = 0 WHERE id = ? AND chat_id = ? AND active = 1",
                (condition_id, chat_id),
            )
            return cur.rowcount > 0

    def is_seen(self, condition_id: int, item_id: str) -> bool:
        with self._connect() as conn:
            row = conn.execute(
                "SELECT 1 FROM seen_items WHERE condition_id = ? AND item_id = ?",
                (condition_id, item_id),
            ).fetchone()
            return row is not None

    def mark_seen(self, condition_id: int, item_id: str) -> None:
        now = datetime.now(timezone.utc).isoformat()
        with self._connect() as conn:
            conn.execute(
                "INSERT OR IGNORE INTO seen_items (condition_id, item_id, notified_at) VALUES (?, ?, ?)",
                (condition_id, item_id, now),
            )
