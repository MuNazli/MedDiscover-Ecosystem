import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const leadId = "cmjjyvdqm0000hpmki4ys5ltc";
  
  console.log("\n=== ADDING TEST DATA ===\n");
  
  // Update status
  await prisma.lead.update({
    where: { id: leadId },
    data: { status: "IN_REVIEW" },
  });
  console.log("✓ Status updated to IN_REVIEW");
  
  // Add status change audit
  await prisma.leadAudit.create({
    data: {
      leadId,
      action: "STATUS_CHANGED",
      actor: "admin",
      meta: JSON.stringify({ status: "IN_REVIEW" }),
    },
  });
  console.log("✓ Audit added: STATUS_CHANGED");
  
  // Add note
  await prisma.leadNote.create({
    data: {
      leadId,
      content: "Patient called and confirmed interest. Ready for offer.",
      author: "admin",
    },
  });
  console.log("✓ Note added");
  
  // Add another note
  await prisma.leadNote.create({
    data: {
      leadId,
      content: "Sent preliminary information package. Awaiting response.",
      author: "admin",
    },
  });
  console.log("✓ Second note added");
  
  // Add note audit
  await prisma.leadAudit.create({
    data: {
      leadId,
      action: "NOTE_ADDED",
      actor: "admin",
    },
  });
  console.log("✓ Audit added: NOTE_ADDED");
  
  console.log("\n=== TEST DATA COMPLETE ===\n");
  console.log("View at: http://localhost:3000/cms/leads/" + leadId);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
