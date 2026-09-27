"""Convenience wrapper around :func:`haversine.haversine`.

The function accepts a list of stations (each providing ``latitude`` and
``longitude`` attributes) and a target coordinate.  It returns the station
with the smallest distance.  The implementation is intentionally straightforward
so it can be unit‑tested in isolation.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable, Optional

from .haversine import haversine, LatLon


@dataclass(frozen=True)
class StationInfo:
    id: str
    name: str
    latitude: float
    longitude: float


def nearest_station(target: LatLon, stations: Iterable[StationInfo]) -> Optional[StationInfo]:
    """Return the closest station to *target*.

    Parameters
    ----------
    target : LatLon
        The point we want to find a neighbour for.
    stations : Iterable[StationInfo]
        Candidate stations.  Must expose ``latitude`` and ``longitude``.
    """
    best = None
    best_dist = float("inf")
    for st in stations:
        dist = haversine(target, LatLon(st.latitude, st.longitude))
        if dist < best_dist:
            best_dist = dist
            best = st
    return best