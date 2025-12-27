import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/cmsAuth";
import { getLeadDetail } from "@/lib/cmsLeads";

interface RouteParams {
  params: { id: string };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const authError = requireAdmin(request);
  if (authError) {
    return authError;
  }

  const lead = await getLeadDetail(params.id);
  if (!lead) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ lead }, { status: 200 });
}
