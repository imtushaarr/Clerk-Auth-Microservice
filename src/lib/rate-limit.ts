import { NextRequest, NextResponse } from "next/server";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export interface RateLimitConfig {
  /** Maximum number of requests allowed within the window */
  limit: number;
  /** Time window in milliseconds */
  windowMs: number;
}

export const RATE_LIMIT_PRESETS = {
  /** Auth endpoints: 5 attempts per minute per IP */
  AUTH: { limit: 5, windowMs: 60_000 },
  /** Webhook endpoints: 60 requests per minute */
  WEBHOOK: { limit: 60, windowMs: 60_000 },
  /** General API endpoints: 100 requests per minute per IP */
  API: { limit: 100, windowMs: 60_000 },
} as const;

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.headers.get("x-real-ip") ?? "unknown";
}

/**
 * Checks whether a request exceeds the rate limit.
 * Returns a NextResponse with HTTP 429 if the limit is exceeded, or null otherwise.
 */
export function checkRateLimit(
  req: NextRequest,
  config: RateLimitConfig,
  identifier?: string
): NextResponse | null {
  const ip = identifier ?? getClientIp(req);
  const key = `${req.nextUrl.pathname}:${ip}`;
  const now = Date.now();

  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + config.windowMs });
    return null;
  }

  entry.count += 1;

  if (entry.count > config.limit) {
    const retryAfterSec = Math.ceil((entry.resetAt - now) / 1000);
    return NextResponse.json(
      {
        error: "Too Many Requests",
        message: "Rate limit exceeded. Please try again later.",
        retryAfter: retryAfterSec,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfterSec),
          "X-RateLimit-Limit": String(config.limit),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(entry.resetAt / 1000)),
        },
      }
    );
  }

  return null;
}
