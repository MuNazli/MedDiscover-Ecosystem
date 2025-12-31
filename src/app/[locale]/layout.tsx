import { redirect } from "next/navigation";
import { NextIntlClientProvider } from 'next-intl';
import { locales, Locale, getMessages } from "@/lib/i18n";

interface LayoutProps {
  children: React.ReactNode;
  params: { locale: string };
}

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ locale: "de" }, { locale: "tr" }];
}

export default function LocaleLayout({ children, params }: LayoutProps) {
  // Safe default: use 'de' if locale is undefined or invalid
  const locale = (params?.locale ?? 'de') as Locale;
  
  // Redirect invalid locales to /de instead of showing 404
  if (!locales.includes(locale)) {
    redirect('/de');
  }

  const messages = getMessages(locale);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
