import asyncio
from types import SimpleNamespace
from unittest.mock import AsyncMock

from price_watcher.bot import check_conditions
from price_watcher.bunjang_client import Listing
from price_watcher.db import Store


class FakeClient:
    """Stands in for BunjangClient so tests never hit the network."""

    def __init__(self, listings: list[Listing]):
        self._listings = listings
        self.queries: list[str] = []

    def search(self, keyword: str) -> list[Listing]:
        self.queries.append(keyword)
        return self._listings


def make_context(store: Store, client: FakeClient) -> SimpleNamespace:
    bot = SimpleNamespace(send_message=AsyncMock())
    return SimpleNamespace(bot_data={"store": store, "client": client}, bot=bot)


def test_check_conditions_notifies_on_new_match(tmp_path):
    store = Store(str(tmp_path / "test.db"))
    condition = store.add_condition(chat_id=42, keyword="아이폰", max_price=500000)
    client = FakeClient([Listing(item_id="p1", title="아이폰13", price=400000, url="http://x/p1", image_url="")])
    context = make_context(store, client)

    asyncio.run(check_conditions(context))

    context.bot.send_message.assert_awaited_once()
    kwargs = context.bot.send_message.await_args.kwargs
    assert kwargs["chat_id"] == 42
    assert "아이폰13" in kwargs["text"]
    assert store.is_seen(condition.id, "p1") is True


def test_check_conditions_skips_already_seen_items(tmp_path):
    store = Store(str(tmp_path / "test.db"))
    condition = store.add_condition(chat_id=42, keyword="아이폰", max_price=500000)
    store.mark_seen(condition.id, "p1")
    client = FakeClient([Listing(item_id="p1", title="아이폰13", price=400000, url="http://x/p1", image_url="")])
    context = make_context(store, client)

    asyncio.run(check_conditions(context))

    context.bot.send_message.assert_not_awaited()


def test_check_conditions_skips_non_matching_price(tmp_path):
    store = Store(str(tmp_path / "test.db"))
    store.add_condition(chat_id=42, keyword="아이폰", max_price=100000)
    client = FakeClient([Listing(item_id="p1", title="아이폰13", price=400000, url="http://x/p1", image_url="")])
    context = make_context(store, client)

    asyncio.run(check_conditions(context))

    context.bot.send_message.assert_not_awaited()


def test_check_conditions_batches_shared_keyword_into_one_search(tmp_path):
    store = Store(str(tmp_path / "test.db"))
    store.add_condition(chat_id=1, keyword="아이폰", max_price=500000)
    store.add_condition(chat_id=2, keyword="아이폰", max_price=500000)
    client = FakeClient([])
    context = make_context(store, client)

    asyncio.run(check_conditions(context))

    assert client.queries == ["아이폰"]
