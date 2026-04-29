import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, RATE_LIMIT_PRESETS } from "@/lib/rate-limit";
import { handleApiError, unauthorized } from "@/lib/api-error";

/**
 * GET /api/auth/profile
 *
 * Returns the authenticated user's profile information.
 *
 * Requires a valid Clerk session (Bearer token or session cookie).
 *
 * Response:
 *   200 { userId: string; email: string; firstName?: string; lastName?: string; imageUrl?: string; createdAt: string }
 *   401 { error: string; message: string }
 *   429 { error: string; message: string; retryAfter: number }
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const rateLimitResponse = checkRateLimit(req, RATE_LIMIT_PRESETS.API);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { userId } = await auth();

    if (!userId) {
      return unauthorized("You must be signed in to access this resource.");
    }

    const user = await currentUser();

    if (!user) {
      return unauthorized("User session is invalid or expired.");
    }

    const primaryEmail = user.emailAddresses.find(
      (addr) => addr.id === user.primaryEmailAddressId
    );

    return NextResponse.json({
      userId: user.id,
      email: primaryEmail?.emailAddress ?? null,
      firstName: user.firstName ?? null,
      lastName: user.lastName ?? null,
      imageUrl: user.imageUrl ?? null,
      createdAt: new Date(user.createdAt).toISOString(),
    });
  } catch (error) {
    return handleApiError(error, "profile");
  }
}

/** Handle CORS preflight */
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, { status: 204 });
}
