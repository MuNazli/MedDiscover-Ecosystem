import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/cmsAuth";
import { rateLimit } from "@/lib/rateLimit";
import { logAdminAction, logError } from "@/lib/securityLogger";
import { prisma } from "@/lib/prisma";

const TimelineResponseSchema = z.object({
  timeline: z.array(z.object({
    id: z.string(),
    type: z.enum(["status", "note", "audit"]),
    createdAt: z.string(),
    content: z.string().optional(),
    author: z.string().optional(),
    action: z.string().optional(),
    meta: z.string().optional(),
  })),
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
    const lead = await prisma.lead.findUnique({
      where: { id: params.id },
      include: {
        notes: {
          orderBy: { createdAt: "desc" },
          take: 100,
        },
        audits: {
          orderBy: { createdAt: "desc" },
          take: 100,
        },
      },
    });

    if (!lead) {
      return NextResponse.json(
        ErrorResponseSchema.parse({ code: "LEAD_NOT_FOUND", message: "Lead not found" }),
        { status: 404 }
      );
    }

    // Build timeline: notes + audits + implicit status changes
    const timeline: Array<{
      id: string;
      type: "status" | "note" | "audit";
      createdAt: string;
      content?: string;
      author?: string;
      action?: string;
      meta?: string;
    }> = [];

    // Add notes
    lead.notes.forEach((note) => {
      timeline.push({
        id: note.id,
        type: "note",
        createdAt: note.createdAt.toISOString(),
        content: note.content,
        author: note.author || "admin",
      });
    });

    // Add audits (status changes tracked here)
    lead.audits.forEach((audit) => {
      timeline.push({
        id: audit.id,
        type: audit.action.includes("status") ? "status" : "audit",
        createdAt: audit.createdAt.toISOString(),
        action: audit.action,
        meta: audit.meta || undefined,
        author: audit.actor || "system",
      });
    });

    // Sort by date (newest first)
    timeline.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    logAdminAction("VIEW_TIMELINE", params.id, { count: timeline.length });
    return NextResponse.json(
      TimelineResponseSchema.parse({ timeline }),
      { status: 200 }
    );
  } catch (error) {
    logError("VIEW_TIMELINE_ERROR", error, { leadId: params.id });
    return NextResponse.json(
      ErrorResponseSchema.parse({ code: "VIEW_TIMELINE_FAILED", message: "Failed to get timeline" }),
      { status: 500 }
    );
  }
}
