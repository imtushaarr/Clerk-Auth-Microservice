import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs";
import {
  successResponse,
  errorResponse,
} from "@/lib/api-utils";
import { withRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { handleCorsPreFlight, addCorsHeaders } from "@/lib/cors";

/**
 * GET /api/auth/profile
 * Fetch authenticated user profile
 *
 * Headers:
 * {
 *   "Authorization": "Bearer <token_or_session_id>"
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "id": "user_123",
 *     "email": "user@example.com",
 *     "firstName": "John",
 *     "lastName": "Doe",
 *     "createdAt": "2024-01-01T00:00:00.000Z"
 *   }
 * }
 */
export async function GET(request: NextRequest) {
  // Handle CORS pre-flight
  const corsResponse = handleCorsPreFlight(request);
  if (corsResponse) return corsResponse;

  try {
    // Rate limiting
    const rateLimitResult = await withRateLimit(request, RATE_LIMITS.general);
    if ("status" in rateLimitResult) {
      return rateLimitResult;
    }

    // Check authentication
    const { userId, sessionId } = await auth();

    if (!userId || !sessionId) {
      const response = errorResponse(
        401,
        "Unauthorized - Please provide valid credentials",
        "UNAUTHORIZED"
      );
      const origin = request.headers.get("origin");
      return addCorsHeaders(response, origin);
    }

    // Mock profile data - in production, fetch from database
    const profileData = {
      id: userId,
      email: `user_${userId}@example.com`,
      firstName: "John",
      lastName: "Doe",
      sessionId,
      createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    };

    const response = successResponse(profileData, "Profile retrieved successfully");
    const origin = request.headers.get("origin");
    return addCorsHeaders(response, origin);
  } catch (error) {
    console.error("Profile fetch error:", error);
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
