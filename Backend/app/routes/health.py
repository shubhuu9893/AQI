"""Health check endpoint.

The router is very small on purpose – it just returns a static JSON
payload. This allows the FastAPI application to expose Swagger UI out of the box.
"""

from fastapi import APIRouter, status

router = APIRouter()


@router.get("/health", response_model=dict, status_code=status.HTTP_200_OK)
def health() -> dict:
    """Return a simple JSON indicating the API is healthy.

    The response format is intentionally minimal to keep the health check
    lightweight and fast. It can be extended in the future with additional
    diagnostic information (database status, cache health, etc.).
    """

    return {"status": "ok"}