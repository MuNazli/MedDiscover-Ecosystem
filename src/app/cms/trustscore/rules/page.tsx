"use client";

import { useEffect, useMemo, useState } from "react";
import { CmsUiKey, t } from "@/lib/cmsI18n";
import { useCmsUiLocale } from "@/lib/useCmsUiLocale";
import CmsLanguageSwitcher from "@/components/cms/CmsLanguageSwitcher";

type TrustRule = {
  code: string;
  delta: number;
  isActive: boolean;
  titleKey: string;
  descriptionKey: string;
  updatedAt: string;
};

type RuleState = TrustRule & {
  saving: boolean;
};

export default function TrustScoreRulesPage() {
  const { uiLocale, setUiLocale } = useCmsUiLocale("de");
  const [rules, setRules] = useState<RuleState[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [savedCode, setSavedCode] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [original, setOriginal] = useState<Record<string, { delta: number; isActive: boolean }>>(
    {}
  );

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);

    fetch("/api/cms/trustscore/rules", { method: "GET" })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Failed");
        }
        const data = await res.json();
        const list = Array.isArray(data.rules) ? data.rules : [];
        if (active) {
          setRules(
            list.map((rule: TrustRule) => ({
              ...rule,
              saving: false,
            }))
          );
          const initial: Record<string, { delta: number; isActive: boolean }> = {};
          list.forEach((rule: TrustRule) => {
            initial[rule.code] = { delta: rule.delta, isActive: rule.isActive };
          });
          setOriginal(initial);
        }
      })
      .catch(() => {
        if (active) {
          setError(true);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const hasRuleChanges = (rule: RuleState) => {
    const base = original[rule.code];
    if (!base) return false;
    return base.delta !== rule.delta || base.isActive !== rule.isActive;
  };

  const handleDeltaChange = (code: string, next: number) => {
    if (!Number.isFinite(next)) {
      return;
    }
    const clamped = Math.min(100, Math.max(-100, Math.trunc(next)));
    setRules((prev) =>
      prev.map((rule) => (rule.code === code ? { ...rule, delta: clamped } : rule))
    );
  };

  const handleToggle = (code: string) => {
    setRules((prev) =>
      prev.map((rule) =>
        rule.code === code ? { ...rule, isActive: !rule.isActive } : rule
      )
    );
  };

  const handleReset = (code: string) => {
    const base = original[code];
    if (!base) return;
    setRules((prev) =>
      prev.map((rule) =>
        rule.code === code ? { ...rule, delta: base.delta, isActive: base.isActive } : rule
      )
    );
  };

  const handleSave = async (code: string) => {
    const target = rules.find((rule) => rule.code === code);
    if (!target) return;

    setRules((prev) =>
      prev.map((rule) => (rule.code === code ? { ...rule, saving: true } : rule))
    );

    try {
      const res = await fetch(`/api/cms/trustscore/rules/${code}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ delta: target.delta, isActive: target.isActive }),
      });
      if (!res.ok) {
        throw new Error("Failed");
      }
      const data = await res.json();
      const updated = data.rule as TrustRule;
      setRules((prev) =>
        prev.map((rule) =>
          rule.code === code
            ? { ...rule, ...updated, saving: false }
            : rule
        )
      );
      setOriginal((prev) => ({
        ...prev,
        [code]: { delta: updated.delta, isActive: updated.isActive },
      }));
      setSavedCode(code);
      setSavedAt(Date.now());
    } catch {
      setRules((prev) =>
        prev.map((rule) => (rule.code === code ? { ...rule, saving: false } : rule))
      );
      setError(true);
    }
  };

  const savedLabel = useMemo(() => {
    if (!savedCode || !savedAt) return null;
    const seconds = Math.floor((Date.now() - savedAt) / 1000);
    return seconds < 10
      ? t(uiLocale, "trustRules.saved")
      : t(uiLocale, "trustRules.savedRecently");
  }, [savedCode, savedAt, uiLocale]);

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <div className="border-b border-black/10">
          <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-6 py-6">
            <div>
              <h1 className="text-2xl font-semibold text-black">{t(uiLocale, "trustRules.title")}</h1>
              <p className="text-[13px] text-black/60">{t(uiLocale, "trustRules.subtitle")}</p>
            </div>
            <CmsLanguageSwitcher currentLocale={uiLocale} onLocaleChange={setUiLocale} />
          </div>
        </div>
        <section className="mx-auto w-full max-w-[1200px] px-6 py-8 text-[13px] text-black/60">
          {t(uiLocale, "general.loading")}
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-white">
        <div className="border-b border-black/10">
          <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-6 py-6">
            <div>
              <h1 className="text-2xl font-semibold text-black">{t(uiLocale, "trustRules.title")}</h1>
              <p className="text-[13px] text-black/60">{t(uiLocale, "trustRules.subtitle")}</p>
            </div>
            <CmsLanguageSwitcher currentLocale={uiLocale} onLocaleChange={setUiLocale} />
          </div>
        </div>
        <section className="mx-auto w-full max-w-[1200px] px-6 py-8">
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-[13px] text-red-800">
            {t(uiLocale, "trustRules.error")}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="border-b border-black/10">
        <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-6 py-6">
          <div>
            <h1 className="text-2xl font-semibold text-black">{t(uiLocale, "trustRules.title")}</h1>
            <p className="text-[13px] text-black/60">{t(uiLocale, "trustRules.subtitle")}</p>
          </div>
          <CmsLanguageSwitcher currentLocale={uiLocale} onLocaleChange={setUiLocale} />
        </div>
      </div>

      <section className="mx-auto w-full max-w-[1200px] px-6 py-8">
        {rules.length === 0 && (
          <div className="rounded-xl border border-black/10 bg-white p-6 text-center text-[14px] text-black/60">
            {t(uiLocale, "trustRules.empty")}
          </div>
        )}

        {rules.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-black/10 bg-white">
            <div className="min-w-[760px]">
              <div className="grid grid-cols-[1.2fr_1fr_120px_90px_160px_140px] gap-3 border-b border-black/10 bg-black/5 px-4 py-3 text-[12px] font-semibold uppercase tracking-wide text-black/60">
                <div>{t(uiLocale, "trustRules.tableRule")}</div>
                <div>{t(uiLocale, "trustRules.tableCode")}</div>
                <div>{t(uiLocale, "trustRules.tableDelta")}</div>
                <div>{t(uiLocale, "trustRules.tableActive")}</div>
                <div>{t(uiLocale, "trustRules.tableUpdated")}</div>
                <div>{t(uiLocale, "trustRules.tableActions")}</div>
              </div>
              {rules.map((rule) => {
                const titleText =
                  t(uiLocale, rule.titleKey as CmsUiKey) || rule.code;
                const descText =
                  t(uiLocale, rule.descriptionKey as CmsUiKey) || "";
                const dirty = hasRuleChanges(rule);
                return (
                  <div
                    key={rule.code}
                    className="grid grid-cols-[1.2fr_1fr_120px_90px_160px_140px] gap-3 border-b border-black/5 px-4 py-3 text-[13px] text-black last:border-b-0"
                  >
                    <div>
                      <div className="font-semibold text-black">{titleText}</div>
                      {descText && (
                        <div className="text-[11px] text-black/50">{descText}</div>
                      )}
                    </div>
                    <div className="font-mono text-[12px] text-black/70">{rule.code}</div>
                    <div>
                      <input
                        type="number"
                        min={-100}
                        max={100}
                        value={rule.delta}
                        onChange={(event) => handleDeltaChange(rule.code, event.target.valueAsNumber)}
                        className="h-9 w-full rounded-lg border border-black/20 px-2 text-[12px] text-black focus:border-black focus:outline-none"
                        aria-label={t(uiLocale, "trustRules.tableDelta")}
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-[12px] text-black/70">
                        <input
                          type="checkbox"
                          checked={rule.isActive}
                          onChange={() => handleToggle(rule.code)}
                          className="h-4 w-4 accent-black"
                          aria-label={t(uiLocale, "trustRules.tableActive")}
                        />
                        {rule.isActive ? t(uiLocale, "trustRules.active") : t(uiLocale, "trustRules.inactive")}
                      </label>
                    </div>
                    <div className="text-[12px] text-black/60">
                      {new Date(rule.updatedAt).toLocaleString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSave(rule.code)}
                        disabled={rule.saving || !dirty}
                        className="rounded-lg border border-black/20 px-3 py-1 text-[12px] font-semibold text-black hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {rule.saving ? t(uiLocale, "trustRules.saving") : t(uiLocale, "trustRules.save")}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReset(rule.code)}
                        disabled={rule.saving || !dirty}
                        className="rounded-lg border border-black/10 px-3 py-1 text-[12px] text-black/60 hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {t(uiLocale, "trustRules.reset")}
                      </button>
                      {savedCode === rule.code && savedLabel && (
                        <span className="text-[11px] text-green-700">{savedLabel}</span>
                      )}
                      {dirty && (
                        <span className="text-[11px] text-yellow-700">{t(uiLocale, "trustRules.unsaved")}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
