"use client";

import { CmsUiLocale, CMS_UI_LOCALES, t } from "@/lib/cmsI18n";

interface CmsLanguageSwitcherProps {
  currentLocale: CmsUiLocale;
  onLocaleChange: (locale: CmsUiLocale) => void;
}

export default function CmsLanguageSwitcher({
  currentLocale,
  onLocaleChange,
}: CmsLanguageSwitcherProps) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
    }}>
      <span style={{
        fontSize: 13,
        color: "#64748b",
        fontWeight: 500,
      }}>
        {t(currentLocale, "general.panelLanguage")}
      </span>
      <div style={{
        display: "flex",
        gap: 4,
        background: "#f8fafc",
        padding: 4,
        borderRadius: 6,
        border: "1px solid #e5e7eb",
      }}>
        {CMS_UI_LOCALES.map((locale) => (
          <button
            key={locale}
            onClick={() => onLocaleChange(locale)}
            style={{
              padding: "6px 12px",
              border: "none",
              borderRadius: 4,
              background: currentLocale === locale
                ? "linear-gradient(135deg, #2EC4B6, #0FA3B1)"
                : "transparent",
              color: currentLocale === locale ? "#fff" : "#64748b",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: currentLocale === locale ? 600 : 500,
              transition: "all 0.2s ease",
            }}
          >
            {locale.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}
