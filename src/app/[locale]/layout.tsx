import { NextIntlClientProvider } from 'next-intl';
import { Locale, getMessages } from "@/lib/i18n";

interface LayoutProps {
  children: React.ReactNode;
  params: { locale: string };
}

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ locale: "de" }, { locale: "tr" }];
}

export default function LocaleLayout({ children, params }: LayoutProps) {
  const locale = (params?.locale ?? "de") as Locale;

  const messages = getMessages(locale);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
