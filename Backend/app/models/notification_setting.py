"""Model storing user‑defined AQI thresholds for notification.

The application currently does not have a full user management system, so the
model contains only a minimal payload that identifies a target location by city
name and stores the threshold value along with an optional FCM registration
token.  The token is used when pushing notifications to a mobile device.

In a real deployment you would replace this with a proper User model and
relate thresholds via a foreign key.
"""

from __future__ import annotations

import uuid
from sqlalchemy import Column, String, Float
from ..database import Base


class NotificationSetting(Base):
    __tablename__ = "notification_settings"
    # Allow unmapped attributes for legacy annotations.
    __allow_unmapped__ = True

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    city = Column(String, nullable=False)
    threshold_aqi = Column(Float, nullable=False)
    fcm_token = Column(String, nullable=True)

    def __repr__(self) -> str:  # pragma: no cover - debug helper
        return (
            f"<NotificationSetting {self.id} city={self.city} threshold={self.threshold_aqi}>"
        )