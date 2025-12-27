"use client";

import { useEffect, useMemo, useState } from "react";
import LeadDetailModal, { Lead, LeadStatus } from "@/components/admin/LeadDetailModal";
import { LEAD_STATUSES } from "@/lib/leadStatus";

type StatusFilter = "ALL" | LeadStatus;

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const loadLeads = async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await fetch("/api/leads", { method: "GET" });
      if (!response.ok) {
        throw new Error("Failed to load");
      }
      const data = await response.json();
      setLeads(Array.isArray(data.leads) ? data.leads : []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const filteredLeads = useMemo(() => {
    const query = search.trim().toLowerCase();
    return leads
      .filter((lead) => {
        if (statusFilter !== "ALL" && lead.status !== statusFilter) {
          return false;
        }
        if (!query) return true;
        return (
          lead.fullName.toLowerCase().includes(query) ||
          lead.email.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [leads, search, statusFilter]);

  const openLead = (lead: Lead) => {
    setSelectedLead(lead);
    setUpdateError(null);
    setModalOpen(true);
  };

  const closeLead = () => {
    setModalOpen(false);
    setSelectedLead(null);
    setUpdateError(null);
  };

  const handleStatusUpdate = async (id: string, status: LeadStatus) => {
    const current = leads.find((lead) => lead.id === id);
    if (!current || current.status === status) {
      return;
    }

    setUpdatingStatus(true);
    setUpdateError(null);
    try {
      const response = await fetch("/api/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });

      if (!response.ok) {
        throw new Error("Update failed");
      }

      setLeads((prev) =>
        prev.map((lead) => (lead.id === id ? { ...lead, status } : lead))
      );
      setSelectedLead((prev) => (prev && prev.id === id ? { ...prev, status } : prev));
    } catch {
      setUpdateError("Update failed");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddNote = async (id: string, text: string) => {
    setUpdatingStatus(true);
    setUpdateError(null);
    try {
      const response = await fetch("/api/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, noteText: text }),
      });
      if (!response.ok) {
        throw new Error("Update failed");
      }
      const data = await response.json();
      if (data?.lead) {
        setLeads((prev) => prev.map((lead) => (lead.id === id ? data.lead : lead)));
        setSelectedLead((prev) => (prev && prev.id === id ? data.lead : prev));
      }
    } catch {
      setUpdateError("Update failed");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDeleteNote = async (id: string, noteId: string) => {
    setUpdatingStatus(true);
    setUpdateError(null);
    try {
      const response = await fetch("/api/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, deleteNoteId: noteId }),
      });
      if (!response.ok) {
        throw new Error("Update failed");
      }
      const data = await response.json();
      if (data?.lead) {
        setLeads((prev) => prev.map((lead) => (lead.id === id ? data.lead : lead)));
        setSelectedLead((prev) => (prev && prev.id === id ? data.lead : prev));
      }
    } catch {
      setUpdateError("Update failed");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="border-b border-black/10">
        <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-3 px-6 py-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-black">Leads Inbox</h1>
            <p className="text-[13px] text-black/60">Manage inbound lead requests</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name or email"
              className="h-10 w-[220px] rounded-lg border border-black/20 px-3 text-[13px] text-black focus:border-black focus:outline-none"
            />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
              className="h-10 rounded-lg border border-black/20 px-3 text-[13px] text-black focus:border-black focus:outline-none"
            >
              <option value="ALL">All statuses</option>
              {LEAD_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={resetFilters}
              className="h-10 rounded-lg border border-black/20 px-3 text-[13px] font-semibold text-black hover:bg-black/5"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <section className="mx-auto w-full max-w-[1200px] px-6 py-8">
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-12 rounded-lg border border-black/10 bg-black/5 animate-pulse" />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-black/10 bg-white p-6 text-center">
            <div className="text-[14px] font-semibold text-black">Failed to load leads</div>
            <button
              type="button"
              onClick={loadLeads}
              className="mt-4 rounded-lg border border-black/20 px-4 py-2 text-[13px] font-semibold text-black hover:bg-black/5"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && filteredLeads.length === 0 && (
          <div className="rounded-xl border border-black/10 bg-white p-6 text-center text-[14px] text-black/70">
            No leads yet
          </div>
        )}

        {!loading && !error && filteredLeads.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-black/10 bg-white">
            <div className="grid grid-cols-[140px_1.2fr_1.2fr_1.5fr_120px_120px] gap-3 border-b border-black/10 bg-black/5 px-4 py-3 text-[12px] font-semibold uppercase tracking-wide text-black/60">
              <div>Date</div>
              <div>Name</div>
              <div>Email</div>
              <div>Package</div>
              <div>Status</div>
              <div>Actions</div>
            </div>
            {filteredLeads.map((lead) => (
              <div
                key={lead.id}
                className="grid cursor-pointer grid-cols-[140px_1.2fr_1.2fr_1.5fr_120px_120px] gap-3 border-b border-black/5 px-4 py-3 text-[13px] text-black last:border-b-0 hover:bg-black/5"
                onClick={() => openLead(lead)}
              >
                <div className="text-[12px] text-black/60">
                  {new Date(lead.createdAt).toLocaleDateString()}
                </div>
                <div className="font-semibold">{lead.fullName}</div>
                <div>{lead.email}</div>
                <div className="truncate">{lead.packageTitle}</div>
                <div className="text-[12px] font-semibold">{lead.status}</div>
                <div>
                  <button
                    type="button"
                    className="rounded-lg border border-black/20 px-3 py-1 text-[12px] font-semibold text-black hover:bg-black/5"
                    onClick={(event) => {
                      event.stopPropagation();
                      openLead(lead);
                    }}
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <LeadDetailModal
        open={modalOpen}
        lead={selectedLead}
        onClose={closeLead}
        onUpdateStatus={handleStatusUpdate}
        onAddNote={handleAddNote}
        onDeleteNote={handleDeleteNote}
        updatingStatus={updatingStatus}
        updateError={updateError}
      />
    </main>
  );
}
