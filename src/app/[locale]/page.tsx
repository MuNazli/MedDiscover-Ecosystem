import Image from "next/image";
import { notFound } from "next/navigation";
import LeadFormGlass from "@/components/LeadFormGlass";
import Navbar from "@/components/Navbar";
import PublicFooter from "@/components/PublicFooter";
import { DEFAULT_ADMIN_SETTINGS } from "@/lib/adminSettingsDefaults";
import { getMessages, locales, Locale } from "@/lib/i18n";
import { resolveSeoForLocale } from "@/lib/seoSettings";

interface PageProps {
  params: { locale: string };
}

const HERO_IMAGE = "/images/meddiscover-modern-hospital-corridor-medical-tourism.webp";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export function generateMetadata({ params }: PageProps) {
  const locale = params.locale as Locale;
  const messages = getMessages(locale);
  const seo = resolveSeoForLocale(DEFAULT_ADMIN_SETTINGS, locale);
  const canonicalBaseUrl = seo.canonicalBaseUrl || "http://localhost:3000";
  const canonicalUrl = new URL(`/${locale}`, canonicalBaseUrl).toString();
  const ogImageUrl = new URL(HERO_IMAGE, canonicalBaseUrl).toString();
  const title =
    seo.metaTitle || `${messages.hero.title} ${messages.hero.titleAccent}`;
  const description = seo.metaDescription || messages.hero.subtitle;
  const ogTitle = seo.ogTitle || title;
  const ogDescription = seo.ogDescription || description;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        de: new URL("/de", canonicalBaseUrl).toString(),
        tr: new URL("/tr", canonicalBaseUrl).toString(),
      },
    },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: canonicalUrl,
      siteName: "MedDiscover",
      images: [{ url: ogImageUrl }],
      locale: locale === "de" ? "de_DE" : "tr_TR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      images: [ogImageUrl],
    },
    robots:
      seo.indexing === "noindex"
        ? { index: false, follow: false }
        : { index: true, follow: true },
  };
}

export default function LocaleHomePage({ params }: PageProps) {
  const locale = params.locale as Locale;

  if (!locales.includes(locale)) {
    notFound();
  }

  const messages = getMessages(locale);
  const { hero, howItWorks, verifiedPartners, faq, form, leadCta, trust } = messages;

  const steps = [
    { title: howItWorks.step1Title, description: howItWorks.step1Desc },
    { title: howItWorks.step2Title, description: howItWorks.step2Desc },
    { title: howItWorks.step3Title, description: howItWorks.step3Desc },
    { title: howItWorks.step4Title, description: howItWorks.step4Desc },
  ];

  const verifiedItems = [
    verifiedPartners.accreditation,
    verifiedPartners.experience,
    verifiedPartners.standards,
    verifiedPartners.transparent,
  ];

  const faqItems = [
    { question: faq.q1, answer: faq.a1 },
    { question: faq.q2, answer: faq.a2 },
    { question: faq.q3, answer: faq.a3 },
    { question: faq.q4, answer: faq.a4 },
    { question: faq.q5, answer: faq.a5 },
  ];

  const seo = resolveSeoForLocale(DEFAULT_ADMIN_SETTINGS, locale);
  const canonicalBaseUrl = seo.canonicalBaseUrl || "http://localhost:3000";
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "MedDiscover",
    url: new URL(`/${locale}`, canonicalBaseUrl).toString(),
    logo: new URL("/favicon.ico", canonicalBaseUrl).toString(),
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "MedDiscover",
    url: new URL(`/${locale}`, canonicalBaseUrl).toString(),
    inLanguage: locale === "de" ? "de-DE" : "tr-TR",
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <main className="landing-page">
      <section className="landing-hero">
        <div className="landing-hero-media">
          <Image
            src={HERO_IMAGE}
            alt="MedDiscover"
            fill
            priority
            sizes="100vw"
            className="landing-hero-image"
          />
        </div>
        <div className="landing-hero-overlay" />

        <Navbar locale={locale} messages={messages} />

        <div className="landing-hero-content container">
          <div className="landing-hero-grid">
            <div className="landing-hero-text">
              <h1>
                {hero.title}
                <br />
                <span className="text-gradient">{hero.titleAccent}</span>
              </h1>
              <p>{hero.subtitle}</p>
              <div className="hero-actions">
                <a href={`/${locale}#lead`} className="btn-primary">
                  {hero.ctaPrimary}
                </a>
                <a href={`/${locale}#steps`} className="btn-outline">
                  {hero.ctaSecondary}
                </a>
              </div>
            </div>

            <div className="glass-strong landing-hero-card">
              <h3>{trust.title}</h3>
              <ul>
                <li>{trust.verified}</li>
                <li>{trust.gdpr}</li>
                <li>{trust.response}</li>
                <li>{trust.support}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="steps" className="landing-section lazy-section">
        <div className="container">
          <div className="section-heading">
            <h2>{howItWorks.title}</h2>
            <p>{howItWorks.subtitle}</p>
          </div>
          <div className="steps-grid">
            {steps.map((step) => (
              <article key={step.title} className="glass-card step-card">
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="verified" className="landing-section alt-section lazy-section">
        <div className="container">
          <div className="section-heading">
            <h2>{verifiedPartners.title}</h2>
            <p>{verifiedPartners.subtitle}</p>
          </div>
          <div className="verified-grid">
            {verifiedItems.map((item) => (
              <div key={item} className="verified-item glass-card">
                <span className="verified-dot" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="landing-section lazy-section">
        <div className="container">
          <div className="section-heading">
            <h2>{faq.title}</h2>
          </div>
          <div className="faq-list">
            {faqItems.map((item) => (
              <details key={item.question} className="glass-card faq-item">
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section id="lead" className="landing-section lead-section lazy-section">
        <div className="container">
          <div className="section-heading">
            <h2>{leadCta.title}</h2>
            <p>{leadCta.subtitle}</p>
          </div>
          <LeadFormGlass locale={locale} messages={messages} />
        </div>
      </section>

      <PublicFooter locale={locale} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </main>
  );
}
