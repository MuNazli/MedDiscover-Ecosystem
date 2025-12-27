import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/cmsAuth";
import { listLeadsForCms } from "@/lib/cmsLeads";

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) {
    return authError;
  }

  const leads = await listLeadsForCms();
  return NextResponse.json({ leads }, { status: 200 });
}
