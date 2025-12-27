import { prisma } from "@/lib/prisma";

export type DashboardStats = {
  totals: {
    total: number;
    last7d: number;
    last24h: number;
    open: number;
  };
  statusCounts: {
    NEW: number;
    IN_REVIEW: number;
    OFFER_SENT: number;
    CLOSED: number;
  };
  recentAudits: Array<{
    id: string;
    leadId: string;
    action: string;
    createdAt: Date;
    actor: string | null;
  }>;
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const now = new Date();
  const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Total leads count
  const total = await prisma.lead.count();

  // Last 7 days
  const last7dCount = await prisma.lead.count({
    where: {
      createdAt: {
        gte: last7d,
      },
    },
  });

  // Last 24h
  const last24hCount = await prisma.lead.count({
    where: {
      createdAt: {
        gte: last24h,
      },
    },
  });

  // Open leads (not CLOSED)
  const openCount = await prisma.lead.count({
    where: {
      status: {
        not: "CLOSED",
      },
    },
  });

  // Status counts
  const statusGroups = await prisma.lead.groupBy({
    by: ["status"],
    _count: {
      status: true,
    },
  });

  const statusCounts = {
    NEW: 0,
    IN_REVIEW: 0,
    OFFER_SENT: 0,
    CLOSED: 0,
  };

  for (const group of statusGroups) {
    const status = group.status as keyof typeof statusCounts;
    if (status in statusCounts) {
      statusCounts[status] = group._count.status;
    }
  }

  // Recent audits (last 20)
  const recentAudits = await prisma.leadAudit.findMany({
    take: 20,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      leadId: true,
      action: true,
      createdAt: true,
      actor: true,
    },
  });

  return {
    totals: {
      total,
      last7d: last7dCount,
      last24h: last24hCount,
      open: openCount,
    },
    statusCounts,
    recentAudits,
  };
}
