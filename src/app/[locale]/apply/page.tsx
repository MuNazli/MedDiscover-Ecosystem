import { notFound } from "next/navigation";
import LeadFormGlass from "@/components/LeadFormGlass";
import { getMessages, locales, Locale } from "@/lib/i18n";

interface PageProps {
  params: { locale: string };
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export function generateMetadata({ params }: PageProps) {
  const locale = params.locale as Locale;
  const messages = getMessages(locale);
  
  return {
    title: `${messages.form.title} – MedDiscover`,
    description: messages.form.subtitle,
  };
}

export default function LocaleApplyPage({ params }: PageProps) {
  const locale = params.locale as Locale;
  
  if (!locales.includes(locale)) {
    notFound();
  }

  const messages = getMessages(locale);

  return (
    <main className="bg-hospital">
      {/* Simple Navbar */}
      <nav className="navbar">
        <div className="glass-nav navbar-inner">
          <a href={`/${locale}`} className="navbar-logo">
            <span className="navbar-logo-icon">M</span>
            MedDiscover
          </a>
          <a href={`/${locale}`} className="btn-outline">{messages.nav.backHome}</a>
        </div>
      </nav>

      {/* Form Section */}
      <section style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 120,
        paddingBottom: "var(--s-48)",
      }}>
        <LeadFormGlass locale={locale} messages={messages} />
      </section>
    </main>
  );
}
