import { NextRequest, NextResponse } from "next/server";
import { ingreyhrResolveRequestAuth } from "@/lib/ingreyhr-auth";
import { ingreyhrSessionStore } from "@/lib/session-store";
import { getConfig } from "@/lib/config";

export async function GET(request: NextRequest) {
  const ingreyhrAuthContext = await ingreyhrResolveRequestAuth(request);
  // Revoke session server-side so tokens can be considered invalid immediately
  try {
    const cfg = getConfig();
    if (ingreyhrAuthContext.profile?.sessionId) {
      await ingreyhrSessionStore.revokeSession(
        ingreyhrAuthContext.profile.sessionId,
        cfg.ingreyhrAuth.tokenTtlSeconds
      );
    }
  } catch (e) {
    console.warn("Warning: failed to revoke session in store", e);
  }

  return NextResponse.json({
    success: true,
    authenticated: ingreyhrAuthContext.authenticated,
    sessionId: ingreyhrAuthContext.profile?.sessionId || null,
    message: "IngreyHR session cleared on the client side",
    timestamp: new Date().toISOString(),
  });
}
