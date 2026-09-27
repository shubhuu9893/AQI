"""Shared HTTP helper built on httpx."""

from __future__ import annotations

from typing import Any

import httpx

DEFAULT_TIMEOUT = 8.0


def http_get(
    url: str,
    *,
    params: dict[str, Any] | None = None,
    headers: dict[str, str] | None = None,
    timeout: float = DEFAULT_TIMEOUT,
) -> dict[str, Any]:
    with httpx.Client(timeout=timeout) as client:
        resp = client.get(url, params=params, headers=headers)
        resp.raise_for_status()
        return resp.json()


def http_post_json(
    url: str,
    *,
    json: dict[str, Any] | None = None,
    params: dict[str, Any] | None = None,
    headers: dict[str, str] | None = None,
    timeout: float = DEFAULT_TIMEOUT,
) -> dict[str, Any]:
    with httpx.Client(timeout=timeout) as client:
        resp = client.post(url, json=json, params=params, headers=headers)
        resp.raise_for_status()
        return resp.json()
