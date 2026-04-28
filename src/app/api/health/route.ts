import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "healthy",
    service: "Clerk Auth Microservice",
    port: 5173,
    timestamp: new Date().toISOString(),
  });
}
