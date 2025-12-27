"use client";

import { useEffect, useState } from "react";
import { AdminSettings, DEFAULT_ADMIN_SETTINGS } from "@/lib/adminSettingsDefaults";
import { loadAdminSettings } from "@/lib/adminSettingsStore";
import { Locale } from "@/lib/i18n";

type LegalPageType = "impressum" | "privacy" | "terms";

interface LegalPageClientProps {
  locale: Locale;
  type: LegalPageType;
}

const titles: Record<Locale, Record<LegalPageType, string>> = {
  de: { impressum: "Impressum", privacy: "Datenschutz", terms: "AGB" },
  en: { impressum: "Impressum", privacy: "Privacy Policy", terms: "Terms" },
  tr: { impressum: "Impressum", privacy: "Gizlilik", terms: "Kosullar" },
};

const placeholders: Record<Locale, Record<Exclude<LegalPageType, "impressum">, string>> = {
  de: {
    privacy: "Datenschutz-Inhalte folgen in Kuerze.",
    terms: "AGB-Inhalte folgen in Kuerze.",
  },
  en: {
    privacy: "Privacy content coming soon.",
    terms: "Terms content coming soon.",
  },
  tr: {
    privacy: "Gizlilik metni yakinda eklenecek.",
    terms: "Kosullar metni yakinda eklenecek.",
  },
};

export default function LegalPageClient({ locale, type }: LegalPageClientProps) {
  const [settings, setSettings] = useState<AdminSettings>(DEFAULT_ADMIN_SETTINGS);

  useEffect(() => {
    setSettings(loadAdminSettings());
  }, []);

  const title = titles[locale][type];
  const content =
    type === "impressum"
      ? settings.footer.imprintText[locale]
      : placeholders[locale][type];

  return (
    <main className="legal-page">
      <div className="container legal-page-inner">
        <h1>{title}</h1>
        <p style={{ whiteSpace: "pre-line" }}>{content}</p>
      </div>
    </main>
  );
}
