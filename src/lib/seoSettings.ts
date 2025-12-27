import { AdminSettings, DEFAULT_ADMIN_SETTINGS } from "@/lib/adminSettingsDefaults";
import { Locale } from "@/lib/i18n";

export const SEO_LIMITS = {
  title: 60,
  description: 160,
};

export type ResolvedSeo = {
  metaTitle: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  ogImageUrl: string;
  canonicalBaseUrl: string;
  indexing: "index" | "noindex";
};

export function getCanonicalBaseUrl(value?: string) {
  const envBase =
    process.env.CANONICAL_BASE_URL ||
    process.env.NEXT_PUBLIC_CANONICAL_BASE_URL ||
    "http://localhost:3000";
  const raw = (value || "").trim();
  const base = raw || envBase;
  return base.endsWith("/") ? base.slice(0, -1) : base;
}

export function getSeoSettings(settings?: AdminSettings) {
  return settings?.seo || DEFAULT_ADMIN_SETTINGS.seo;
}

export function resolveSeoForLocale(
  settings: AdminSettings | undefined,
  locale: Locale
): ResolvedSeo {
  const seo = getSeoSettings(settings);
  const metaTitle = seo.metaTitle?.[locale] || "";
  const metaDescription = seo.metaDescription?.[locale] || "";
  const ogTitle = seo.ogTitle?.[locale] || metaTitle;
  const ogDescription = seo.ogDescription?.[locale] || metaDescription;
  const ogImageUrl = seo.ogImageUrl || DEFAULT_ADMIN_SETTINGS.seo.ogImageUrl;
  const canonicalBaseUrl = getCanonicalBaseUrl(seo.canonicalBaseUrl);

  return {
    metaTitle,
    metaDescription,
    ogTitle,
    ogDescription,
    ogImageUrl,
    canonicalBaseUrl,
    indexing: seo.indexing,
  };
}
