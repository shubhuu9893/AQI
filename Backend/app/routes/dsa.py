"""Educational DSA utilities backed by real station data."""

from fastapi import APIRouter, Body, Depends, Query
from datetime import datetime
from typing import Any

from sqlalchemy.orm import Session

from ..database import get_db
from ..models.air_quality_measurements import AirQualityMeasurement
from ..models.monitoring_station import MonitoringStation
from ..utils.dsa.binary_search_range import find_range
from ..utils.dsa.haversine import LatLon
from ..utils.dsa.hashmap_lookup import build_latest_map
from ..utils.dsa.heap_topk import top_k_by_aqi
from ..utils.dsa.nearest_station import StationInfo, nearest_station

router = APIRouter(prefix="/dsa", tags=["DSA Examples"])


@router.get("/nearest-station")
def dsa_nearest_station(
    lat: float = Query(...),
    lon: float = Query(...),
    db: Session = Depends(get_db),
):
    stations = db.query(MonitoringStation).all()
    station_infos = [
        StationInfo(id=st.id, name=st.name, latitude=st.latitude, longitude=st.longitude)
        for st in stations
    ]
    nearest = nearest_station(LatLon(lat, lon), station_infos)
    if not nearest:
        return {"error": "No stations found"}
    return {
        "id": nearest.id,
        "name": nearest.name,
        "latitude": nearest.latitude,
        "longitude": nearest.longitude,
    }


@router.post("/topk-aqi")
def dsa_top_k_aqi(body: dict[str, Any] = Body(...), db: Session = Depends(get_db)):
    k: int = int(body.get("k", 5))
    recs = (
        db.query(AirQualityMeasurement)
        .filter(AirQualityMeasurement.aqi.isnot(None))
        .order_by(AirQualityMeasurement.timestamp.desc())
        .limit(2000)
        .all()
    )
    latest_map = build_latest_map(recs)
    top_k = top_k_by_aqi(latest_map.values(), k)
    return {"top_k": [{"station_id": sid, "aqi": aqi} for sid, aqi in top_k]}


@router.get("/historical-range")
def dsa_historical_range(
    station_id: str,
    start: datetime,
    end: datetime,
    db: Session = Depends(get_db),
):
    recs = (
        db.query(AirQualityMeasurement)
        .filter(AirQualityMeasurement.station_id == station_id)
        .order_by(AirQualityMeasurement.timestamp.asc())
        .all()
    )
    start_idx, end_idx = find_range(recs, start, end)
    if end_idx < start_idx:
        sliced = []
    else:
        sliced = recs[start_idx : end_idx + 1]
    return {
        "records": [
            {
                "id": r.id,
                "timestamp": r.timestamp.isoformat(),
                "aqi": r.aqi,
                "pm25": r.pm25,
            }
            for r in sliced
        ]
    }
