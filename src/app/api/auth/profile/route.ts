import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { apiError, withErrorHandler } from "@/lib/api-error";
import { withRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

/**
 * GET /api/auth/profile
 *
 * Returns the authenticated user's profile.
 *
 * Requires a valid Clerk session. External consumers should include the
 * Clerk session token in the `Authorization: Bearer <token>` header or
 * send the `__session` cookie.
 *
 * Response 200:
 *   { id, email, firstName, lastName, imageUrl, createdAt }
 *
 * Response 401:
 *   { error: { code: "UNAUTHORIZED", message: "..." } }
 */
async function getProfile(_req: NextRequest): Promise<NextResponse> {
  const { userId } = await auth();

  if (!userId) {
    return apiError("UNAUTHORIZED", "Authentication required");
  }

  const user = await currentUser();

  if (!user) {
    return apiError("NOT_FOUND", "User not found");
  }

  const primaryEmail = user.emailAddresses.find(
    (e) => e.id === user.primaryEmailAddressId
  )?.emailAddress;

  return NextResponse.json({
    id: user.id,
    email: primaryEmail ?? null,
    firstName: user.firstName,
    lastName: user.lastName,
    imageUrl: user.imageUrl,
    createdAt: new Date(user.createdAt).toISOString(),
  });
}

export const GET = withRateLimit(
  withErrorHandler(getProfile as (...args: unknown[]) => Promise<NextResponse>),
  RATE_LIMITS.api,
  "profile"
) as typeof getProfile;
