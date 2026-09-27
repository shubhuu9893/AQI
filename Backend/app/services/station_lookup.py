"""Nearest-station helpers and snapshot persistence."""

from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any

from ..database import SessionLocal
from ..models.air_quality_measurements import AirQualityMeasurement
from ..models.monitoring_station import MonitoringStation
from ..models.weather_measurements import WeatherMeasurement
from ..utils.dsa.haversine import LatLon, haversine


def nearest_station_row(lat: float, lon: float, session=None) -> MonitoringStation | None:
    close = session is None
    db = session or SessionLocal()
    try:
        stations = db.query(MonitoringStation).all()
        if not stations:
            return None
        target = LatLon(lat, lon)
        best = None
        best_dist = float("inf")
        for st in stations:
            dist = haversine(target, LatLon(st.latitude, st.longitude))
            if dist < best_dist:
                best_dist = dist
                best = st
        return best
    finally:
        if close:
            db.close()


def latest_air_quality_near(lat: float, lon: float) -> dict[str, Any] | None:
    db = SessionLocal()
    try:
        station = nearest_station_row(lat, lon, session=db)
        if not station:
            return None
        rec = (
            db.query(AirQualityMeasurement)
            .filter(AirQualityMeasurement.station_id == station.id)
            .order_by(AirQualityMeasurement.timestamp.desc())
            .first()
        )
        if not rec:
            return None
        return {
            "aqi": rec.aqi,
            "pm25": rec.pm25,
            "pm10": rec.pm10,
            "no2": rec.no2,
            "so2": rec.so2,
            "co": rec.co,
            "o3": rec.o3,
        }
    finally:
        db.close()


def latest_weather_near(lat: float, lon: float) -> dict[str, Any] | None:
    db = SessionLocal()
    try:
        station = nearest_station_row(lat, lon, session=db)
        if not station:
            return None
        rec = (
            db.query(WeatherMeasurement)
            .filter(WeatherMeasurement.station_id == station.id)
            .order_by(WeatherMeasurement.timestamp.desc())
            .first()
        )
        if not rec:
            return None
        return {
            "temperature": rec.temperature,
            "humidity": rec.humidity,
            "pressure": rec.pressure,
            "wind_speed": rec.wind_speed,
            "wind_direction": rec.wind_direction,
            "visibility": rec.visibility,
        }
    finally:
        db.close()


def persist_air_quality(lat: float, lon: float, metrics: dict[str, Any]) -> None:
    if all(v is None for v in metrics.values()):
        return
    db = SessionLocal()
    try:
        station = nearest_station_row(lat, lon, session=db)
        if not station:
            return
        recent = (
            db.query(AirQualityMeasurement)
            .filter(
                AirQualityMeasurement.station_id == station.id,
                AirQualityMeasurement.source == "live",
                AirQualityMeasurement.timestamp >= datetime.utcnow() - timedelta(minutes=15),
            )
            .first()
        )
        if recent:
            return
        db.add(
            AirQualityMeasurement(
                station_id=station.id,
                timestamp=datetime.utcnow(),
                aqi=metrics.get("aqi"),
                pm25=metrics.get("pm25"),
                pm10=metrics.get("pm10"),
                no2=metrics.get("no2"),
                so2=metrics.get("so2"),
                co=metrics.get("co"),
                o3=metrics.get("o3"),
                source="live",
            )
        )
        db.commit()
    except Exception:
        db.rollback()
    finally:
        db.close()


def persist_weather(lat: float, lon: float, metrics: dict[str, Any]) -> None:
    if all(v is None for v in metrics.values()):
        return
    db = SessionLocal()
    try:
        station = nearest_station_row(lat, lon, session=db)
        if not station:
            return
        recent = (
            db.query(WeatherMeasurement)
            .filter(
                WeatherMeasurement.station_id == station.id,
                WeatherMeasurement.source == "live",
                WeatherMeasurement.timestamp >= datetime.utcnow() - timedelta(minutes=15),
            )
            .first()
        )
        if recent:
            return
        db.add(
            WeatherMeasurement(
                station_id=station.id,
                timestamp=datetime.utcnow(),
                temperature=metrics.get("temperature"),
                humidity=metrics.get("humidity"),
                pressure=metrics.get("pressure"),
                wind_speed=metrics.get("wind_speed"),
                wind_direction=metrics.get("wind_direction"),
                visibility=metrics.get("visibility"),
                source="live",
            )
        )
        db.commit()
    except Exception:
        db.rollback()
    finally:
        db.close()
