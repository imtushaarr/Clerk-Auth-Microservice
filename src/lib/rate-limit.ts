import { NextRequest, NextResponse } from "next/server";
import { getConfig } from "./config";

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

// Rate limit configurations from environment
export function getRateLimitConfigs() {
  const config = getConfig();
  return {
    auth: {
      windowMs: config.api.rateLimitAuthWindow,
      maxRequests: config.api.rateLimitAuthMax,
    },
    general: {
      windowMs: config.api.rateLimitGeneralWindow,
      maxRequests: config.api.rateLimitGeneralMax,
    },
    api: {
      windowMs: config.api.rateLimitGeneralWindow,
      maxRequests: config.api.rateLimitGeneralMax,
    },
  };
}

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
  config?: RateLimitConfig
) {
  const finalConfig = config || getRateLimitConfigs().general;
  const key = getRateLimitKey(req);
  const { allowed, remaining, resetTime } = await checkRateLimit(key, finalConfig);

  if (!allowed) {
    return NextResponse.json(
      {
        success: false,
        error: "Rate limit exceeded",
        code: "RATE_LIMIT_EXCEEDED",
        retryAfter: Math.ceil((resetTime - Date.now()) / 1000),
        timestamp: new Date().toISOString(),
      },
      {
        status: 429,
        headers: {
          "Retry-After": Math.ceil((resetTime - Date.now()) / 1000).toString(),
          "X-RateLimit-Limit": finalConfig.maxRequests.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": (resetTime / 1000).toString(),
        },
      }
    );
  }

  return {
    allowed: true,
    headers: {
      "X-RateLimit-Limit": finalConfig.maxRequests.toString(),
      "X-RateLimit-Remaining": remaining.toString(),
      "X-RateLimit-Reset": (resetTime / 1000).toString(),
    },
  };
}
