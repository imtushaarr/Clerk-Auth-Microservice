import { NextResponse } from "next/server";
import { getConfig } from "@/lib/config";

export async function GET() {
  const config = getConfig();

  return NextResponse.json({
    status: "healthy",
    service: config.app.name,
    environment: config.app.nodeEnv,
    port: config.app.port,
    url: config.app.url,
    authRoles: ["company-admin", "hr-admin", "employee"],
    apiOnly: true,
    timestamp: new Date().toISOString(),
  });
}
