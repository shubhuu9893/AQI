"""SQLAlchemy model for ``health_risk_records`` table."""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import Column, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from .monitoring_station import MonitoringStation
from ..database import Base


class HealthRiskRecord(Base):
    __tablename__ = "health_risk_records"
    # Allow unmapped attributes for legacy annotations.
    __allow_unmapped__ = True

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    station_id = Column(
        String(36), ForeignKey("monitoring_stations.id"), nullable=False
    )
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    risk_score = Column(Float, nullable=True)
    risk_level = Column(String, nullable=True)
    recommendation = Column(String, nullable=True)
    # Extended fields to match the specification
    affected_groups = Column(String, nullable=True)
    basis = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    station: MonitoringStation | None = relationship(
        "MonitoringStation", backref="health_risk_records"
    )

    def __repr__(self) -> str:  # pragma: no cover
        return f"\u003cHealthRiskRecord {self.id} at {self.timestamp}\u003e"