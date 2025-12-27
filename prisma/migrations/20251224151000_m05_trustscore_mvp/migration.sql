-- Add TrustScore fields to leads
ALTER TABLE "leads" ADD COLUMN "trustScore" INTEGER NOT NULL DEFAULT 80;
ALTER TABLE "leads" ADD COLUMN "trustStatus" TEXT NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "leads" ADD COLUMN "scoreOverride" INTEGER;
ALTER TABLE "leads" ADD COLUMN "overrideReason" TEXT;
ALTER TABLE "leads" ADD COLUMN "overrideBy" TEXT;
ALTER TABLE "leads" ADD COLUMN "overrideAt" DATETIME;
ALTER TABLE "leads" ADD COLUMN "trustUpdatedAt" DATETIME;

-- Create TrustScoreEvent table
CREATE TABLE "TrustScoreEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "leadId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "delta" INTEGER,
    "scoreBefore" INTEGER,
    "scoreAfter" INTEGER,
    "meta" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actor" TEXT,
    CONSTRAINT "TrustScoreEvent_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "TrustScoreEvent_leadId_createdAt_idx" ON "TrustScoreEvent"("leadId", "createdAt");
