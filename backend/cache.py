"""
Simple in-memory cache for GET endpoints.

Why this matters for low connectivity:
  On a slow or intermittent network, repeated identical requests (e.g. the
  dashboard reloading every 30 s) would all hammer the database. This cache
  stores the last response for each URL for a short TTL so the server can
  reply instantly without a DB round-trip, reducing latency noticeably on
  poor connections.

This is intentionally simple — a dict + timestamps. No external dependencies
(no Redis, no Memcached). Suitable for a single-server clinic deployment.
"""

import time

# { cache_key: {'data': ..., 'expires_at': float} }
_store = {}


def cache_get(key):
    """Return cached data if it exists and hasn't expired, else None."""
    entry = _store.get(key)
    if entry and time.time() < entry['expires_at']:
        return entry['data']
    return None


def cache_set(key, data, ttl=30):
    """Store data under key for ttl seconds."""
    _store[key] = {
        'data':       data,
        'expires_at': time.time() + ttl
    }


def cache_invalidate(prefix):
    """
    Delete all cache entries whose key starts with prefix.
    Called after a POST/PATCH so stale data isn't served.
    e.g. cache_invalidate('patients') clears /api/patients and /api/patients/5
    """
    keys_to_delete = [k for k in _store if k.startswith(prefix)]
    for k in keys_to_delete:
        del _store[k]