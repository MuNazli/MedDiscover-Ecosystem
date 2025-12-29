import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/cmsAuth";
import { getLeadDetail } from "@/lib/cmsLeads";
import { rateLimit } from "@/lib/rateLimit";
import { logAdminAction, logError } from "@/lib/securityLogger";

const LeadDetailResponseSchema = z.object({
  lead: z.any(),
});

const ErrorResponseSchema = z.object({
  code: z.string(),
  message: z.string(),
});

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

  try {
    const lead = await getLeadDetail(params.id);
    if (!lead) {
      return NextResponse.json(
        ErrorResponseSchema.parse({ code: "LEAD_NOT_FOUND", message: "Lead not found" }),
        { status: 404 }
      );
    }

    logAdminAction("VIEW_LEAD", params.id);
    return NextResponse.json(LeadDetailResponseSchema.parse({ lead }), { status: 200 });
  } catch (error) {
    logError("VIEW_LEAD_ERROR", error, { leadId: params.id });
    return NextResponse.json(
      ErrorResponseSchema.parse({ code: "VIEW_LEAD_FAILED", message: "Failed to get lead" }),
      { status: 500 }
    );
  }
}
