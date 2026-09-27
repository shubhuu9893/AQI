"""SQLAlchemy model for monitoring stations."""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import Column, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .location import Location
from ..database import Base


class MonitoringStation(Base):
    __tablename__ = "monitoring_stations"
    # Allow unmapped attributes for legacy annotations that don't use Mapped[].
    __allow_unmapped__ = True

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    location_id = Column(String(36), ForeignKey("locations.id"), nullable=False)
    name = Column(String, nullable=False)
    provider = Column(String, nullable=True)
    external_station_id = Column(String, nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    # New columns to match the updated schema
    is_active = Column(String(5), default="True", nullable=False)  # simple flag
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    location: Location | None = relationship("Location", backref="stations")