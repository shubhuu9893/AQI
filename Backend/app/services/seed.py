"""Seed Indian monitoring stations and historical measurements for local/dev use."""

from __future__ import annotations

import math
import random
from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from ..database import SessionLocal
from ..models.location import Location
from ..models.monitoring_station import MonitoringStation
from ..models.air_quality_measurements import AirQualityMeasurement
from ..models.weather_measurements import WeatherMeasurement
from ..models.health_risk_records import HealthRiskRecord
from .health_risk_service import calculate_risk

# Matches frontend DEMO_CITIES so search/compare stay aligned.
CITIES = [
    ("delhi", "Delhi", "Delhi", 28.6139, 77.2090, 180),
    ("mumbai", "Mumbai", "Maharashtra", 19.0760, 72.8777, 95),
    ("pune", "Pune", "Maharashtra", 18.5204, 73.8567, 85),
    ("bangalore", "Bangalore", "Karnataka", 12.9716, 77.5946, 70),
    ("chennai", "Chennai", "Tamil Nadu", 13.0827, 80.2707, 75),
    ("kolkata", "Kolkata", "West Bengal", 22.5726, 88.3639, 140),
    ("hyderabad", "Hyderabad", "Telangana", 17.3850, 78.4867, 90),
    ("ahmedabad", "Ahmedabad", "Gujarat", 23.0225, 72.5714, 120),
    ("jaipur", "Jaipur", "Rajasthan", 26.9124, 75.7873, 110),
    ("lucknow", "Lucknow", "Uttar Pradesh", 26.8467, 80.9462, 160),
    ("kanpur", "Kanpur", "Uttar Pradesh", 26.4499, 80.3319, 170),
    ("patna", "Patna", "Bihar", 25.5941, 85.1376, 165),
    ("surat", "Surat", "Gujarat", 21.1702, 72.8311, 100),
    ("nagpur", "Nagpur", "Maharashtra", 21.1458, 79.0882, 95),
    ("indore", "Indore", "Madhya Pradesh", 22.7196, 75.8577, 105),
    ("bhopal", "Bhopal", "Madhya Pradesh", 23.2599, 77.4126, 100),
    ("visakhapatnam", "Visakhapatnam", "Andhra Pradesh", 17.6868, 83.2185, 80),
    ("kochi", "Kochi", "Kerala", 9.9312, 76.2673, 55),
]


def seed_if_empty() -> None:
    session = SessionLocal()
    try:
        if session.query(Location).count() > 0:
            return
        _seed(session)
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def _seed(session: Session) -> None:
    now = datetime.utcnow()
    hours = 24 * 30  # 30 days of hourly points

    for slug, name, state, lat, lon, base_aqi in CITIES:
        loc = Location(
            id=f"loc-{slug}",
            name=name,
            state=state,
            country="India",
            latitude=lat,
            longitude=lon,
            created_at=now,
        )
        session.add(loc)

        offsets = [(-0.03, 0.02), (0.025, -0.03)]
        station_ids: list[str] = []
        for idx, (dlat, dlon) in enumerate(offsets, start=1):
            sid = f"{slug}-{idx}"
            station_ids.append(sid)
            session.add(
                MonitoringStation(
                    id=sid,
                    location_id=loc.id,
                    name=f"{name} Station {idx}",
                    provider="CPCB",
                    external_station_id=sid,
                    latitude=round(lat + dlat, 4),
                    longitude=round(lon + dlon, 4),
                    is_active="True",
                    created_at=now,
                    updated_at=now,
                )
            )

        rng = random.Random(slug)
        for hour in range(hours, -1, -3):  # every 3 hours → ~240 points / station
            ts = now - timedelta(hours=hour)
            diurnal = 18 * math.sin((hour % 24) / 24 * 2 * math.pi)
            for sid in station_ids:
                aqi = max(12, min(450, base_aqi + diurnal + rng.uniform(-22, 22)))
                pm25 = max(4.0, aqi * 0.42 + rng.uniform(-5, 5))
                pm10 = max(8.0, pm25 * 1.7 + rng.uniform(-8, 8))
                no2 = max(2.0, aqi * 0.28 + rng.uniform(-6, 6))
                so2 = max(1.0, 6 + rng.uniform(-2, 8))
                co = max(0.2, 0.8 + rng.uniform(-0.3, 0.9))
                o3 = max(8.0, 35 + rng.uniform(-10, 20))

                session.add(
                    AirQualityMeasurement(
                        station_id=sid,
                        timestamp=ts,
                        aqi=round(aqi, 1),
                        pm25=round(pm25, 1),
                        pm10=round(pm10, 1),
                        no2=round(no2, 1),
                        so2=round(so2, 1),
                        co=round(co, 2),
                        o3=round(o3, 1),
                        source="seed",
                        created_at=ts,
                    )
                )

                temp = 22 + 8 * math.sin((hour % 24) / 24 * 2 * math.pi) + rng.uniform(-2, 2)
                session.add(
                    WeatherMeasurement(
                        station_id=sid,
                        timestamp=ts,
                        temperature=round(temp, 1),
                        humidity=round(max(25, min(95, 58 + rng.uniform(-15, 15))), 0),
                        pressure=round(1008 + rng.uniform(-6, 6), 1),
                        wind_speed=round(max(0.5, 3.2 + rng.uniform(-1.5, 2.5)), 1),
                        wind_direction=round(rng.uniform(0, 359), 0),
                        visibility=round(max(1.0, 8 + rng.uniform(-3, 4)), 1),
                        weather_condition="Clear",
                        source="seed",
                        created_at=ts,
                    )
                )

                if hour % 24 == 0:
                    metrics = {
                        "aqi": aqi,
                        "pm25": pm25,
                        "pm10": pm10,
                        "no2": no2,
                        "so2": so2,
                        "co": co,
                        "o3": o3,
                    }
                    score, level, rec = calculate_risk(metrics)
                    session.add(
                        HealthRiskRecord(
                            station_id=sid,
                            timestamp=ts,
                            risk_score=score,
                            risk_level=level,
                            recommendation=rec,
                            affected_groups="Sensitive groups",
                            basis="WHO-simplified thresholds",
                            created_at=ts,
                        )
                    )
