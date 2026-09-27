"""Historical measurements for a station."""

from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any

from sqlalchemy.orm import Session

from ..database import SessionLocal
from ..models.air_quality_measurements import AirQualityMeasurement
from ..models.health_risk_records import HealthRiskRecord
from ..models.weather_measurements import WeatherMeasurement

Period = str


def _build_timeframe(
    period: Period,
    start: datetime | None = None,
    end: datetime | None = None,
) -> tuple[datetime, datetime]:
    now = datetime.utcnow()
    if period == "24h":
        return now - timedelta(hours=24), now
    if period == "7d":
        return now - timedelta(days=7), now
    if period == "30d":
        return now - timedelta(days=30), now
    if start and end:
        return start, end
    raise ValueError("Invalid period specification")


def _serialize(record) -> dict[str, Any]:
    data = {c.name: getattr(record, c.name) for c in record.__table__.columns}
    for key, value in list(data.items()):
        if isinstance(value, datetime):
            data[key] = value.isoformat()
    return data


def _query_measurements(session: Session, model, station_id: str, start: datetime, end: datetime):
    records = (
        session.query(model)
        .filter(
            model.station_id == station_id,
            model.timestamp >= start,
            model.timestamp <= end,
        )
        .order_by(model.timestamp.asc())
        .all()
    )
    return [_serialize(r) for r in records]


def get_history(
    station_id: str,
    period: Period = "24h",
    start: datetime | None = None,
    end: datetime | None = None,
    session: Session | None = None,
):
    close = session is None
    db = session or SessionLocal()
    try:
        start_ts, end_ts = _build_timeframe(period, start, end)
        return {
            "air_quality": _query_measurements(db, AirQualityMeasurement, station_id, start_ts, end_ts),
            "weather": _query_measurements(db, WeatherMeasurement, station_id, start_ts, end_ts),
            "health_risk": _query_measurements(db, HealthRiskRecord, station_id, start_ts, end_ts),
        }
    finally:
        if close:
            db.close()
