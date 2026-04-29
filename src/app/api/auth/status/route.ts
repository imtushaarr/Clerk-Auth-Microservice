import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, RATE_LIMIT_PRESETS } from "@/lib/rate-limit";
import { handleApiError } from "@/lib/api-error";

export async function GET(req: NextRequest) {
  const rateLimitResponse = checkRateLimit(req, RATE_LIMIT_PRESETS.API);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { userId, sessionId } = await auth();

    return NextResponse.json({
      authenticated: !!userId,
      userId,
      sessionId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return handleApiError(error, "auth/status");
  }
}
