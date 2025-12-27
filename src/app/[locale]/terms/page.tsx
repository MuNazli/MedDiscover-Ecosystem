import { Locale } from "@/lib/i18n";
import LegalPageClient from "@/components/LegalPageClient";

interface PageProps {
  params: { locale: string };
}

export default function TermsPage({ params }: PageProps) {
  const locale = params.locale as Locale;
  return <LegalPageClient locale={locale} type="terms" />;
}
