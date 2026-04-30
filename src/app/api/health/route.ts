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
    timestamp: new Date().toISOString(),
  });
}
