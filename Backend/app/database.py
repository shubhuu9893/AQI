"""SQLAlchemy setup for the FastAPI backend."""

from __future__ import annotations

from pathlib import Path

from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, DeclarativeMeta, declarative_base

from .config import get_settings

settings = get_settings()

_db_url = settings.database_url or ""

if not _db_url or _db_url == "postgresql://localhost/dbname":
    _sqlite_path = Path(__file__).resolve().parent.parent / "airhealth.db"
    _db_url = f"sqlite:///{_sqlite_path}"

_is_sqlite = _db_url.startswith("sqlite")
_connect_args = {"check_same_thread": False} if _is_sqlite else {}

engine = create_engine(_db_url, echo=False, connect_args=_connect_args)

if _is_sqlite:
    @event.listens_for(engine, "connect")
    def _set_sqlite_pragma(dbapi_connection, _connection_record) -> None:
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.execute("PRAGMA busy_timeout=5000")
        cursor.close()


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base: DeclarativeMeta = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """Create tables if they don't exist. Safe to call on every startup."""
    try:
        from .models import (  # noqa: F401 - register with Base.metadata
            air_quality_measurements,
            weather_measurements,
            health_risk_records,
            monitoring_station,
            location,
            notification_setting,
        )
        Base.metadata.create_all(bind=engine)
    except Exception as exc:
        import logging
        logging.getLogger(__name__).warning("init_db skipped: %s", exc)
