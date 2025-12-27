/**
 * MedDiscover MVP - Internationalization
 * Supported: German (DE), English (EN), Turkish (TR)
 */

import en from "@/messages/en.json";
import de from "@/messages/de.json";
import tr from "@/messages/tr.json";

export type Locale = "de" | "en" | "tr";

export const locales: Locale[] = ["de", "en", "tr"];
export const DEFAULT_LOCALE: Locale = "de";

export const localeNames: Record<Locale, string> = {
  de: "Deutsch",
  en: "English",
  tr: "Türkçe",
};

export type Messages = typeof en;

const messages: Record<Locale, Messages> = {
  en,
  de,
  tr,
};

// Get messages for a specific locale
export function getMessages(locale: Locale = DEFAULT_LOCALE): Messages {
  return messages[locale] || messages[DEFAULT_LOCALE];
}

// Alias for backward compatibility
export const t = getMessages;

// Default export for current locale (used in non-dynamic contexts)
export const i18n = getMessages(DEFAULT_LOCALE);
