import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("\n=== DASHBOARD API TEST ===\n");

  // Get stats manually to verify
  const total = await prisma.lead.count();
  console.log("✓ Total Leads:", total);

  const now = new Date();
  const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const last7dCount = await prisma.lead.count({
    where: { createdAt: { gte: last7d } },
  });
  console.log("✓ Last 7 days:", last7dCount);

  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const last24hCount = await prisma.lead.count({
    where: { createdAt: { gte: last24h } },
  });
  console.log("✓ Last 24h:", last24hCount);

  const openCount = await prisma.lead.count({
    where: { status: { not: "CLOSED" } },
  });
  console.log("✓ Open Leads:", openCount);

  const statusGroups = await prisma.lead.groupBy({
    by: ["status"],
    _count: { status: true },
  });
  console.log("\n✓ Status Counts:");
  for (const group of statusGroups) {
    console.log(`  ${group.status}: ${group._count.status}`);
  }

  const recentAudits = await prisma.leadAudit.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    select: { id: true, leadId: true, action: true, createdAt: true },
  });
  console.log("\n✓ Recent Audits (5):");
  recentAudits.forEach((audit, i) => {
    console.log(`  ${i + 1}. ${audit.action} - ${audit.createdAt.toLocaleString()}`);
  });

  console.log("\n=== TEST COMPLETE ===\n");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
