"""Entry point for the FastAPI application."""

from __future__ import annotations

import os

from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from .config import get_settings
from .database import init_db
from .routes.air_quality import router as air_quality_router
from .routes.charts import router as charts_router
from .routes.comparison import router as comparison_router
from .routes.dashboard import router as dashboard_router
from .routes.dsa import router as dsa_router
from .routes.exports import router as exports_router
from .routes.gemini import router as gemini_router
from .routes.health import router as health_router
from .routes.health_risk import router as health_risk_router
from .routes.history import router as history_router
from .routes.location import router as location_router
from .routes.notifications import router as notifications_router
from .routes.search_measurements import router as search_router
from .routes.stations import router as stations_router
from .routes.weather import router as weather_router
from .services.seed import seed_if_empty
from .utils.cache import init_cache


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title="AirHealth India API", version="0.2.0")

    raw_origins = (settings.cors_origins or "*").strip()
    origins_list = ["*"] if raw_origins == "*" else [o.strip() for o in raw_origins.split(",") if o.strip()]
    allow_credentials = origins_list != ["*"]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins_list,
        allow_credentials=allow_credentials,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["*"],
    )

    app.include_router(health_router, prefix="/api")
    app.include_router(air_quality_router, prefix="/api")
    app.include_router(weather_router, prefix="/api")
    app.include_router(location_router, prefix="/api")
    app.include_router(dashboard_router, prefix="/api")
    app.include_router(history_router, prefix="/api")
    app.include_router(search_router, prefix="/api")
    app.include_router(health_risk_router, prefix="/api")
    app.include_router(dsa_router, prefix="/api")
    app.include_router(charts_router, prefix="/api")
    app.include_router(notifications_router, prefix="/api")
    app.include_router(comparison_router, prefix="/api")
    app.include_router(gemini_router, prefix="/api")
    app.include_router(stations_router, prefix="/api")
    app.include_router(exports_router, prefix="")

    # ------------------------------------------------------------------
    # Root endpoint – returns a friendly message and helps health‑check tools
    # that hit the root path.  The application originally did not expose a
    # ``/`` route; this caused repeated 404 logs when external probes (or a
    # browser navigating to http://localhost:8000/) attempted to access the
    # root.  Providing an explicit route resolves that problem while keeping
    # the rest of the API unchanged.
    # ------------------------------------------------------------------
    @app.get("/", tags=["root"])
    async def read_root() -> dict:
        return {
            "status": "ok",
            "service": "AQI API",
            "message": "AirHealth API is running. Use /docs for Swagger UI.",
        }

    @app.on_event("startup")
    def _on_startup() -> None:
        init_cache()
        from .database import init_db
        from .services.seed import seed_if_empty
        init_db()
        seed_if_empty()
        if settings.environment.lower() != "production":
            init_db()
            seed_if_empty()
        else:
            init_db()
            seed_if_empty()

    return app


app = create_app()

if __name__ == "__main__":
    from uvicorn import run

    port = int(os.getenv("PORT", "8000"))
    run("app.main:app", host="0.0.0.0", port=port, reload=True)
