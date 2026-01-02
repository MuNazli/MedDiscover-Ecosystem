import { getRequestConfig } from 'next-intl/server';
import { locales, Locale } from './lib/i18n';

export default getRequestConfig(async ({ locale }) => {
  // Always return a valid locale to prevent Vercel SSG build failures
  // Fallback to "de" if locale is missing or invalid
  const resolvedLocale = (locale && locales.includes(locale as Locale))
    ? (locale as Locale)
    : "de";

  return {
    locale: resolvedLocale,
    messages: (await import(`./messages/${resolvedLocale}.json`)).default,
  };
});
