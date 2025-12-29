import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/cmsAuth";
import { listLeadsForCms } from "@/lib/cmsLeads";
import { rateLimit } from "@/lib/rateLimit";
import { logAdminAction, logError } from "@/lib/securityLogger";

const LeadListResponseSchema = z.object({
  leads: z.array(z.any()),
});

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

  try {
    const leads = await listLeadsForCms();
    logAdminAction("LIST_LEADS", undefined, { count: leads.length });
    return NextResponse.json(LeadListResponseSchema.parse({ leads }), { status: 200 });
  } catch (error) {
    logError("LIST_LEADS_ERROR", error);
    return NextResponse.json({ error: "Failed to list leads" }, { status: 500 });
  }
}
