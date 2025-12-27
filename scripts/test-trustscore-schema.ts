import { prisma } from "../src/lib/prisma";

async function testTrustScore() {
  console.log("Testing TrustScore schema...\n");

  // Test 1: Create a lead with default TrustScore
  const lead = await prisma.lead.create({
    data: {
      patientName: "Test Patient",
      country: "DE",
      requestedProcedure: "Test Procedure",
      gdprConsent: true,
      // trustScore and trustStatus will use defaults
    },
  });

  console.log("✓ Lead created with defaults:");
  console.log(`  ID: ${lead.id}`);
  console.log(`  trustScore: ${lead.trustScore}`);
  console.log(`  trustStatus: ${lead.trustStatus}`);
  console.log(`  scoreOverride: ${lead.scoreOverride}`);

  // Test 2: Update with override
  const updated = await prisma.lead.update({
    where: { id: lead.id },
    data: {
      scoreOverride: 50,
      overrideReason: "Test override",
      overrideBy: "admin",
      overrideAt: new Date(),
    },
  });

  console.log("\n✓ Lead updated with override:");
  console.log(`  scoreOverride: ${updated.scoreOverride}`);
  console.log(`  overrideReason: ${updated.overrideReason}`);

  // Test 3: Create TrustScoreEvent
  const event = await prisma.trustScoreEvent.create({
    data: {
      leadId: lead.id,
      kind: "OVERRIDE_SET",
      scoreBefore: 80,
      scoreAfter: 50,
      delta: -30,
      meta: JSON.stringify({ test: true }),
      actor: "admin",
    },
  });

  console.log("\n✓ TrustScoreEvent created:");
  console.log(`  ID: ${event.id}`);
  console.log(`  kind: ${event.kind}`);
  console.log(`  delta: ${event.delta}`);

  // Cleanup
  await prisma.trustScoreEvent.deleteMany({ where: { leadId: lead.id } });
  await prisma.lead.delete({ where: { id: lead.id } });

  console.log("\n✓ Cleanup complete");
  console.log("\n=== ALL TESTS PASSED ===\n");
}

testTrustScore()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
