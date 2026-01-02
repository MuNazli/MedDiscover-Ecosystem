import {getRequestConfig} from 'next-intl/server';
import {locales, type Locale} from './lib/i18n';

export default getRequestConfig(async ({requestLocale}) => {
  const candidate = requestLocale as string | undefined;

  const resolvedLocale: Locale =
    candidate && locales.includes(candidate as Locale)
      ? (candidate as Locale)
      : 'de';

  return {
    locale: resolvedLocale,
    messages: (await import(`./messages/${resolvedLocale}.json`)).default
  };
});
