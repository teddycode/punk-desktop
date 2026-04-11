import queue
import threading
import time
from collections import defaultdict, deque


def _to_bytes(value):
    if value is None:
        return None
    if isinstance(value, bytes):
        return value
    if isinstance(value, memoryview):
        return bytes(value)
    if isinstance(value, bytearray):
        return bytes(value)
    return str(value).encode()


class LocalPubSub:
    def __init__(self, store, ignore_subscribe_messages=False):
        self.store = store
        self.ignore_subscribe_messages = ignore_subscribe_messages
        self._channels = set()
        self._queue = queue.Queue()
        self._closed = False

    def subscribe(self, *channels):
        if len(channels) == 1 and isinstance(channels[0], (list, tuple, set)):
            channels = tuple(channels[0])
        with self.store._lock:
            if self._closed:
                return
            for channel in channels:
                channel = self.store._normalize_key(channel)
                self._channels.add(channel)
                self.store._subscribers[channel].add(self)
                if not self.ignore_subscribe_messages:
                    self._queue.put({
                        'type': 'subscribe',
                        'channel': _to_bytes(channel),
                        'data': len(self._channels),
                    })

    def put_message(self, channel, data):
        if not self._closed:
            self._queue.put({
                'type': 'message',
                'channel': _to_bytes(channel),
                'data': data,
            })

    def get_message(self, timeout=0):
        if self._closed:
            return None
        try:
            if timeout and timeout > 0:
                return self._queue.get(timeout=timeout)
            return self._queue.get_nowait()
        except queue.Empty:
            return None

    def close(self):
        with self.store._lock:
            if self._closed:
                return
            for channel in tuple(self._channels):
                subscribers = self.store._subscribers.get(channel)
                if subscribers:
                    subscribers.discard(self)
                    if not subscribers:
                        self.store._subscribers.pop(channel, None)
            self._channels.clear()
            self._closed = True


class LocalRedis:
    def __init__(self):
        self._lock = threading.RLock()
        self._condition = threading.Condition(self._lock)
        self._data = {}
        self._types = {}
        self._expiry = {}
        self._subscribers = defaultdict(set)

    @staticmethod
    def _normalize_key(key):
        if isinstance(key, bytes):
            return key.decode()
        return str(key)

    @staticmethod
    def _normalize_field(field):
        if isinstance(field, bytes):
            return field.decode()
        return str(field)

    def _delete_locked(self, *names):
        count = 0
        for name in names:
            name = self._normalize_key(name)
            if name in self._data:
                self._data.pop(name, None)
                self._types.pop(name, None)
                self._expiry.pop(name, None)
                count += 1
        return count

    def _prune_expired_locked(self, *names):
        now = time.time()
        names = names or tuple(self._expiry.keys())
        for name in tuple(names):
            name = self._normalize_key(name)
            expires_at = self._expiry.get(name)
            if expires_at is not None and expires_at <= now:
                self._delete_locked(name)

    def _set_expiry_locked(self, name, ttl):
        if ttl is None:
            self._expiry.pop(name, None)
        else:
            self._expiry[name] = time.time() + max(0, float(ttl))

    def _get_list_locked(self, name, create=False):
        current = self._data.get(name)
        if current is None:
            if create:
                current = deque()
                self._data[name] = current
                self._types[name] = 'list'
            return current
        if self._types.get(name) != 'list':
            raise TypeError(f'WRONGTYPE key={name!r} expected list')
        return current

    def _get_hash_locked(self, name, create=False):
        current = self._data.get(name)
        if current is None:
            if create:
                current = {}
                self._data[name] = current
                self._types[name] = 'hash'
            return current
        if self._types.get(name) != 'hash':
            raise TypeError(f'WRONGTYPE key={name!r} expected hash')
        return current

    def close(self):
        return None

    def delete(self, *names):
        with self._condition:
            self._prune_expired_locked(*names)
            count = self._delete_locked(*names)
            if count:
                self._condition.notify_all()
            return count

    def delete_prefix(self, prefix):
        with self._condition:
            self._prune_expired_locked()
            names = [name for name in self._data if name.startswith(prefix)]
            count = self._delete_locked(*names)
            if count:
                self._condition.notify_all()
            return count

    def exists(self, name):
        with self._lock:
            name = self._normalize_key(name)
            self._prune_expired_locked(name)
            return 1 if name in self._data else 0

    def get(self, name):
        with self._lock:
            name = self._normalize_key(name)
            self._prune_expired_locked(name)
            if self._types.get(name) != 'string':
                return None
            return self._data.get(name)

    def set(self, name, value, ex=None, px=None, nx=False, xx=False):
        with self._condition:
            name = self._normalize_key(name)
            self._prune_expired_locked(name)
            exists = name in self._data
            if nx and exists:
                return False
            if xx and not exists:
                return False
            ttl = ex if ex is not None else (px / 1000 if px is not None else None)
            self._data[name] = _to_bytes(value)
            self._types[name] = 'string'
            self._set_expiry_locked(name, ttl)
            self._condition.notify_all()
            return True

    def setex(self, name, timeout, value):
        return self.set(name, value, ex=timeout)

    def ttl(self, name):
        with self._lock:
            name = self._normalize_key(name)
            self._prune_expired_locked(name)
            if name not in self._data:
                return -2
            expires_at = self._expiry.get(name)
            if expires_at is None:
                return -1
            return int(expires_at - time.time())

    def expire(self, name, timeout):
        with self._condition:
            name = self._normalize_key(name)
            self._prune_expired_locked(name)
            if name not in self._data:
                return False
            timeout = int(timeout)
            if timeout <= 0:
                self._delete_locked(name)
            else:
                self._set_expiry_locked(name, timeout)
            self._condition.notify_all()
            return True

    def persist(self, name):
        with self._lock:
            name = self._normalize_key(name)
            self._prune_expired_locked(name)
            if name not in self._data:
                return False
            self._expiry.pop(name, None)
            return True

    def rename(self, src, dst):
        with self._condition:
            src = self._normalize_key(src)
            dst = self._normalize_key(dst)
            self._prune_expired_locked(src, dst)
            if src not in self._data:
                raise KeyError(src)
            self._data[dst] = self._data.pop(src)
            self._types[dst] = self._types.pop(src)
            if src in self._expiry:
                self._expiry[dst] = self._expiry.pop(src)
            else:
                self._expiry.pop(dst, None)
            self._condition.notify_all()
            return True

    def lpush(self, name, *values):
        with self._condition:
            name = self._normalize_key(name)
            self._prune_expired_locked(name)
            items = self._get_list_locked(name, create=True)
            for value in values:
                items.appendleft(_to_bytes(value))
            self._condition.notify_all()
            return len(items)

    def rpush(self, name, *values):
        with self._condition:
            name = self._normalize_key(name)
            self._prune_expired_locked(name)
            items = self._get_list_locked(name, create=True)
            for value in values:
                items.append(_to_bytes(value))
            self._condition.notify_all()
            return len(items)

    def _normalize_range(self, items, start, end):
        size = len(items)
        start = int(start)
        end = int(end)
        if start < 0:
            start += size
        if end < 0:
            end += size
        start = max(0, start)
        end = min(size - 1, end)
        if size == 0 or start > end or start >= size:
            return []
        return items[start:end + 1]

    def lrange(self, name, start, end):
        with self._lock:
            name = self._normalize_key(name)
            self._prune_expired_locked(name)
            items = self._get_list_locked(name)
            if items is None:
                return []
            return self._normalize_range(list(items), start, end)

    def lindex(self, name, index):
        with self._lock:
            name = self._normalize_key(name)
            self._prune_expired_locked(name)
            items = self._get_list_locked(name)
            if items is None:
                return None
            try:
                return list(items)[int(index)]
            except IndexError:
                return None

    def _blocking_pop(self, keys, from_left, timeout=0):
        if isinstance(keys, (str, bytes)):
            keys = [keys]
        keys = [self._normalize_key(x) for x in keys]
        deadline = None if not timeout else time.monotonic() + timeout
        with self._condition:
            while True:
                for key in keys:
                    self._prune_expired_locked(key)
                    items = self._get_list_locked(key)
                    if items:
                        value = items.popleft() if from_left else items.pop()
                        if not items:
                            self._delete_locked(key)
                        return _to_bytes(key), value
                if deadline is None:
                    self._condition.wait()
                    continue
                remaining = deadline - time.monotonic()
                if remaining <= 0:
                    return None
                self._condition.wait(remaining)

    def blpop(self, keys, timeout=0):
        return self._blocking_pop(keys, True, timeout)

    def brpop(self, keys, timeout=0):
        return self._blocking_pop(keys, False, timeout)

    def hgetall(self, name):
        with self._lock:
            name = self._normalize_key(name)
            self._prune_expired_locked(name)
            data = self._get_hash_locked(name)
            if data is None:
                return {}
            return {_to_bytes(key): value for key, value in data.items()}

    def hmget(self, name, *fields):
        if len(fields) == 1 and isinstance(fields[0], (list, tuple, set)):
            fields = tuple(fields[0])
        with self._lock:
            name = self._normalize_key(name)
            self._prune_expired_locked(name)
            data = self._get_hash_locked(name)
            if data is None:
                return [None for _ in fields]
            return [data.get(self._normalize_field(field)) for field in fields]

    def hincrby(self, name, field, amount=1):
        with self._lock:
            name = self._normalize_key(name)
            field = self._normalize_field(field)
            self._prune_expired_locked(name)
            data = self._get_hash_locked(name, create=True)
            current = int((data.get(field) or b'0').decode())
            current += int(amount)
            data[field] = _to_bytes(current)
            return current

    def hset(self, name, field, value):
        with self._lock:
            name = self._normalize_key(name)
            field = self._normalize_field(field)
            self._prune_expired_locked(name)
            data = self._get_hash_locked(name, create=True)
            is_new = field not in data
            data[field] = _to_bytes(value)
            return 1 if is_new else 0

    def hdel(self, name, *fields):
        with self._lock:
            name = self._normalize_key(name)
            self._prune_expired_locked(name)
            data = self._get_hash_locked(name)
            if data is None:
                return 0
            count = 0
            for field in fields:
                field = self._normalize_field(field)
                if field in data:
                    data.pop(field, None)
                    count += 1
            if not data:
                self._delete_locked(name)
            return count

    def pubsub(self, ignore_subscribe_messages=True):
        return LocalPubSub(self, ignore_subscribe_messages=ignore_subscribe_messages)

    def publish(self, channel, message):
        channel = self._normalize_key(channel)
        data = _to_bytes(message)
        with self._lock:
            subscribers = list(self._subscribers.get(channel, ()))
        for subscriber in subscribers:
            subscriber.put_message(channel, data)
        return len(subscribers)


_default_connection = LocalRedis()


def get_redis_connection(*args, **kwargs):
    return _default_connection
