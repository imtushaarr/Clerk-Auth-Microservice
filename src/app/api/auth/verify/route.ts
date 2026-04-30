import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  validateObject,
  ValidationError,
} from "@/lib/api-utils";
import { withRateLimit, getRateLimitConfigs } from "@/lib/rate-limit";
import { handleCorsPreFlight, addCorsHeaders } from "@/lib/cors";

/**
 * POST /api/auth/verify
 * Verify email address or OTP
 *
 * Body:
 * {
 *   "email": "user@example.com",
 *   "code": "123456"
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "verified": true,
 *     "email": "user@example.com"
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  // Handle CORS pre-flight
  const corsResponse = handleCorsPreFlight(request);
  if (corsResponse) return corsResponse;

  try {
    // Rate limiting
    const { auth: authLimitConfig } = getRateLimitConfigs();
    const rateLimitResult = await withRateLimit(request, authLimitConfig);
    if ("status" in rateLimitResult) {
      return rateLimitResult;
    }

    const body = await request.json();

    // Validation schema
    const schema: Record<string, (value: any) => ValidationError | null> = {
      email: (value) =>
        !value
          ? { field: "email", message: "Email is required" }
          : !value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
            ? { field: "email", message: "Valid email is required" }
            : null,
      code: (value) =>
        !value || typeof value !== "string" || value.length < 4
          ? { field: "code", message: "Verification code is required (min 4 characters)" }
          : null,
    };

    const errors = validateObject(body, schema);
    if (errors.length > 0) {
      const response = errorResponse(400, "Validation failed", "VALIDATION_ERROR");
      const origin = request.headers.get("origin");
      return addCorsHeaders(response, origin);
    }

    // TODO: Integrate with email verification service
    // For now, return success mock response
    const verificationData = {
      verified: true,
      email: body.email,
      verifiedAt: new Date().toISOString(),
    };

    const response = successResponse(verificationData, "Email verified successfully");
    const origin = request.headers.get("origin");
    return addCorsHeaders(response, origin);
  } catch (error) {
    console.error("Verification error:", error);
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
