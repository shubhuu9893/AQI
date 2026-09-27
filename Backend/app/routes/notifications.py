"""AQI threshold settings and optional FCM alerts."""

from __future__ import annotations

import time
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import event
from sqlalchemy.orm import Session

from ..config import get_settings
from ..database import SessionLocal, get_db
from ..models.air_quality_measurements import AirQualityMeasurement
from ..models.location import Location
from ..models.monitoring_station import MonitoringStation
from ..models.notification_setting import NotificationSetting
from ..services.http_client import http_post_json

router = APIRouter(prefix="/notifications", tags=["Notifications"])


def _send_fcm(token: str, title: str, body: str) -> None:
    settings = get_settings()
    if not settings.fcm_server_key:
        return
    try:
        http_post_json(
            "https://fcm.googleapis.com/fcm/send",
            headers={
                "Authorization": f"key={settings.fcm_server_key}",
                "Content-Type": "application/json",
            },
            json={
                "to": token,
                "notification": {"title": title, "body": body},
                "data": {"timestamp": datetime.utcnow().isoformat()},
            },
        )
    except Exception as exc:
        print(f"FCM send failed: {exc}")


def _check_thresholds_and_notify(db: Session, measurement: AirQualityMeasurement) -> None:
    station = db.get(MonitoringStation, measurement.station_id)
    if not station:
        return
    location = db.get(Location, station.location_id)
    city = location.name if location else None
    if not city:
        return

    thresholds = db.query(NotificationSetting).filter(NotificationSetting.city == city).all()
    current_aqi = measurement.aqi
    for thresh in thresholds:
        if current_aqi is None or thresh.threshold_aqi is None:
            continue
        if current_aqi > thresh.threshold_aqi and thresh.fcm_token:
            _send_fcm(
                thresh.fcm_token,
                f"AQI alert for {city}",
                f"AQI near your location is {current_aqi}",
            )


_threshold_cache = {"ts": 0.0, "has": False}


def _thresholds_configured() -> bool:
    now = time.time()
    if now - _threshold_cache["ts"] < 30:
        return _threshold_cache["has"]
    db = SessionLocal()
    try:
        _threshold_cache["has"] = db.query(NotificationSetting).first() is not None
        _threshold_cache["ts"] = now
    except Exception:
        return False
    finally:
        db.close()
    return _threshold_cache["has"]


@event.listens_for(AirQualityMeasurement, "after_insert")
def after_insert_air_quality(_mapper, _connection, target):  # pragma: no cover
    if not _thresholds_configured():
        return
    db = SessionLocal()
    try:
        _check_thresholds_and_notify(db, target)
    except Exception as exc:
        print(f"notification hook failed: {exc}")
    finally:
        db.close()


class ThresholdRequest(BaseModel):
    city: str
    threshold_aqi: float
    fcm_token: Optional[str] = None


@router.post("/set", summary="Set an AQI threshold for a city")
def set_threshold(req: ThresholdRequest, db: Session = Depends(get_db)):
    existing = (
        db.query(NotificationSetting)
        .filter(NotificationSetting.city == req.city)
        .first()
    )
    if existing:
        existing.threshold_aqi = req.threshold_aqi
        existing.fcm_token = req.fcm_token
        db.commit()
        return {"id": existing.id, "city": existing.city, "threshold_aqi": existing.threshold_aqi}

    new = NotificationSetting(
        city=req.city, threshold_aqi=req.threshold_aqi, fcm_token=req.fcm_token
    )
    db.add(new)
    db.commit()
    db.refresh(new)
    _threshold_cache["has"] = True
    _threshold_cache["ts"] = time.time()
    return {"id": new.id, "city": new.city, "threshold_aqi": new.threshold_aqi}


@router.get("/list", summary="List all thresholds")
def list_thresholds(db: Session = Depends(get_db)):
    rows = db.query(NotificationSetting).all()
    return [{"id": r.id, "city": r.city, "threshold_aqi": r.threshold_aqi} for r in rows]
