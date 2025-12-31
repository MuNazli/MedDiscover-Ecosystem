import { getRequestConfig } from 'next-intl/server';
import { locales, Locale } from './lib/i18n';

export default getRequestConfig(async ({ locale }) => {
  const resolvedLocale = locales.includes(locale as Locale)
    ? (locale as Locale)
    : "de";

  return {
    messages: (await import(`./messages/${resolvedLocale}.json`)).default,
  };
});
