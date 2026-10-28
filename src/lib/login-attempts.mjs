const DEFAULT_MAX_ATTEMPTS = 5;
const DEFAULT_LOCKOUT_MS = 10 * 60 * 1000;
const DEFAULT_ATTEMPT_WINDOW_MS = 10 * 60 * 1000;
const DEFAULT_MAX_TRACKED_KEYS = 10_000;

function positiveInteger(value, fallback) {
  return Number.isSafeInteger(value) && value > 0 ? value : fallback;
}

function normalizeIdentifier(identifier) {
  return typeof identifier === "string" ? identifier.trim().toLowerCase() : "";
}

/**
 * Process-local login attempt tracking with a rolling failure window and a hard
 * memory bound. This does not coordinate attempts across serverless instances.
 */
export function createLoginAttemptLimiter(options = {}) {
  const maxAttempts = positiveInteger(options.maxAttempts, DEFAULT_MAX_ATTEMPTS);
  const lockoutMs = positiveInteger(options.lockoutMs, DEFAULT_LOCKOUT_MS);
  const attemptWindowMs = positiveInteger(options.attemptWindowMs, DEFAULT_ATTEMPT_WINDOW_MS);
  const maxTrackedKeys = positiveInteger(options.maxTrackedKeys, DEFAULT_MAX_TRACKED_KEYS);
  const now = typeof options.now === "function" ? options.now : Date.now;
  const records = new Map();

  function prune(currentTime) {
    for (const [key, record] of records) {
      if (record.lockedUntil > 0) {
        if (record.lockedUntil <= currentTime) records.delete(key);
      } else if (currentTime - record.lastAttemptAt >= attemptWindowMs) {
        records.delete(key);
      }
    }
  }

  function oldestUnlockedKey(currentTime) {
    let oldestKey = null;
    let oldestTouchedAt = Infinity;
    for (const [key, record] of records) {
      if (record.lockedUntil > currentTime && record.lockedUntil !== 0) continue;
      if (record.lastTouchedAt < oldestTouchedAt) {
        oldestKey = key;
        oldestTouchedAt = record.lastTouchedAt;
      }
    }
    return oldestKey;
  }

  function checkLoginLock(identifier) {
    const key = normalizeIdentifier(identifier);
    if (!key) return 0;

    const currentTime = now();
    prune(currentTime);
    const record = records.get(key);
    if (record && record.lockedUntil > currentTime) {
      record.lastTouchedAt = currentTime;
      return Math.max(1, Math.ceil((record.lockedUntil - currentTime) / 60_000));
    }

    // If every tracked slot is currently locked, fail closed for new identities
    // rather than allocating beyond the configured memory bound.
    if (!record && records.size >= maxTrackedKeys && oldestUnlockedKey(currentTime) === null) {
      return Math.max(1, Math.ceil(lockoutMs / 60_000));
    }

    if (record) record.lastTouchedAt = currentTime;
    return 0;
  }

  function recordFailedLogin(identifier) {
    const key = normalizeIdentifier(identifier);
    if (!key) return false;

    const currentTime = now();
    prune(currentTime);
    let record = records.get(key);

    if (record && record.lockedUntil > currentTime) {
      record.lastTouchedAt = currentTime;
      return false;
    }

    if (!record) {
      if (records.size >= maxTrackedKeys) {
        const evictableKey = oldestUnlockedKey(currentTime);
        if (evictableKey === null) return false;
        records.delete(evictableKey);
      }
      record = {
        count: 0,
        windowStartedAt: currentTime,
        lockedUntil: 0,
        lastAttemptAt: currentTime,
        lastTouchedAt: currentTime,
      };
    } else if (currentTime - record.windowStartedAt >= attemptWindowMs) {
      record.count = 0;
      record.windowStartedAt = currentTime;
      record.lockedUntil = 0;
    }

    record.count += 1;
    record.lastAttemptAt = currentTime;
    record.lastTouchedAt = currentTime;

    if (record.count >= maxAttempts) {
      record.count = 0;
      record.lockedUntil = currentTime + lockoutMs;
    }

    records.set(key, record);
    return true;
  }

  function clearFailedLogins(identifier) {
    const key = normalizeIdentifier(identifier);
    if (key) records.delete(key);
  }

  return {
    checkLoginLock,
    recordFailedLogin,
    clearFailedLogins,
    getTrackedKeyCount: () => records.size,
  };
}
