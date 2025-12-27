import { notFound } from "next/navigation";
import { locales, Locale } from "@/lib/i18n";

interface LayoutProps {
  children: React.ReactNode;
  params: { locale: string };
}

export default function LocaleLayout({ children, params }: LayoutProps) {
  const locale = params.locale as Locale;
  
  if (!locales.includes(locale)) {
    notFound();
  }

  return <>{children}</>;
}
