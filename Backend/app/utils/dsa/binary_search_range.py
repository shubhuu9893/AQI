"""Binary search helpers for date‑range queries.

Assumes the input list is sorted by ``timestamp`` ascending.  The functions
return indices or sliced lists to keep the implementation lightweight.
"""

from __future__ import annotations

from datetime import datetime
from typing import List, Tuple

from ...models.air_quality_measurements import AirQualityMeasurement


def find_range(
    records: List[AirQualityMeasurement],
    start: datetime,
    end: datetime,
) -> Tuple[int, int]:
    """Return the inclusive index range that matches ``start`` ≤ ts ≤ ``end``.

    Uses two binary searches to locate the boundaries in O(log n).
    If no records match, returns ``(0, -1)``.
    """
    left = 0
    right = len(records)
    while left < right:
        mid = (left + right) // 2
        if records[mid].timestamp < start:
            left = mid + 1
        else:
            right = mid
    start_idx = left

    left = 0
    right = len(records)
    while left < right:
        mid = (left + right) // 2
        if records[mid].timestamp <= end:
            left = mid + 1
        else:
            right = mid
    end_idx = left - 1

    return start_idx, end_idx