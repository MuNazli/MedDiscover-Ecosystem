-- CreateTable
CREATE TABLE "trust_rules" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "titleKey" TEXT NOT NULL,
    "descriptionKey" TEXT NOT NULL,
    "delta" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "appliesTo" TEXT NOT NULL DEFAULT 'LEAD',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "trust_rule_runs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "leadId" TEXT NOT NULL,
    "ruleCode" TEXT NOT NULL,
    "delta" INTEGER NOT NULL,
    "scoreBefore" INTEGER NOT NULL,
    "scoreAfter" INTEGER NOT NULL,
    "runId" TEXT NOT NULL,
    "actor" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "trust_rule_runs_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_leads" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "locale" TEXT,
    "name" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "patientName" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "contactPreference" TEXT NOT NULL DEFAULT 'WHATSAPP',
    "requestedProcedure" TEXT NOT NULL,
    "gdprConsent" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "trustScore" INTEGER NOT NULL DEFAULT 80,
    "ruleScore" INTEGER NOT NULL DEFAULT 80,
    "finalScore" INTEGER NOT NULL DEFAULT 80,
    "trustStatus" TEXT NOT NULL DEFAULT 'ACTIVE',
    "scoreOverride" INTEGER,
    "overrideReason" TEXT,
    "overrideBy" TEXT,
    "overrideAt" DATETIME,
    "trustUpdatedAt" DATETIME,
    "clinicId" TEXT,
    "treatmentId" TEXT,
    CONSTRAINT "leads_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "clinics" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "leads_treatmentId_fkey" FOREIGN KEY ("treatmentId") REFERENCES "treatments" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_leads" ("clinicId", "contactPreference", "country", "createdAt", "email", "gdprConsent", "id", "locale", "name", "overrideAt", "overrideBy", "overrideReason", "patientName", "phone", "requestedProcedure", "scoreOverride", "status", "treatmentId", "trustStatus", "trustUpdatedAt", "updatedAt", "trustScore") SELECT "clinicId", "contactPreference", "country", "createdAt", "email", "gdprConsent", "id", "locale", "name", "overrideAt", "overrideBy", "overrideReason", "patientName", "phone", "requestedProcedure", "scoreOverride", "status", "treatmentId", "trustStatus", "trustUpdatedAt", "updatedAt", "trustScore" FROM "leads";
UPDATE "new_leads" SET "ruleScore" = "trustScore", "finalScore" = COALESCE("scoreOverride", "trustScore");
DROP TABLE "leads";
ALTER TABLE "new_leads" RENAME TO "leads";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "trust_rules_code_key" ON "trust_rules"("code");

-- CreateIndex
CREATE INDEX "trust_rule_runs_leadId_createdAt_idx" ON "trust_rule_runs"("leadId", "createdAt");

-- CreateIndex
CREATE INDEX "trust_rule_runs_runId_idx" ON "trust_rule_runs"("runId");
