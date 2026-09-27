"""Shared city-level metric aggregation."""

from __future__ import annotations

from typing import Any

from sqlalchemy import func
from sqlalchemy.orm import Session

from ..models.air_quality_measurements import AirQualityMeasurement
from ..models.health_risk_records import HealthRiskRecord
from ..models.location import Location
from ..models.monitoring_station import MonitoringStation
from ..models.weather_measurements import WeatherMeasurement


def city_station_ids(db: Session, city: str):
    return (
        db.query(MonitoringStation.id)
        .join(Location, MonitoringStation.location_id == Location.id)
        .filter(func.lower(Location.name) == city.lower())
    )


def aggregate_city_metrics(db: Session, city: str) -> dict[str, Any]:
    station_subq = city_station_ids(db, city).subquery()

    aq_vals = (
        db.query(
            func.avg(AirQualityMeasurement.aqi),
            func.avg(AirQualityMeasurement.pm25),
            func.avg(AirQualityMeasurement.pm10),
            func.avg(AirQualityMeasurement.no2),
            func.avg(AirQualityMeasurement.so2),
            func.avg(AirQualityMeasurement.co),
            func.avg(AirQualityMeasurement.o3),
        )
        .filter(AirQualityMeasurement.station_id.in_(station_subq))
        .one()
    )

    weather_vals = (
        db.query(
            func.avg(WeatherMeasurement.temperature),
            func.avg(WeatherMeasurement.humidity),
            func.avg(WeatherMeasurement.wind_speed),
        )
        .filter(WeatherMeasurement.station_id.in_(station_subq))
        .one()
    )

    risk_score = (
        db.query(func.avg(HealthRiskRecord.risk_score))
        .filter(HealthRiskRecord.station_id.in_(station_subq))
        .scalar()
    )

    def _r(v):
        return round(float(v), 2) if v is not None else None

    return {
        "aqi": _r(aq_vals[0]),
        "pm25": _r(aq_vals[1]),
        "pm10": _r(aq_vals[2]),
        "no2": _r(aq_vals[3]),
        "so2": _r(aq_vals[4]),
        "co": _r(aq_vals[5]),
        "o3": _r(aq_vals[6]),
        "temperature": _r(weather_vals[0]),
        "humidity": _r(weather_vals[1]),
        "wind_speed": _r(weather_vals[2]),
        "risk_score": _r(risk_score),
    }


def find_location_by_name(db: Session, city: str) -> Location | None:
    return (
        db.query(Location)
        .filter(func.lower(Location.name) == city.lower())
        .first()
    )
