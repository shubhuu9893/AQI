"""Simple Redis cache helper with graceful fallback.

If the ``redis`` package is not installed, or if the Redis server is
unreachable, all cache operations become no-ops and decorated functions
execute normally without caching.

Environment variables:
    REDIS_URL  — Redis connection URL (default: redis://127.0.0.1:6379)
"""

from __future__ import annotations

import json
import os
from functools import wraps
from typing import Any, Callable

# ── Optional Redis import ────────────────────────────────────────────────────
try:
    import redis as _redis_lib  # type: ignore
    _REDIS_AVAILABLE = True
except ImportError:
    _redis_lib = None
    _REDIS_AVAILABLE = False

_client = None  # lazily initialised


def init_cache() -> None:
    """Initialise the global Redis client.

    Safe to call multiple times (idempotent). If Redis is unavailable the
    application continues without caching.
    """
    global _client

    if not _REDIS_AVAILABLE:
        return  # silently skip — no redis package installed

    if _client is not None:
        return

    url = os.getenv("REDIS_URL", "redis://127.0.0.1:6379")
    try:
        _client = _redis_lib.Redis.from_url(url, decode_responses=True, socket_connect_timeout=2)
        _client.ping()  # verify connection is live
    except Exception:
        _client = None  # Redis unreachable — fall back to no-cache mode


def get_cache(key: str) -> Any | None:
    """Return cached value for *key*, or ``None`` on miss / error."""
    if _client is None:
        return None
    try:
        raw = _client.get(key)
        return json.loads(raw) if raw else None
    except Exception:
        return None


def set_cache(key: str, value: Any, ttl: int | None = None) -> None:
    """Store *value* under *key* with optional TTL (seconds)."""
    if _client is None:
        return
    try:
        raw = json.dumps(value, default=str)
        if ttl:
            _client.setex(key, ttl, raw)
        else:
            _client.set(key, raw)
    except Exception:
        pass


def cached(ttl: int = 300):
    """Decorator: cache function result in Redis, or execute normally if unavailable."""

    def decorator(func: Callable):
        @wraps(func)
        def wrapper(*args, **kwargs):
            if _client is None:
                return func(*args, **kwargs)

            key = f"cache:{func.__module__}:{func.__qualname__}:{json.dumps(args, default=str)}"
            cached_val = get_cache(key)
            if cached_val is not None:
                return cached_val

            result = func(*args, **kwargs)
            set_cache(key, result, ttl)
            return result

        return wrapper

    return decorator
