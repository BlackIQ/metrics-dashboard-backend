# Time
import time

# Collection
from collections import defaultdict

# Typing
from typing import DefaultDict, List


# Rate limiter
class RateLimiter:
    def __init__(self, limit: int, window_seconds: int):
        self.limit = max(1, limit)
        self.window_seconds = max(1, window_seconds)
        self._buckets: DefaultDict[str, List[float]] = defaultdict(list)

    def allow_request(self, key: str) -> bool:
        now = time.monotonic()
        cutoff = now - self.window_seconds

        requests = self._buckets[key]
        requests[:] = [timestamp for timestamp in requests if timestamp > cutoff]

        if len(requests) >= self.limit:
            return False

        requests.append(now)

        return True
