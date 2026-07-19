"""Telegram bot: condition registration (chat commands) + scheduled crawl/notify.

Uses python-telegram-bot's built-in JobQueue (itself APScheduler-based) so a
single process handles both the user-facing bot and the periodic crawl —
no separate scheduler process needed for the MVP.
"""
from __future__ import annotations

import logging
from collections import defaultdict

import requests
from telegram import Update
from telegram.ext import Application, CommandHandler, ContextTypes

from .bunjang_client import BunjangClient
from .config import Config, load_config
from .db import Store
from .matcher import matches

logger = logging.getLogger(__name__)


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_text(
        "가격/재고 감시 봇입니다.\n"
        "/add <키워드> <가격상한> - 조건 등록\n"
        "/list - 등록한 조건 보기\n"
        "/remove <조건ID> - 조건 삭제\n"
        f"무료 플랜은 조건 {context.bot_data['config'].max_free_conditions}개까지 등록할 수 있습니다."
    )


async def add_condition(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    store: Store = context.bot_data["store"]
    config: Config = context.bot_data["config"]
    chat_id = update.effective_chat.id

    if len(context.args) < 2:
        await update.message.reply_text("사용법: /add <키워드> <가격상한(원)>")
        return

    *keyword_parts, price_text = context.args
    keyword = " ".join(keyword_parts)
    if not keyword:
        await update.message.reply_text("사용법: /add <키워드> <가격상한(원)>")
        return
    try:
        max_price = int(price_text)
    except ValueError:
        await update.message.reply_text("가격상한은 숫자로 입력해주세요. 예: /add 아이폰13 500000")
        return

    if store.count_active_conditions(chat_id) >= config.max_free_conditions:
        await update.message.reply_text(
            f"무료 플랜은 조건 {config.max_free_conditions}개까지 등록할 수 있습니다. "
            "/list 로 기존 조건을 확인하고 /remove 로 정리해주세요."
        )
        return

    condition = store.add_condition(chat_id, keyword, max_price)
    await update.message.reply_text(
        f"등록됨 (ID {condition.id}): '{keyword}' / {max_price:,}원 이하"
    )


async def list_conditions(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    store: Store = context.bot_data["store"]
    chat_id = update.effective_chat.id
    conditions = store.list_conditions(chat_id=chat_id)
    if not conditions:
        await update.message.reply_text("등록된 조건이 없습니다. /add 로 등록해보세요.")
        return
    lines = [f"ID {c.id}: '{c.keyword}' / {c.max_price:,}원 이하" for c in conditions]
    await update.message.reply_text("\n".join(lines))


async def remove_condition(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    store: Store = context.bot_data["store"]
    chat_id = update.effective_chat.id
    if not context.args:
        await update.message.reply_text("사용법: /remove <조건ID>")
        return
    try:
        condition_id = int(context.args[0])
    except ValueError:
        await update.message.reply_text("조건ID는 숫자입니다. /list 로 확인해주세요.")
        return
    removed = store.deactivate_condition(chat_id, condition_id)
    await update.message.reply_text("삭제되었습니다." if removed else "해당 ID의 조건을 찾을 수 없습니다.")


async def check_conditions(context: ContextTypes.DEFAULT_TYPE) -> None:
    store: Store = context.bot_data["store"]
    client: BunjangClient = context.bot_data["client"]

    conditions = store.list_conditions(active_only=True)
    if not conditions:
        return

    by_keyword: dict[str, list] = defaultdict(list)
    for condition in conditions:
        by_keyword[condition.keyword].append(condition)

    for keyword, keyword_conditions in by_keyword.items():
        try:
            listings = client.search(keyword)
        except requests.RequestException:
            logger.warning("Bunjang search failed for %r, skipping this cycle", keyword, exc_info=True)
            continue

        for condition in keyword_conditions:
            for listing in listings:
                if not matches(listing, condition):
                    continue
                if store.is_seen(condition.id, listing.item_id):
                    continue
                store.mark_seen(condition.id, listing.item_id)
                await context.bot.send_message(
                    chat_id=condition.chat_id,
                    text=(
                        f"🔔 '{condition.keyword}' 조건 매칭!\n"
                        f"{listing.title} - {listing.price:,}원\n"
                        f"{listing.url}"
                    ),
                )


def build_application(config: Config) -> Application:
    application = Application.builder().token(config.telegram_bot_token).build()
    application.bot_data["config"] = config
    application.bot_data["store"] = Store(config.db_path)
    application.bot_data["client"] = BunjangClient(config.bunjang_search_url, config.request_timeout_seconds)

    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("help", start))
    application.add_handler(CommandHandler("add", add_condition))
    application.add_handler(CommandHandler("list", list_conditions))
    application.add_handler(CommandHandler("remove", remove_condition))

    application.job_queue.run_repeating(
        check_conditions, interval=config.poll_interval_seconds, first=10
    )
    return application


def main() -> None:
    logging.basicConfig(level=logging.INFO)
    config = load_config()
    application = build_application(config)
    application.run_polling()


if __name__ == "__main__":
    main()
