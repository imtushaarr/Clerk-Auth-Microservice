import { NextResponse } from "next/server";
import { sendSignupWelcomeEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email, firstName } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const success = await sendSignupWelcomeEmail(email, firstName);

    if (success) {
      return NextResponse.json(
        { message: "Welcome email sent successfully" },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: "Failed to send welcome email" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in email endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
