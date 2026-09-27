"""SQLAlchemy model for the ``air_quality_measurements`` table."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import Column, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from .monitoring_station import MonitoringStation
from ..database import Base


class AirQualityMeasurement(Base):
    __tablename__ = "air_quality_measurements"
    # Allow unmapped attributes for legacy annotations.
    __allow_unmapped__ = True

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    station_id = Column(
        String(36), ForeignKey("monitoring_stations.id"), nullable=False
    )
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    aqi = Column(Float, nullable=True)
    pm25 = Column(Float, nullable=True)
    pm10 = Column(Float, nullable=True)
    no2 = Column(Float, nullable=True)
    so2 = Column(Float, nullable=True)
    co = Column(Float, nullable=True)
    o3 = Column(Float, nullable=True)
    # Additional fields required by the updated schema
    source = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    station: MonitoringStation | None = relationship(
        "MonitoringStation", backref="air_quality_measurements"
    )

    def __repr__(self) -> str:  # pragma: no cover - debugging helper
        return f"<AirQualityMeasurement {self.id} at {self.timestamp}>"