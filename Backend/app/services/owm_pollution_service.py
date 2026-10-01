"""OpenWeatherMap Air Pollution service for real-time global pollutant data."""

from __future__ import annotations

from typing import Any

from ..config import get_settings
from ..utils.cache import cached
from .aqi_utils import EMPTY_AIR_QUALITY, aqi_from_pollutants
from .http_client import http_get


@cached(ttl=300)
def get_owm_air_pollution(lat: float, lon: float) -> dict[str, Any]:
    """Fetch real-time air pollution data from OpenWeatherMap API.

    Returns normalized dictionary with aqi, pm25, pm10, no2, so2, co, o3.
    """
    settings = get_settings()
    if not settings.weather_api_key:
        return dict(EMPTY_AIR_QUALITY)

    url = f"{settings.weather_api_url.rstrip('/')}/air_pollution"
    try:
        data = http_get(
            url,
            params={"lat": lat, "lon": lon, "appid": settings.weather_api_key},
            timeout=8.0,
        )
        items = data.get("list") or []
        if not items:
            return dict(EMPTY_AIR_QUALITY)

        item = items[0]
        comp = item.get("components", {})

        result = dict(EMPTY_AIR_QUALITY)
        # OWM gives pollutants in μg/m3, except CO which is also in μg/m3 (EPA standard uses mg/m3)
        result["pm25"] = round(float(comp["pm2_5"]), 2) if comp.get("pm2_5") is not None else None
        result["pm10"] = round(float(comp["pm10"]), 2) if comp.get("pm10") is not None else None
        result["no2"]  = round(float(comp["no2"]), 2)  if comp.get("no2") is not None else None
        result["so2"]  = round(float(comp["so2"]), 2)  if comp.get("so2") is not None else None
        result["co"]   = round(float(comp["co"]) / 1000.0, 2) if comp.get("co") is not None else None
        result["o3"]   = round(float(comp["o3"]), 2)   if comp.get("o3") is not None else None

        # Calculate standard US EPA AQI from real pollutant concentrations
        calculated_aqi = aqi_from_pollutants(result)
        result["aqi"] = calculated_aqi

        return result
    except Exception as exc:
        return dict(EMPTY_AIR_QUALITY)
