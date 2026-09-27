"""End‑to‑end test exercising SQLAlchemy insert/select against a SQLite
in‑memory database.

In production the :envvar:`DATABASE_URL` will point to Supabase PostgreSQL.
For local tests we override it so the test suite is self‑contained and fast.
"""

import os
from sqlalchemy.orm import Session

# Ensure the test database uses an in‑memory SQLite instance.
os.environ["DATABASE_URL"] = "sqlite:///:memory:"

from Backend.app.database import init_db, SessionLocal
from Backend.app.models import Location, MonitoringStation


def test_insert_and_select() -> None:
    # Create tables for the in‑memory database.
    init_db()

    session: Session = SessionLocal()
    try:
        # Insert a location.
        loc = Location(
            name="Testville",
            state="TS",
            country="India",
            latitude=12.34,
            longitude=56.78,
        )
        session.add(loc)
        session.commit()
        session.refresh(loc)

        # Insert a monitoring station linked to the location.
        st = MonitoringStation(
            location_id=loc.id,
            name="Test Station",
            provider="test",
            latitude=12.35,
            longitude=56.79,
        )
        session.add(st)
        session.commit()
        session.refresh(st)

        # Verify retrieval.
        loc_from_db = session.query(Location).filter_by(id=loc.id).one()
        st_from_db = session.query(MonitoringStation).filter_by(id=st.id).one()

        assert loc_from_db.name == "Testville"
        assert st_from_db.location_id == loc.id
    finally:
        session.close()