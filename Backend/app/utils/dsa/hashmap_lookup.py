"""Hash‑map based fast lookups for station latest data.

The real backend already fetches the most recent measurement per station via a
``GROUP BY`` query.  For in‑memory caching we expose a tiny helper that turns a
list of records into a dictionary keyed by ``station_id``.
"""

from __future__ import annotations

from typing import Dict, Iterable

from ...models.air_quality_measurements import AirQualityMeasurement


def build_latest_map(records: Iterable[AirQualityMeasurement]) -> Dict[str, AirQualityMeasurement]:
    """Return a mapping of station_id → latest measurement.

    ``records`` are expected to be sorted by ``timestamp`` descending so that
    the first encountered record for each station is the most recent.
    """
    latest: Dict[str, AirQualityMeasurement] = {}
    for rec in records:
        if rec.station_id not in latest:
            latest[rec.station_id] = rec
    return latest