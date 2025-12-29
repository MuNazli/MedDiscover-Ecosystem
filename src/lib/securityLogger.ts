/**
 * Security-aware logging utility
 * 
 * NEVER log PII (Personally Identifiable Information):
 * - Full email addresses
 * - Phone numbers
 * - Full names
 * - Patient details
 * 
 * Only log:
 * - IDs (cuid)
 * - Actions/events
 * - Status changes
 * - Masked PII (first char + ***)
 */

import { maskEmail, maskName, maskPhone } from "./leadMask";

type LogLevel = "info" | "warn" | "error";

interface LogContext {
  action: string;
  leadId?: string;
  status?: string;
  error?: string;
  meta?: Record<string, unknown>;
}

/**
 * Security-safe logger
 * Ensures no PII is logged to console/monitoring
 */
export function secureLog(level: LogLevel, context: LogContext) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    ...context,
  };

  // Remove any potential PII fields if accidentally passed
  const sanitized = sanitizeLogEntry(logEntry);

  if (level === "error") {
    console.error("[SECURE_LOG]", JSON.stringify(sanitized));
  } else if (level === "warn") {
    console.warn("[SECURE_LOG]", JSON.stringify(sanitized));
  } else {
    console.log("[SECURE_LOG]", JSON.stringify(sanitized));
  }
}

/**
 * Remove or mask PII from log entries
 */
function sanitizeLogEntry(entry: Record<string, unknown>): Record<string, unknown> {
  const sanitized = { ...entry };

  // List of keys that should never be logged
  const piiKeys = [
    "email",
    "phone",
    "name",
    "fullName",
    "patientName",
    "address",
    "birthday",
    "birthDate",
    "ssn",
    "passport",
  ];

  for (const key of piiKeys) {
    if (key in sanitized) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete sanitized[key];
    }
  }

  // If meta contains PII, sanitize it
  if (sanitized.meta && typeof sanitized.meta === "object") {
    sanitized.meta = sanitizeLogEntry(sanitized.meta as Record<string, unknown>);
  }

  return sanitized;
}

/**
 * Log lead action safely (no PII)
 */
export function logLeadAction(action: string, leadId: string, meta?: Record<string, unknown>) {
  secureLog("info", {
    action,
    leadId,
    meta: meta ? sanitizeLogEntry(meta) : undefined,
  });
}

/**
 * Log admin action safely
 */
export function logAdminAction(action: string, leadId?: string, meta?: Record<string, unknown>) {
  secureLog("info", {
    action: `ADMIN_${action}`,
    leadId,
    meta: meta ? sanitizeLogEntry(meta) : undefined,
  });
}

/**
 * Log security event
 */
export function logSecurityEvent(event: string, meta?: Record<string, unknown>) {
  secureLog("warn", {
    action: `SECURITY_${event}`,
    meta: meta ? sanitizeLogEntry(meta) : undefined,
  });
}

/**
 * Log error safely (no PII)
 */
export function logError(action: string, error: unknown, meta?: Record<string, unknown>) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  secureLog("error", {
    action,
    error: errorMessage,
    meta: meta ? sanitizeLogEntry(meta) : undefined,
  });
}

/**
 * Helper to log lead data safely (masked)
 */
export function getMaskedLeadForLog(lead: {
  id: string;
  email?: string | null;
  phone?: string | null;
  name?: string | null;
  status?: string;
}) {
  return {
    leadId: lead.id,
    email: lead.email ? maskEmail(lead.email) : null,
    phone: lead.phone ? maskPhone(lead.phone) : null,
    name: lead.name ? maskName(lead.name) : null,
    status: lead.status,
  };
}
