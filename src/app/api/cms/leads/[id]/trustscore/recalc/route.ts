/**
 * POST /api/cms/leads/[id]/trustscore/recalc
 * 
 * Recalculate trust score based on rules (ignores override if present).
 * Creates TrustScoreEvent audit record.
 */

import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/cmsAuth";
import { applyLeadRules } from "@/lib/trustscoreRules";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = requireAdmin(request);
  if (authError) {
    return authError;
  }

  const { id } = params;

  try {
    // Fetch lead with notes count
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        _count: {
          select: { notes: true },
        },
      },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const notesCount = lead._count.notes;
    const rules = await prisma.trustRule.findMany({
      where: { isActive: true, appliesTo: "LEAD" },
      select: { code: true, delta: true, isActive: true, appliesTo: true },
    });

    const result = applyLeadRules({
      lead,
      notesCount,
      rules,
    });
    const scoreBefore = lead.finalScore ?? lead.trustScore;
    const delta = result.finalScore - scoreBefore;
    const runId = randomUUID();

    await prisma.lead.update({
      where: { id },
      data: {
        ruleScore: result.ruleScore,
        finalScore: result.finalScore,
        trustScore: result.finalScore,
        trustStatus: result.trustStatus,
        trustUpdatedAt: new Date(),
      },
    });

    if (result.applied.length > 0) {
      await prisma.trustRuleRun.createMany({
        data: result.applied.map((applied) => ({
          leadId: id,
          ruleCode: applied.code,
          delta: applied.delta,
          scoreBefore: applied.before,
          scoreAfter: applied.after,
          runId,
          actor: "admin",
        })),
      });
    }

    await prisma.trustScoreEvent.create({
      data: {
        leadId: id,
        kind: "RULE_RECALC",
        scoreBefore,
        scoreAfter: result.finalScore,
        delta,
        meta: JSON.stringify({ runId, appliedCount: result.applied.length }),
        actor: "admin",
      },
    });

    return NextResponse.json({
      success: true,
      scoreBefore,
      ruleScore: result.ruleScore,
      finalScore: result.finalScore,
      delta,
      status: result.trustStatus,
      appliedCount: result.applied.length,
      runId,
    });
  } catch (error) {
    console.error("[TrustScore Recalc] Error:", error);
    return NextResponse.json(
      { error: "Failed to recalculate trust score" },
      { status: 500 }
    );
  }
}
