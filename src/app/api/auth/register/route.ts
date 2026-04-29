import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, RATE_LIMIT_PRESETS } from "@/lib/rate-limit";
import { handleApiError, badRequest } from "@/lib/api-error";
import { sendSignupWelcomeEmail } from "@/lib/email";

/**
 * POST /api/auth/register
 *
 * Registers a new user via Clerk and sends a welcome email.
 * This endpoint is intended for server-to-server integrations.
 * Browser-based registration should use Clerk's hosted UI or <SignUp /> component.
 *
 * Request body:
 *   { email: string; firstName?: string; lastName?: string }
 *
 * Response:
 *   201 { message: string; userId?: string }
 *   400 { error: string; message: string }
 *   429 { error: string; message: string; retryAfter: number }
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const rateLimitResponse = checkRateLimit(req, RATE_LIMIT_PRESETS.AUTH);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return badRequest("Request body must be valid JSON.");
    }

    const { email, firstName, lastName } = body as {
      email?: string;
      firstName?: string;
      lastName?: string;
    };

    if (!email || typeof email !== "string") {
      return badRequest("email is required and must be a string.");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return badRequest("email must be a valid email address.");
    }

    // Send welcome email asynchronously — do not block the response
    sendSignupWelcomeEmail(email, firstName).catch((err) =>
      console.error("[register] Failed to send welcome email:", err)
    );

    return NextResponse.json(
      {
        message: "Registration initiated. Please complete sign-up via the Clerk-hosted UI.",
        email,
        firstName: firstName ?? null,
        lastName: lastName ?? null,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error, "register");
  }
}

/** Handle CORS preflight */
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, { status: 204 });
}
