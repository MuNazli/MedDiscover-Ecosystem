import { AdminSettings, DEFAULT_ADMIN_SETTINGS } from "@/lib/adminSettingsDefaults";
import { Locale } from "@/lib/i18n";

export type FeaturedClinicView = {
  id: string;
  name: string;
  city: string;
  country: string;
  specialty: string;
  shortDescription: string;
  imageUrl: string;
  ctaLabel: string;
  ctaUrl: string;
  active: boolean;
};

export function isValidCtaUrl(url: string) {
  return url.trim().startsWith("/");
}

export function resolveFeaturedClinics(
  settings: AdminSettings | undefined,
  locale: Locale
) {
  const clinics = settings?.featuredClinics || DEFAULT_ADMIN_SETTINGS.featuredClinics;
  return clinics.map((clinic) => ({
    id: clinic.id,
    name: clinic.name?.[locale] || "",
    city: clinic.city?.[locale] || "",
    country: clinic.country?.[locale] || "",
    specialty: clinic.specialty?.[locale] || "",
    shortDescription: clinic.shortDescription?.[locale] || "",
    imageUrl: clinic.imageUrl,
    ctaLabel: clinic.ctaLabel?.[locale] || "",
    ctaUrl: clinic.ctaUrl,
    active: clinic.active,
  }));
}
