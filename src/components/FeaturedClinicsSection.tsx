"use client";

import { useEffect, useState } from "react";
import { AdminSettings, DEFAULT_ADMIN_SETTINGS } from "@/lib/adminSettingsDefaults";
import { loadAdminSettings } from "@/lib/adminSettingsStore";
import { Locale } from "@/lib/i18n";
import { isValidCtaUrl, resolveFeaturedClinics } from "@/lib/featuredClinics";

interface FeaturedClinicsSectionProps {
  locale: Locale;
}

export default function FeaturedClinicsSection({ locale }: FeaturedClinicsSectionProps) {
  const [settings, setSettings] = useState<AdminSettings>(DEFAULT_ADMIN_SETTINGS);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setSettings(loadAdminSettings());
  }, []);

  const clinics = resolveFeaturedClinics(settings, locale).filter(
    (clinic) => clinic.active
  );

  if (clinics.length === 0) {
    return null;
  }

  return (
    <section className="featured-clinics-section">
      <div className="container">
        <div className="featured-clinics-grid">
          {clinics.map((clinic) => {
            const hasBrokenImage = brokenImages[clinic.id];
            const ctaValid = isValidCtaUrl(clinic.ctaUrl);
            const fallbackLabel = clinic.name || "Featured Clinic";

            return (
              <article key={clinic.id} className="featured-clinic-card">
                <div className="featured-clinic-image">
                  {!hasBrokenImage && clinic.imageUrl ? (
                    <img
                      src={clinic.imageUrl}
                      alt={fallbackLabel}
                      onError={() =>
                        setBrokenImages((prev) => ({ ...prev, [clinic.id]: true }))
                      }
                    />
                  ) : (
                    <div className="featured-clinic-image-fallback">
                      {fallbackLabel.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="featured-clinic-body">
                  <div className="featured-clinic-name">{clinic.name}</div>
                  <div className="featured-clinic-location">
                    {clinic.city}, {clinic.country}
                  </div>
                  <div className="featured-clinic-specialty">{clinic.specialty}</div>
                  <p className="featured-clinic-description">{clinic.shortDescription}</p>
                  {ctaValid ? (
                    <a href={clinic.ctaUrl} className="featured-clinic-cta">
                      {clinic.ctaLabel}
                    </a>
                  ) : (
                    <span className="featured-clinic-cta disabled">
                      {clinic.ctaLabel}
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
