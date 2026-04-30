import { NextRequest, NextResponse } from "next/server";
import { getConfig } from "./config";

export interface CorsOptions {
  allowedOrigins?: string[];
  allowedMethods?: string[];
  allowedHeaders?: string[];
  exposedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
}

export function getCorsHeaders(
  origin: string | null,
  options?: CorsOptions
): Record<string, string> {
  const config = getConfig();
  const defaultOrigins = options?.allowedOrigins || config.api.corsOrigins;

  const headers: Record<string, string> = {};

  // Check if origin is allowed
  if (origin && defaultOrigins.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  } else if (defaultOrigins.includes("*")) {
    headers["Access-Control-Allow-Origin"] = "*";
  }

  headers["Access-Control-Allow-Methods"] =
    (options?.allowedMethods || ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"])?.join(
      ","
    ) || "*";

  headers["Access-Control-Allow-Headers"] =
    (options?.allowedHeaders || [
      "Content-Type",
      "Authorization",
      "Accept",
      "Origin",
      "X-Requested-With",
      "X-API-Key",
    ])?.join(",") || "Content-Type, Authorization";

  headers["Access-Control-Expose-Headers"] =
    (options?.exposedHeaders || [
      "X-RateLimit-Limit",
      "X-RateLimit-Remaining",
      "X-RateLimit-Reset",
      "Content-Length",
      "X-Request-Id",
    ])?.join(",") || "";

  if (options?.credentials !== false) {
    headers["Access-Control-Allow-Credentials"] = "true";
  }

  headers["Access-Control-Max-Age"] = (options?.maxAge || 86400).toString();

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
