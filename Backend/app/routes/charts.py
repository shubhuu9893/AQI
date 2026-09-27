"""FastAPI router exposing simple chart data endpoints.

The routes return raw JSON arrays that can be consumed by a client‑side
charting library such as Chart.js or D3.  The server performs the necessary
aggregation using the sliding‑window algorithm for moving averages.
"""

from __future__ import annotations

from datetime import datetime, timedelta
from typing import List, Tuple

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

# Import the FastAPI dependency that yields a DB session.
from ..database import get_db
from ..models.air_quality_measurements import AirQualityMeasurement
from ..utils.dsa.sliding_window import moving_average

router = APIRouter(prefix="/charts", tags=["Charts"])


def _fetch_measurements(
    db: Session,
    start_ts: datetime,
    end_ts: datetime,
    station_id: str | None = None,
    field: str = "aqi",
):
    """Return a list of ``(timestamp, value)`` tuples.

    Parameters
    ----------
    field:
        Column name to pull from :class:`AirQualityMeasurement`.
    """
    q = (
        db.query(AirQualityMeasurement)
        .filter(
            AirQualityMeasurement.timestamp >= start_ts,
            AirQualityMeasurement.timestamp <= end_ts,
        )
    )
    if station_id:
        q = q.filter(AirQualityMeasurement.station_id == station_id)
    records = q.order_by(AirQualityMeasurement.timestamp.asc()).all()

    values: List[Tuple[datetime, float]] = []
    for r in records:
        val = getattr(r, field)
        if val is not None:
            values.append((r.timestamp, val))
    return values


def _daily_averages(
    data: List[Tuple[datetime, float]], start_ts: datetime, end_ts: datetime
):
    """Return daily averages over *data* as ``[(date_str, avg), ...]``.

    The function groups by calendar day using UTC timestamps.
    """
    from collections import defaultdict

    groups: defaultdict[str, List[float]] = defaultdict(list)
    for ts, val in data:
        if not (start_ts <= ts <= end_ts):
            continue
        day_key = ts.date().isoformat()
        groups[day_key].append(val)
    result: List[Tuple[str, float]] = []
    for day in sorted(groups.keys()):
        vals = groups[day]
        if vals:
            result.append((day, sum(vals) / len(vals)))
    return result


@router.get("/24h-aqi")
def chart_24h_aqi(
    station_id: str | None = Query(None),
    db: Session = Depends(get_db),
):
    """Return hourly moving‑average AQI for the last 24 hours.

    The response format is ``[{"timestamp": iso, "avg_aqi": value}, ...]``.
    """
    now = datetime.utcnow()
    start_ts = now - timedelta(hours=24)
    data = _fetch_measurements(db, start_ts, now, station_id, field="aqi")
    ma = moving_average(data, window_size=timedelta(hours=1))
    return [{"timestamp": ts.isoformat(), "avg_aqi": val} for ts, val in ma]


@router.get("/7d-aqi")
def chart_7d_aqi(
    station_id: str | None = Query(None),
    db: Session = Depends(get_db),
):
    """Return daily average AQI for the last 7 days.

    Response format: ``[{"date": YYYY‑MM‑DD, "avg_aqi": value}, ...]``.
    """
    now = datetime.utcnow()
    start_ts = now - timedelta(days=7)
    data = _fetch_measurements(db, start_ts, now, station_id, field="aqi")
    daily = _daily_averages(data, start_ts, now)
    return [{"date": day, "avg_aqi": avg} for day, avg in daily]


@router.get("/30d-aqi")
def chart_30d_aqi(
    station_id: str | None = Query(None),
    db: Session = Depends(get_db),
):
    """Return daily average AQI for the last 30 days."""
    now = datetime.utcnow()
    start_ts = now - timedelta(days=30)
    data = _fetch_measurements(db, start_ts, now, station_id, field="aqi")
    daily = _daily_averages(data, start_ts, now)
    return [{"date": day, "avg_aqi": avg} for day, avg in daily]


@router.get("/pm25-trend")
def chart_pm25_trend(
    station_id: str | None = Query(None),
    db: Session = Depends(get_db),
):
    """Return hourly moving‑average PM2.5 for the last 24 hours."""
    now = datetime.utcnow()
    start_ts = now - timedelta(hours=24)
    data = _fetch_measurements(db, start_ts, now, station_id, field="pm25")
    ma = moving_average(data, window_size=timedelta(hours=1))
    return [{"timestamp": ts.isoformat(), "avg_pm25": val} for ts, val in ma]


@router.get("/pm10-trend")
def chart_pm10_trend(
    station_id: str | None = Query(None),
    db: Session = Depends(get_db),
):
    """Return hourly moving‑average PM10 for the last 24 hours."""
    now = datetime.utcnow()
    start_ts = now - timedelta(hours=24)
    data = _fetch_measurements(db, start_ts, now, station_id, field="pm10")
    ma = moving_average(data, window_size=timedelta(hours=1))
    return [{"timestamp": ts.isoformat(), "avg_pm10": val} for ts, val in ma]