import { locales, Locale } from "@/lib/i18n";
import { generateLocaleMetadata, LocaleHome } from "@/app/(public)/locale-home";

interface PageProps {
  params: { locale: string };
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const dynamicParams = false;
export const dynamic = "force-static";

export function generateMetadata({ params }: PageProps) {
  const locale = params.locale as Locale;
  return generateLocaleMetadata(locale);
}

export default function LocaleHomePage({ params }: PageProps) {
  const locale = locales.includes(params.locale as Locale)
    ? (params.locale as Locale)
    : "de";

  return <LocaleHome locale={locale} />;
}
