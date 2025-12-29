import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/cmsAuth";
import { updateLeadStatus } from "@/lib/cmsLeads";
import { LEAD_STATUSES } from "@/lib/leadStatus";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rateLimit";
import { logAdminAction, logError } from "@/lib/securityLogger";

const StatusSchema = z.object({
  status: z.enum(LEAD_STATUSES),
});

const StatusUpdateResponseSchema = z.object({
  lead: z.any(),
});

const ErrorResponseSchema = z.object({
  code: z.string(),
  message: z.string(),
});

interface RouteParams {
  params: { id: string };
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  // Rate limiting
  const rateLimitError = rateLimit(request, {
    maxRequests: 20,
    windowMs: 60 * 1000, // 20 updates per minute
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
    const body = await request.json().catch(() => null);
    const parsed = StatusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        ErrorResponseSchema.parse({ code: "INVALID_STATUS", message: "Invalid status value" }),
        { status: 400 }
      );
    }

    const existing = await prisma.lead.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json(
        ErrorResponseSchema.parse({ code: "LEAD_NOT_FOUND", message: "Lead not found" }),
        { status: 404 }
      );
    }

    const lead = await updateLeadStatus(params.id, parsed.data.status);
    logAdminAction("UPDATE_STATUS", params.id, { status: parsed.data.status });
    return NextResponse.json(StatusUpdateResponseSchema.parse({ lead }), { status: 200 });
  } catch (error) {
    logError("UPDATE_STATUS_ERROR", error, { leadId: params.id });
    return NextResponse.json(
      ErrorResponseSchema.parse({ code: "UPDATE_STATUS_FAILED", message: "Failed to update status" }),
      { status: 500 }
    );
  }
}
