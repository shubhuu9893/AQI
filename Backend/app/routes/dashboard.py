"""Unified dashboard response."""

from __future__ import annotations

from typing import Any, Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, ConfigDict, Field

from ..services.dashboard_service import get_dashboard

router = APIRouter()


class LocationInfo(BaseModel):
    city: str
    state: str
    distance_km: float


class NearbyStation(BaseModel):
    model_config = ConfigDict(extra="allow")

    id: Any
    name: str
    latitude: float
    longitude: float
    distance_km: float
    city: Optional[str] = None
    state: Optional[str] = None
    aqi: Optional[float] = None
    pm25: Optional[float] = None
    pm10: Optional[float] = None
    no2: Optional[float] = None
    so2: Optional[float] = None
    co: Optional[float] = None
    o3: Optional[float] = None
    updated_at: Optional[str] = None
    data_source: Optional[str] = None


class HistoricalSummary(BaseModel):
    air_quality: dict[str, Optional[float]] = Field(default_factory=dict)
    weather: dict[str, Optional[float]] = Field(default_factory=dict)


class DashboardResponse(BaseModel):
    location: LocationInfo
    air_quality: dict[str, Any]
    weather: dict[str, Any]
    health_risk: Optional[dict[str, Any]] = None
    nearby_stations: list[NearbyStation]
    historical_summary: HistoricalSummary


@router.get("/dashboard", response_model=DashboardResponse)
def dashboard(
    latitude: float = Query(..., description="Latitude in decimal degrees"),
    longitude: float = Query(..., description="Longitude in decimal degrees"),
):
    try:
        return get_dashboard(latitude, longitude)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
