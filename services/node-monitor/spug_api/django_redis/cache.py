import pickle

from django.core.cache.backends.base import BaseCache, DEFAULT_TIMEOUT

from .store import get_redis_connection


class RedisCache(BaseCache):
    key_prefix = 'django-cache:'

    def __init__(self, server, params):
        super().__init__(params)
        self._server = get_redis_connection()
        self._location = server

    def _cache_key(self, key, version=None):
        return f'{self.key_prefix}{self.make_key(key, version=version)}'

    def _normalize_timeout(self, timeout):
        if timeout is DEFAULT_TIMEOUT:
            timeout = self.default_timeout
        if timeout is None:
            return None
        timeout = int(timeout)
        return max(0, timeout)

    def add(self, key, value, timeout=DEFAULT_TIMEOUT, version=None):
        ttl = self._normalize_timeout(timeout)
        payload = pickle.dumps(value, pickle.HIGHEST_PROTOCOL)
        return self._server.set(self._cache_key(key, version), payload, ex=ttl, nx=True)

    def get(self, key, default=None, version=None):
        payload = self._server.get(self._cache_key(key, version))
        if payload is None:
            return default
        return pickle.loads(payload)

    def set(self, key, value, timeout=DEFAULT_TIMEOUT, version=None):
        ttl = self._normalize_timeout(timeout)
        payload = pickle.dumps(value, pickle.HIGHEST_PROTOCOL)
        return self._server.set(self._cache_key(key, version), payload, ex=ttl)

    def touch(self, key, timeout=DEFAULT_TIMEOUT, version=None):
        ttl = self._normalize_timeout(timeout)
        cache_key = self._cache_key(key, version)
        if ttl is None:
            return self._server.persist(cache_key)
        return self._server.expire(cache_key, ttl)

    def delete(self, key, version=None):
        return self._server.delete(self._cache_key(key, version))

    def clear(self):
        return self._server.delete_prefix(self.key_prefix)

    def ttl(self, key, version=None):
        return self._server.ttl(self._cache_key(key, version))

    def expire(self, key, timeout, version=None):
        ttl = self._normalize_timeout(timeout)
        cache_key = self._cache_key(key, version)
        if ttl is None:
            return self._server.persist(cache_key)
        return self._server.expire(cache_key, ttl)

    def close(self, **kwargs):
        self._server.close()
