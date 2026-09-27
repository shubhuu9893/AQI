"""Service layer for calculating and persisting health risk assessments.

The algorithm is intentionally simple but demonstrates how real‑world
thresholds can be mapped to a risk score.  It uses the ``HealthRiskRecord``
model defined in :mod:`Backend.app.models.health_risk_records`.
"""

from __future__ import annotations

from datetime import datetime
from typing import Dict, Tuple

from sqlalchemy.orm import Session

from ..models.air_quality_measurements import AirQualityMeasurement
from ..models.health_risk_records import HealthRiskRecord

# ---------------------------------------------------------------------------
# Thresholds for normalisation (WHO 2021 reference values – simplified).
THRESHOLDS: Dict[str, float] = {
    "aqi": 100.0,   # 100 is the boundary between good and moderate.
    "pm25": 35.0,   # µg/m3 (24‑h)
    "pm10": 45.0,
    "no2": 200.0,
    "so2": 20.0,
    "co": 10.0,     # mg/m3
    "o3": 100.0,
}

# ---------------------------------------------------------------------------
def _normalize(value: float | None, threshold: float) -> float:
    """Return a number in the range ``[0, 1]``.

    If *value* is ``None`` or less than zero it is treated as zero.
    The result is capped at 1.
    """
    if value is None or value < 0:
        return 0.0
    return min(value / threshold, 1.0)


def calculate_risk(metrics: Dict[str, float | None]) -> Tuple[float, str, str]:
    """Return ``(risk_score, risk_level, recommendation)``.

    Parameters
    ----------
    metrics:
        Dictionary containing at least the keys defined in :data:`THRESHOLDS`.
        Missing or ``None`` values are treated as zero.
    """
    norms = []
    for key, threshold in THRESHOLDS.items():
        norms.append(_normalize(metrics.get(key), threshold))

    # Average normalised value -> score in range 0–100
    avg_norm = sum(norms) / len(norms)
    risk_score = round(avg_norm * 100, 1)

    if risk_score <= 40:
        level = "Low Risk"
    elif risk_score <= 70:
        level = "Moderate Risk"
    elif risk_score <= 90:
        level = "High Risk"
    else:
        level = "Very High Risk"

    RECOMMENDATIONS = {
        "Low Risk": (
            "General: Normal outdoor activity.",
            "Sensitive groups: No special precautions required.",
        ),
        "Moderate Risk": (
            "General: Normal outdoor activity with caution.",
            "Sensitive groups: Consider reducing prolonged outdoor exposure.",
        ),
        "High Risk": (
            "General: Avoid strenuous outdoor activities.",
            "Sensitive groups: Stay indoors and use air purifiers.",
        ),
        "Very High Risk": (
            "General: No outdoor activities.",
            "Sensitive groups: Seek medical attention if symptoms appear.",
        ),
    }

    general, sensitive = RECOMMENDATIONS[level]
    recommendation = f"{general} {sensitive}"  # combine for DB storage

    return risk_score, level, recommendation


def evaluate_and_store(
    session: Session,
    station_id: str,
    metrics: Dict[str, float | None],
) -> HealthRiskRecord:
    """Calculate the health risk and persist a record.

    The function commits immediately. It returns the created
    :class:`HealthRiskRecord` instance.
    """
    filled = dict(metrics or {})
    if not any(v is not None for v in filled.values()):
        latest = (
            session.query(AirQualityMeasurement)
            .filter(AirQualityMeasurement.station_id == station_id)
            .order_by(AirQualityMeasurement.timestamp.desc())
            .first()
        )
        if latest:
            filled = {
                "aqi": latest.aqi,
                "pm25": latest.pm25,
                "pm10": latest.pm10,
                "no2": latest.no2,
                "so2": latest.so2,
                "co": latest.co,
                "o3": latest.o3,
            }

    score, level, rec = calculate_risk(filled)
    record = HealthRiskRecord(
        station_id=station_id,
        timestamp=datetime.utcnow(),
        risk_score=score,
        risk_level=level,
        recommendation=rec,
    )
    session.add(record)
    session.commit()
    session.refresh(record)
    return record