import { prisma } from "@/lib/prisma";
import { LeadStatus, normalizeLeadStatus } from "@/lib/leadStatus";
import { maskEmail, maskPhone } from "@/lib/leadMask";
import { applyLeadRules } from "@/lib/trustscoreRules";

const DETAIL_LIMIT = 50;

export async function getLeadDetail(leadId: string) {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: {
      notes: {
        orderBy: { createdAt: "desc" },
        take: DETAIL_LIMIT,
      },
      audits: {
        orderBy: { createdAt: "desc" },
        take: DETAIL_LIMIT,
      },
    },
  });
  if (!lead) {
    return null;
  }
  return {
    ...lead,
    status: normalizeLeadStatus(lead.status),
    email: lead.email ? maskEmail(lead.email) : lead.email,
    phone: lead.phone ? maskPhone(lead.phone) : lead.phone,
  };
}

export async function listLeadsForCms() {
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      locale: true,
      name: true,
      email: true,
      phone: true,
      patientName: true,
      status: true,
      trustScore: true,
      trustStatus: true,
    },
  });
  return leads.map((lead) => ({
    ...lead,
    status: normalizeLeadStatus(lead.status),
    email: lead.email ? maskEmail(lead.email) : lead.email,
    phone: lead.phone ? maskPhone(lead.phone) : lead.phone,
  }));
}

export async function updateLeadStatus(leadId: string, status: LeadStatus) {
  return prisma.$transaction(async (tx) => {
    // First update status
    const lead = await tx.lead.update({
      where: { id: leadId },
      data: { status },
    });

    // Recalculate TrustScore if no override
    if (lead.scoreOverride === null) {
      const notesCount = await tx.leadNote.count({ where: { leadId } });
      const rules = await tx.trustRule.findMany({
        where: { isActive: true, appliesTo: "LEAD" },
        select: { code: true, delta: true, isActive: true, appliesTo: true },
      });
      const result = applyLeadRules(
        { lead: { ...lead, status, scoreOverride: null }, notesCount, rules }
      );

      if (result.finalScore !== lead.trustScore) {
        await tx.lead.update({
          where: { id: leadId },
          data: {
            ruleScore: result.ruleScore,
            finalScore: result.finalScore,
            trustScore: result.finalScore,
            trustStatus: result.trustStatus,
            trustUpdatedAt: new Date(),
          },
        });

        await tx.trustScoreEvent.create({
          data: {
            leadId,
            kind: "RULE_RECALC",
            scoreBefore: lead.trustScore,
            scoreAfter: result.finalScore,
            delta: result.finalScore - lead.trustScore,
            meta: JSON.stringify({ trigger: "status_change" }),
            actor: "admin",
          },
        });
      }
    }

    await tx.leadAudit.create({
      data: {
        leadId,
        action: "STATUS_CHANGED",
        actor: "admin",
        meta: JSON.stringify({ status }),
      },
    });

    return lead;
  });
}

export async function addLeadNote(leadId: string, content: string) {
  return prisma.$transaction(async (tx) => {
    const note = await tx.leadNote.create({
      data: {
        leadId,
        content,
        author: "admin",
      },
    });

    // Recalculate TrustScore if no override
    const lead = await tx.lead.findUnique({ where: { id: leadId } });
    if (lead && lead.scoreOverride === null) {
      const notesCount = await tx.leadNote.count({ where: { leadId } });
      const rules = await tx.trustRule.findMany({
        where: { isActive: true, appliesTo: "LEAD" },
        select: { code: true, delta: true, isActive: true, appliesTo: true },
      });
      const result = applyLeadRules({ lead: { ...lead, scoreOverride: null }, notesCount, rules });

      if (result.finalScore !== lead.trustScore) {
        await tx.lead.update({
          where: { id: leadId },
          data: {
            ruleScore: result.ruleScore,
            finalScore: result.finalScore,
            trustScore: result.finalScore,
            trustStatus: result.trustStatus,
            trustUpdatedAt: new Date(),
          },
        });

        await tx.trustScoreEvent.create({
          data: {
            leadId,
            kind: "RULE_RECALC",
            scoreBefore: lead.trustScore,
            scoreAfter: result.finalScore,
            delta: result.finalScore - lead.trustScore,
            meta: JSON.stringify({ trigger: "note_added" }),
            actor: "admin",
          },
        });
      }
    }

    await tx.leadAudit.create({
      data: {
        leadId,
        action: "NOTE_ADDED",
        actor: "admin",
      },
    });

    return note;
  });
}
