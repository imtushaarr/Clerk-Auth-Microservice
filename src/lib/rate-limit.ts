import { NextRequest, NextResponse } from "next/server";

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  message?: string;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

// Default configurations
export const RATE_LIMITS = {
  auth: { windowMs: 15 * 60 * 1000, maxRequests: 5 }, // 5 attempts per 15 minutes
  general: { windowMs: 60 * 1000, maxRequests: 100 }, // 100 requests per minute
  api: { windowMs: 60 * 1000, maxRequests: 50 }, // 50 requests per minute
};

export function getRateLimitKey(req: NextRequest): string {
  const ip =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    req.ip ||
    "unknown";
  return ip;
}

export async function checkRateLimit(
  key: string,
  config: RateLimitConfig
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const now = Date.now();
  const record = store[key];

  // Clean up old records
  if (record && record.resetTime < now) {
    delete store[key];
  }

  // Initialize if not exists
  if (!store[key]) {
    store[key] = {
      count: 0,
      resetTime: now + config.windowMs,
    };
  }

  const current = store[key];
  current.count++;

  const allowed = current.count <= config.maxRequests;
  const remaining = Math.max(0, config.maxRequests - current.count);
  const resetTime = current.resetTime;

  return { allowed, remaining, resetTime };
}

export async function withRateLimit(
  req: NextRequest,
  config: RateLimitConfig = RATE_LIMITS.general
) {
  const key = getRateLimitKey(req);
  const { allowed, remaining, resetTime } = await checkRateLimit(key, config);

  if (!allowed) {
    return NextResponse.json(
      {
        success: false,
        error: config.message || "Rate limit exceeded",
        code: "RATE_LIMIT_EXCEEDED",
        retryAfter: Math.ceil((resetTime - Date.now()) / 1000),
        timestamp: new Date().toISOString(),
      },
      {
        status: 429,
        headers: {
          "Retry-After": Math.ceil((resetTime - Date.now()) / 1000).toString(),
          "X-RateLimit-Limit": config.maxRequests.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": (resetTime / 1000).toString(),
        },
      }
    );
  }

  return {
    allowed: true,
    headers: {
      "X-RateLimit-Limit": config.maxRequests.toString(),
      "X-RateLimit-Remaining": remaining.toString(),
      "X-RateLimit-Reset": (resetTime / 1000).toString(),
    },
  };
}
