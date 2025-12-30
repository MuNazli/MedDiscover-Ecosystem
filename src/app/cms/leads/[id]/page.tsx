"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { CmsUiKey, t } from "@/lib/cmsI18n";
import { useCmsUiLocale } from "@/lib/useCmsUiLocale";
import { isLeadStatus, LEAD_STATUSES, LeadStatus } from "@/lib/leadStatus";
import { maskEmail, maskName, maskPhone } from "@/lib/leadMask";

type LeadNote = {
  id: string;
  content: string;
  createdAt: string;
  author?: string | null;
};

type LeadAudit = {
  id: string;
  action: string;
  createdAt: string;
  actor?: string | null;
  meta?: string | null;
};

type LeadDetail = {
  id: string;
  createdAt: string;
  locale: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  patientName: string | null;
  status: LeadStatus;
  trustScore: number;
  trustStatus: string;
  scoreOverride: number | null;
  overrideReason: string | null;
  overrideBy: string | null;
  overrideAt: string | null;
  notes: LeadNote[];
  audits: LeadAudit[];
};

export default function CmsLeadDetailPage() {
  const params = useParams<{ id: string }>();
  const leadId = params?.id;
  const { uiLocale } = useCmsUiLocale("de");

  const [lead, setLead] = useState<LeadDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [noteError, setNoteError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [overrideScore, setOverrideScore] = useState<string>("");
  const [overrideReason, setOverrideReason] = useState<string>("");
  const [savingOverride, setSavingOverride] = useState(false);
  const [recalculating, setRecalculating] = useState(false);
  const [auditFilter, setAuditFilter] = useState<"all" | "status" | "notes">("all");
  const [visibleAudits, setVisibleAudits] = useState(6);

  const getStatusLabel = (status: LeadStatus) =>
    t(uiLocale, `leadStatus.${status}` as CmsUiKey);

  const parseAuditStatus = (meta?: string | null) => {
    if (!meta) return null;
    try {
      const parsed = JSON.parse(meta) as { status?: string };
      return parsed.status && isLeadStatus(parsed.status) ? parsed.status : null;
    } catch {
      return null;
    }
  };

  const getAuditLabel = (action: string) => {
    const key = `leadAudit.${action}` as CmsUiKey;
    return t(uiLocale, key) || action;
  };

  const auditEvents = useMemo(() => {
    if (!lead) return [];
    const baseEvents = lead.audits.map((audit) => ({
      id: audit.id,
      action: audit.action,
      createdAt: audit.createdAt,
      actor: audit.actor || "system",
      meta: audit.meta ?? null,
      kind:
        audit.action === "STATUS_CHANGED"
          ? "status"
          : audit.action === "NOTE_ADDED"
            ? "note"
            : "audit",
    }));

    baseEvents.push({
      id: `lead-created-${lead.id}`,
      action: "LEAD_CREATED",
      createdAt: lead.createdAt,
      actor: "system",
      meta: null,
      kind: "audit",
    });

    return baseEvents.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [lead]);

  const filteredAudits = useMemo(() => {
    if (auditFilter === "status") {
      return auditEvents.filter((event) => event.kind === "status");
    }
    if (auditFilter === "notes") {
      return auditEvents.filter((event) => event.kind === "note");
    }
    return auditEvents;
  }, [auditEvents, auditFilter]);

  useEffect(() => {
    setVisibleAudits(6);
  }, [auditFilter, lead?.id]);

  useEffect(() => {
    if (!leadId) return;
    let active = true;
    setLoading(true);
    setError(false);

    fetch(`/api/cms/leads/${leadId}`, { method: "GET" })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Failed");
        }
        const data = await res.json();
        if (active) {
          setLead(data.lead);
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
  }, [leadId]);

  const displayName = useMemo(() => {
    if (!lead) return "-";
    const nameValue = lead.name || lead.patientName || "";
    return nameValue ? maskName(nameValue) : "-";
  }, [lead]);

  const displayEmail = useMemo(() => {
    if (!lead?.email) return "-";
    return maskEmail(lead.email);
  }, [lead]);

  const displayPhone = useMemo(() => {
    if (!lead?.phone) return "-";
    return maskPhone(lead.phone);
  }, [lead]);

  const handleRecalcScore = async () => {
    if (!lead) return;
    setRecalculating(true);
    try {
      const response = await fetch(`/api/cms/leads/${lead.id}/trustscore/recalc`, {
        method: "POST",
      });
      if (!response.ok) {
        const data = await response.json();
        alert(data.error || "Failed to recalculate");
        return;
      }
      const data = await response.json();
      setLead((prev) =>
        prev
          ? {
              ...prev,
              trustScore: data.scoreAfter,
              trustStatus: data.status,
            }
          : prev
      );
    } finally {
      setRecalculating(false);
    }
  };

  const handleSaveOverride = async () => {
    if (!lead) return;

    const trimmedReason = overrideReason.trim();
    const scoreValue = overrideScore.trim() === "" ? null : parseInt(overrideScore);

    // Validation
    if (scoreValue !== null) {
      if (isNaN(scoreValue) || scoreValue < 0 || scoreValue > 100) {
        alert("Score must be between 0 and 100");
        return;
      }
    }

    setSavingOverride(true);
    try {
      const response = await fetch(`/api/cms/leads/${lead.id}/trustscore/override`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scoreOverride: scoreValue,
          reason: trimmedReason || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || "Failed to update override");
        return;
      }

      const data = await response.json();
      // Refresh lead data
      const refreshRes = await fetch(`/api/cms/leads/${lead.id}`, { method: "GET" });
      const refreshData = await refreshRes.json();
      setLead(refreshData.lead);
      setOverrideScore("");
      setOverrideReason("");
    } finally {
      setSavingOverride(false);
    }
  };

  const handleClearOverride = async () => {
    if (!lead) return;
    setOverrideScore("");
    setOverrideReason("");
    setSavingOverride(true);
    try {
      const response = await fetch(`/api/cms/leads/${lead.id}/trustscore/override`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scoreOverride: null }),
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || "Failed to clear override");
        return;
      }

      // Refresh lead data
      const refreshRes = await fetch(`/api/cms/leads/${lead.id}`, { method: "GET" });
      const refreshData = await refreshRes.json();
      setLead(refreshData.lead);
    } finally {
      setSavingOverride(false);
    }
  };

  const handleStatusChange = async (nextStatus: LeadStatus) => {
    if (!lead || lead.status === nextStatus) {
      return;
    }
    setUpdatingStatus(true);
    try {
      const response = await fetch(`/api/cms/leads/${lead.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!response.ok) {
        throw new Error("Failed");
      }
      const data = await response.json();
      setLead((prev) => (prev ? { ...prev, status: data.lead.status } : prev));
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddNote = async () => {
    const trimmed = noteText.trim();
    if (!trimmed) {
      setNoteError(t(uiLocale, "leads.notesEmpty"));
      return;
    }
    if (trimmed.length < 2) {
      setNoteError(t(uiLocale, "leads.notesTooShort"));
      return;
    }
    if (trimmed.length > 2000) {
      setNoteError(t(uiLocale, "leads.notesTooLong"));
      return;
    }

    if (!lead) return;

    setSavingNote(true);
    setNoteError(null);
    try {
      const response = await fetch(`/api/cms/leads/${lead.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed }),
      });
      if (!response.ok) {
        throw new Error("Failed");
      }
      const data = await response.json();
      setLead(data.lead);
      setNoteText("");
    } finally {
      setSavingNote(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-white px-6 py-8 text-[13px] text-black/60">
        {t(uiLocale, "leads.loading")}
      </main>
    );
  }

  if (error || !lead) {
    return (
      <main className="min-h-screen bg-white px-6 py-8 text-[13px] text-black/60">
        {t(uiLocale, "leads.empty")}
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="border-b border-black/10">
        <div className="mx-auto flex w-full max-w-[1000px] flex-col gap-2 px-6 py-6">
          <h1 className="text-2xl font-semibold text-black">{t(uiLocale, "leads.detailTitle")}</h1>
          <p className="text-[13px] text-black/60">{t(uiLocale, "leads.detailInfo")}</p>
        </div>
      </div>

      <section className="mx-auto w-full max-w-[1000px] px-6 py-8">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-black/10 bg-white p-4">
            <div className="text-[12px] uppercase tracking-wide text-black/50">{t(uiLocale, "leads.detailInfo")}</div>
            <div className="mt-3 grid gap-2 text-[13px] text-black">
              <div><span className="text-black/50">{t(uiLocale, "leads.fieldId")}:</span> {lead.id}</div>
              <div><span className="text-black/50">{t(uiLocale, "leads.fieldCreatedAt")}:</span> {new Date(lead.createdAt).toLocaleString()}</div>
              <div><span className="text-black/50">{t(uiLocale, "leads.fieldLocale")}:</span> {lead.locale || "-"}</div>
              <div><span className="text-black/50">{t(uiLocale, "leads.fieldName")}:</span> {displayName}</div>
              <div><span className="text-black/50">{t(uiLocale, "leads.fieldEmail")}:</span> {displayEmail}</div>
              <div><span className="text-black/50">{t(uiLocale, "leads.fieldPhone")}:</span> {displayPhone}</div>
            </div>
          </div>

          <div className="rounded-xl border border-black/10 bg-white p-4">
            <div className="text-[12px] uppercase tracking-wide text-black/50">{t(uiLocale, "leads.statusLabel")}</div>
            <div className="mt-3 grid gap-3">
              <select
                value={lead.status}
                onChange={(event) => handleStatusChange(event.target.value as LeadStatus)}
                disabled={updatingStatus}
                className="h-10 rounded-lg border border-black/20 px-3 text-[13px] text-black focus:border-black focus:outline-none"
              >
                {LEAD_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {getStatusLabel(status)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-black/10 bg-white p-4">
          <div className="text-[12px] uppercase tracking-wide text-black/50">{t(uiLocale, "trustScore.panelTitle")}</div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-black/10 bg-black/5 p-3">
              <div className="text-[11px] uppercase text-black/50">{t(uiLocale, "trustScore.finalScore")}</div>
              <div className="mt-1 text-2xl font-bold text-black">{lead.trustScore}</div>
              <div className="mt-1 text-[11px] text-black/60">
                {t(uiLocale, `trustScore.status.${lead.trustStatus}` as CmsUiKey)}
                {lead.scoreOverride !== null && (
                  <span className="ml-2 rounded bg-yellow-200 px-1.5 py-0.5 text-[10px] font-semibold text-yellow-800">
                    {t(uiLocale, "trustScore.overrideActive")}
                  </span>
                )}
              </div>
            </div>

            {lead.scoreOverride !== null && (
              <div className="rounded-lg border border-black/10 bg-black/5 p-3">
                <div className="text-[11px] uppercase text-black/50">{t(uiLocale, "trustScore.overrideInfo")}</div>
                <div className="mt-2 text-[12px] text-black/80">
                  <div><strong>{t(uiLocale, "trustScore.overrideScore")}:</strong> {lead.scoreOverride}</div>
                  {lead.overrideReason && (
                    <div className="mt-1"><strong>{t(uiLocale, "trustScore.overrideReason")}:</strong> {lead.overrideReason}</div>
                  )}
                  {lead.overrideAt && (
                    <div className="mt-1 text-[11px] text-black/50">
                      {new Date(lead.overrideAt).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 border-t border-black/10 pt-4">
            <div className="text-[13px] font-semibold text-black">{t(uiLocale, "trustScore.manageOverride")}</div>
            <div className="mt-3 grid gap-3">
              <div>
                <label className="text-[12px] text-black/70">{t(uiLocale, "trustScore.overrideScoreLabel")}</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={overrideScore}
                  onChange={(e) => setOverrideScore(e.target.value)}
                  placeholder="0-100"
                  className="mt-1 w-full rounded-lg border border-black/20 px-3 py-2 text-[13px] text-black focus:border-black focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[12px] text-black/70">{t(uiLocale, "trustScore.overrideReasonLabel")}</label>
                <textarea
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  rows={2}
                  maxLength={200}
                  placeholder={t(uiLocale, "trustScore.overrideReasonPlaceholder")}
                  className="mt-1 w-full rounded-lg border border-black/20 px-3 py-2 text-[13px] text-black focus:border-black focus:outline-none"
                />
                <div className="mt-1 text-[11px] text-black/50">{overrideReason.length}/200</div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSaveOverride}
                  disabled={savingOverride}
                  className="rounded-lg border border-black/20 bg-black px-4 py-2 text-[12px] font-semibold text-white hover:bg-black/80 disabled:opacity-60"
                >
                  {t(uiLocale, "trustScore.saveOverride")}
                </button>
                {lead.scoreOverride !== null && (
                  <button
                    type="button"
                    onClick={handleClearOverride}
                    disabled={savingOverride}
                    className="rounded-lg border border-black/20 px-4 py-2 text-[12px] font-semibold text-black hover:bg-black/5 disabled:opacity-60"
                  >
                    {t(uiLocale, "trustScore.clearOverride")}
                  </button>
                )}
                {lead.scoreOverride === null && (
                  <button
                    type="button"
                    onClick={handleRecalcScore}
                    disabled={recalculating}
                    className="rounded-lg border border-black/20 px-4 py-2 text-[12px] font-semibold text-black hover:bg-black/5 disabled:opacity-60"
                  >
                    {t(uiLocale, "trustScore.recalculate")}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-black/10 bg-white p-4">
          <div className="flex flex-col gap-1">
            <div className="text-[12px] uppercase tracking-wide text-black/50">{t(uiLocale, "leads.notesTitle")}</div>
            <div className="text-[12px] text-black/60">{t(uiLocale, "leads.notesHelper")}</div>
          </div>

          <div className="mt-3 space-y-2">
            <textarea
              value={noteText}
              onChange={(event) => {
                setNoteText(event.target.value);
                if (noteError) setNoteError(null);
              }}
              rows={3}
              placeholder={t(uiLocale, "leads.notesPlaceholder")}
              className="w-full rounded-lg border border-black/20 p-3 text-[13px] text-black focus:border-black focus:outline-none"
            />
            <div className="flex items-center justify-between text-[12px] text-black/50">
              <span>{noteText.trim().length}/2000</span>
              <button
                type="button"
                onClick={handleAddNote}
                disabled={savingNote}
                className="rounded-lg border border-black/20 px-3 py-1 text-[12px] font-semibold text-black hover:bg-black/5 disabled:opacity-60"
              >
                {t(uiLocale, "leads.notesAdd")}
              </button>
            </div>
            {noteError && <div className="text-[12px] text-red-600">{noteError}</div>}
          </div>

          <div className="mt-4 space-y-3">
            {lead.notes.length === 0 && (
              <div className="rounded-lg border border-black/10 bg-black/5 p-3 text-[12px] text-black/60">
                {t(uiLocale, "leads.notesNone")}
              </div>
            )}
            {lead.notes.map((note) => (
              <div key={note.id} className="rounded-lg border border-black/10 p-3">
                <div className="flex items-center justify-between text-[12px] text-black/50">
                  <span>{new Date(note.createdAt).toLocaleString()}</span>
                  <span>{note.author || "admin"}</span>
                </div>
                <p className="mt-2 whitespace-pre-line text-[13px] text-black/80">{note.content}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-black/10 bg-white p-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="text-[12px] uppercase tracking-wide text-black/50">
              {t(uiLocale, "leads.auditTitle")}
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              {[
                { id: "all", label: t(uiLocale, "leads.auditFilterAll") },
                { id: "status", label: t(uiLocale, "leads.auditFilterStatus") },
                { id: "notes", label: t(uiLocale, "leads.auditFilterNotes") },
              ].map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setAuditFilter(option.id as "all" | "status" | "notes")}
                  className={`rounded-full border px-3 py-1 ${
                    auditFilter === option.id
                      ? "border-black bg-black text-white"
                      : "border-black/20 text-black/60 hover:bg-black/5"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3 space-y-2">
            {filteredAudits.length === 0 && (
              <div className="rounded-lg border border-black/10 bg-black/5 p-3 text-[12px] text-black/60">
                {t(uiLocale, "leads.auditNone")}
              </div>
            )}

            {filteredAudits.slice(0, visibleAudits).map((audit) => {
              const status = audit.action === "STATUS_CHANGED" ? parseAuditStatus(audit.meta) : null;
              const details = status
                ? `${t(uiLocale, "leads.statusLabel")}: ${getStatusLabel(status)}`
                : null;

              return (
                <div key={audit.id} className="rounded-lg border border-black/10 p-3">
                  <div className="flex items-center justify-between text-[12px] text-black">
                    <span className="font-semibold">{getAuditLabel(audit.action)}</span>
                    <span className="text-[11px] text-black/50">
                      {new Date(audit.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-2 space-y-1 text-[11px] text-black/60">
                    <div className="flex items-center justify-between">
                      <span>{t(uiLocale, "leadAudit.eventBy")}</span>
                      <span>{audit.actor}</span>
                    </div>
                    {details && (
                      <div className="flex items-center justify-between">
                        <span>{t(uiLocale, "leadAudit.eventDetails")}</span>
                        <span>{details}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredAudits.length > visibleAudits && (
            <div className="mt-3 flex justify-center">
              <button
                type="button"
                onClick={() => setVisibleAudits((prev) => prev + 6)}
                className="rounded-lg border border-black/20 px-3 py-1 text-[12px] text-black hover:bg-black/5"
              >
                {t(uiLocale, "leads.auditLoadMore")}
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
