"""Utility script used in the project repo for seeding historical data.

The function :func:`seed_measurements` accepts a station id and a list of
``(timestamp, aqi)`` tuples. It then inserts them into the
``air_quality_measurements`` table via SQLAlchemy.

This script is intentionally lightweight – it opens a temporary session,
creates the objects, commits, and closes the session. It's handy for manual
testing when you want to populate the database with historical values like:

>>> from datetime import datetime
>>> seed_measurements("station123", [
...     (datetime(2024, 9, 23, 10), 120),
...     (datetime(2024, 9, 23, 11), 128),
... ])

The script also demonstrates how to run it from the repository root:

``python -m Backend.scripts.load_sample_history``
"""

from __future__ import annotations

import sys
from datetime import datetime, timedelta
from typing import Iterable, Tuple

from sqlalchemy.orm import Session

from ..database import SessionLocal
from ..models.air_quality_measurements import AirQualityMeasurement


def seed_measurements(station_id: str, data: Iterable[Tuple[datetime, float]]) -> None:
    """Insert a sequence of AQI records for the given station.

    Parameters
    ----------
    station_id: str
        Primary key of an existing :class:`MonitoringStation`.
    data: Iterable[Tuple[datetime, float]]
        Each tuple contains a UTC timestamp and the corresponding AQI value.
    """

    with SessionLocal() as session:
        for ts, aqi in data:
            rec = AirQualityMeasurement(
                station_id=station_id,
                timestamp=ts,
                aqi=float(aqi),
            )
            session.add(rec)
        session.commit()


if __name__ == "__main__":  # pragma: no cover
    if len(sys.argv) < 2:
        print("Usage: python -m Backend.scripts.load_sample_history <station_id>")
        sys.exit(1)
    sid = sys.argv[1]
    now = datetime.utcnow()
    sample_data = [
        (now - timedelta(hours=3), 120),
        (now - timedelta(hours=2), 128),
        (now - timedelta(hours=1), 134),
        (now, 142),
    ]
    seed_measurements(sid, sample_data)
    print("Seeded history data for", sid)