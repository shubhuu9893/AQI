"""Route definitions for the Air-Quality endpoint."""

from fastapi import APIRouter, Query
from pydantic import BaseModel

from ..services.airvisual_service import get_air_quality

router = APIRouter()


class AirQualityResponse(BaseModel):
    aqi:  int | None
    pm25: float | None
    pm10: float | None
    no2:  float | None
    so2:  float | None
    co:   float | None
    o3:   float | None


@router.get("/air_quality", response_model=AirQualityResponse)
def air_quality(
    lat: float = Query(..., description="Latitude of the location"),
    lon: float = Query(..., description="Longitude of the location"),
):
    """Return air-quality data for a specific geographic coordinate."""
    return get_air_quality(lat, lon)


@router.get("/air_quality/regions")
def air_quality_regions(
    macro_region: str | None = Query(None, alias="region", description="Optional macro-region filter (e.g. Europe, North America)"),
):
    """Return real-time air quality and pollutants for major geographic regions and areas."""
    from ..services.region_service import get_global_regions_aqi
    return get_global_regions_aqi(macro_filter=macro_region)
