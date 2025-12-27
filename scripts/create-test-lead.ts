import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Creating test lead...");

  const lead = await prisma.lead.create({
    data: {
      patientName: "Max Mustermann",
      name: "Max Mustermann",
      email: "max.mustermann@example.com",
      phone: "+49 123 456 7890",
      country: "DE",
      locale: "de",
      contactPreference: "WHATSAPP",
      requestedProcedure: "Haartransplantation",
      gdprConsent: true,
      status: "NEW",
    },
  });

  console.log("✓ Test lead created:", lead.id);
  console.log("  Name:", lead.patientName);
  console.log("  Status:", lead.status);
  console.log("\nYou can view it at: /cms/leads/" + lead.id);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
