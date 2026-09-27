"""Alembic environment configuration.

This file is the standard output of ``alembic init`` but modified slightly
to import our :mod:`Backend.app.database` module so that migrations run against
the same SQLAlchemy engine used by the application. It also uses dotenv to load
environment variables when running locally.
"""

from __future__ import annotations

import os
from logging.config import fileConfig
from typing import Dict

from sqlalchemy import engine_from_config, pool
from sqlalchemy.engine.url import URL

# Import the SQLAlchemy Base and engine from the app. This keeps migration code
# DRY with the runtime application.
from Backend.app.database import Base, engine as alembic_engine

# Import all models so that the Base.metadata knows about every table. The
# ``import`` statements have no side effects beyond populating the declarative
# base.
from Backend.app.models import (
    Location,
    MonitoringStation,
    AirQualityMeasurement,
    WeatherMeasurement,
    HealthRiskRecord,
)

# this is a placeholder for Alembic's context object – it will be supplied by
# the framework when running ``alembic`` commands.
import alembic.migration
context = None  # type: ignore[assignment]


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    In offline mode, the SQL is emitted to stdout. This is useful for
    generating migration scripts without a live database connection.
    """

    url = alembic_engine.url
    context.configure(url=url, target_metadata=Base.metadata, literal_binds=True)

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations against a live database.

    The configuration is derived from the current application settings.
    """

    connectable = alembic_engine

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=Base.metadata)
        with context.begin_transaction():
            context.run_migrations()
