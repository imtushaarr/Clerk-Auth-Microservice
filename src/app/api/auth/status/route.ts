import { NextResponse } from "next/server";
import { ingreyhrResolveRequestAuth } from "@/lib/ingreyhr-auth";

export async function GET(request: Request) {
  const ingreyhrAuthContext = await ingreyhrResolveRequestAuth(request as any);

  return NextResponse.json({
    authenticated: ingreyhrAuthContext.authenticated,
    source: ingreyhrAuthContext.source,
    user: ingreyhrAuthContext.profile,
    userId: ingreyhrAuthContext.profile?.id || null,
    sessionId: ingreyhrAuthContext.profile?.sessionId || null,
    timestamp: new Date().toISOString(),
  });
}
