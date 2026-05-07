import { NextResponse } from "next/server";
import { getConfig } from "@/lib/config";

export async function GET() {
  const ingreyhrConfig = getConfig();

  return NextResponse.json({
    service: ingreyhrConfig.app.name,
    status: "ok",
    mode: "headless-api",
    rootUrl: ingreyhrConfig.app.url,
    apiRoutes: [
      "/api/health",
      "/api/auth/status",
      "/api/auth/login",
      "/api/auth/register",
      "/api/auth/profile",
      "/api/auth/refresh",
      "/api/auth/logout",
      "/api/auth/verify",
      "/api/webhooks/clerk",
      "/api/email/send-welcome",
      "/api/docs/openapi.json",
    ],
    note:
      "This service is intentionally headless. Use the REST API endpoints above from the IngreyHR frontends.",
    timestamp: new Date().toISOString(),
  });
}
