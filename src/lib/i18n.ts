import de from "@/messages/de.json";
import tr from "@/messages/tr.json";

export type Locale = "de" | "tr";

export const locales: Locale[] = ["de", "tr"];
export const DEFAULT_LOCALE: Locale = "de";

export const localeNames: Record<Locale, string> = {
  de: "Deutsch",
  tr: "Turkce",
};

export type Messages = typeof de;

const messages: Record<Locale, Messages> = {
  de,
  tr,
};

export function getMessages(locale: Locale = DEFAULT_LOCALE): Messages {
  return messages[locale] || messages[DEFAULT_LOCALE];
}

export const t = getMessages;

export const i18n = getMessages(DEFAULT_LOCALE);
