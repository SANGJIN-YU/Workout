"""Condition matching: MVP supports exactly keyword AND price-ceiling (§2)."""
from __future__ import annotations

from .bunjang_client import Listing
from .db import Condition


def matches(listing: Listing, condition: Condition) -> bool:
    keyword_hit = condition.keyword.strip().lower() in listing.title.lower()
    price_hit = listing.price <= condition.max_price
    return keyword_hit and price_hit
