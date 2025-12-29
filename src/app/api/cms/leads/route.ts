import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/cmsAuth";
import { listLeadsForCms } from "@/lib/cmsLeads";
import { rateLimit } from "@/lib/rateLimit";
import { logAdminAction, logError } from "@/lib/securityLogger";
import { LeadStatus } from "@/lib/leadStatus";

const LeadListResponseSchema = z.object({
  leads: z.array(z.any()),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
});

const ErrorResponseSchema = z.object({
  code: z.string(),
  message: z.string(),
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
    const { searchParams } = request.nextUrl;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "50", 10);
    const status = searchParams.get("status") as LeadStatus | null;
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const allLeads = await listLeadsForCms();
    
    // Filter by status
    let filtered = status 
      ? allLeads.filter((lead) => lead.status === status)
      : allLeads;

    // Sort
    filtered.sort((a, b) => {
      const aVal = (a as any)[sortBy];
      const bVal = (b as any)[sortBy];
      const order = sortOrder === "asc" ? 1 : -1;
      
      if (sortBy === "createdAt") {
        return order * (new Date(bVal).getTime() - new Date(aVal).getTime());
      }
      
      return order * String(aVal).localeCompare(String(bVal));
    });

    // Paginate
    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const leads = filtered.slice(start, start + pageSize);

    logAdminAction("LIST_LEADS", undefined, { count: leads.length, total, page, status });
    return NextResponse.json(
      LeadListResponseSchema.parse({ leads, total, page, pageSize }),
      { status: 200 }
    );
  } catch (error) {
    logError("LIST_LEADS_ERROR", error);
    return NextResponse.json(
      ErrorResponseSchema.parse({ code: "LIST_LEADS_FAILED", message: "Failed to list leads" }),
      { status: 500 }
    );
  }
}
