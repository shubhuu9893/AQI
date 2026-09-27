"""Test the health‑check endpoint.

The test uses FastAPI's :class:`fastapi.testclient.TestClient` to avoid running a real server.
It verifies that the endpoint returns the expected JSON payload and HTTP status code.
"""

from fastapi.testclient import TestClient
from Backend.app.main import create_app


def test_health_endpoint() -> None:
    app = create_app()
    client = TestClient(app)

    response = client.get("/api/health")
    assert response.status_code == 200, "Health endpoint should return 200"
    assert response.json() == {"status": "ok"}, "Unexpected health response payload"