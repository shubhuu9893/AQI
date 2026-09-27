"""Export air-quality reports as CSV, JSON, or PDF."""

from __future__ import annotations

import csv
import io
import json
from datetime import datetime, timedelta
from typing import Any

from fastapi import APIRouter, Query, Response
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session, joinedload

from ..database import SessionLocal
from ..models.air_quality_measurements import AirQualityMeasurement
from ..models.health_risk_records import HealthRiskRecord
from ..models.location import Location
from ..models.monitoring_station import MonitoringStation
from ..models.weather_measurements import WeatherMeasurement

router = APIRouter(prefix="/api/export", tags=["export"])


class ExportRecord(BaseModel):
    location: str
    timestamp: datetime
    aqi: float | None
    pm25: float | None
    pm10: float | None
    no2: float | None
    so2: float | None
    co: float | None
    o3: float | None
    temperature: float | None = Field(None)
    humidity: float | None = Field(None)
    pressure: float | None = Field(None)
    wind_speed: float | None = None
    wind_direction: float | None = None
    visibility: float | None = None
    risk_level: str | None = None
    recommendation: str | None = None
    provider: str | None = None


def _nearest(records: list[Any], ts: datetime) -> Any | None:
    if not records:
        return None
    window = timedelta(minutes=90)
    best = None
    best_delta = None
    for rec in records:
        delta = abs(rec.timestamp - ts)
        if delta <= window and (best_delta is None or delta < best_delta):
            best = rec
            best_delta = delta
    return best


def _collect_records(session: Session, city: str, start_date: datetime, end_date: datetime) -> list[ExportRecord]:
    aqi_records = (
        session.query(AirQualityMeasurement)
        .join(MonitoringStation, AirQualityMeasurement.station_id == MonitoringStation.id)
        .join(Location, MonitoringStation.location_id == Location.id)
        .options(
            joinedload(AirQualityMeasurement.station).joinedload(MonitoringStation.location)
        )
        .filter(
            Location.name.ilike(city),
            AirQualityMeasurement.timestamp.between(start_date, end_date),
        )
        .order_by(AirQualityMeasurement.timestamp.asc())
        .limit(2000)
        .all()
    )

    station_ids = {aq.station_id for aq in aqi_records}
    weather_by_station: dict[str, list[WeatherMeasurement]] = {sid: [] for sid in station_ids}
    health_by_station: dict[str, list[HealthRiskRecord]] = {sid: [] for sid in station_ids}

    if station_ids:
        for w in (
            session.query(WeatherMeasurement)
            .filter(
                WeatherMeasurement.station_id.in_(station_ids),
                WeatherMeasurement.timestamp.between(start_date - timedelta(hours=2), end_date + timedelta(hours=2)),
            )
            .all()
        ):
            weather_by_station.setdefault(w.station_id, []).append(w)
        for h in (
            session.query(HealthRiskRecord)
            .filter(
                HealthRiskRecord.station_id.in_(station_ids),
                HealthRiskRecord.timestamp.between(start_date - timedelta(hours=12), end_date + timedelta(hours=12)),
            )
            .all()
        ):
            health_by_station.setdefault(h.station_id, []).append(h)

    result: list[ExportRecord] = []
    for aq in aqi_records:
        loc_name = aq.station.location.name if aq.station and aq.station.location else city
        weather = _nearest(weather_by_station.get(aq.station_id, []), aq.timestamp)
        health = _nearest(health_by_station.get(aq.station_id, []), aq.timestamp)
        result.append(
            ExportRecord(
                location=loc_name,
                timestamp=aq.timestamp,
                aqi=aq.aqi,
                pm25=aq.pm25,
                pm10=aq.pm10,
                no2=aq.no2,
                so2=aq.so2,
                co=aq.co,
                o3=aq.o3,
                temperature=weather.temperature if weather else None,
                humidity=weather.humidity if weather else None,
                pressure=weather.pressure if weather else None,
                wind_speed=weather.wind_speed if weather else None,
                wind_direction=weather.wind_direction if weather else None,
                visibility=weather.visibility if weather else None,
                risk_level=health.risk_level if health else None,
                recommendation=health.recommendation if health else None,
                provider=aq.source or (aq.station.provider if aq.station else None),
            )
        )
    return result


def _to_csv(records: list[ExportRecord]) -> str:
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(
        [
            "Location", "Timestamp", "AQI", "PM2.5", "PM10", "NO2", "SO2", "CO", "O3",
            "Temperature (C)", "Humidity (%)", "Pressure (hPa)", "Wind Speed (m/s)",
            "Wind Direction (deg)", "Visibility (km)", "Risk Level", "Recommendation", "Provider",
        ]
    )
    for r in records:
        writer.writerow(
            [
                r.location, r.timestamp.isoformat(), r.aqi, r.pm25, r.pm10, r.no2, r.so2, r.co, r.o3,
                r.temperature, r.humidity, r.pressure, r.wind_speed, r.wind_direction,
                r.visibility, r.risk_level, r.recommendation, r.provider,
            ]
        )
    return output.getvalue()


def _to_pdf(records: list[ExportRecord]) -> bytes:
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import landscape, letter
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=landscape(letter))
    data: list[list[Any]] = [["Location", "Timestamp", "AQI", "PM2.5", "PM10", "Risk", "Provider"]]
    for r in records[:80]:
        data.append(
            [
                r.location,
                r.timestamp.isoformat(timespec="minutes"),
                r.aqi,
                r.pm25,
                r.pm10,
                r.risk_level,
                r.provider,
            ]
        )
    table = Table(data)
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 8),
                ("GRID", (0, 0), (-1, -1), 0.4, colors.black),
            ]
        )
    )
    doc.build([table])
    pdf = buffer.getvalue()
    buffer.close()
    return pdf


@router.get("/report", response_class=Response, tags=["export"])
def get_export_report(
    city: str = Query(..., description="City name to filter by"),
    start_date: datetime | None = Query(None),
    end_date: datetime | None = Query(None),
    fmt: str = Query("csv", pattern="^(csv|json|pdf)$"),
):
    session: Session = SessionLocal()
    try:
        if not start_date and not end_date:
            now = datetime.utcnow()
            start_date = now - timedelta(days=7)
            end_date = now
        elif start_date and not end_date:
            end_date = start_date + timedelta(days=1)
        elif end_date and not start_date:
            start_date = end_date - timedelta(days=7)
        records = _collect_records(session, city, start_date, end_date)
    finally:
        session.close()

    if fmt == "json":
        content = json.dumps([r.model_dump() for r in records], default=str)
        return Response(content=content, media_type="application/json")
    if fmt == "csv":
        return Response(
            content=_to_csv(records),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={city}_report.csv"},
        )
    return Response(
        content=_to_pdf(records),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={city}_report.pdf"},
    )
