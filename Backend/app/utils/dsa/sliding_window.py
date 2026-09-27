"""Sliding‑window utilities for moving averages.

The implementation operates on a list of (timestamp, value) tuples sorted by
timestamp ascending.  It returns a list of moving‑average points.
"""

from __future__ import annotations

from collections import deque
from datetime import datetime, timedelta
from typing import List, Tuple


def moving_average(
    data: List[Tuple[datetime, float]],
    window_size: timedelta,
) -> List[Tuple[datetime, float]]:
    """Return a list of (timestamp, average) pairs.

    The timestamp for each output point is the right‑edge time of the
    sliding window.  Only points where at least one sample falls inside the
    window are emitted.
    """
    if not data:
        return []
    dq: deque[Tuple[datetime, float]] = deque()
    result: List[Tuple[datetime, float]] = []
    for ts, val in data:
        dq.append((ts, val))
        while dq and (ts - dq[0][0]) > window_size:
            dq.popleft()
        avg = sum(v for _, v in dq) / len(dq)
        result.append((ts, avg))
    return result