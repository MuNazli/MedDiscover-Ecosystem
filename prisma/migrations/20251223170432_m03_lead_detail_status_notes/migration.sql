/*
  Warnings:

  - You are about to drop the column `notes` on the `leads` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "LeadNote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "leadId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "author" TEXT,
    CONSTRAINT "LeadNote_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LeadAudit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "leadId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "meta" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actor" TEXT,
    CONSTRAINT "LeadAudit_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads" ("id") ON DELETE CASCADE ON UPDATE CASCADE
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
    "clinicId" TEXT,
    "treatmentId" TEXT,
    CONSTRAINT "leads_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "clinics" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "leads_treatmentId_fkey" FOREIGN KEY ("treatmentId") REFERENCES "treatments" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_leads" ("clinicId", "contactPreference", "country", "createdAt", "gdprConsent", "id", "patientName", "requestedProcedure", "status", "treatmentId", "updatedAt") SELECT "clinicId", "contactPreference", "country", "createdAt", "gdprConsent", "id", "patientName", "requestedProcedure", "status", "treatmentId", "updatedAt" FROM "leads";
DROP TABLE "leads";
ALTER TABLE "new_leads" RENAME TO "leads";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

UPDATE "leads" SET status = 'IN_REVIEW' WHERE status = 'CONTACTED';

-- CreateIndex
CREATE INDEX "LeadNote_leadId_createdAt_idx" ON "LeadNote"("leadId", "createdAt");

-- CreateIndex
CREATE INDEX "LeadAudit_leadId_createdAt_idx" ON "LeadAudit"("leadId", "createdAt");
