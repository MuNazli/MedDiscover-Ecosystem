/**
 * PII / DLP Guard - Server-side detection of personal contact information
 * Blocks: email, phone, WhatsApp refs, URLs, social handles
 */

interface PIIDetectionResult {
  hasPII: boolean;
  reason?: string;
}

// Regex patterns for PII detection
const PATTERNS = {
  // Email: standard email format
  email: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
  
  // Phone: 9+ digits with optional separators (covers most international formats)
  phone: /(\+?\d[\d\s().\-]{7,}\d)/,
  
  // WhatsApp references
  whatsapp: /\b(whatsapp|whats\s*app|wa\.me|wp\b)/i,
  
  // URLs
  url: /(https?:\/\/|www\.)/i,
  
  // Social handles (@username with 3+ chars)
  socialHandle: /@\w{3,}/,
  
  // Telegram references
  telegram: /\b(telegram|t\.me)\b/i,
};

/**
 * Detects if text contains PII (contact information)
 */
export function detectPII(text: string): PIIDetectionResult {
  if (!text || typeof text !== "string") {
    return { hasPII: false };
  }

  // Check email
  if (PATTERNS.email.test(text)) {
    return { hasPII: true, reason: "E-posta adresi tespit edildi" };
  }

  // Check phone (must have at least 9 digits total)
  const phoneMatch = text.match(PATTERNS.phone);
  if (phoneMatch) {
    const digitsOnly = phoneMatch[0].replace(/\D/g, "");
    if (digitsOnly.length >= 9) {
      return { hasPII: true, reason: "Telefon numarası tespit edildi" };
    }
  }

  // Check WhatsApp
  if (PATTERNS.whatsapp.test(text)) {
    return { hasPII: true, reason: "WhatsApp referansı tespit edildi" };
  }

  // Check URL
  if (PATTERNS.url.test(text)) {
    return { hasPII: true, reason: "URL/link tespit edildi" };
  }

  // Check social handles
  if (PATTERNS.socialHandle.test(text)) {
    return { hasPII: true, reason: "Sosyal medya kullanıcı adı tespit edildi" };
  }

  // Check Telegram
  if (PATTERNS.telegram.test(text)) {
    return { hasPII: true, reason: "Telegram referansı tespit edildi" };
  }

  return { hasPII: false };
}

/**
 * Sanitizes text (trim + normalize whitespace)
 * Does NOT remove PII - use detectPII first to block
 */
export function sanitizeText(text: string): string {
  if (!text || typeof text !== "string") {
    return "";
  }
  
  return text
    .trim()
    .replace(/\s+/g, " ") // normalize whitespace
    .substring(0, 2000); // enforce max length
}
