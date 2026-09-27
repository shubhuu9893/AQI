"""US EPA-style AQI helpers used when providers do not return AQI."""

from __future__ import annotations

from typing import Mapping

# Breakpoints: (C_low, C_high, I_low, I_high)
_PM25_BREAKPOINTS = (
    (0.0, 12.0, 0, 50),
    (12.1, 35.4, 51, 100),
    (35.5, 55.4, 101, 150),
    (55.5, 150.4, 151, 200),
    (150.5, 250.4, 201, 300),
    (250.5, 500.4, 301, 500),
)

_PM10_BREAKPOINTS = (
    (0.0, 54.0, 0, 50),
    (55.0, 154.0, 51, 100),
    (155.0, 254.0, 101, 150),
    (255.0, 354.0, 151, 200),
    (355.0, 424.0, 201, 300),
    (425.0, 604.0, 301, 500),
)


def _sub_index(conc: float | None, breakpoints: tuple[tuple[float, float, int, int], ...]) -> float | None:
    if conc is None:
        return None
    c = max(0.0, float(conc))
    for c_low, c_high, i_low, i_high in breakpoints:
        if c <= c_high or (c_high == breakpoints[-1][1] and c >= c_low):
            if c < c_low:
                continue
            return round(((i_high - i_low) / (c_high - c_low)) * (c - c_low) + i_low, 1)
    i_low, i_high = breakpoints[-1][2], breakpoints[-1][3]
    c_low, c_high = breakpoints[-1][0], breakpoints[-1][1]
    return round(((i_high - i_low) / (c_high - c_low)) * (min(c, c_high) - c_low) + i_low, 1)


def aqi_from_pollutants(metrics: Mapping[str, float | None]) -> int | None:
    candidates = [
        _sub_index(metrics.get("pm25"), _PM25_BREAKPOINTS),
        _sub_index(metrics.get("pm10"), _PM10_BREAKPOINTS),
    ]
    values = [v for v in candidates if v is not None]
    if not values:
        return None
    return int(round(max(values)))


EMPTY_AIR_QUALITY = {
    "aqi": None,
    "pm25": None,
    "pm10": None,
    "no2": None,
    "so2": None,
    "co": None,
    "o3": None,
}

EMPTY_WEATHER = {
    "temperature": None,
    "humidity": None,
    "pressure": None,
    "wind_speed": None,
    "wind_direction": None,
    "visibility": None,
}
