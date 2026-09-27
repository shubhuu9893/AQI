"""Route definitions for the Weather endpoint."""

from fastapi import APIRouter, Query
from pydantic import BaseModel

from ..services.weather_service import get_weather

router = APIRouter()


class WeatherResponse(BaseModel):
    temperature:    float | None
    humidity:       int   | None
    pressure:       int   | None
    wind_speed:     float | None
    wind_direction: int   | None
    visibility:     float | None


@router.get("/weather", response_model=WeatherResponse)
def weather(
    lat: float = Query(..., description="Latitude of the location"),
    lon: float = Query(..., description="Longitude of the location"),
):
    """Return weather data for a specific geographic coordinate."""
    return get_weather(lat, lon)
