import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clinics
  const clinics = [
    { name: "Istanbul Dental Center", country: "TR" },
    { name: "Ankara Medical Hub", country: "TR" },
    { name: "Berlin Health Clinic", country: "DE" },
  ];

  for (const clinic of clinics) {
    await prisma.clinic.upsert({
      where: { id: clinic.name.toLowerCase().replace(/\s+/g, "-") },
      update: {},
      create: {
        id: clinic.name.toLowerCase().replace(/\s+/g, "-"),
        name: clinic.name,
        country: clinic.country,
        isActive: true,
      },
    });
    console.log(`  ✓ Clinic: ${clinic.name}`);
  }

  // Treatments
  const treatments = [
    { name: "Diş İmplantı" },
    { name: "Zirkonyum Kaplama" },
    { name: "Diş Beyazlatma" },
    { name: "Saç Ekimi" },
    { name: "Göz Lazer Ameliyatı" },
  ];

  for (const treatment of treatments) {
    await prisma.treatment.upsert({
      where: { id: treatment.name.toLowerCase().replace(/\s+/g, "-") },
      update: {},
      create: {
        id: treatment.name.toLowerCase().replace(/\s+/g, "-"),
        name: treatment.name,
        isActive: true,
      },
    });
    console.log(`  ✓ Treatment: ${treatment.name}`);
  }


  const trustRules = [
    {
      code: "RULE_MISSING_EMAIL",
      delta: -20,
      titleKey: "trustRule.missingEmail.title",
      descriptionKey: "trustRule.missingEmail.description",
    },
    {
      code: "RULE_MISSING_PHONE",
      delta: -15,
      titleKey: "trustRule.missingPhone.title",
      descriptionKey: "trustRule.missingPhone.description",
    },
    {
      code: "RULE_MISSING_NAME",
      delta: -10,
      titleKey: "trustRule.missingName.title",
      descriptionKey: "trustRule.missingName.description",
    },
    {
      code: "RULE_MISSING_LOCALE",
      delta: -5,
      titleKey: "trustRule.missingLocale.title",
      descriptionKey: "trustRule.missingLocale.description",
    },
    {
      code: "RULE_HAS_NOTE",
      delta: 5,
      titleKey: "trustRule.hasNote.title",
      descriptionKey: "trustRule.hasNote.description",
    },
    {
      code: "RULE_STATUS_OFFER_SENT",
      delta: 5,
      titleKey: "trustRule.statusOfferSent.title",
      descriptionKey: "trustRule.statusOfferSent.description",
    },
    {
      code: "RULE_STATUS_CLOSED",
      delta: 10,
      titleKey: "trustRule.statusClosed.title",
      descriptionKey: "trustRule.statusClosed.description",
    },
  ];

  for (const rule of trustRules) {
    await prisma.trustRule.upsert({
      where: { code: rule.code },
      update: {
        delta: rule.delta,
        titleKey: rule.titleKey,
        descriptionKey: rule.descriptionKey,
      },
      create: {
        code: rule.code,
        delta: rule.delta,
        titleKey: rule.titleKey,
        descriptionKey: rule.descriptionKey,
        appliesTo: "LEAD",
        isActive: true,
      },
    });
    console.log(`  ?o" TrustRule: ${rule.code}`);
  }

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
