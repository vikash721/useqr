/**
 * In-memory rate limiter by identifier (e.g. IP).
 * Prunes old entries each check. Not distributed — use Redis/KV for multi-instance.
 */

const store = new Map<string, number[]>();

/**
 * Checks whether the identifier is within the rate limit.
 * If allowed, records this request and returns true. If over limit, returns false.
 * @param identifier - e.g. client IP
 * @param limit - max requests allowed in the window
 * @param windowMs - window length in milliseconds
 * @returns true if request is allowed, false if rate limited
 */
export function checkRateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const cutoff = now - windowMs;
  let timestamps = store.get(identifier) ?? [];

  timestamps = timestamps.filter((t) => t > cutoff);
  if (timestamps.length >= limit) {
    return false;
  }
  timestamps.push(now);
  store.set(identifier, timestamps);
  return true;
}
