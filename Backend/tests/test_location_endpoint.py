"""End‑to‑end test for the location resolution endpoint.

An in‑memory SQLite database is populated with a single station/city pair. The
test posts coordinates that are close to this record and verifies the JSON
response.
"""

import os
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Import after setting env for in‑memory DB.
os.environ["DATABASE_URL"] = "sqlite:///:memory:"
from Backend.app.main import create_app
from Backend.app.database import Base, engine, SessionLocal
from Backend.models.location import Location
from Backend.models.monitoring_station import MonitoringStation


def init_db() -> None:
    Base.metadata.create_all(bind=engine)
    # Populate a single location/station.
    session = SessionLocal()
    loc = Location(name="Pune", city="Pune", state="Maharashtra", country="India", latitude=18.5204, longitude=73.8567)
    session.add(loc)
    session.flush()  # get id
    st = MonitoringStation(location_id=loc.id, name="Test Station", latitude=18.5210, longitude=73.8570)
    session.add(st)
    session.commit()
    session.close()


def test_resolve_location() -> None:
    init_db()
    client = TestClient(create_app())
    # Coordinates very close to the station
    resp = client.post(
        "/api/location/resolve",
        json={"lat": 18.5204, "lon": 73.8567},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["city"] == "Pune"
    assert data["state"] == "Maharashtra"
    # Distance should be small (within a few hundred metres)
    assert data["distance_km"] < 1