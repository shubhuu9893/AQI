"""Endpoint for resolving GPS coordinates to nearest monitoring station.

The client POSTs a JSON payload ``{ "lat": 12.34, "lon": 56.78 }`` and receives a
JSON response with the nearest city, state and distance in kilometers.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from ..services.location_service import resolve_location

router = APIRouter()


class LocationResolveRequest(BaseModel):
    lat: float = Field(..., description="Latitude in decimal degrees")
    lon: float = Field(..., description="Longitude in decimal degrees")


class LocationResolveResponse(BaseModel):
    city: str
    state: str
    distance_km: float


@router.post("/location/resolve", response_model=LocationResolveResponse)
def resolve(request: LocationResolveRequest) -> LocationResolveResponse:
    try:
        result = resolve_location(request.lat, request.lon)
        return LocationResolveResponse(**result)
    except RuntimeError as exc:  # pragma: no cover - defensive
        raise HTTPException(status_code=500, detail=str(exc)) from exc