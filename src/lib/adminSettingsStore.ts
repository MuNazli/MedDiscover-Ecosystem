import {
  AdminSettings,
  DEFAULT_ADMIN_SETTINGS,
  STORAGE_KEY,
} from "@/lib/adminSettingsDefaults";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function deepMerge<T>(base: T, source: Partial<T>): T {
  if (!isPlainObject(base) || !isPlainObject(source)) {
    return (source === undefined ? base : (source as T)) as T;
  }

  const result: Record<string, unknown> = { ...base };

  for (const key of Object.keys(source)) {
    const sourceValue = source[key];
    if (sourceValue === undefined) {
      continue;
    }
    const baseValue = (base as Record<string, unknown>)[key];
    if (isPlainObject(baseValue) && isPlainObject(sourceValue)) {
      result[key] = deepMerge(baseValue, sourceValue);
    } else {
      result[key] = sourceValue;
    }
  }

  return result as T;
}

export function loadAdminSettings(): AdminSettings {
  if (typeof window === "undefined") {
    return DEFAULT_ADMIN_SETTINGS;
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return DEFAULT_ADMIN_SETTINGS;
  }

  try {
    const parsed = JSON.parse(stored) as Partial<AdminSettings>;
    const merged = deepMerge(DEFAULT_ADMIN_SETTINGS, parsed);
    if (!Array.isArray(merged.trust?.stats)) {
      merged.trust = {
        ...merged.trust,
        stats: DEFAULT_ADMIN_SETTINGS.trust.stats,
      };
    }
    if (!Array.isArray(merged.featuredClinics)) {
      merged.featuredClinics = DEFAULT_ADMIN_SETTINGS.featuredClinics;
    }
    return merged;
  } catch {
    return DEFAULT_ADMIN_SETTINGS;
  }
}

export function saveAdminSettings(settings: AdminSettings): AdminSettings {
  const toSave = {
    ...settings,
    _lastSaved: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  }

  return toSave;
}
