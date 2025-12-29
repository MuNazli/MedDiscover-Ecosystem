"use client";

import { useState, useEffect, useCallback } from "react";
import {
  AdminSettings,
  DEFAULT_ADMIN_SETTINGS,
  I18nField,
} from "@/lib/adminSettingsDefaults";
import { loadAdminSettings, saveAdminSettings } from "@/lib/adminSettingsStore";
import { SEO_LIMITS } from "@/lib/seoSettings";
import { isValidCtaUrl } from "@/lib/featuredClinics";
import {
  CmsUiLocale,
  CmsUiKey,
  t,
} from "@/lib/cmsI18n";
import CmsLanguageSwitcher from "@/components/cms/CmsLanguageSwitcher";
import { useCmsUiLocale } from "@/lib/useCmsUiLocale";

type Locale = CmsUiLocale;
type SettingSection = "hero" | "trust" | "seo" | "footer" | "banner" | "locale" | "clinic";

export default function CMSSettingsPage() {
  const [settings, setSettings] = useState<AdminSettings>(DEFAULT_ADMIN_SETTINGS);
  const [savedSettings, setSavedSettings] = useState<AdminSettings>(DEFAULT_ADMIN_SETTINGS);
  const [activeSection, setActiveSection] = useState<SettingSection>("hero");
  const [activeLocale, setActiveLocale] = useState<Locale>("de");
  const { uiLocale, setUiLocale } = useCmsUiLocale("de");
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Load settings from localStorage
  useEffect(() => {
    const stored = loadAdminSettings();
    setSettings(stored);
    setSavedSettings(stored);
  }, []);

  useEffect(() => {
    setActiveLocale(uiLocale);
  }, [uiLocale]);

  // Track changes
  useEffect(() => {
    setHasChanges(JSON.stringify(settings) !== JSON.stringify(savedSettings));
  }, [settings, savedSettings]);

  // Save settings
  const handleSave = useCallback(() => {
    setSaving(true);
    const saved = saveAdminSettings(settings);
    setSavedSettings(saved);
    setSettings(saved);
    setHasChanges(false);
    setSaving(false);
    setMessage({ type: "success", text: t(uiLocale, "toast.saved") });
    setTimeout(() => setMessage(null), 3000);
  }, [settings, uiLocale]);

  // Reset to last saved
  const handleReset = useCallback(() => {
    setSettings(savedSettings);
    setMessage({ type: "success", text: t(uiLocale, "toast.reset") });
    setTimeout(() => setMessage(null), 3000);
  }, [savedSettings, uiLocale]);

  const handleUiLocaleChange = useCallback((nextLocale: CmsUiLocale) => {
    setUiLocale(nextLocale);
  }, [setUiLocale]);

  // Update i18n field
  const updateI18n = (
    section: keyof AdminSettings,
    field: string,
    locale: Locale,
    value: string
  ) => {
    setSettings((prev) => {
      const sectionData = prev[section] as Record<string, unknown>;
      const fieldData = sectionData[field] as I18nField;
      return {
        ...prev,
        [section]: {
          ...sectionData,
          [field]: {
            ...fieldData,
            [locale]: value,
          },
        },
      };
    });
  };

  // Update simple field
  const updateField = (section: keyof AdminSettings, field: string, value: unknown) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] as Record<string, unknown>),
        [field]: value,
      },
    }));
  };

  const updateTrustStat = (id: string, updater: (stat: AdminSettings["trust"]["stats"][number]) => AdminSettings["trust"]["stats"][number]) => {
    setSettings((prev) => ({
      ...prev,
      trust: {
        ...prev.trust,
        stats: prev.trust.stats.map((stat) => (stat.id === id ? updater(stat) : stat)),
      },
    }));
  };

  const updateTrustStatLabel = (id: string, locale: Locale, value: string) => {
    updateTrustStat(id, (stat) => ({
      ...stat,
      label: {
        ...stat.label,
        [locale]: value,
      },
    }));
  };

  const updateFeaturedClinic = (
    id: string,
    updater: (clinic: AdminSettings["featuredClinics"][number]) => AdminSettings["featuredClinics"][number]
  ) => {
    setSettings((prev) => ({
      ...prev,
      featuredClinics: prev.featuredClinics.map((clinic) =>
        clinic.id === id ? updater(clinic) : clinic
      ),
    }));
  };

  const updateFeaturedClinicI18n = (
    id: string,
    field: keyof Pick<
      AdminSettings["featuredClinics"][number],
      "name" | "city" | "country" | "specialty" | "shortDescription" | "ctaLabel"
    >,
    locale: Locale,
    value: string
  ) => {
    updateFeaturedClinic(id, (clinic) => ({
      ...clinic,
      [field]: {
        ...clinic[field],
        [locale]: value,
      },
    }));
  };

  const metaTitleLength = settings.seo.metaTitle[activeLocale]?.length ?? 0;
  const metaDescriptionLength = settings.seo.metaDescription[activeLocale]?.length ?? 0;
  const showTitleWarning = metaTitleLength > SEO_LIMITS.title;
  const showDescriptionWarning = metaDescriptionLength > SEO_LIMITS.description;

  const sections: { id: SettingSection; icon: string }[] = [
    { id: "hero", icon: "🏠" },
    { id: "trust", icon: "📊" },
    { id: "clinic", icon: "🏥" },
    { id: "seo", icon: "🔍" },
    { id: "banner", icon: "📢" },
    { id: "footer", icon: "📄" },
    { id: "locale", icon: "🌐" },
  ];

  const getSectionLabel = (id: SettingSection): string => {
    const labels: Record<SettingSection, CmsUiKey> = {
      hero: "nav.hero",
      trust: "nav.trust",
      clinic: "nav.clinic",
      seo: "nav.seo",
      banner: "nav.banner",
      footer: "nav.footer",
      locale: "nav.localization",
    };
    return t(uiLocale, labels[id]);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      {/* Sidebar */}
      <aside style={{
        width: 260,
        background: "#fff",
        borderRight: "1px solid #e5e7eb",
        padding: "24px 16px",
        display: "flex",
        flexDirection: "column",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32, padding: "0 8px" }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: "linear-gradient(135deg, #2EC4B6, #0FA3B1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontWeight: 700,
          }}>
            M
          </div>
          <div>
            <div style={{ fontWeight: 600, color: "#0A2540" }}>MedDiscover</div>
            <div style={{ fontSize: 12, color: "#64748b" }}>{t(uiLocale, "general.cmsPanel")}</div>
          </div>
        </div>

        <nav style={{ flex: 1 }}>
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 16px",
                border: "none",
                borderRadius: 8,
                background: activeSection === section.id ? "#f0fdfa" : "transparent",
                color: activeSection === section.id ? "#0d9488" : "#64748b",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: activeSection === section.id ? 600 : 400,
                marginBottom: 4,
                textAlign: "left",
              }}
            >
              <span>{section.icon}</span>
              {getSectionLabel(section.id)}
            </button>
          ))}
        </nav>

        <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 16 }}>
          <a
            href={`/cms/preview/${activeLocale}`}
            target="_blank"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 16px",
              color: "#64748b",
              textDecoration: "none",
              fontSize: 14,
              borderRadius: 8,
            }}
          >
            👁️ {t(uiLocale, "nav.preview")}
          </a>
          <button
            onClick={async () => {
              await fetch("/api/cms/auth", { method: "DELETE" });
              window.location.href = "/cms/login";
            }}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 16px",
              border: "none",
              background: "transparent",
              color: "#64748b",
              cursor: "pointer",
              fontSize: 14,
              textAlign: "left",
              borderRadius: 8,
            }}
          >
            🚪 {t(uiLocale, "nav.logout")}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Top Bar */}
        <header style={{
          height: 64,
          background: "#fff",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <h1 style={{ fontSize: 18, fontWeight: 600, color: "#0A2540" }}>
              {getSectionLabel(activeSection)}
            </h1>
            <span style={{
              padding: "4px 12px",
              background: "#fef3c7",
              color: "#92400e",
              borderRadius: 100,
              fontSize: 12,
              fontWeight: 500,
            }}>
              MVP
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <CmsLanguageSwitcher
              currentLocale={uiLocale}
              onLocaleChange={handleUiLocaleChange}
            />
            <div style={{
              width: 1,
              height: 24,
              background: "#e5e7eb",
            }} />
            <span style={{
              fontSize: 13,
              color: hasChanges ? "#f59e0b" : "#10b981",
            }}>
              {hasChanges ? t(uiLocale, "status.unsavedChanges") : t(uiLocale, "status.saved")}
            </span>
            <button
              onClick={handleReset}
              disabled={!hasChanges}
              style={{
                padding: "8px 16px",
                border: "1px solid #e5e7eb",
                borderRadius: 6,
                background: "#fff",
                color: "#64748b",
                cursor: hasChanges ? "pointer" : "not-allowed",
                fontSize: 14,
                opacity: hasChanges ? 1 : 0.5,
              }}
            >
              {t(uiLocale, "action.reset")}
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges || saving}
              style={{
                padding: "8px 20px",
                border: "none",
                borderRadius: 6,
                background: hasChanges ? "linear-gradient(135deg, #2EC4B6, #0FA3B1)" : "#e5e7eb",
                color: hasChanges ? "#fff" : "#9ca3af",
                cursor: hasChanges && !saving ? "pointer" : "not-allowed",
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              {saving ? t(uiLocale, "action.saving") : t(uiLocale, "action.saveChanges")}
            </button>
          </div>
        </header>

        {/* Message */}
        {message && (
          <div style={{
            margin: "16px 24px 0",
            padding: "12px 16px",
            background: message.type === "success" ? "#f0fdf4" : "#fef2f2",
            border: `1px solid ${message.type === "success" ? "#86efac" : "#fecaca"}`,
            borderRadius: 8,
            color: message.type === "success" ? "#166534" : "#dc2626",
            fontSize: 14,
          }}>
            {message.text}
          </div>
        )}

        {/* Content Area */}
        <div style={{ flex: 1, padding: 24, overflowY: "auto" }}>
          {/* Language Tabs */}
          <div style={{
            display: "flex",
            gap: 8,
            marginBottom: 24,
            background: "#fff",
            padding: 8,
            borderRadius: 8,
            width: "fit-content",
          }}>
            {(["de", "en", "tr"] as Locale[]).map((locale) => (
              <button
                key={locale}
                onClick={() => setActiveLocale(locale)}
                style={{
                  padding: "8px 20px",
                  border: "none",
                  borderRadius: 6,
                  background: activeLocale === locale ? "#0A3F62" : "transparent",
                  color: activeLocale === locale ? "#fff" : "#64748b",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                {locale.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Settings Form */}
          <div style={{
            background: "#fff",
            borderRadius: 12,
            border: "1px solid #e5e7eb",
            padding: 32,
          }}>
            {activeSection === "hero" && (
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: "#0A2540", marginBottom: 8 }}>
                  {t(uiLocale, "hero.sectionTitle")}
                </h2>
                <p style={{ fontSize: 14, color: "#64748b", marginBottom: 24 }}>
                  {t(uiLocale, "hero.sectionDescription")}
                </p>

                <div style={{ display: "grid", gap: 20 }}>
                  <Field
                    label={t(uiLocale, "hero.title")}
                    value={settings.hero.title[activeLocale]}
                    onChange={(v) => updateI18n("hero", "title", activeLocale, v)}
                  />
                  <Field
                    label={t(uiLocale, "hero.subtitle")}
                    value={settings.hero.subtitle[activeLocale]}
                    onChange={(v) => updateI18n("hero", "subtitle", activeLocale, v)}
                    multiline
                  />
                  <Field
                    label={t(uiLocale, "hero.ctaLabel")}
                    value={settings.hero.ctaLabel[activeLocale]}
                    onChange={(v) => updateI18n("hero", "ctaLabel", activeLocale, v)}
                  />
                  <Field
                    label={t(uiLocale, "hero.ctaUrl")}
                    value={settings.hero.ctaUrl}
                    onChange={(v) => updateField("hero", "ctaUrl", v)}
                  />
                  <Field
                    label={t(uiLocale, "hero.backgroundImageUrl")}
                    value={settings.hero.backgroundImage}
                    onChange={(v) => updateField("hero", "backgroundImage", v)}
                  />
                  <div>
                    <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#374151", marginBottom: 8 }}>
                      {t(uiLocale, "hero.overlayOpacity")}: {settings.hero.overlayOpacity}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={settings.hero.overlayOpacity}
                      onChange={(e) => updateField("hero", "overlayOpacity", Number(e.target.value))}
                      style={{ width: "100%" }}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeSection === "trust" && (
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: "#0A2540", marginBottom: 8 }}>
                  {t(uiLocale, "trust.sectionTitle")}
                </h2>
                <p style={{ fontSize: 14, color: "#64748b", marginBottom: 24 }}>
                  {t(uiLocale, "trust.sectionDescription")}
                </p>

                <div style={{ display: "grid", gap: 20 }}>
                  {settings.trust.stats.map((stat) => (
                    <div
                      key={stat.id}
                      style={{
                        border: "1px solid #e5e7eb",
                        borderRadius: 12,
                        padding: 20,
                        background: "#f8fafc",
                        display: "grid",
                        gap: 16,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ fontWeight: 600, color: "#0A2540" }}>
                          {stat.label[activeLocale] || t(uiLocale, "trust.untitled")}
                        </div>
                        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#64748b" }}>
                          <input
                            type="checkbox"
                            checked={stat.active}
                            onChange={(e) =>
                              updateTrustStat(stat.id, (current) => ({
                                ...current,
                                active: e.target.checked,
                              }))
                            }
                            style={{ width: 16, height: 16 }}
                          />
                          {t(uiLocale, "trust.active")}
                        </label>
                      </div>

                      <Field
                        label={`${t(uiLocale, "trust.label")} (${activeLocale.toUpperCase()})`}
                        value={stat.label[activeLocale]}
                        onChange={(v) => updateTrustStatLabel(stat.id, activeLocale, v)}
                      />
                      <Field
                        label={t(uiLocale, "trust.value")}
                        value={stat.value}
                        onChange={(v) =>
                          updateTrustStat(stat.id, (current) => ({
                            ...current,
                            value: v,
                          }))
                        }
                      />
                      <Field
                        label={t(uiLocale, "trust.iconOptional")}
                        value={stat.icon || ""}
                        onChange={(v) =>
                          updateTrustStat(stat.id, (current) => ({
                            ...current,
                            icon: v,
                          }))
                        }
                      />
                    </div>
                  ))}
                  <div style={{ fontSize: 12, color: "#64748b" }}>
                    {t(uiLocale, "trust.note")}
                  </div>
                </div>
              </div>
            )}

            {activeSection === "clinic" && (
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: "#0A2540", marginBottom: 8 }}>
                  {t(uiLocale, "clinic.sectionTitle")}
                </h2>
                <p style={{ fontSize: 14, color: "#64748b", marginBottom: 24 }}>
                  {t(uiLocale, "clinic.sectionDescription")}
                </p>

                <div style={{ display: "grid", gap: 20 }}>
                  {settings.featuredClinics.map((clinic, index) => {
                    const ctaValid = isValidCtaUrl(clinic.ctaUrl || "");

                    return (
                      <div
                        key={clinic.id}
                        style={{
                          border: "1px solid #e5e7eb",
                          borderRadius: 12,
                          padding: 20,
                          background: "#f8fafc",
                          display: "grid",
                          gap: 16,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div style={{ fontWeight: 600, color: "#0A2540" }}>
                            {t(uiLocale, "clinic.clinicNumber")}{index + 1}
                          </div>
                          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#64748b" }}>
                            <input
                              type="checkbox"
                              checked={clinic.active}
                              onChange={(e) =>
                                updateFeaturedClinic(clinic.id, (current) => ({
                                  ...current,
                                  active: e.target.checked,
                                }))
                              }
                              style={{ width: 16, height: 16 }}
                            />
                            {t(uiLocale, "clinic.active")}
                          </label>
                        </div>

                        <Field
                          label={`${t(uiLocale, "clinic.name")} (${activeLocale.toUpperCase()})`}
                          value={clinic.name[activeLocale]}
                          onChange={(v) => updateFeaturedClinicI18n(clinic.id, "name", activeLocale, v)}
                        />
                        <Field
                          label={`${t(uiLocale, "clinic.city")} (${activeLocale.toUpperCase()})`}
                          value={clinic.city[activeLocale]}
                          onChange={(v) => updateFeaturedClinicI18n(clinic.id, "city", activeLocale, v)}
                        />
                        <Field
                          label={`${t(uiLocale, "clinic.country")} (${activeLocale.toUpperCase()})`}
                          value={clinic.country[activeLocale]}
                          onChange={(v) => updateFeaturedClinicI18n(clinic.id, "country", activeLocale, v)}
                        />
                        <Field
                          label={`${t(uiLocale, "clinic.specialty")} (${activeLocale.toUpperCase()})`}
                          value={clinic.specialty[activeLocale]}
                          onChange={(v) => updateFeaturedClinicI18n(clinic.id, "specialty", activeLocale, v)}
                        />
                        <Field
                          label={`${t(uiLocale, "clinic.shortDescription")} (${activeLocale.toUpperCase()})`}
                          value={clinic.shortDescription[activeLocale]}
                          onChange={(v) => updateFeaturedClinicI18n(clinic.id, "shortDescription", activeLocale, v)}
                          multiline
                        />
                        <Field
                          label={t(uiLocale, "clinic.imageUrl")}
                          value={clinic.imageUrl}
                          onChange={(v) =>
                            updateFeaturedClinic(clinic.id, (current) => ({
                              ...current,
                              imageUrl: v,
                            }))
                          }
                        />
                        <Field
                          label={`${t(uiLocale, "clinic.ctaLabel")} (${activeLocale.toUpperCase()})`}
                          value={clinic.ctaLabel[activeLocale]}
                          onChange={(v) => updateFeaturedClinicI18n(clinic.id, "ctaLabel", activeLocale, v)}
                        />
                        <Field
                          label={t(uiLocale, "clinic.ctaUrl")}
                          value={clinic.ctaUrl}
                          onChange={(v) =>
                            updateFeaturedClinic(clinic.id, (current) => ({
                              ...current,
                              ctaUrl: v,
                            }))
                          }
                        />
                        {!ctaValid && (
                          <div style={{ fontSize: 12, color: "#b45309" }}>
                            {t(uiLocale, "clinic.ctaUrlHint")}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeSection === "seo" && (
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: "#0A2540", marginBottom: 8 }}>
                  {t(uiLocale, "seo.sectionTitle")}
                </h2>
                <p style={{ fontSize: 14, color: "#64748b", marginBottom: 24 }}>
                  {t(uiLocale, "seo.sectionDescription")}
                </p>

                <div style={{ display: "grid", gap: 20 }}>
                  <Field
                    label={`${t(uiLocale, "seo.metaTitle")} (${activeLocale.toUpperCase()})`}
                    value={settings.seo.metaTitle[activeLocale]}
                    onChange={(v) => updateI18n("seo", "metaTitle", activeLocale, v)}
                  />
                  {showTitleWarning && (
                    <div style={{ fontSize: 12, color: "#b45309" }}>
                      {t(uiLocale, "seo.metaTitleWarning", {
                        current: metaTitleLength,
                        limit: SEO_LIMITS.title,
                      })}
                    </div>
                  )}
                  <Field
                    label={`${t(uiLocale, "seo.metaDescription")} (${activeLocale.toUpperCase()})`}
                    value={settings.seo.metaDescription[activeLocale]}
                    onChange={(v) => updateI18n("seo", "metaDescription", activeLocale, v)}
                    multiline
                  />
                  {showDescriptionWarning && (
                    <div style={{ fontSize: 12, color: "#b45309" }}>
                      {t(uiLocale, "seo.metaDescriptionWarning", {
                        current: metaDescriptionLength,
                        limit: SEO_LIMITS.description,
                      })}
                    </div>
                  )}
                  <Field
                    label={`${t(uiLocale, "seo.ogTitle")} (${activeLocale.toUpperCase()})`}
                    value={settings.seo.ogTitle[activeLocale]}
                    onChange={(v) => updateI18n("seo", "ogTitle", activeLocale, v)}
                  />
                  <Field
                    label={`${t(uiLocale, "seo.ogDescription")} (${activeLocale.toUpperCase()})`}
                    value={settings.seo.ogDescription[activeLocale]}
                    onChange={(v) => updateI18n("seo", "ogDescription", activeLocale, v)}
                    multiline
                  />
                  <Field
                    label={t(uiLocale, "seo.ogImageUrl")}
                    value={settings.seo.ogImageUrl}
                    onChange={(v) => updateField("seo", "ogImageUrl", v)}
                  />
                  <Field
                    label={t(uiLocale, "seo.canonicalBaseUrl")}
                    value={settings.seo.canonicalBaseUrl}
                    onChange={(v) => updateField("seo", "canonicalBaseUrl", v)}
                  />
                  <div>
                    <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#374151", marginBottom: 8 }}>
                      {t(uiLocale, "seo.indexing")}
                    </label>
                    <select
                      value={settings.seo.indexing}
                      onChange={(e) => updateField("seo", "indexing", e.target.value)}
                      style={inputStyle}
                    >
                      <option value="index">{t(uiLocale, "seo.index")}</option>
                      <option value="noindex">{t(uiLocale, "seo.noindex")}</option>
                    </select>
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>
                    {t(uiLocale, "seo.metaNote")}
                  </div>
                </div>
              </div>
            )}

            {activeSection === "banner" && (
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: "#0A2540", marginBottom: 8 }}>
                  {t(uiLocale, "banner.sectionTitle")}
                </h2>
                <p style={{ fontSize: 14, color: "#64748b", marginBottom: 24 }}>
                  {t(uiLocale, "banner.sectionDescription")}
                </p>

                <div style={{ display: "grid", gap: 20 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={settings.banner.enabled}
                    onChange={(e) => updateField("banner", "enabled", e.target.checked)}
                    style={{ width: 18, height: 18 }}
                  />
                  <span style={{ fontSize: 14, fontWeight: 500, color: "#374151" }}>
                    {t(uiLocale, "banner.enable")}
                  </span>
                </label>

                  {settings.banner.enabled && (
                    <>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                        <div>
                          <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#374151", marginBottom: 8 }}>
                            {t(uiLocale, "banner.startDate")}
                          </label>
                          <input
                            type="date"
                            value={settings.banner.startDate}
                            onChange={(e) => updateField("banner", "startDate", e.target.value)}
                            style={inputStyle}
                          />
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#374151", marginBottom: 8 }}>
                            {t(uiLocale, "banner.endDate")}
                          </label>
                          <input
                            type="date"
                            value={settings.banner.endDate}
                            onChange={(e) => updateField("banner", "endDate", e.target.value)}
                            style={inputStyle}
                          />
                        </div>
                      </div>
                      <Field
                        label={`${t(uiLocale, "banner.content")} (${activeLocale.toUpperCase()})`}
                        value={settings.banner.content[activeLocale]}
                        onChange={(v) => updateI18n("banner", "content", activeLocale, v)}
                      />
                    </>
                  )}
                </div>
              </div>
            )}

            {activeSection === "footer" && (
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: "#0A2540", marginBottom: 8 }}>
                  {t(uiLocale, "footer.sectionTitle")}
                </h2>
                <p style={{ fontSize: 14, color: "#64748b", marginBottom: 24 }}>
                  {t(uiLocale, "footer.sectionDescription")}
                </p>

                <div style={{ display: "grid", gap: 20 }}>
                  <Field
                    label={`${t(uiLocale, "footer.companyText")} (${activeLocale.toUpperCase()})`}
                    value={settings.footer.companyText[activeLocale]}
                    onChange={(v) => updateI18n("footer", "companyText", activeLocale, v)}
                  />
                  <Field
                    label={`${t(uiLocale, "footer.imprintText")} (${activeLocale.toUpperCase()})`}
                    value={settings.footer.imprintText[activeLocale]}
                    onChange={(v) => updateI18n("footer", "imprintText", activeLocale, v)}
                    multiline
                  />
                  <Field
                    label={t(uiLocale, "footer.privacyUrl")}
                    value={settings.footer.privacyUrl}
                    onChange={(v) => updateField("footer", "privacyUrl", v)}
                  />
                  <Field
                    label={t(uiLocale, "footer.termsUrl")}
                    value={settings.footer.termsUrl}
                    onChange={(v) => updateField("footer", "termsUrl", v)}
                  />
                  <Field
                    label={t(uiLocale, "footer.imprintUrl")}
                    value={settings.footer.imprintUrl}
                    onChange={(v) => updateField("footer", "imprintUrl", v)}
                  />
                </div>
              </div>
            )}

            {activeSection === "locale" && (
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: "#0A2540", marginBottom: 8 }}>
                  {t(uiLocale, "locale.sectionTitle")}
                </h2>
                <p style={{ fontSize: 14, color: "#64748b", marginBottom: 24 }}>
                  {t(uiLocale, "locale.sectionDescription")}
                </p>

                <div style={{ display: "grid", gap: 20 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#374151", marginBottom: 8 }}>
                      {t(uiLocale, "locale.uiLanguage")}
                    </label>
                    <select
                      value={uiLocale}
                      onChange={(e) => handleUiLocaleChange(e.target.value as CmsUiLocale)}
                      style={inputStyle}
                    >
                      <option value="de">{t(uiLocale, "locale.de")}</option>
                      <option value="en">{t(uiLocale, "locale.en")}</option>
                      <option value="tr">{t(uiLocale, "locale.tr")}</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#374151", marginBottom: 8 }}>
                      {t(uiLocale, "locale.defaultLanguage")}
                    </label>
                    <select
                      value={settings.locale.defaultLocale}
                      onChange={(e) => updateField("locale", "defaultLocale", e.target.value)}
                      style={inputStyle}
                    >
                      <option value="de">{t(uiLocale, "locale.de")}</option>
                      <option value="en">{t(uiLocale, "locale.en")}</option>
                      <option value="tr">{t(uiLocale, "locale.tr")}</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#374151", marginBottom: 8 }}>
                      {t(uiLocale, "locale.fallbackLanguage")}
                    </label>
                    <select
                      value={settings.locale.fallbackLocale}
                      onChange={(e) => updateField("locale", "fallbackLocale", e.target.value)}
                      style={inputStyle}
                    >
                      <option value="de">{t(uiLocale, "locale.de")}</option>
                      <option value="en">{t(uiLocale, "locale.en")}</option>
                      <option value="tr">{t(uiLocale, "locale.tr")}</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 16px",
  fontSize: 14,
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  outline: "none",
};

function Field({
  label,
  value,
  onChange,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
}) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#374151", marginBottom: 8 }}>
        {label}
      </label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          style={{ ...inputStyle, resize: "vertical" }}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={inputStyle}
        />
      )}
    </div>
  );
}





