import { PrismaClient } from "@prisma/client";

const baseUrl = process.env.M07A_BASE_URL || "http://localhost:3000";
const adminKey = process.env.ADMIN_PASSPHRASE;

if (!adminKey) {
  console.error("Missing ADMIN_PASSPHRASE");
  process.exit(1);
}

const prisma = new PrismaClient();

async function main() {
  const lead = await prisma.lead.create({
    data: {
      patientName: "Test Patient",
      country: "TR",
      contactPreference: "EMAIL",
      requestedProcedure: "Test Procedure",
      gdprConsent: true,
    },
  });

  const authRes = await fetch(`${baseUrl}/api/cms/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key: adminKey }),
  });

  if (!authRes.ok) {
    throw new Error("Auth failed");
  }

  const cookie = authRes.headers.get("set-cookie");
  if (!cookie) {
    throw new Error("Missing auth cookie");
  }

  const recalcRes = await fetch(`${baseUrl}/api/cms/leads/${lead.id}/trustscore/recalc`, {
    method: "POST",
    headers: { cookie },
  });

  if (!recalcRes.ok) {
    throw new Error(`Recalc failed: ${recalcRes.status}`);
  }

  const data = await recalcRes.json();
  console.log("Recalc success", {
    leadId: lead.id,
    ruleScore: data.ruleScore,
    finalScore: data.finalScore,
    appliedCount: data.appliedCount,
    runId: data.runId,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
