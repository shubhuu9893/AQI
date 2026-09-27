"""Endpoint for searching and filtering air quality measurements.

The API accepts a variety of query parameters, performs all filtering/sorting in
PostgreSQL via SQLAlchemy and returns the raw measurement data. The route is
intended to be used by the mobile UI when users want to explore historical or
near‑by data.
"""

from fastapi import APIRouter, Query, Depends
from datetime import datetime
from typing import Optional

from ..services.measurement_service import search_measurements
# Import the FastAPI dependency that yields a DB session.
from ..database import get_db

router = APIRouter()


@router.get("/search", response_model=list)
def get_search(
    city: Optional[str] = Query(None, description="City name for filtering"),
    date_from: Optional[datetime] = Query(None, alias="dateFrom"),
    date_to: Optional[datetime] = Query(None, alias="dateTo"),
    pollutant: Optional[str] = Query(None, description="PM25, PM10, CO…"),
    aqi_category: Optional[str] = Query(
        None,
        alias="aqiCategory",
        description="good|moderate|unhealthy-sensitive|...",  # see service
    ),
    sort_by: str = Query("newest", alias="sortBy", description="Sort order"),
    db=Depends(get_db),
):
    return search_measurements(
        session=db,
        city=city,
        date_from=date_from,
        date_to=date_to,
        pollutant=pollutant,
        aqi_category=aqi_category,
        sort_by=sort_by,
    )