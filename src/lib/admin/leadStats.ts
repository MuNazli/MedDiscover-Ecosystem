import { LeadStatus } from "@/lib/leadStatus";

export type LeadSummary = {
  id: string;
  createdAt: string;
  status: LeadStatus;
};

type LeadInput = LeadSummary & {
  fullName?: string;
  email?: string;
  phone?: string | null;
  message?: string | null;
  packageId?: string;
  packageTitle?: string;
  destination?: string;
  treatmentCategory?: string;
  locale?: string;
};

export type LeadStats = {
  total: number;
  statusCounts: Record<LeadStatus, number>;
  statusPercentages: Record<LeadStatus, number>;
  last7DaysCount: number;
  recentLeads: LeadSummary[];
};

export function computeLeadStats(leads: LeadInput[]): LeadStats {
  const total = leads.length;
  const statusCounts: Record<LeadStatus, number> = {
    NEW: 0,
    IN_REVIEW: 0,
    OFFER_SENT: 0,
    CLOSED: 0,
  };

  for (const lead of leads) {
    if (lead.status in statusCounts) {
      statusCounts[lead.status as LeadStatus] += 1;
    }
  }

  const statusPercentages: Record<LeadStatus, number> = {
    NEW: total ? Math.round((statusCounts.NEW / total) * 100) : 0,
    IN_REVIEW: total ? Math.round((statusCounts.IN_REVIEW / total) * 100) : 0,
    OFFER_SENT: total ? Math.round((statusCounts.OFFER_SENT / total) * 100) : 0,
    CLOSED: total ? Math.round((statusCounts.CLOSED / total) * 100) : 0,
  };

  const now = Date.now();
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  const last7DaysCount = leads.filter((lead) => {
    const created = new Date(lead.createdAt).getTime();
    return !Number.isNaN(created) && created >= sevenDaysAgo;
  }).length;

  const recentLeads = [...leads]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map((lead) => ({
      id: lead.id,
      createdAt: lead.createdAt,
      status: lead.status,
    }));

  return { total, statusCounts, statusPercentages, last7DaysCount, recentLeads };
}
