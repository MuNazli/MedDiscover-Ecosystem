import { notFound } from "next/navigation";
import HeroGlass from "@/components/HeroGlass";
import { PLACEHOLDER_FEATURED_CLINIC } from "@/lib/placeholderData";
import { getMessages, locales, Locale } from "@/lib/i18n";
import { DEFAULT_ADMIN_SETTINGS } from "@/lib/adminSettingsDefaults";
import { resolveSeoForLocale } from "@/lib/seoSettings";
import TrustStatsStrip from "@/components/TrustStatsStrip";
import FeaturedClinicsSection from "@/components/FeaturedClinicsSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import VerifiedPartnersSection from "@/components/VerifiedPartnersSection";
import FAQSection from "@/components/FAQSection";
import FAQSchema from "@/components/FAQSchema";
import PublicFooter from "@/components/PublicFooter";

interface PageProps {
  params: { locale: string };
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export function generateMetadata({ params }: PageProps) {
  const locale = params.locale as Locale;
  const seo = resolveSeoForLocale(DEFAULT_ADMIN_SETTINGS, locale);
  const canonicalUrl = new URL(`/${locale}`, seo.canonicalBaseUrl).toString();
  const ogImageUrl = seo.ogImageUrl
    ? new URL(seo.ogImageUrl, seo.canonicalBaseUrl).toString()
    : undefined;

  return {
    title: seo.metaTitle,
    description: seo.metaDescription,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        de: new URL("/de", seo.canonicalBaseUrl).toString(),
        en: new URL("/en", seo.canonicalBaseUrl).toString(),
        tr: new URL("/tr", seo.canonicalBaseUrl).toString(),
      },
    },
    openGraph: {
      title: seo.ogTitle,
      description: seo.ogDescription,
      url: canonicalUrl,
      images: ogImageUrl ? [ogImageUrl] : undefined,
    },
    robots: seo.indexing === "noindex" ? { index: false, follow: false } : undefined,
  };
}

export default function LocaleHomePage({ params }: PageProps) {
  const locale = params.locale as Locale;
  
  if (!locales.includes(locale)) {
    notFound();
  }

  const messages = getMessages(locale);

  return (
    <>
      <FAQSchema locale={locale} />
      <main className="bg-hospital">
        <HeroGlass
          locale={locale}
          messages={messages}
          featuredClinic={PLACEHOLDER_FEATURED_CLINIC}
        />
        <TrustStatsStrip locale={locale} />
        <HowItWorksSection />
        <VerifiedPartnersSection />
        <FeaturedClinicsSection locale={locale} />
        <FAQSection />
        <PublicFooter locale={locale} />
      </main>
    </>
  );
}

