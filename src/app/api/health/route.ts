import { NextResponse } from "next/server";

/**
 * Health check endpoint for production monitoring
 * No authentication required
 * Returns 200 OK if service is running
 */
export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "m01-lead-intake",
    },
    { status: 200 }
  );
}
