"use client";

import { useEffect, useState } from "react";
import { AdminSettings, DEFAULT_ADMIN_SETTINGS } from "@/lib/adminSettingsDefaults";
import { loadAdminSettings } from "@/lib/adminSettingsStore";
import { Locale } from "@/lib/i18n";
import { resolveTrustStats } from "@/lib/trustStats";

interface TrustStatsStripProps {
  locale: Locale;
}

export default function TrustStatsStrip({ locale }: TrustStatsStripProps) {
  const [settings, setSettings] = useState<AdminSettings>(DEFAULT_ADMIN_SETTINGS);

  useEffect(() => {
    setSettings(loadAdminSettings());
  }, []);

  const stats = resolveTrustStats(settings, locale);

  if (stats.length === 0) {
    return null;
  }

  return (
    <section className="trust-stats-strip">
      <div className="trust-stats-inner container">
        {stats.map((stat) => (
          <div key={stat.id} className="trust-stat-card">
            {stat.icon ? <div className="trust-stat-icon">{stat.icon}</div> : null}
            <div className="trust-stat-value">{stat.value}</div>
            <div className="trust-stat-label">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
