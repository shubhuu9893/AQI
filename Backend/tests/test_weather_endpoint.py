"""Test for the weather endpoint.

The service is monkeypatched so no external API calls are made. The test
verifies that the response matches the normalised contract defined in
``WeatherResponse``.
"""

from fastapi.testclient import TestClient
from Backend.app.main import create_app


def test_weather_endpoint(monkeypatch) -> None:
    def fake_service(lat, lon):  # pragma: no cover - simple stub
        return {
            "temperature": 27.0,
            "humidity": 72,
            "pressure": 1008,
            "wind_speed": 12.0,
            "wind_direction": 315,
            "visibility": 6.0,
        }

    monkeypatch.setattr(
        "Backend.app.routes.weather.get_weather", fake_service
    )

    client = TestClient(create_app())
    resp = client.get("/api/weather?lat=12.34&lon=56.78")
    assert resp.status_code == 200
    data = resp.json()
    for key in ["temperature", "humidity", "pressure", "wind_speed", "wind_direction", "visibility"]:
        assert key in data