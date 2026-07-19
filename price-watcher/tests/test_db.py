import pytest

from price_watcher.db import Store


@pytest.fixture
def store(tmp_path) -> Store:
    return Store(str(tmp_path / "test.db"))


def test_add_and_list_condition(store: Store):
    store.add_condition(chat_id=1, keyword="아이폰", max_price=500000)
    conditions = store.list_conditions(chat_id=1)
    assert len(conditions) == 1
    assert conditions[0].keyword == "아이폰"
    assert conditions[0].max_price == 500000


def test_free_tier_condition_count(store: Store):
    store.add_condition(chat_id=1, keyword="a", max_price=1)
    store.add_condition(chat_id=1, keyword="b", max_price=1)
    assert store.count_active_conditions(chat_id=1) == 2
    assert store.count_active_conditions(chat_id=2) == 0


def test_deactivate_condition_hides_it_from_active_list(store: Store):
    condition = store.add_condition(chat_id=1, keyword="a", max_price=1)
    assert store.deactivate_condition(chat_id=1, condition_id=condition.id) is True
    assert store.list_conditions(chat_id=1) == []


def test_deactivate_condition_requires_matching_chat_id(store: Store):
    condition = store.add_condition(chat_id=1, keyword="a", max_price=1)
    assert store.deactivate_condition(chat_id=2, condition_id=condition.id) is False
    assert len(store.list_conditions(chat_id=1)) == 1


def test_seen_items_deduplicate_notifications(store: Store):
    condition = store.add_condition(chat_id=1, keyword="a", max_price=1)
    assert store.is_seen(condition.id, "item-1") is False
    store.mark_seen(condition.id, "item-1")
    assert store.is_seen(condition.id, "item-1") is True
    # Marking twice must not raise (dedup on repeated poll cycles).
    store.mark_seen(condition.id, "item-1")
