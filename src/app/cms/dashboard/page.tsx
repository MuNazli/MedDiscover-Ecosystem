"use client";

import { useEffect, useState } from "react";
import { CmsUiKey, t } from "@/lib/cmsI18n";
import { useCmsUiLocale } from "@/lib/useCmsUiLocale";
import CmsLanguageSwitcher from "@/components/cms/CmsLanguageSwitcher";

type DashboardStats = {
  totals: {
    total: number;
    last7d: number;
    last24h: number;
    open: number;
  };
  statusCounts: {
    NEW: number;
    IN_REVIEW: number;
    OFFER_SENT: number;
    CLOSED: number;
  };
  recentAudits: Array<{
    id: string;
    leadId: string;
    action: string;
    createdAt: string;
    actor: string | null;
  }>;
};

type TrustScoreSummary = {
  counts: {
    active: number;
    riskyHidden: number;
    blacklisted: number;
  };
  avgScore: number;
  topRisky: Array<{
    leadId: string;
    score: number;
    trustStatus: string;
    updatedAt: string | null;
  }>;
};

export default function CMSDashboardPage() {
  const { uiLocale, setUiLocale } = useCmsUiLocale("de");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trustScore, setTrustScore] = useState<TrustScoreSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);

    Promise.all([
      fetch("/api/cms/dashboard", { method: "GET" }),
      fetch("/api/cms/trustscore/summary", { method: "GET" }),
    ])
      .then(async ([dashRes, trustRes]) => {
        if (!dashRes.ok || !trustRes.ok) {
          throw new Error("Failed");
        }
        const dashData = await dashRes.json();
        const trustData = await trustRes.json();
        if (active) {
          setStats(dashData);
          setTrustScore(trustData);
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

  const getAuditLabel = (action: string) => {
    const key = `leadAudit.${action}` as CmsUiKey;
    return t(uiLocale, key);
  };

  const getRelativeTime = (dateStr: string) => {
    const now = new Date();
    const past = new Date(dateStr);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t(uiLocale, "dashboard.timeJustNow");
    if (diffMins < 60) return `${diffMins}${t(uiLocale, "dashboard.timeMinutesAgo")}`;
    if (diffHours < 24) return `${diffHours}${t(uiLocale, "dashboard.timeHoursAgo")}`;
    return `${diffDays}${t(uiLocale, "dashboard.timeDaysAgo")}`;
  };

  const getAuditIcon = (action: string) => {
    if (action === "STATUS_CHANGED") return "S";
    if (action === "NOTE_ADDED") return "N";
    return "?";
  };

  const calculateTrend = () => {
    if (!stats) return null;
    const { last24h, last7d } = stats.totals;
    if (last7d === 0) return null;
    const avg7d = last7d / 7;
    if (avg7d === 0) return null;
    const trend = ((last24h - avg7d) / avg7d) * 100;
    return trend;
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <div className="border-b border-black/10">
          <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-6 py-6">
            <div>
              <h1 className="text-2xl font-semibold text-black">{t(uiLocale, "dashboard.title")}</h1>
              <p className="text-[13px] text-black/60">{t(uiLocale, "dashboard.subtitle")}</p>
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

  if (error || !stats) {
    return (
      <main className="min-h-screen bg-white">
        <div className="border-b border-black/10">
          <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-6 py-6">
            <div>
              <h1 className="text-2xl font-semibold text-black">{t(uiLocale, "dashboard.title")}</h1>
              <p className="text-[13px] text-black/60">{t(uiLocale, "dashboard.subtitle")}</p>
            </div>
            <CmsLanguageSwitcher currentLocale={uiLocale} onLocaleChange={setUiLocale} />
          </div>
        </div>
        <section className="mx-auto w-full max-w-[1200px] px-6 py-8">
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-[13px] text-red-800">
            {t(uiLocale, "dashboard.error")}
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
            <h1 className="text-2xl font-semibold text-black">{t(uiLocale, "dashboard.title")}</h1>
            <p className="text-[13px] text-black/60">{t(uiLocale, "dashboard.subtitle")}</p>
          </div>
          <CmsLanguageSwitcher currentLocale={uiLocale} onLocaleChange={setUiLocale} />
        </div>
      </div>

      <section className="mx-auto w-full max-w-[1200px] px-6 py-8">
        {/* KPI Cards - Row 1: Lead Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-black/10 bg-white p-4">
            <div className="text-[12px] uppercase tracking-wide text-black/50">
              {t(uiLocale, "dashboard.kpiTotal")}
            </div>
            <div className="mt-2 text-3xl font-bold text-black">{stats.totals.total}</div>
          </div>

          <div className="rounded-xl border border-black/10 bg-white p-4">
            <div className="text-[12px] uppercase tracking-wide text-black/50">
              {t(uiLocale, "dashboard.kpiLast7d")}
            </div>
            <div className="mt-2 text-3xl font-bold text-black">{stats.totals.last7d}</div>
          </div>

          <div className="rounded-xl border border-black/10 bg-white p-4">
            <div className="text-[12px] uppercase tracking-wide text-black/50">
              {t(uiLocale, "dashboard.kpiLast24h")}
            </div>
            <div className="mt-2 flex items-end gap-2">
              <span className="text-3xl font-bold text-black">{stats.totals.last24h}</span>
              {(() => {
                const trend = calculateTrend();
                if (trend !== null) {
                  const isPositive = trend > 0;
                  const trendColor = isPositive ? "text-green-600" : "text-red-600";
                  const prefix = isPositive ? "+" : "-";
                  return (
                    <span className={`text-[11px] font-semibold ${trendColor}`}>
                      {prefix} {Math.abs(Math.round(trend))}%
                    </span>
                  );
                }
                return null;
              })()}
            </div>
          </div>

          <div className="rounded-xl border border-black/10 bg-white p-4">
            <div className="text-[12px] uppercase tracking-wide text-black/50">
              {t(uiLocale, "dashboard.kpiOpen")}
            </div>
            <div className="mt-2 text-3xl font-bold text-black">{stats.totals.open}</div>
          </div>
        </div>

        {/* KPI Cards - Row 2: TrustScore Stats */}
        {trustScore && (
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-green-200 bg-green-50 p-4">
              <div className="text-[12px] uppercase tracking-wide text-green-700">
                {t(uiLocale, "trustScore.avgScore")}
              </div>
              <div className="mt-2 text-3xl font-bold text-green-800">{trustScore.avgScore}</div>
              {/* Score bar */}
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-black/10">
                <div
                  className={
                    trustScore.avgScore >= 70
                      ? "h-full bg-green-600"
                      : trustScore.avgScore >= 50
                        ? "h-full bg-yellow-600"
                        : "h-full bg-red-600"
                  }
                  style={{ width: `${Math.min(100, Math.max(0, trustScore.avgScore || 0))}%` }}
                  aria-label={`Score: ${trustScore.avgScore}%`}
                />
              </div>
            </div>

            <div className="rounded-xl border border-green-200 bg-green-50 p-4">
              <div className="text-[12px] uppercase tracking-wide text-green-700">
                {t(uiLocale, "trustScore.active")}
              </div>
              <div className="mt-2 text-3xl font-bold text-green-800">{trustScore.counts.active}</div>
            </div>

            <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
              <div className="text-[12px] uppercase tracking-wide text-yellow-700">
                {t(uiLocale, "trustScore.riskyHidden")}
              </div>
              <div className="mt-2 text-3xl font-bold text-yellow-800">{trustScore.counts.riskyHidden}</div>
            </div>

            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <div className="text-[12px] uppercase tracking-wide text-red-700">
                {t(uiLocale, "trustScore.blacklisted")}
              </div>
              <div className="mt-2 text-3xl font-bold text-red-800">{trustScore.counts.blacklisted}</div>
            </div>
          </div>
        )}

        {/* Status Overview, TrustScore Distribution & Recent Activity */}
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {/* Status Overview */}
          <div className="rounded-xl border border-black/10 bg-white p-4">
            <div className="mb-4 text-[14px] font-semibold text-black">
              {t(uiLocale, "dashboard.statusOverview")}
            </div>
            <div className="space-y-3">
              {(() => {
                const total = stats.statusCounts.NEW + stats.statusCounts.IN_REVIEW + 
                              stats.statusCounts.OFFER_SENT + stats.statusCounts.CLOSED;
                const statuses = [
                  { key: "NEW", count: stats.statusCounts.NEW, color: "bg-blue-500" },
                  { key: "IN_REVIEW", count: stats.statusCounts.IN_REVIEW, color: "bg-purple-500" },
                  { key: "OFFER_SENT", count: stats.statusCounts.OFFER_SENT, color: "bg-orange-500" },
                  { key: "CLOSED", count: stats.statusCounts.CLOSED, color: "bg-green-500" }
                ];

                return statuses.map((status) => {
                  const percent = total > 0 ? Math.round((status.count / total) * 100) : 0;
                  return (
                    <div key={status.key}>
                      <div className="mb-1 flex items-center justify-between text-[12px]">
                        <span className="text-black/70">{t(uiLocale, `leadStatus.${status.key}` as CmsUiKey)}</span>
                        <span className="font-semibold text-black">
                          {status.count} <span className="text-black/50">({percent}%)</span>
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-black/5">
                        <div
                          className={`h-full ${status.color}`}
                          style={{ width: `${percent}%` }}
                          aria-label={`${status.key}: ${percent}%`}
                        />
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          {/* TrustScore Distribution */}
          {trustScore && (
            <div className="rounded-xl border border-black/10 bg-white p-4">
              <div className="mb-4 text-[14px] font-semibold text-black">
                {t(uiLocale, "dashboard.trustScoreDistribution")}
              </div>
              {(() => {
                const total = trustScore.counts.active + trustScore.counts.riskyHidden + 
                              trustScore.counts.blacklisted;
                const segments = [
                  { key: "ACTIVE", count: trustScore.counts.active, color: "bg-green-500" },
                  { key: "RISKY_HIDDEN", count: trustScore.counts.riskyHidden, color: "bg-yellow-500" },
                  { key: "BLACKLISTED", count: trustScore.counts.blacklisted, color: "bg-red-500" }
                ];

                return (
                  <>
                    {/* Stacked bar */}
                    <div className="mb-3 flex h-8 w-full overflow-hidden rounded-lg">
                      {total === 0 ? (
                        <div className="flex h-full w-full items-center justify-center bg-black/5 text-[11px] text-black/50">
                          {t(uiLocale, "dashboard.noData")}
                        </div>
                      ) : (
                        segments.map((seg) => {
                          const percent = total > 0 ? (seg.count / total) * 100 : 0;
                          if (percent === 0) return null;
                          return (
                            <div
                              key={seg.key}
                              className={`${seg.color} flex items-center justify-center text-[10px] font-semibold text-white`}
                              style={{ width: `${percent}%` }}
                              aria-label={`${seg.key}: ${Math.round(percent)}%`}
                            >
                              {percent > 10 && Math.round(percent) + "%"}
                            </div>
                          );
                        })
                      )}
                    </div>
                    {/* Legend */}
                    <div className="space-y-2">
                      {segments.map((seg) => {
                        const percent = total > 0 ? Math.round((seg.count / total) * 100) : 0;
                        return (
                          <div key={seg.key} className="flex items-center justify-between text-[12px]">
                            <div className="flex items-center gap-2">
                              <div className={`h-2.5 w-2.5 rounded-full ${seg.color}`} />
                              <span className="text-black/70">
                                {t(uiLocale, `trustScore.status.${seg.key}` as CmsUiKey)}
                              </span>
                            </div>
                            <span className="font-semibold text-black">
                              {seg.count} <span className="text-black/50">({percent}%)</span>
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {/* Recent Activity */}
          <div className="rounded-xl border border-black/10 bg-white p-4">
            <div className="mb-4 text-[14px] font-semibold text-black">
              {t(uiLocale, "dashboard.recentActivity")}
            </div>
            <div className="space-y-2">
              {stats.recentAudits.length === 0 && (
                <div className="rounded-lg border border-black/10 bg-black/5 p-3 text-center text-[12px] text-black/60">
                  {t(uiLocale, "dashboard.noActivity")}
                </div>
              )}
              {stats.recentAudits.slice(0, 8).map((audit) => (
                <div
                  key={audit.id}
                  className="flex items-start gap-2 rounded-lg border border-black/10 px-3 py-2"
                >
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-black/5 text-[14px]">
                    {getAuditIcon(audit.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-medium text-black">
                      {getAuditLabel(audit.action)}
                    </div>
                    <div className="text-[11px] text-black/50 truncate">
                      {t(uiLocale, "dashboard.leadLabel")}: {audit.leadId.substring(0, 8)}...
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right text-[11px] text-black/50">
                    {getRelativeTime(audit.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Risky Leads */}
        {trustScore && trustScore.topRisky.length > 0 && (
          <div className="mt-6 rounded-xl border border-black/10 bg-white p-4">
            <div className="mb-4 text-[14px] font-semibold text-black">
              {t(uiLocale, "trustScore.topRisky")}
            </div>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              {trustScore.topRisky.map((item) => {
                const bgColor =
                  item.trustStatus === "BLACKLISTED"
                    ? "bg-red-50 border-red-200"
                    : "bg-yellow-50 border-yellow-200";
                const textColor =
                  item.trustStatus === "BLACKLISTED" ? "text-red-800" : "text-yellow-800";

                return (
                  <div
                    key={item.leadId}
                    className={`flex items-center justify-between rounded-lg border px-3 py-2 ${bgColor}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className={`text-[12px] font-medium ${textColor} truncate`}>
                        {t(uiLocale, "dashboard.leadLabel")}: {item.leadId.substring(0, 8)}...
                      </div>
                      <div className="text-[11px] text-black/50">
                        {t(uiLocale, `trustScore.status.${item.trustStatus}`)}
                      </div>
                    </div>
                    <div className={`flex-shrink-0 text-[16px] font-bold ${textColor}`}>{item.score}</div>
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
