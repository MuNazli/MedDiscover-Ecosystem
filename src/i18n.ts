import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';
import { locales, Locale } from './lib/i18n';

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as Locale)) {
    if (process.env.NODE_ENV === "production") {
      console.log(`[md] notFound locale in i18n.ts: ${locale}`);
    }
    notFound();
  }

  return {
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
