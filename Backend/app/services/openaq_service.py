"""OpenAQ lookup with API-key support and a stored-data fallback."""

from __future__ import annotations

from typing import Any

from ..config import get_settings
from ..utils.cache import cached
from .aqi_utils import EMPTY_AIR_QUALITY
from .http_client import http_get


def _aggregate(records: list[dict[str, Any]]) -> dict[str, Any]:
    result = dict(EMPTY_AIR_QUALITY)
    for rec in records:
        param = (rec.get("parameter") or "").lower().replace(".", "")
        value = rec.get("value")
        if param in result and result[param] is None:
            result[param] = value
    return result


@cached(ttl=600)
def get_openaq_measurement(lat: float, lon: float) -> dict[str, Any]:
    settings = get_settings()
    headers = {}
    if settings.openaq_api_key:
        headers["X-API-Key"] = settings.openaq_api_key

    base = settings.openaq_api_url.rstrip("/")
    params = {
        "coordinates": f"{lat},{lon}",
        "radius": 25000,
        "limit": 100,
        "sort": "desc",
        "order_by": "datetime",
    }

    try:
        data = http_get(f"{base}/measurements", params=params, headers=headers or None)
        records = data.get("results") or data.get("results", [])
        if not records and "data" in data:
            records = data["data"]
        return _aggregate(records if isinstance(records, list) else [])
    except Exception:
        return dict(EMPTY_AIR_QUALITY)
