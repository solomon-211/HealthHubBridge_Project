import time

_store = {}


def cache_get(key):
    entry = _store.get(key)
    if entry and time.time() < entry['expires_at']:
        return entry['data']
    return None


def cache_set(key, data, ttl=30):
    _store[key] = {
        'data':       data,
        'expires_at': time.time() + ttl
    }


def cache_invalidate(prefix):
    keys_to_delete = [k for k in _store if k.startswith(prefix)]
    for k in keys_to_delete:
        del _store[k]
