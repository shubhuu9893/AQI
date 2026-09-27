"""Return top‑K stations by AQI using a min‑heap.

The helper accepts an iterable of records and a threshold K. It keeps the
smallest K values in a heap to efficiently produce the largest ones.
"""

from __future__ import annotations

import heapq
from typing import Iterable, List, Tuple

from ...models.air_quality_measurements import AirQualityMeasurement


def top_k_by_aqi(records: Iterable[AirQualityMeasurement], k: int) -> List[Tuple[str, float]]:
    """Return ``k`` tuples of (station_id, aqi), sorted descending.

    The function ignores records with ``aqi`` == None.
    """
    heap: List[Tuple[float, str]] = []
    for rec in records:
        if rec.aqi is None:
            continue
        val = (rec.aqi, rec.station_id)
        if len(heap) < k:
            heapq.heappush(heap, val)
        else:
            heapq.heappushpop(heap, val)
    # Convert to descending order
    return [(sid, aqi) for aqi, sid in sorted(heap, reverse=True)]