"""Resolve GPS coordinates to the nearest city / monitoring station."""

from __future__ import annotations

from typing import Any

from sqlalchemy.orm import Session

from ..database import SessionLocal
from ..models.location import Location
from ..models.monitoring_station import MonitoringStation
from ..utils.dsa.haversine import LatLon, haversine

# Maximum proximity distance to consider a local station match (100km)
MAX_STATION_MATCH_DISTANCE_KM = 100.0


def resolve_location(lat: float, lon: float, session: Session | None = None) -> dict[str, Any]:
    close = session is None
    db = session or SessionLocal()
    try:
        stations = db.query(MonitoringStation).all()
        target = LatLon(lat, lon)

        if stations:
            best_station = None
            min_distance = float("inf")
            for st in stations:
                d = haversine(target, LatLon(st.latitude, st.longitude))
                if d < min_distance:
                    min_distance = d
                    best_station = st
            if best_station and min_distance <= MAX_STATION_MATCH_DISTANCE_KM:
                loc = db.query(Location).filter_by(id=best_station.location_id).one_or_none()
                if loc:
                    return {
                        "city": loc.name,
                        "state": loc.state or "",
                        "country": loc.country or "",
                        "distance_km": round(min_distance, 1),
                        "station_id": best_station.id,
                    }

        locations = db.query(Location).all()
        if locations:
            best_loc = None
            min_distance = float("inf")
            for loc in locations:
                d = haversine(target, LatLon(loc.latitude, loc.longitude))
                if d < min_distance:
                    min_distance = d
                    best_loc = loc
            if best_loc and min_distance <= MAX_STATION_MATCH_DISTANCE_KM:
                return {
                    "city": best_loc.name,
                    "state": (best_loc.state if best_loc else "") or "",
                    "country": (best_loc.country if best_loc else "") or "",
                    "distance_km": round(min_distance, 1),
                    "station_id": None,
                }

        return {
            "city": "",
            "state": "",
            "country": "",
            "distance_km": 0.0,
            "station_id": None,
        }
    finally:
        if close:
            db.close()
