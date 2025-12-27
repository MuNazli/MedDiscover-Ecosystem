/*
  Warnings:

  - You are about to drop the column `email` on the `leads` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `leads` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `leads` table. All the data in the column will be lost.
  - You are about to drop the column `message` on the `leads` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `leads` table. All the data in the column will be lost.
  - You are about to drop the column `treatment` on the `leads` table. All the data in the column will be lost.
  - Added the required column `country` to the `leads` table without a default value. This is not possible if the table is not empty.
  - Added the required column `patientName` to the `leads` table without a default value. This is not possible if the table is not empty.
  - Added the required column `requestedProcedure` to the `leads` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_leads" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "patientName" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "contactPreference" TEXT NOT NULL DEFAULT 'WHATSAPP',
    "requestedProcedure" TEXT NOT NULL,
    "gdprConsent" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "notes" TEXT
);
INSERT INTO "new_leads" ("createdAt", "id", "status", "updatedAt") SELECT "createdAt", "id", "status", "updatedAt" FROM "leads";
DROP TABLE "leads";
ALTER TABLE "new_leads" RENAME TO "leads";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
