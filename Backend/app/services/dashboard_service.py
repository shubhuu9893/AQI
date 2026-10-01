"""Aggregation logic for the unified dashboard endpoint."""

from __future__ import annotations

import datetime as _dt
from typing import Any

from sqlalchemy.orm import Session, joinedload

from ..database import SessionLocal
from ..models.air_quality_measurements import AirQualityMeasurement
from ..models.health_risk_records import HealthRiskRecord
from ..models.monitoring_station import MonitoringStation
from ..models.weather_measurements import WeatherMeasurement
from ..utils.dsa.haversine import LatLon, haversine
from .airvisual_service import get_air_quality
from .health_risk_service import calculate_risk
from .location_service import resolve_location
from .weather_service import get_weather


def _avg(values: list[float | None]) -> float | None:
    nums = [v for v in values if v is not None]
    if not nums:
        return None
    return round(sum(nums) / len(nums), 1)


def _nearby_stations(
    lat: float,
    lon: float,
    radius_km: float = 50.0,
    session: Session | None = None,
) -> list[dict[str, Any]]:
    close = session is None
    db = session or SessionLocal()
    try:
        stations = (
            db.query(MonitoringStation)
            .options(joinedload(MonitoringStation.location))
            .all()
        )
        target = LatLon(lat, lon)
        nearby: list[dict[str, Any]] = []
        for st in stations:
            dist = haversine(target, LatLon(st.latitude, st.longitude))
            if dist > radius_km:
                continue
            latest = (
                db.query(AirQualityMeasurement)
                .filter(AirQualityMeasurement.station_id == st.id)
                .order_by(AirQualityMeasurement.timestamp.desc())
                .first()
            )
            loc = st.location
            nearby.append(
                {
                    "id": st.id,
                    "name": st.name,
                    "city": loc.name if loc else st.name,
                    "state": loc.state if loc else "",
                    "latitude": st.latitude,
                    "longitude": st.longitude,
                    "distance_km": round(dist, 1),
                    "aqi": latest.aqi if latest else None,
                    "pm25": latest.pm25 if latest else None,
                    "pm10": latest.pm10 if latest else None,
                    "no2": latest.no2 if latest else None,
                    "so2": latest.so2 if latest else None,
                    "co": latest.co if latest else None,
                    "o3": latest.o3 if latest else None,
                    "updated_at": latest.timestamp.isoformat() if latest else None,
                    "data_source": (latest.source if latest else None) or st.provider,
                }
            )
        nearby.sort(key=lambda row: row["distance_km"])
        return nearby
    finally:
        if close:
            db.close()


def _historical_summary(station_id: str | None, session: Session) -> dict[str, Any]:
    empty = {
        "air_quality": {"aqi": None, "pm25": None, "pm10": None},
        "weather": {"temperature": None, "humidity": None, "pressure": None},
    }
    if not station_id:
        return empty

    since = _dt.datetime.utcnow() - _dt.timedelta(days=7)
    aq_records = (
        session.query(AirQualityMeasurement)
        .filter(
            AirQualityMeasurement.station_id == station_id,
            AirQualityMeasurement.timestamp >= since,
        )
        .all()
    )
    wx_records = (
        session.query(WeatherMeasurement)
        .filter(
            WeatherMeasurement.station_id == station_id,
            WeatherMeasurement.timestamp >= since,
        )
        .all()
    )
    return {
        "air_quality": {
            "aqi": _avg([r.aqi for r in aq_records]),
            "pm25": _avg([r.pm25 for r in aq_records]),
            "pm10": _avg([r.pm10 for r in aq_records]),
        },
        "weather": {
            "temperature": _avg([r.temperature for r in wx_records]),
            "humidity": _avg([r.humidity for r in wx_records]),
            "pressure": _avg([r.pressure for r in wx_records]),
        },
    }


def get_dashboard(lat: float, lon: float) -> dict[str, Any]:
    loc = resolve_location(lat, lon)
    aq = get_air_quality(lat, lon)
    wx = get_weather(lat, lon)
    score, level, rec = calculate_risk(aq)

    db = SessionLocal()
    try:
        station_id = loc.get("station_id")
        health = {
            "risk_score": score,
            "risk_level": level,
            "recommendation": rec,
            "timestamp": _dt.datetime.utcnow().isoformat(),
        }
        if station_id:
            hr = (
                db.query(HealthRiskRecord)
                .filter_by(station_id=station_id)
                .order_by(HealthRiskRecord.timestamp.desc())
                .first()
            )
            if hr:
                health = {
                    "risk_score": hr.risk_score,
                    "risk_level": hr.risk_level,
                    "recommendation": hr.recommendation,
                    "timestamp": hr.timestamp.isoformat(),
                }

        return {
            "location": {
                "city": loc.get("city") or "Unknown",
                "state": loc.get("state") or "",
                "country": loc.get("country") or "",
                "distance_km": loc.get("distance_km") or 0.0,
            },
            "air_quality": aq,
            "weather": wx,
            "health_risk": health,
            "nearby_stations": _nearby_stations(lat, lon, radius_km=50.0, session=db),
            "historical_summary": _historical_summary(station_id, db),
        }
    finally:
        db.close()


def get_nearby_stations(lat: float, lon: float, radius_km: float = 50.0) -> list[dict[str, Any]]:
    return _nearby_stations(lat, lon, radius_km=radius_km)


def get_station_by_id(station_id: str) -> dict[str, Any] | None:
    db = SessionLocal()
    try:
        st = (
            db.query(MonitoringStation)
            .options(joinedload(MonitoringStation.location))
            .filter(MonitoringStation.id == station_id)
            .one_or_none()
        )
        if not st:
            return None
        latest = (
            db.query(AirQualityMeasurement)
            .filter(AirQualityMeasurement.station_id == st.id)
            .order_by(AirQualityMeasurement.timestamp.desc())
            .first()
        )
        loc = st.location
        return {
            "id": st.id,
            "name": st.name,
            "city": loc.name if loc else st.name,
            "state": loc.state if loc else "",
            "latitude": st.latitude,
            "longitude": st.longitude,
            "distance_km": 0.0,
            "aqi": latest.aqi if latest else None,
            "pm25": latest.pm25 if latest else None,
            "pm10": latest.pm10 if latest else None,
            "no2": latest.no2 if latest else None,
            "so2": latest.so2 if latest else None,
            "co": latest.co if latest else None,
            "o3": latest.o3 if latest else None,
            "updated_at": latest.timestamp.isoformat() if latest else None,
            "data_source": (latest.source if latest else None) or st.provider,
        }
    finally:
        db.close()
