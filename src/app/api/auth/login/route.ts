import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  validateEmail,
  validateObject,
  ValidationError,
} from "@/lib/api-utils";
import { withRateLimit, getRateLimitConfigs } from "@/lib/rate-limit";
import { handleCorsPreFlight, addCorsHeaders } from "@/lib/cors";

/**
 * POST /api/auth/login
 * Login with email and password
 *
 * Body:
 * {
 *   "email": "user@example.com",
 *   "password": "SecurePass123!"
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "id": "user_123",
 *     "email": "user@example.com",
 *     "sessionId": "sess_123",
 *     "token": "jwt_token_here"
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  // Handle CORS pre-flight
  const corsResponse = handleCorsPreFlight(request);
  if (corsResponse) return corsResponse;

  try {
    // Rate limiting (stricter for login)
    const { auth: authLimitConfig } = getRateLimitConfigs();
    const rateLimitResult = await withRateLimit(request, authLimitConfig);
    if ("status" in rateLimitResult) {
      return rateLimitResult;
    }

    const body = await request.json();

    // Validation schema
    const schema: Record<string, (value: any) => ValidationError | null> = {
      email: (value) =>
        !value || !validateEmail(value)
          ? { field: "email", message: "Valid email is required" }
          : null,
      password: (value) =>
        !value || typeof value !== "string" || value.length === 0
          ? { field: "password", message: "Password is required" }
          : null,
    };

    const errors = validateObject(body, schema);
    if (errors.length > 0) {
      const response = errorResponse(
        400,
        "Validation failed",
        "VALIDATION_ERROR"
      );
      const origin = request.headers.get("origin");
      return addCorsHeaders(response, origin);
    }

    // TODO: Integrate with Clerk API to authenticate user
    // For now, return mock response
    const authData = {
      id: `user_${Date.now()}`,
      email: body.email,
      sessionId: `sess_${Date.now()}`,
      token: `jwt_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      expiresIn: 3600,
    };

    const response = successResponse(authData, "Login successful");
    const origin = request.headers.get("origin");
    return addCorsHeaders(response, origin);
  } catch (error) {
    console.error("Login error:", error);
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
