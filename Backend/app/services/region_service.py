"""Region-wise air quality aggregation and lookup across global geographic areas."""

from __future__ import annotations

from typing import Any
from ..utils.cache import cached
from .airvisual_service import get_air_quality

# Pre-defined major global metropolitan regions / geographic areas
GLOBAL_REGIONS = [
    # North America
    {"id": "reg-nyc", "name": "New York Metropolitan Area", "macro_region": "North America", "country": "USA", "lat": 40.7128, "lon": -74.0060},
    {"id": "reg-la", "name": "Los Angeles Basin", "macro_region": "North America", "country": "USA", "lat": 34.0522, "lon": -118.2437},
    {"id": "reg-chi", "name": "Greater Chicago Area", "macro_region": "North America", "country": "USA", "lat": 41.8781, "lon": -87.6298},
    {"id": "reg-tor", "name": "Greater Toronto Area", "macro_region": "North America", "country": "Canada", "lat": 43.6532, "lon": -79.3832},
    {"id": "reg-van", "name": "Metro Vancouver", "macro_region": "North America", "country": "Canada", "lat": 49.2827, "lon": -123.1207},
    {"id": "reg-sf", "name": "San Francisco Bay Area", "macro_region": "North America", "country": "USA", "lat": 37.7749, "lon": -122.4194},

    # Europe
    {"id": "reg-ldn", "name": "Greater London Area", "macro_region": "Europe", "country": "UK", "lat": 51.5074, "lon": -0.1278},
    {"id": "reg-par", "name": "Île-de-France (Paris)", "macro_region": "Europe", "country": "France", "lat": 48.8566, "lon": 2.3522},
    {"id": "reg-ber", "name": "Berlin-Brandenburg", "macro_region": "Europe", "country": "Germany", "lat": 52.5200, "lon": 13.4050},
    {"id": "reg-mad", "name": "Community of Madrid", "macro_region": "Europe", "country": "Spain", "lat": 40.4168, "lon": -3.7038},
    {"id": "reg-rom", "name": "Metropolitan City of Rome", "macro_region": "Europe", "country": "Italy", "lat": 41.9028, "lon": 12.4964},
    {"id": "reg-ams", "name": "Randstad (Amsterdam)", "macro_region": "Europe", "country": "Netherlands", "lat": 52.3676, "lon": 4.9041},

    # South Asia
    {"id": "reg-del", "name": "Delhi National Capital Region", "macro_region": "South Asia", "country": "India", "lat": 28.6139, "lon": 77.2090},
    {"id": "reg-mum", "name": "Mumbai Metropolitan Region", "macro_region": "South Asia", "country": "India", "lat": 19.0760, "lon": 72.8777},
    {"id": "reg-pun", "name": "Pune Metropolitan Area", "macro_region": "South Asia", "country": "India", "lat": 18.5204, "lon": 73.8567},
    {"id": "reg-blr", "name": "Bangalore Urban Region", "macro_region": "South Asia", "country": "India", "lat": 12.9716, "lon": 77.5946},
    {"id": "reg-kol", "name": "Kolkata Metropolitan Area", "macro_region": "South Asia", "country": "India", "lat": 22.5726, "lon": 88.3639},
    {"id": "reg-dhk", "name": "Greater Dhaka Area", "macro_region": "South Asia", "country": "Bangladesh", "lat": 23.8103, "lon": 90.4125},

    # East Asia
    {"id": "reg-tyo", "name": "Greater Tokyo Bay Area", "macro_region": "East Asia", "country": "Japan", "lat": 35.6762, "lon": 139.6503},
    {"id": "reg-sha", "name": "Shanghai Yangtze Delta", "macro_region": "East Asia", "country": "China", "lat": 31.2304, "lon": 121.4737},
    {"id": "reg-bjs", "name": "Beijing-Tianjin-Hebei", "macro_region": "East Asia", "country": "China", "lat": 39.9042, "lon": 116.4074},
    {"id": "reg-sel", "name": "Seoul Capital Area", "macro_region": "East Asia", "country": "South Korea", "lat": 37.5665, "lon": 126.9780},
    {"id": "reg-sin", "name": "Singapore Island Area", "macro_region": "East Asia", "country": "Singapore", "lat": 1.3521, "lon": 103.8198},
    {"id": "reg-bkk", "name": "Bangkok Metropolitan Region", "macro_region": "East Asia", "country": "Thailand", "lat": 13.7563, "lon": 100.5018},

    # Middle East
    {"id": "reg-dxb", "name": "Dubai-Sharjah Urban Area", "macro_region": "Middle East", "country": "UAE", "lat": 25.2048, "lon": 55.2708},
    {"id": "reg-ruh", "name": "Riyadh Region", "macro_region": "Middle East", "country": "Saudi Arabia", "lat": 24.7136, "lon": 46.6753},
    {"id": "reg-ist", "name": "Istanbul Metropolitan", "macro_region": "Middle East", "country": "Turkey", "lat": 41.0082, "lon": 28.9784},
    {"id": "reg-doh", "name": "Doha Urban Region", "macro_region": "Middle East", "country": "Qatar", "lat": 25.2854, "lon": 51.5310},

    # Oceania
    {"id": "reg-syd", "name": "Greater Sydney Basin", "macro_region": "Oceania", "country": "Australia", "lat": -33.8688, "lon": 151.2093},
    {"id": "reg-mel", "name": "Greater Melbourne Area", "macro_region": "Oceania", "country": "Australia", "lat": -37.8136, "lon": 144.9631},
    {"id": "reg-akl", "name": "Auckland Region", "macro_region": "Oceania", "country": "New Zealand", "lat": -36.8509, "lon": 174.7645},

    # Africa
    {"id": "reg-cai", "name": "Greater Cairo Urban Area", "macro_region": "Africa", "country": "Egypt", "lat": 30.0444, "lon": 31.2357},
    {"id": "reg-jnb", "name": "Johannesburg-Pretoria Area", "macro_region": "Africa", "country": "South Africa", "lat": -26.2041, "lon": 28.0473},
    {"id": "reg-los", "name": "Lagos Metropolitan Region", "macro_region": "Africa", "country": "Nigeria", "lat": 6.5244, "lon": 3.3792},
    {"id": "reg-nbo", "name": "Nairobi Metro Area", "macro_region": "Africa", "country": "Kenya", "lat": -1.2921, "lon": 36.8219},

    # South America
    {"id": "reg-sao", "name": "São Paulo Macrometropolis", "macro_region": "South America", "country": "Brazil", "lat": -23.5505, "lon": -46.6333},
    {"id": "reg-bue", "name": "Greater Buenos Aires", "macro_region": "South America", "country": "Argentina", "lat": -34.6037, "lon": -58.3816},
    {"id": "reg-bog", "name": "Bogotá Savanna Region", "macro_region": "South America", "country": "Colombia", "lat": 4.7110, "lon": -74.0721},
    {"id": "reg-scl", "name": "Santiago Metropolitan Region", "macro_region": "South America", "country": "Chile", "lat": -33.4489, "lon": -70.6693},
]


@cached(ttl=600)
def get_global_regions_aqi(macro_filter: str | None = None) -> list[dict[str, Any]]:
    """Return live air quality measurements for major global regions and areas."""
    results = []
    for reg in GLOBAL_REGIONS:
        if macro_filter and macro_filter.lower() != "all" and reg["macro_region"].lower() != macro_filter.lower():
            continue

        aq_data = get_air_quality(reg["lat"], reg["lon"])
        results.append({
            "id": reg["id"],
            "name": reg["name"],
            "macro_region": reg["macro_region"],
            "country": reg["country"],
            "latitude": reg["lat"],
            "longitude": reg["lon"],
            "aqi": aq_data.get("aqi"),
            "pm25": aq_data.get("pm25"),
            "pm10": aq_data.get("pm10"),
            "no2": aq_data.get("no2"),
            "so2": aq_data.get("so2"),
            "co": aq_data.get("co"),
            "o3": aq_data.get("o3"),
            "source": "OpenWeatherMap / Real-Time Sensors",
        })
    return results
