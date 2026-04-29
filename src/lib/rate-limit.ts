import { NextRequest, NextResponse } from "next/server";
import { apiError } from "./api-error";

interface RateLimitConfig {
  /** Maximum number of requests allowed within the window. */
  limit: number;
  /** Window duration in milliseconds. */
  windowMs: number;
}

interface RequestRecord {
  count: number;
  resetAt: number;
}

// In-memory store — suitable for single-instance deployments.
// For multi-instance deployments replace this with a shared Redis store.
const store = new Map<string, RequestRecord>();

/**
 * Resolves a client identifier from the request.
 * Uses the `x-forwarded-for` header when running behind a proxy.
 */
function getClientKey(req: NextRequest, prefix: string): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  return `${prefix}:${ip}`;
}

/**
 * Checks whether the client identified by `key` has exceeded the rate limit.
 * Returns `true` when the request is allowed, `false` when it should be blocked.
 */
function checkRateLimit(key: string, config: RateLimitConfig): boolean {
  const now = Date.now();
  const record = store.get(key);

  if (!record || now >= record.resetAt) {
    store.set(key, { count: 1, resetAt: now + config.windowMs });
    return true;
  }

  if (record.count >= config.limit) {
    return false;
  }

  record.count += 1;
  return true;
}

/**
 * Rate-limit configurations for different endpoint categories.
 */
export const RATE_LIMITS = {
  /** Strict limit for login / register to deter brute-force attacks. */
  auth: { limit: 5, windowMs: 60_000 } satisfies RateLimitConfig,
  /** Moderate limit for webhook ingestion. */
  webhook: { limit: 30, windowMs: 60_000 } satisfies RateLimitConfig,
  /** General API limit for authenticated endpoints. */
  api: { limit: 100, windowMs: 60_000 } satisfies RateLimitConfig,
};

/**
 * Higher-order function that wraps a Next.js route handler with rate limiting.
 *
 * @param handler - The route handler to protect.
 * @param config  - Rate limit configuration (limit + windowMs).
 * @param prefix  - A label used to namespace the per-IP counter (e.g. "login").
 *
 * @example
 * export const POST = withRateLimit(handler, RATE_LIMITS.auth, "login");
 */
export function withRateLimit<TArgs extends unknown[]>(
  handler: (...args: TArgs) => Promise<NextResponse>,
  config: RateLimitConfig,
  prefix: string
): (...args: TArgs) => Promise<NextResponse> {
  return async (...args: TArgs) => {
    const req = args[0] as NextRequest;
    const key = getClientKey(req, prefix);

    if (!checkRateLimit(key, config)) {
      return apiError(
        "RATE_LIMITED",
        `Too many requests. Please try again after ${config.windowMs / 1000} seconds.`
      );
    }

    return handler(...args);
  };
}

// Periodically purge expired entries to prevent unbounded memory growth.
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of store.entries()) {
      if (now >= record.resetAt) {
        store.delete(key);
      }
    }
  }, 60_000);
}
