// In-memory rate limiter — works within a single serverless instance.
// On Vercel, each warm instance enforces the limit independently.
// For strict cross-instance enforcement, replace the store with Upstash Redis.

interface Record {
  count: number;
  resetAt: number;
}

const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 5;
const MAX_STORE_ENTRIES = 10_000;

const store = new Map<string, Record>();

function cleanup() {
  if (store.size < MAX_STORE_ENTRIES) return;
  const now = Date.now();
  for (const [key, record] of store) {
    if (now > record.resetAt) store.delete(key);
  }
}

export function checkRateLimit(ip: string): { allowed: boolean; retryAfter: number } {
  cleanup();

  const now = Date.now();
  const record = store.get(ip);

  if (!record || now > record.resetAt) {
    store.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, retryAfter: 0 };
  }

  if (record.count >= MAX_REQUESTS) {
    return { allowed: false, retryAfter: Math.ceil((record.resetAt - now) / 1000) };
  }

  record.count++;
  return { allowed: true, retryAfter: 0 };
}
