"""Nearby stations and station-by-id for the map and details pages."""

from fastapi import APIRouter, HTTPException, Query
from typing import Any

from ..services.dashboard_service import get_nearby_stations, get_station_by_id

router = APIRouter()


@router.get("/stations/nearby")
def nearby(
    latitude: float = Query(..., description="Current latitude"),
    longitude: float = Query(..., description="Current longitude"),
    radius_km: float = Query(50.0, alias="radiusKm", description="Search radius in km"),
) -> list[dict[str, Any]]:
    return get_nearby_stations(latitude, longitude, radius_km=radius_km)


@router.get("/stations/{station_id}")
def station_detail(station_id: str) -> dict[str, Any]:
    row = get_station_by_id(station_id)
    if not row:
        raise HTTPException(status_code=404, detail=f"Station '{station_id}' not found")
    return row
