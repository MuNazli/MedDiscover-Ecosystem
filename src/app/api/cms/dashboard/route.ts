import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/cmsAuth";
import { getDashboardStats } from "@/lib/cmsDashboard";

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) {
    return authError;
  }

  const stats = await getDashboardStats();
  return NextResponse.json(stats, { status: 200 });
}
