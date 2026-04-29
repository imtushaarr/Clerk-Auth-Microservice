import { NextResponse } from "next/server";
import { sendSignupWelcomeEmail } from "@/lib/email";
import { apiError, withErrorHandler } from "@/lib/api-error";

async function handler(req: Request): Promise<NextResponse> {
  const { email, firstName } = await req.json();

  if (!email) {
    return apiError("VALIDATION_ERROR", "email is required");
  }

  const success = await sendSignupWelcomeEmail(email, firstName);

  if (success) {
    return NextResponse.json(
      { message: "Welcome email sent successfully" },
      { status: 200 }
    );
  }

  return apiError("INTERNAL_ERROR", "Failed to send welcome email");
}

export const POST = withErrorHandler(handler as (...args: unknown[]) => Promise<NextResponse>) as typeof handler;
