"""Geometric utilities – Haversine distance.

This module contains a pure‑Python implementation of the Haversine formula
used throughout the project to calculate great‑circle distances between two
points on Earth.  All functions are intentionally stateless and serialisable so
they can be imported into services or even used in unit tests.
"""

from __future__ import annotations

import math
from dataclasses import dataclass
from typing import Tuple


@dataclass(frozen=True)
class LatLon:
    latitude: float
    longitude: float


def haversine(a: LatLon, b: LatLon) -> float:
    """Return the distance in kilometers between two coordinates.

    Parameters
    ----------
    a, b : LatLon
        Latitude/longitude pairs.  Values are assumed to be in decimal degrees.
    """
    # Earth radius in kilometres
    R = 6371.0
    lat1, lon1 = math.radians(a.latitude), math.radians(a.longitude)
    lat2, lon2 = math.radians(b.latitude), math.radians(b.longitude)
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a_val = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a_val), math.sqrt(1 - a_val))
    return R * c