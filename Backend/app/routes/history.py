"""Endpoint for fetching historical measurement data."""

from fastapi import APIRouter, Depends, Query
from datetime import datetime
from typing import Optional

from ..services.history_service import get_history
# Import the FastAPI dependency that yields a DB session.
from ..database import get_db

router = APIRouter()


@router.get("/history", response_model=dict)
def history(
    station_id: str = Query(..., description="Monitoring station id"),
    period: str = Query("24h", pattern="^(24h|7d|30d)$", description="Predefined period or leave empty for custom"),
    start: Optional[datetime] = Query(None, description="ISO datetime for custom range start"),
    end: Optional[datetime] = Query(None, description="ISO datetime for custom range end"),
    db=Depends(get_db),
):
    return get_history(station_id, period=period, start=start, end=end, session=db)