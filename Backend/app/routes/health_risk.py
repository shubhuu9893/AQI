"""Health-risk assessment for a monitoring station."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.air_quality_measurements import AirQualityMeasurement
from ..models.monitoring_station import MonitoringStation
from ..services.health_risk_service import evaluate_and_store

router = APIRouter(prefix="/health-risk", tags=["Health Risk"])


@router.post("/{station_id}")
def assess_health(
    station_id: str,
    metrics: dict[str, Any] | None = None,
    db: Session = Depends(get_db),
):
    station = db.get(MonitoringStation, station_id)
    if not station:
        raise HTTPException(status_code=404, detail=f"Station '{station_id}' not found")

    payload = metrics or {}
    useful = {k: v for k, v in payload.items() if v is not None}
    if not useful:
        latest = (
            db.query(AirQualityMeasurement)
            .filter(AirQualityMeasurement.station_id == station_id)
            .order_by(AirQualityMeasurement.timestamp.desc())
            .first()
        )
        if latest:
            useful = {
                "aqi": latest.aqi,
                "pm25": latest.pm25,
                "pm10": latest.pm10,
                "no2": latest.no2,
                "so2": latest.so2,
                "co": latest.co,
                "o3": latest.o3,
            }

    try:
        record = evaluate_and_store(db, station_id, useful)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return {
        "id": record.id,
        "station_id": record.station_id,
        "timestamp": record.timestamp.isoformat(),
        "risk_score": record.risk_score,
        "risk_level": record.risk_level,
        "recommendation": record.recommendation,
    }
