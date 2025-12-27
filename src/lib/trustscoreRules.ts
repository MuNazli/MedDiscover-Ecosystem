export type TrustStatus = "ACTIVE" | "RISKY_HIDDEN" | "BLACKLISTED";

export type TrustRule = {
  code: string;
  delta: number;
  isActive: boolean;
  appliesTo: "LEAD";
};

export type LeadForRules = {
  email?: string | null;
  phone?: string | null;
  name?: string | null;
  patientName?: string | null;
  locale?: string | null;
  status?: string | null;
  scoreOverride?: number | null;
};

export type AppliedRule = {
  code: string;
  delta: number;
  before: number;
  after: number;
};

type ApplyLeadRulesInput = {
  lead: LeadForRules;
  notesCount: number;
  rules: TrustRule[];
};

export function mapScoreToStatus(score: number): TrustStatus {
  if (score >= 70) return "ACTIVE";
  if (score >= 50) return "RISKY_HIDDEN";
  return "BLACKLISTED";
}

function shouldApplyRule(code: string, lead: LeadForRules, notesCount: number): boolean {
  switch (code) {
    case "RULE_MISSING_EMAIL":
      return !lead.email;
    case "RULE_MISSING_PHONE":
      return !lead.phone;
    case "RULE_MISSING_NAME":
      return !(lead.name ?? lead.patientName);
    case "RULE_MISSING_LOCALE":
      return !lead.locale;
    case "RULE_HAS_NOTE":
      return notesCount >= 1;
    case "RULE_STATUS_OFFER_SENT":
      return lead.status === "OFFER_SENT";
    case "RULE_STATUS_CLOSED":
      return lead.status === "CLOSED";
    default:
      return false;
  }
}

export function applyLeadRules({
  lead,
  notesCount,
  rules,
}: ApplyLeadRulesInput) {
  let score = 80;
  const applied: AppliedRule[] = [];

  const activeRules = rules.filter((rule) => rule.isActive && rule.appliesTo === "LEAD");
  for (const rule of activeRules) {
    if (!shouldApplyRule(rule.code, lead, notesCount)) {
      continue;
    }
    const before = score;
    score = score + rule.delta;
    score = Math.max(0, Math.min(100, score));
    applied.push({
      code: rule.code,
      delta: rule.delta,
      before,
      after: score,
    });
  }

  const ruleScore = score;
  const finalScore =
    lead.scoreOverride !== null && lead.scoreOverride !== undefined
      ? lead.scoreOverride
      : ruleScore;
  const trustStatus = mapScoreToStatus(finalScore);

  return {
    ruleScore,
    finalScore,
    trustStatus,
    applied,
  };
}
