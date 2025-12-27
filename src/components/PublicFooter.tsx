"use client";

import { useEffect, useState } from "react";
import { AdminSettings, DEFAULT_ADMIN_SETTINGS } from "@/lib/adminSettingsDefaults";
import { loadAdminSettings } from "@/lib/adminSettingsStore";
import { Locale } from "@/lib/i18n";

interface PublicFooterProps {
  locale: Locale;
}

const footerLabels: Record<Locale, { impressum: string; privacy: string; terms: string }> = {
  de: { impressum: "Impressum", privacy: "Datenschutz", terms: "AGB" },
  en: { impressum: "Impressum", privacy: "Privacy", terms: "Terms" },
  tr: { impressum: "Impressum", privacy: "Gizlilik", terms: "Kosullar" },
};

function resolveLocalizedUrl(locale: Locale, url: string) {
  const trimmed = (url || "").trim();
  if (!trimmed) {
    return `/${locale}`;
  }
  if (trimmed.startsWith("http")) {
    return trimmed;
  }
  if (trimmed.startsWith(`/${locale}/`)) {
    return trimmed;
  }
  if (trimmed.startsWith("/")) {
    return `/${locale}${trimmed}`;
  }
  return `/${locale}/${trimmed}`;
}

export default function PublicFooter({ locale }: PublicFooterProps) {
  const [settings, setSettings] = useState<AdminSettings>(DEFAULT_ADMIN_SETTINGS);

  useEffect(() => {
    setSettings(loadAdminSettings());
  }, []);

  const labels = footerLabels[locale];
  const privacyUrl = resolveLocalizedUrl(locale, settings.footer.privacyUrl);
  const termsUrl = resolveLocalizedUrl(locale, settings.footer.termsUrl);
  const imprintUrl = resolveLocalizedUrl(locale, settings.footer.imprintUrl);

  return (
    <footer className="public-footer">
      <div className="container public-footer-inner">
        <div className="public-footer-text">
          {settings.footer.companyText[locale]}
        </div>
        <div className="public-footer-links">
          <a href={imprintUrl}>{labels.impressum}</a>
          <a href={privacyUrl}>{labels.privacy}</a>
          <a href={termsUrl}>{labels.terms}</a>
        </div>
      </div>
    </footer>
  );
}
