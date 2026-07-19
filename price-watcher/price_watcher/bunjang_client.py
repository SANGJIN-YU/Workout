"""Client for Bunjang's public product search.

⚠️ VERIFICATION NEEDED BEFORE PRODUCTION USE (see checklist in README):
This targets Bunjang's search JSON endpoint as commonly used by third-party
tools (no login required to search). This session's sandbox has outbound
network access blocked for this host, so the request/response shape below
could not be verified live. Before relying on this in production:
  1. Confirm the endpoint/params still match by inspecting real traffic
     from https://m.bunjang.co.kr/search/products?q=... in a browser devtools
     network tab (or a Playwright trace) from an unrestricted network.
  2. Re-check Bunjang's Terms of Service for a no-crawling clause.
  3. If the JSON endpoint is gone or blocked (403/CAPTCHA), swap this class
     for a Playwright-based implementation behind the same interface
     (`search`) — nothing else in the codebase needs to change.
"""
from __future__ import annotations

from dataclasses import dataclass

import requests


@dataclass(frozen=True)
class Listing:
    item_id: str
    title: str
    price: int
    url: str
    image_url: str


class BunjangClient:
    def __init__(self, search_url: str, timeout_seconds: int = 10):
        self._search_url = search_url
        self._timeout = timeout_seconds
        self._session = requests.Session()
        self._session.headers.update(
            {
                "User-Agent": (
                    "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 "
                    "(KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36"
                ),
                "Accept": "application/json",
            }
        )

    def search(self, keyword: str, page: int = 0, page_size: int = 100) -> list[Listing]:
        """Return listings for `keyword`, newest first.

        Raises requests.RequestException on network/HTTP failure so callers
        can decide how to handle a down/blocked upstream (e.g. skip this
        poll cycle rather than crash the scheduler).
        """
        params = {
            "q": keyword,
            "order": "date",
            "page": page,
            "n": page_size,
            "stat_device": "w",
        }
        response = self._session.get(self._search_url, params=params, timeout=self._timeout)
        response.raise_for_status()
        payload = response.json()
        return [self._parse_item(item) for item in payload.get("list", [])]

    @staticmethod
    def _parse_item(item: dict) -> Listing:
        pid = str(item["pid"])
        return Listing(
            item_id=pid,
            title=item.get("name", ""),
            price=int(item.get("price", 0)),
            url=f"https://m.bunjang.co.kr/products/{pid}",
            image_url=item.get("product_image", ""),
        )
