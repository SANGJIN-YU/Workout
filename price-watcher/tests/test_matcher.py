from price_watcher.bunjang_client import Listing
from price_watcher.db import Condition
from price_watcher.matcher import matches


def make_condition(keyword="아이폰", max_price=500000) -> Condition:
    return Condition(id=1, chat_id=1, keyword=keyword, max_price=max_price, active=True, created_at="")


def make_listing(title="아이폰13 128GB", price=450000) -> Listing:
    return Listing(item_id="1", title=title, price=price, url="http://x", image_url="")


def test_matches_when_keyword_and_price_both_satisfied():
    assert matches(make_listing(), make_condition()) is True


def test_no_match_when_price_exceeds_ceiling():
    listing = make_listing(price=600000)
    assert matches(listing, make_condition()) is False


def test_no_match_when_keyword_absent():
    listing = make_listing(title="갤럭시 S23")
    assert matches(listing, make_condition()) is False


def test_keyword_match_is_case_insensitive():
    listing = make_listing(title="IPHONE 13", price=100000)
    condition = make_condition(keyword="iphone")
    assert matches(listing, condition) is True


def test_price_exactly_at_ceiling_matches():
    listing = make_listing(price=500000)
    assert matches(listing, make_condition(max_price=500000)) is True
