import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/cmsAuth";
import { listLeadsForCms } from "@/lib/cmsLeads";
import { rateLimit } from "@/lib/rateLimit";

export async function GET(request: NextRequest) {
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

  const leads = await listLeadsForCms();
  return NextResponse.json({ leads }, { status: 200 });
}
