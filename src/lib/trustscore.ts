/**
 * M05: TrustScore MVP
 * 
 * Rule-based scoring system for leads with manual admin override capability.
 * Scores range from 0-100 and map to trust statuses (ACTIVE/RISKY_HIDDEN/BLACKLISTED).
 */

import { Lead } from "@prisma/client";

export type TrustStatus = "ACTIVE" | "RISKY_HIDDEN" | "BLACKLISTED";

export interface TrustScoreResult {
  score: number;
  status: TrustStatus;
}

export interface LeadForScoring {
  email?: string | null;
  phone?: string | null;
  name?: string | null;
  patientName?: string | null;
  locale?: string | null;
  status: string;
  scoreOverride?: number | null;
}

/**
 * MVP Rule Set:
 * - Base score: 80
 * - Email missing: -20
 * - Phone missing: -15
 * - Name missing: -10
 * - Locale missing: -5
 * - Has notes (notesCount >= 1): +5
 * - Status OFFER_SENT: +5
 * - Status CLOSED: +10
 * 
 * Final score clamped to 0-100
 */
export function computeTrustScore(
  lead: LeadForScoring,
  notesCount: number = 0
): TrustScoreResult {
  let score = 80; // Base score

  // Deductions
  if (!lead.email) score -= 20;
  if (!lead.phone) score -= 15;
  const nameValue = lead.name ?? lead.patientName;
  if (!nameValue) score -= 10;
  if (!lead.locale) score -= 5;

  // Bonuses
  if (notesCount >= 1) score += 5;
  if (lead.status === "OFFER_SENT") score += 5;
  if (lead.status === "CLOSED") score += 10;

  // Clamp to valid range
  score = Math.max(0, Math.min(100, score));

  const status = mapScoreToStatus(score);

  return { score, status };
}

/**
 * Map score to trust status:
 * - >= 70: ACTIVE
 * - 50-69: RISKY_HIDDEN
 * - < 50: BLACKLISTED
 */
export function mapScoreToStatus(score: number): TrustStatus {
  if (score >= 70) return "ACTIVE";
  if (score >= 50) return "RISKY_HIDDEN";
  return "BLACKLISTED";
}

/**
 * Apply manual override if present, otherwise use rule-based score
 */
export function getFinalScore(
  lead: LeadForScoring,
  notesCount: number = 0
): TrustScoreResult {
  if (lead.scoreOverride !== null && lead.scoreOverride !== undefined) {
    const score = lead.scoreOverride;
    const status = mapScoreToStatus(score);
    return { score, status };
  }

  return computeTrustScore(lead, notesCount);
}

/**
 * Validate override score (must be 0-100)
 */
export function validateOverrideScore(score: number | null): boolean {
  if (score === null) return true; // Clearing override is valid
  return Number.isInteger(score) && score >= 0 && score <= 100;
}

/**
 * Get badge color based on trust status
 */
export function getTrustBadgeColor(status: TrustStatus): string {
  switch (status) {
    case "ACTIVE":
      return "green";
    case "RISKY_HIDDEN":
      return "yellow";
    case "BLACKLISTED":
      return "red";
    default:
      return "gray";
  }
}

/**
 * Get badge color based on score (for direct score display)
 */
export function getScoreBadgeColor(score: number): string {
  if (score >= 70) return "green";
  if (score >= 50) return "yellow";
  return "red";
}
