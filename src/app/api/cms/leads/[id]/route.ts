import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/cmsAuth";
import { getLeadDetail } from "@/lib/cmsLeads";
import { rateLimit } from "@/lib/rateLimit";

interface RouteParams {
  params: { id: string };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  // Rate limiting
  const rateLimitError = rateLimit(request, {
    maxRequests: 30,
    windowMs: 60 * 1000, // 30 requests per minute
  });
  if (rateLimitError) {
    return rateLimitError;
  }

  // Auth check
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
