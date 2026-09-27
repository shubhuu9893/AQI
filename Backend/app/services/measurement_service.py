"""Search and filter air-quality measurements."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from sqlalchemy import asc, desc, func
from sqlalchemy.orm import Session, aliased

from ..models.air_quality_measurements import AirQualityMeasurement
from ..models.location import Location
from ..models.monitoring_station import MonitoringStation

AQI_CATEGORIES = {
    "good": (0, 50),
    "moderate": (51, 100),
    "unhealthy-sensitive": (101, 150),
    "unhealthy": (151, 200),
    "very-unhealthy": (201, 300),
    "hazardous": (301, 500),
}


def _apply_category_filter(query, category: str):
    key = (category or "").lower()
    if key not in AQI_CATEGORIES:
        return query
    low, high = AQI_CATEGORIES[key]
    return query.filter(AirQualityMeasurement.aqi.between(low, high))


def _apply_sort(query, sort_by: str):
    mapping = {
        "newest": desc(AirQualityMeasurement.timestamp),
        "oldest": asc(AirQualityMeasurement.timestamp),
        "highest_aqi": desc(AirQualityMeasurement.aqi),
        "lowest_aqi": asc(AirQualityMeasurement.aqi),
        "highest_pm25": desc(AirQualityMeasurement.pm25),
        "lowest_pm25": asc(AirQualityMeasurement.pm25),
    }
    order = mapping.get(sort_by, desc(AirQualityMeasurement.timestamp))
    return query.order_by(order)


def search_measurements(
    session: Session,
    city: str | None = None,
    date_from: datetime | None = None,
    date_to: datetime | None = None,
    pollutant: str | None = None,
    aqi_category: str | None = None,
    sort_by: str = "newest",
    limit: int = 500,
) -> list[dict[str, Any]]:
    station_alias = aliased(MonitoringStation)
    location_alias = aliased(Location)

    query = (
        session.query(AirQualityMeasurement, location_alias.name)
        .join(station_alias, AirQualityMeasurement.station_id == station_alias.id)
        .join(location_alias, station_alias.location_id == location_alias.id)
    )

    if city:
        query = query.filter(func.lower(location_alias.name) == city.lower())
    if date_from:
        query = query.filter(AirQualityMeasurement.timestamp >= date_from)
    if date_to:
        query = query.filter(AirQualityMeasurement.timestamp <= date_to)
    if pollutant and hasattr(AirQualityMeasurement, pollutant):
        query = query.filter(getattr(AirQualityMeasurement, pollutant).isnot(None))
    if aqi_category:
        query = _apply_category_filter(query, aqi_category)

    query = _apply_sort(query, sort_by).limit(limit)

    results: list[dict[str, Any]] = []
    for rec, city_name in query.all():
        results.append(
            {
                "id": rec.id,
                "station_id": rec.station_id,
                "city": city_name,
                "timestamp": rec.timestamp.isoformat(),
                "aqi": rec.aqi,
                "pm25": rec.pm25,
                "pm10": rec.pm10,
                "no2": rec.no2,
                "so2": rec.so2,
                "co": rec.co,
                "o3": rec.o3,
            }
        )
    return results
