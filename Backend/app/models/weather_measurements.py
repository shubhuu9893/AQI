"""SQLAlchemy model for ``weather_measurements`` table."""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import Column, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from .monitoring_station import MonitoringStation
from ..database import Base


class WeatherMeasurement(Base):
    __tablename__ = "weather_measurements"
    # Allow unmapped attributes for legacy annotations.
    __allow_unmapped__ = True

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    station_id = Column(
        String(36), ForeignKey("monitoring_stations.id"), nullable=False
    )
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    temperature = Column(Float, nullable=True)
    humidity = Column(Float, nullable=True)
    pressure = Column(Float, nullable=True)
    wind_speed = Column(Float, nullable=True)
    wind_direction = Column(Float, nullable=True)
    visibility = Column(Float, nullable=True)
    # New fields for the extended schema
    weather_condition = Column(String, nullable=True)
    source = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    station: MonitoringStation | None = relationship(
        "MonitoringStation", backref="weather_measurements"
    )

    def __repr__(self) -> str:  # pragma: no cover
        return f"\u003cWeatherMeasurement {self.id} at {self.timestamp}\u003e"