import os
from dataclasses import dataclass

from dotenv import load_dotenv

load_dotenv()


@dataclass(frozen=True)
class Config:
    telegram_bot_token: str
    db_path: str
    poll_interval_seconds: int
    max_free_conditions: int
    bunjang_search_url: str
    request_timeout_seconds: int


def load_config() -> Config:
    token = os.environ.get("TELEGRAM_BOT_TOKEN", "")
    if not token:
        raise RuntimeError(
            "TELEGRAM_BOT_TOKEN is not set. Copy .env.example to .env and fill it in."
        )
    return Config(
        telegram_bot_token=token,
        db_path=os.environ.get("PRICE_WATCHER_DB_PATH", "price_watcher.db"),
        poll_interval_seconds=int(os.environ.get("POLL_INTERVAL_SECONDS", "300")),
        max_free_conditions=int(os.environ.get("MAX_FREE_CONDITIONS", "2")),
        bunjang_search_url=os.environ.get(
            "BUNJANG_SEARCH_URL", "https://api.bunjang.co.kr/api/1/find_v2.json"
        ),
        request_timeout_seconds=int(os.environ.get("REQUEST_TIMEOUT_SECONDS", "10")),
    )
