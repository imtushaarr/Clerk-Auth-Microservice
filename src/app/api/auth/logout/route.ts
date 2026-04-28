import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export async function GET() {
  const { sessionId } = await auth();

  if (!sessionId) {
    redirect("/");
  }

  // Clerk handles session cleanup on client side via SignOutButton
  // This endpoint redirects to home after confirming user is logged out
  redirect("/");
}
