import { AdminSettings, DEFAULT_ADMIN_SETTINGS } from "@/lib/adminSettingsDefaults";
import { Locale } from "@/lib/i18n";

export type TrustStatView = {
  id: string;
  label: string;
  value: string;
  icon?: string;
};

export function resolveTrustStats(settings: AdminSettings | undefined, locale: Locale) {
  const stats = settings?.trust?.stats || DEFAULT_ADMIN_SETTINGS.trust.stats;
  return stats
    .filter((stat) => stat.active)
    .map((stat) => ({
      id: stat.id,
      label: stat.label?.[locale] || "",
      value: stat.value,
      icon: stat.icon,
    }));
}
