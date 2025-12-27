export const LEAD_STATUSES = ["NEW", "IN_REVIEW", "OFFER_SENT", "CLOSED"] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export function isLeadStatus(value: unknown): value is LeadStatus {
  return (
    value === "NEW" ||
    value === "IN_REVIEW" ||
    value === "OFFER_SENT" ||
    value === "CLOSED"
  );
}

export function normalizeLeadStatus(value: unknown): LeadStatus {
  if (isLeadStatus(value)) {
    return value;
  }
  return "IN_REVIEW";
}
