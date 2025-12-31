import { NextIntlClientProvider } from 'next-intl';
import { Locale, getMessages, locales } from "@/lib/i18n";

interface LayoutProps {
  children: React.ReactNode;
  params: { locale: string };
}

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ locale: "de" }, { locale: "tr" }];
}

export default function LocaleLayout({ children, params }: LayoutProps) {
  const locale = locales.includes(params?.locale as Locale)
    ? (params?.locale as Locale)
    : "de";

  const messages = getMessages(locale);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
