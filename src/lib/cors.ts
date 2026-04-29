import { NextRequest, NextResponse } from "next/server";

export interface CorsOptions {
  allowedOrigins?: string[];
  allowedMethods?: string[];
  allowedHeaders?: string[];
  exposedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
}

const DEFAULT_CORS_OPTIONS: CorsOptions = {
  allowedOrigins: [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:8000",
    process.env.NEXT_PUBLIC_APP_URL || "",
  ].filter(Boolean),
  allowedMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Accept",
    "Origin",
    "X-Requested-With",
    "X-API-Key",
  ],
  exposedHeaders: [
    "X-RateLimit-Limit",
    "X-RateLimit-Remaining",
    "X-RateLimit-Reset",
    "Content-Length",
    "X-Request-Id",
  ],
  credentials: true,
  maxAge: 86400, // 24 hours
};

export function getCorsHeaders(
  origin: string | null,
  options: CorsOptions = DEFAULT_CORS_OPTIONS
): Record<string, string> {
  const allowedOrigins = options.allowedOrigins || DEFAULT_CORS_OPTIONS.allowedOrigins || [];

  const headers: Record<string, string> = {};

  // Check if origin is allowed
  if (origin && allowedOrigins.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  } else if (allowedOrigins.includes("*")) {
    headers["Access-Control-Allow-Origin"] = "*";
  }

  headers["Access-Control-Allow-Methods"] =
    (options.allowedMethods || DEFAULT_CORS_OPTIONS.allowedMethods)?.join(",") || "*";

  headers["Access-Control-Allow-Headers"] =
    (options.allowedHeaders || DEFAULT_CORS_OPTIONS.allowedHeaders)?.join(",") ||
    "Content-Type, Authorization";

  headers["Access-Control-Expose-Headers"] =
    (options.exposedHeaders || DEFAULT_CORS_OPTIONS.exposedHeaders)?.join(",") || "";

  if (options.credentials !== false) {
    headers["Access-Control-Allow-Credentials"] = "true";
  }

  headers["Access-Control-Max-Age"] = (
    options.maxAge || DEFAULT_CORS_OPTIONS.maxAge || 86400
  ).toString();

  // Security headers
  headers["X-Content-Type-Options"] = "nosniff";
  headers["X-Frame-Options"] = "DENY";
  headers["X-XSS-Protection"] = "1; mode=block";
  headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains";

  return headers;
}

export function handleCorsPreFlight(
  req: NextRequest,
  options?: CorsOptions
): NextResponse | null {
  if (req.method === "OPTIONS") {
    const origin = req.headers.get("origin");
    const headers = getCorsHeaders(origin, options);

    return new NextResponse(null, {
      status: 200,
      headers,
    });
  }

  return null;
}

export function addCorsHeaders(
  response: NextResponse,
  origin: string | null,
  options?: CorsOptions
): NextResponse {
  const headers = getCorsHeaders(origin, options);

  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}
