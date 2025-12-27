"use client";

import { useEffect, useState } from "react";
import { CmsUiKey, t } from "@/lib/cmsI18n";
import { useCmsUiLocale } from "@/lib/useCmsUiLocale";
import { LeadStatus } from "@/lib/leadStatus";
import { maskName } from "@/lib/leadMask";

type LeadListItem = {
  id: string;
  createdAt: string;
  locale: string | null;
  name: string | null;
  patientName: string | null;
  email: string | null;
  phone: string | null;
  status: LeadStatus;
  trustScore: number;
  trustStatus: string;
};

export default function CmsLeadsPage() {
  const { uiLocale } = useCmsUiLocale("de");
  const [leads, setLeads] = useState<LeadListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);

    fetch("/api/cms/leads", { method: "GET" })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Failed");
        }
        const data = await res.json();
        if (active) {
          setLeads(Array.isArray(data.leads) ? data.leads : []);
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

  const getStatusLabel = (status: LeadStatus) =>
    t(uiLocale, `leadStatus.${status}` as CmsUiKey);

  const getTrustBadgeColor = (score: number) => {
    if (score >= 70) return "bg-green-100 text-green-800 border-green-300";
    if (score >= 50) return "bg-yellow-100 text-yellow-800 border-yellow-300";
    return "bg-red-100 text-red-800 border-red-300";
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="border-b border-black/10">
        <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-3 px-6 py-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-black">{t(uiLocale, "leads.title")}</h1>
            <p className="text-[13px] text-black/60">{t(uiLocale, "leads.subtitle")}</p>
          </div>
        </div>
      </div>

      <section className="mx-auto w-full max-w-[1200px] px-6 py-8">
        {loading && (
          <div className="text-[13px] text-black/60">{t(uiLocale, "leads.loading")}</div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-black/10 bg-white p-6 text-center text-[14px] text-black/70">
            {t(uiLocale, "leads.empty")}
          </div>
        )}

        {!loading && !error && leads.length === 0 && (
          <div className="rounded-xl border border-black/10 bg-white p-6 text-center text-[14px] text-black/70">
            {t(uiLocale, "leads.empty")}
          </div>
        )}

        {!loading && !error && leads.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-black/10 bg-white">
            <div className="grid grid-cols-[160px_1.4fr_180px_140px_120px] gap-3 border-b border-black/10 bg-black/5 px-4 py-3 text-[12px] font-semibold uppercase tracking-wide text-black/60">
              <div>{t(uiLocale, "leads.tableDate")}</div>
              <div>{t(uiLocale, "leads.tableName")}</div>
              <div>{t(uiLocale, "trustScore.label")}</div>
              <div>{t(uiLocale, "leads.tableStatus")}</div>
              <div>{t(uiLocale, "leads.tableActions")}</div>
            </div>
            {leads.map((lead) => {
              const displayName = lead.name || lead.patientName || "-";
              return (
                <div
                  key={lead.id}
                  className="grid grid-cols-[160px_1.4fr_180px_140px_120px] gap-3 border-b border-black/5 px-4 py-3 text-[13px] text-black last:border-b-0"
                >
                  <div className="text-[12px] text-black/60">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </div>
                  <div className="font-semibold">
                    {displayName ? maskName(displayName) : "-"}
                  </div>
                  <div>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-semibold ${getTrustBadgeColor(
                        lead.trustScore
                      )}`}
                    >
                      {lead.trustScore} • {t(uiLocale, `trustScore.status.${lead.trustStatus}` as CmsUiKey)}
                    </span>
                  </div>
                  <div className="text-[12px] font-semibold">
                    {getStatusLabel(lead.status)}
                  </div>
                  <div>
                    <a
                      href={`/cms/leads/${lead.id}`}
                      className="rounded-lg border border-black/20 px-3 py-1 text-[12px] font-semibold text-black hover:bg-black/5"
                    >
                      {t(uiLocale, "leads.viewDetails")}
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
