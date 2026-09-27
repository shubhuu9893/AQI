"""Compare two cities on air-quality and weather metrics."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..services.city_metrics import aggregate_city_metrics, find_location_by_name

router = APIRouter(prefix="/compare", tags=["City Comparison"])


@router.get("/cities", summary="Compare two cities")
def compare_cities(
    city1: str = Query(..., description="First city to compare"),
    city2: str = Query(..., description="Second city to compare"),
    db: Session = Depends(get_db),
):
    if city1.lower() == city2.lower():
        raise HTTPException(status_code=400, detail="Cities must be different")

    if not find_location_by_name(db, city1):
        raise HTTPException(status_code=404, detail=f"No data found for {city1}")
    if not find_location_by_name(db, city2):
        raise HTTPException(status_code=404, detail=f"No data found for {city2}")

    return {
        "city1": {"name": city1, "metrics": aggregate_city_metrics(db, city1)},
        "city2": {"name": city2, "metrics": aggregate_city_metrics(db, city2)},
    }
