import { getRequestConfig } from "next-intl/server";
import { locales, Locale } from "./lib/i18n";

export default getRequestConfig(async ({ requestLocale }) => {
  const candidate = requestLocale as Locale | undefined;
  const resolvedLocale = candidate && locales.includes(candidate) ? candidate : "de";

  return {
    locale: resolvedLocale,
    messages: (await import(`./messages/${resolvedLocale}.json`)).default,
  };
});
