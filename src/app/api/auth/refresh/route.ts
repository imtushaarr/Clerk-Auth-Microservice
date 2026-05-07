import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  validateObject,
  ValidationError,
} from "@/lib/api-utils";
import { withRateLimit, getRateLimitConfigs } from "@/lib/rate-limit";
import { handleCorsPreFlight, addCorsHeaders } from "@/lib/cors";
import {
  ingreyhrCreateAuthSession,
  ingreyhrResolveRequestAuth,
} from "@/lib/ingreyhr-auth";

/**
 * POST /api/auth/refresh
 * Refresh authentication token
 *
 * Body:
 * {
 *   "refreshToken": "refresh_token_here"
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "token": "new_jwt_token",
 *     "expiresIn": 3600,
 *     "refreshToken": "new_refresh_token"
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  // Handle CORS pre-flight
  const corsResponse = handleCorsPreFlight(request);
  if (corsResponse) return corsResponse;

  try {
    // Rate limiting
    const { general: generalLimitConfig } = getRateLimitConfigs();
    const rateLimitResult = await withRateLimit(request, generalLimitConfig);
    if ("status" in rateLimitResult) {
      return rateLimitResult;
    }

    const body = await request.json();

    // Validation schema
    const schema: Record<string, (value: any) => ValidationError | null> = {
      refreshToken: (value) =>
        !value || typeof value !== "string" || value.length < 10
          ? { field: "refreshToken", message: "Valid refresh token is required" }
          : null,
    };

    const errors = validateObject(body, schema);
    if (errors.length > 0) {
      const response = errorResponse(400, "Validation failed", "VALIDATION_ERROR");
      const origin = request.headers.get("origin");
      return addCorsHeaders(response, origin);
    }

    const ingreyhrAuthContext = await ingreyhrResolveRequestAuth(request);

    if (!ingreyhrAuthContext.authenticated || !ingreyhrAuthContext.profile) {
      const response = errorResponse(
        401,
        "Unauthorized - Session expired or invalid",
        "UNAUTHORIZED"
      );
      const origin = request.headers.get("origin");
      return addCorsHeaders(response, origin);
    }

    // TODO: Integrate with Clerk API to refresh token
    // For now, return mock response
    const ingreyhrRefreshedSession = ingreyhrCreateAuthSession({
      email: ingreyhrAuthContext.profile.email,
      firstName: ingreyhrAuthContext.profile.firstName,
      lastName: ingreyhrAuthContext.profile.lastName,
      role: ingreyhrAuthContext.profile.role,
    });

    const tokenData = {
      token: ingreyhrRefreshedSession.token,
      expiresIn: ingreyhrRefreshedSession.expiresIn,
      refreshToken: `ingreyhr_refresh_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      sessionId: ingreyhrRefreshedSession.sessionId,
      user: ingreyhrRefreshedSession,
    };

    const response = successResponse(tokenData, "Token refreshed successfully");
    const origin = request.headers.get("origin");
    return addCorsHeaders(response, origin);
  } catch (error) {
    console.error("Token refresh error:", error);
    const response = errorResponse(500, "Internal server error", "INTERNAL_ERROR");
    const origin = request.headers.get("origin");
    return addCorsHeaders(response, origin);
  }
}

export async function OPTIONS(request: NextRequest) {
  const corsResponse = handleCorsPreFlight(request);
  if (corsResponse) return corsResponse;
  return new Response(null, { status: 200 });
}
