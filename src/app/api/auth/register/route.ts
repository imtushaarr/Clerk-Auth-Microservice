import { NextRequest, NextResponse } from "next/server";
import { apiError, withErrorHandler } from "@/lib/api-error";
import { withRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

/**
 * POST /api/auth/register
 *
 * Initiates a Clerk-managed sign-up flow.
 *
 * Because Clerk handles all user registration (including email verification,
 * password hashing, and OAuth) on the client or via its hosted UI, this
 * endpoint acts as a discovery helper that returns the registration URL for
 * server-side or external consumers.
 *
 * Body (JSON):
 *   { redirectUrl?: string }   — optional post-registration destination
 *
 * Response 200:
 *   { signUpUrl: string }      — URL to redirect the user to for sign-up
 *
 * For programmatic user creation (e.g. admin tooling) use the Clerk
 * Backend API: https://clerk.com/docs/reference/backend-api
 */
async function registerHandler(req: NextRequest): Promise<NextResponse> {
  let redirectUrl = "/dashboard";

  try {
    const body = await req.json().catch(() => ({}));
    if (body?.redirectUrl && typeof body.redirectUrl === "string") {
      // Basic validation: only allow relative paths to prevent open redirect
      const parsed = new URL(body.redirectUrl, "http://localhost");
      if (parsed.hostname === "localhost") {
        redirectUrl = parsed.pathname + parsed.search;
      }
    }
  } catch {
    // Ignore malformed body — fall back to default redirect
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:5173";
  const signUpUrl = new URL("/sign-up", appUrl);
  signUpUrl.searchParams.set("redirect_url", redirectUrl);

  return NextResponse.json({ signUpUrl: signUpUrl.toString() });
}

export const POST = withRateLimit(
  withErrorHandler(registerHandler as (...args: unknown[]) => Promise<NextResponse>),
  RATE_LIMITS.auth,
  "register"
) as typeof registerHandler;
