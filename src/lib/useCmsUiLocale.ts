import { useCallback, useEffect, useState } from "react";
import { CmsUiLocale, isCmsUiLocale, UI_LOCALE_STORAGE_KEY } from "@/lib/cmsI18n";

export function useCmsUiLocale(defaultLocale: CmsUiLocale = "de") {
  const [uiLocale, setUiLocaleState] = useState<CmsUiLocale>(defaultLocale);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const stored = localStorage.getItem(UI_LOCALE_STORAGE_KEY);
    if (isCmsUiLocale(stored)) {
      setUiLocaleState(stored);
    }
  }, []);

  const setUiLocale = useCallback((nextLocale: CmsUiLocale) => {
    setUiLocaleState(nextLocale);
    if (typeof window !== "undefined") {
      localStorage.setItem(UI_LOCALE_STORAGE_KEY, nextLocale);
    }
  }, []);

  return { uiLocale, setUiLocale };
}
