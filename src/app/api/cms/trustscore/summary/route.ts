/**
 * GET /api/cms/trustscore/summary
 * 
 * Returns TrustScore summary statistics for admin dashboard.
 * No PII in response.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/cmsAuth";

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) {
    return authError;
  }

  try {
    const [avgResult, totalCount, statusGroups, topRisky] = await Promise.all([
      prisma.lead.aggregate({
        _avg: { trustScore: true },
      }),
      prisma.lead.count(),
      prisma.lead.groupBy({
        by: ["trustStatus"],
        _count: { trustStatus: true },
      }),
      prisma.lead.findMany({
        where: {
          trustStatus: { in: ["RISKY_HIDDEN", "BLACKLISTED"] },
        },
        orderBy: { trustScore: "asc" },
        take: 10,
        select: {
          id: true,
          trustScore: true,
          trustStatus: true,
          trustUpdatedAt: true,
        },
      }),
    ]);

    const counts = {
      active: 0,
      riskyHidden: 0,
      blacklisted: 0,
    };

    for (const group of statusGroups) {
      switch (group.trustStatus) {
        case "ACTIVE":
          counts.active = group._count.trustStatus;
          break;
        case "RISKY_HIDDEN":
          counts.riskyHidden = group._count.trustStatus;
          break;
        case "BLACKLISTED":
          counts.blacklisted = group._count.trustStatus;
          break;
      }
    }

    const avgScore = totalCount > 0 ? Math.round(avgResult._avg.trustScore ?? 0) : 0;
    const topRiskyPayload = topRisky.map((lead) => ({
      leadId: lead.id,
      score: lead.trustScore,
      trustStatus: lead.trustStatus,
      updatedAt: lead.trustUpdatedAt?.toISOString() || null,
    }));

    return NextResponse.json({
      counts,
      avgScore,
      topRisky: topRiskyPayload,
    });
  } catch (error) {
    console.error("[TrustScore Summary] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch trust score summary" },
      { status: 500 }
    );
  }
}
