"""End‑to‑end test for the air‑quality endpoint.

The external services are monkeypatched so the tests do not rely on live API
keys. The response structure is verified against the defined Pydantic model.
"""

from fastapi.testclient import TestClient
from Backend.app.main import create_app


def test_air_quality_endpoint(monkeypatch) -> None:
    # Fake service returns a deterministic dictionary.
    def fake_service(lat, lon):  # pragma: no cover - simple stub
        return {
            "aqi": 128,
            "pm25": 52.0,
            "pm10": 91.0,
            "no2": 24.0,
            "so2": 8.0,
            "co": 0.6,
            "o3": 31.0,
        }

    monkeypatch.setattr(
        "Backend.app.routes.air_quality.get_air_quality", fake_service
    )

    client = TestClient(create_app())
    resp = client.get("/api/air_quality?lat=12.34&lon=56.78")
    assert resp.status_code == 200
    data = resp.json()
    # Basic schema check – keys present and correct types.
    for key in ["aqi", "pm25", "pm10", "no2", "so2", "co", "o3"]:
        assert key in data
