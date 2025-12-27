import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const leadId = "cmjjyvdqm0000hpmki4ys5ltc";
  
  console.log("\n=== LEAD VERIFICATION ===\n");
  
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: {
      notes: { orderBy: { createdAt: "desc" } },
      audits: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!lead) {
    console.log("❌ Lead not found");
    return;
  }

  console.log("✓ Lead Found");
  console.log("  ID:", lead.id);
  console.log("  Name:", lead.patientName);
  console.log("  Status:", lead.status);
  console.log("  Created:", lead.createdAt.toLocaleString());
  console.log("\n✓ Notes:", lead.notes.length);
  lead.notes.forEach((note, i) => {
    console.log(`  ${i + 1}. [${note.author}] ${note.content.substring(0, 50)}...`);
  });
  
  console.log("\n✓ Audits:", lead.audits.length);
  lead.audits.forEach((audit, i) => {
    console.log(`  ${i + 1}. ${audit.action} by ${audit.actor}`);
  });
  
  console.log("\n=== VERIFICATION COMPLETE ===\n");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
