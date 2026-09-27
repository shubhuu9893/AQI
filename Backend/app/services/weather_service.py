"""OpenWeatherMap lookup with stored-data fallback."""

from __future__ import annotations

from typing import Any

from ..config import get_settings
from ..utils.cache import cached
from .aqi_utils import EMPTY_WEATHER
from .http_client import http_get
from .station_lookup import latest_weather_near, persist_weather


def _normalize_owm(data: dict[str, Any]) -> dict[str, Any]:
    main = data.get("main") or {}
    wind = data.get("wind") or {}
    visibility_m = data.get("visibility")
    temp = main.get("temp")
    humidity = main.get("humidity")
    pressure = main.get("pressure")
    wind_dir = wind.get("deg")
    return {
        "temperature": round(float(temp), 1) if temp is not None else None,
        "humidity": int(humidity) if humidity is not None else None,
        "pressure": int(pressure) if pressure is not None else None,
        "wind_speed": wind.get("speed"),
        "wind_direction": int(wind_dir) if wind_dir is not None else None,
        "visibility": round(visibility_m / 1000, 1) if visibility_m else None,
    }


@cached(ttl=600)
def get_weather(lat: float, lon: float) -> dict[str, Any]:
    settings = get_settings()
    result = dict(EMPTY_WEATHER)

    if settings.weather_api_key:
        try:
            data = http_get(
                f"{settings.weather_api_url.rstrip('/')}/weather",
                params={
                    "lat": lat,
                    "lon": lon,
                    "appid": settings.weather_api_key,
                    "units": "metric",
                },
            )
            result = _normalize_owm(data)
        except Exception:
            result = dict(EMPTY_WEATHER)

    if all(v is None for v in result.values()):
        stored = latest_weather_near(lat, lon)
        if stored:
            result = stored

    if result.get("humidity") is not None:
        result["humidity"] = int(round(float(result["humidity"])))
    if result.get("pressure") is not None:
        result["pressure"] = int(round(float(result["pressure"])))
    if result.get("wind_direction") is not None:
        result["wind_direction"] = int(round(float(result["wind_direction"])))

    persist_weather(lat, lon, result)
    return result
