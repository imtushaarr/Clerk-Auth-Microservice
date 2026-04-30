import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  validateEmail,
  validatePassword,
  validateObject,
  ValidationError,
} from "@/lib/api-utils";
import { withRateLimit, getRateLimitConfigs } from "@/lib/rate-limit";
import { handleCorsPreFlight, addCorsHeaders } from "@/lib/cors";

/**
 * POST /api/auth/register
 * Register a new user
 *
 * Body:
 * {
 *   "email": "user@example.com",
 *   "password": "SecurePass123!",
 *   "firstName": "John",
 *   "lastName": "Doe"
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
        !value || !validateEmail(value)
          ? { field: "email", message: "Valid email is required" }
          : null,
      password: (value) => {
        if (!value) return { field: "password", message: "Password is required" };
        const validation = validatePassword(value);
        return !validation.valid
          ? { field: "password", message: validation.errors.join("; ") }
          : null;
      },
      firstName: (value) =>
        !value || typeof value !== "string" || value.trim().length < 2
          ? { field: "firstName", message: "First name must be at least 2 characters" }
          : null,
      lastName: (value) =>
        !value || typeof value !== "string" || value.trim().length < 2
          ? { field: "lastName", message: "Last name must be at least 2 characters" }
          : null,
    };

    const errors = validateObject(body, schema);
    if (errors.length > 0) {
      const response = errorResponse(
        400,
        "Validation failed",
        "VALIDATION_ERROR"
      );
      response.headers.set("Content-Type", "application/json");
      const origin = request.headers.get("origin");
      return addCorsHeaders(response, origin);
    }

    // TODO: Integrate with Clerk API to create user
    // For now, return success mock response
    const userData = {
      id: `user_${Date.now()}`,
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
      createdAt: new Date().toISOString(),
    };

    const response = successResponse(userData, "User registered successfully", 201);
    const origin = request.headers.get("origin");
    return addCorsHeaders(response, origin);
  } catch (error) {
    console.error("Registration error:", error);
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
