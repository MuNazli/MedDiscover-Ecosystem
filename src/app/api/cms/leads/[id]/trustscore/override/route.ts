/**
 * PATCH /api/cms/leads/[id]/trustscore/override
 * 
 * Set or clear manual score override.
 * Body: { scoreOverride: number | null, reason?: string }
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/cmsAuth";
import { applyLeadRules, mapScoreToStatus } from "@/lib/trustscoreRules";

const MAX_REASON_LENGTH = 200;

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = requireAdmin(request);
  if (authError) {
    return authError;
  }

  const { id } = params;

  try {
    const body = await request.json();
    const { scoreOverride, reason } = body;

    // Validate score
    if (!validateOverrideScore(scoreOverride)) {
      return NextResponse.json(
        { error: "Invalid override score. Must be 0-100 or null." },
        { status: 400 }
      );
    }

    // Validate reason length
    if (reason && typeof reason === "string" && reason.length > MAX_REASON_LENGTH) {
      return NextResponse.json(
        { error: `Reason too long. Max ${MAX_REASON_LENGTH} characters.` },
        { status: 400 }
      );
    }

    // Fetch current lead
    const lead = await prisma.lead.findUnique({
      where: { id },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const scoreBefore = lead.scoreOverride !== null ? lead.scoreOverride : lead.trustScore;

    // Determine action
    const isClearing = scoreOverride === null;
    const kind = isClearing ? "OVERRIDE_CLEARED" : "OVERRIDE_SET";

    // Calculate new status
    let newStatus: string;
    let finalScore: number;

    let ruleScoreUpdate: number | null = null;
    if (isClearing) {
      const notesCount = await prisma.leadNote.count({ where: { leadId: id } });
      const rules = await prisma.trustRule.findMany({
        where: { isActive: true, appliesTo: "LEAD" },
        select: { code: true, delta: true, isActive: true, appliesTo: true },
      });
      const result = applyLeadRules({
        lead: { ...lead, scoreOverride: null },
        notesCount,
        rules,
      });
      finalScore = result.finalScore;
      newStatus = result.trustStatus;
      ruleScoreUpdate = result.ruleScore;
    } else {
      finalScore = scoreOverride;
      newStatus = mapScoreToStatus(scoreOverride);
    }

    const delta = finalScore - scoreBefore;

    // Update lead
    await prisma.lead.update({
      where: { id },
      data: {
        scoreOverride: isClearing ? null : scoreOverride,
        overrideReason: isClearing ? null : (reason || null),
        overrideBy: isClearing ? null : "admin",
        overrideAt: isClearing ? null : new Date(),
        finalScore: finalScore,
        trustScore: finalScore,
        trustStatus: newStatus,
        trustUpdatedAt: new Date(),
        ...(ruleScoreUpdate !== null ? { ruleScore: ruleScoreUpdate } : {}),
      },
    });

    // Create audit event
    await prisma.trustScoreEvent.create({
      data: {
        leadId: id,
        kind,
        scoreBefore,
        scoreAfter: finalScore,
        delta,
        meta: JSON.stringify({ hasReason: Boolean(reason) }),
        actor: "admin",
      },
    });

    return NextResponse.json({
      success: true,
      action: kind,
      scoreBefore,
      scoreAfter: finalScore,
      delta,
      status: newStatus,
    });
  } catch (error) {
    console.error("[TrustScore Override] Error:", error);
    return NextResponse.json(
      { error: "Failed to update trust score override" },
      { status: 500 }
    );
  }
}
