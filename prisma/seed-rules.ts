// Seed TrustRules (idempotent)
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const RULES = [
  {
    code: 'RULE_MISSING_EMAIL',
    titleKey: 'trust.rule.missingEmail.title',
    descriptionKey: 'trust.rule.missingEmail.desc',
    delta: -20,
  },
  {
    code: 'RULE_MISSING_PHONE',
    titleKey: 'trust.rule.missingPhone.title',
    descriptionKey: 'trust.rule.missingPhone.desc',
    delta: -15,
  },
  {
    code: 'RULE_MISSING_NAME',
    titleKey: 'trust.rule.missingName.title',
    descriptionKey: 'trust.rule.missingName.desc',
    delta: -10,
  },
  {
    code: 'RULE_MISSING_LOCALE',
    titleKey: 'trust.rule.missingLocale.title',
    descriptionKey: 'trust.rule.missingLocale.desc',
    delta: -5,
  },
  {
    code: 'RULE_HAS_NOTE',
    titleKey: 'trust.rule.hasNote.title',
    descriptionKey: 'trust.rule.hasNote.desc',
    delta: 5,
  },
  {
    code: 'RULE_STATUS_OFFER_SENT',
    titleKey: 'trust.rule.statusOfferSent.title',
    descriptionKey: 'trust.rule.statusOfferSent.desc',
    delta: 5,
  },
  {
    code: 'RULE_STATUS_CLOSED',
    titleKey: 'trust.rule.statusClosed.title',
    descriptionKey: 'trust.rule.statusClosed.desc',
    delta: 10,
  },
];

async function main() {
  console.log('🌱 Seeding TrustRules...');

  for (const rule of RULES) {
    await prisma.trustRule.upsert({
      where: { code: rule.code },
      update: {
        titleKey: rule.titleKey,
        descriptionKey: rule.descriptionKey,
        delta: rule.delta,
      },
      create: rule,
    });
    console.log(`  ✓ ${rule.code} (${rule.delta > 0 ? '+' : ''}${rule.delta})`);
  }

  const count = await prisma.trustRule.count();
  console.log(`✅ Total TrustRules: ${count}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
