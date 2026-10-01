"""Air-quality lookup: AirVisual → OpenAQ → nearest stored measurement."""

from __future__ import annotations

from typing import Any

from ..config import get_settings
from ..utils.cache import cached
from .aqi_utils import EMPTY_AIR_QUALITY, aqi_from_pollutants
from .http_client import http_get
from .openaq_service import get_openaq_measurement
from .station_lookup import latest_air_quality_near, persist_air_quality


def _normalize_airvisual(data: dict[str, Any]) -> dict[str, Any]:
    try:
        pollution = data["data"]["current"]["pollution"]
    except Exception:
        return dict(EMPTY_AIR_QUALITY)

    result = dict(EMPTY_AIR_QUALITY)
    result["aqi"] = pollution.get("aqius")
    # IQAir current payload often only includes AQI + dominant pollutant.
    for key in ("pm25", "pm10", "no2", "so2", "co", "o3"):
        result[key] = pollution.get(key) or pollution.get(f"{key}us")
    return result


def _merge(primary: dict[str, Any], secondary: dict[str, Any]) -> dict[str, Any]:
    merged = dict(EMPTY_AIR_QUALITY)
    for key in merged:
        merged[key] = primary.get(key)
        if merged[key] is None:
            merged[key] = secondary.get(key)
    if merged["aqi"] is None:
        merged["aqi"] = aqi_from_pollutants(merged)
    return merged


@cached(ttl=600)
def get_air_quality(lat: float, lon: float) -> dict[str, Any]:
    settings = get_settings()
    live: dict[str, Any] = dict(EMPTY_AIR_QUALITY)

    if settings.airvisual_api_key:
        try:
            data = http_get(
                f"{settings.airvisual_api_url.rstrip('/')}/nearest_city",
                params={
                    "lat": lat,
                    "lon": lon,
                    "key": settings.airvisual_api_key,
                },
            )
            live = _normalize_airvisual(data)
        except Exception:
            live = dict(EMPTY_AIR_QUALITY)

    openaq = get_openaq_measurement(lat, lon)
    merged = _merge(live, openaq)

    # Enrich with OpenWeatherMap real-time pollutants if missing
    from .owm_pollution_service import get_owm_air_pollution
    owm = get_owm_air_pollution(lat, lon)
    merged = _merge(merged, owm)

    if all(v is None for v in merged.values()):
        stored = latest_air_quality_near(lat, lon)
        if stored:
            merged = stored

    if merged.get("aqi") is None:
        merged["aqi"] = aqi_from_pollutants(merged)
    if merged.get("aqi") is not None:
        merged["aqi"] = int(round(float(merged["aqi"])))

    persist_air_quality(lat, lon, merged)
    return merged
