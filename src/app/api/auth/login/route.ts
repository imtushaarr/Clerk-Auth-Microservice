import { NextRequest, NextResponse } from "next/server";
import { apiError, withErrorHandler } from "@/lib/api-error";
import { withRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

/**
 * POST /api/auth/login
 *
 * Initiates a Clerk-managed sign-in flow.
 *
 * Because Clerk handles all credential validation on the client (via its
 * hosted UI or the Clerk JS SDK), this endpoint acts as a discovery/redirect
 * helper for server-side consumers that need a canonical login URL.
 *
 * Body (JSON):
 *   { redirectUrl?: string }   — optional post-login destination
 *
 * Response 200:
 *   { signInUrl: string }      — URL to redirect the user to for sign-in
 *
 * For programmatic authentication (e.g. mobile apps or service-to-service)
 * use the Clerk Backend API directly:
 * https://clerk.com/docs/reference/backend-api
 */
async function loginHandler(req: NextRequest): Promise<NextResponse> {
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
  const signInUrl = new URL("/sign-in", appUrl);
  signInUrl.searchParams.set("redirect_url", redirectUrl);

  return NextResponse.json({ signInUrl: signInUrl.toString() });
}

export const POST = withRateLimit(
  withErrorHandler(loginHandler as (...args: unknown[]) => Promise<NextResponse>),
  RATE_LIMITS.auth,
  "login"
) as typeof loginHandler;
