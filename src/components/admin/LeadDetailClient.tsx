"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface TimelineItem {
  id: string;
  type: "status" | "note" | "audit";
  createdAt: string;
  content?: string;
  author?: string;
  action?: string;
  meta?: string;
}

interface LeadDetailClientProps {
  leadId: string;
  leadData: {
    patientName: string;
    country: string;
    contactPreference: string;
    requestedProcedure: string;
    status: string;
    createdAt: string;
    email?: string;
    phone?: string;
  };
}

export default function LeadDetailClient({ leadId, leadData }: LeadDetailClientProps) {
  const router = useRouter();
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [loadingTimeline, setLoadingTimeline] = useState(true);
  const [noteContent, setNoteContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState(leadData.status);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    loadTimeline();
  }, [leadId]);

  const loadTimeline = async () => {
    try {
      setLoadingTimeline(true);
      const response = await fetch(`/api/cms/leads/${leadId}/timeline`);
      if (!response.ok) throw new Error("Failed to load timeline");
      const data = await response.json();
      setTimeline(data.timeline || []);
    } catch (err) {
      console.error("Timeline load error:", err);
    } finally {
      setLoadingTimeline(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim() || submitting) return;

    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch(`/api/cms/leads/${leadId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: noteContent.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add note");
      }

      setNoteContent("");
      await loadTimeline();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add note");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (newStatus === leadData.status || updatingStatus) return;

    setError(null);
    setUpdatingStatus(true);

    try {
      const response = await fetch(`/api/cms/leads/${leadId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update status");
      }

      await loadTimeline();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
      setNewStatus(leadData.status); // Revert
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 32 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <a href="/admin/leads" style={{ fontSize: 14, color: "#2563eb", textDecoration: "none" }}>
          ← Back to Leads
        </a>
        <h1 style={{ fontSize: 28, fontWeight: 600, marginTop: 16, marginBottom: 8 }}>
          Lead Detail
        </h1>
        <p style={{ fontSize: 14, color: "#6b7280" }}>
          Created: {new Date(leadData.createdAt).toLocaleString("en-US")}
        </p>
      </div>

      {/* Core Fields */}
      <div style={{ 
        background: "white", 
        border: "1px solid #e5e7eb", 
        borderRadius: 8, 
        padding: 24, 
        marginBottom: 24 
      }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Patient Information</h2>
        <div style={{ display: "grid", gap: 12, fontSize: 14 }}>
          <div style={{ display: "flex" }}>
            <span style={{ width: 180, color: "#6b7280", fontWeight: 500 }}>Patient Name:</span>
            <span>{leadData.patientName}</span>
          </div>
          <div style={{ display: "flex" }}>
            <span style={{ width: 180, color: "#6b7280", fontWeight: 500 }}>Country:</span>
            <span>{leadData.country}</span>
          </div>
          <div style={{ display: "flex" }}>
            <span style={{ width: 180, color: "#6b7280", fontWeight: 500 }}>Contact Preference:</span>
            <span>{leadData.contactPreference}</span>
          </div>
          {leadData.email && (
            <div style={{ display: "flex" }}>
              <span style={{ width: 180, color: "#6b7280", fontWeight: 500 }}>Email:</span>
              <span>{leadData.email}</span>
            </div>
          )}
          {leadData.phone && (
            <div style={{ display: "flex" }}>
              <span style={{ width: 180, color: "#6b7280", fontWeight: 500 }}>Phone:</span>
              <span>{leadData.phone}</span>
            </div>
          )}
          <div style={{ display: "flex" }}>
            <span style={{ width: 180, color: "#6b7280", fontWeight: 500, alignSelf: "flex-start" }}>
              Requested Procedure:
            </span>
            <span style={{ whiteSpace: "pre-wrap" }}>{leadData.requestedProcedure}</span>
          </div>
        </div>
      </div>

      {/* Status Update */}
      <div style={{ 
        background: "white", 
        border: "1px solid #e5e7eb", 
        borderRadius: 8, 
        padding: 24, 
        marginBottom: 24 
      }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Update Status</h2>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            disabled={updatingStatus}
            style={{
              padding: "8px 12px",
              border: "1px solid #d1d5db",
              borderRadius: 6,
              fontSize: 14,
              flex: 1,
              maxWidth: 300,
            }}
          >
            <option value="NEW">NEW</option>
            <option value="IN_REVIEW">IN_REVIEW</option>
            <option value="OFFER_SENT">OFFER_SENT</option>
            <option value="CLOSED">CLOSED</option>
          </select>
          <button
            onClick={handleUpdateStatus}
            disabled={newStatus === leadData.status || updatingStatus}
            style={{
              padding: "8px 16px",
              background: newStatus === leadData.status ? "#e5e7eb" : "#2563eb",
              color: "white",
              border: "none",
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 500,
              cursor: newStatus === leadData.status ? "not-allowed" : "pointer",
            }}
          >
            {updatingStatus ? "Updating..." : "Update"}
          </button>
        </div>
      </div>

      {/* Add Note */}
      <div style={{ 
        background: "white", 
        border: "1px solid #e5e7eb", 
        borderRadius: 8, 
        padding: 24, 
        marginBottom: 24 
      }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Add Note</h2>
        <form onSubmit={handleAddNote}>
          <textarea
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder="Enter note (2-2000 characters)..."
            disabled={submitting}
            style={{
              width: "100%",
              minHeight: 100,
              padding: 12,
              border: "1px solid #d1d5db",
              borderRadius: 6,
              fontSize: 14,
              fontFamily: "inherit",
              resize: "vertical",
              marginBottom: 12,
            }}
          />
          <button
            type="submit"
            disabled={!noteContent.trim() || submitting}
            style={{
              padding: "8px 16px",
              background: !noteContent.trim() ? "#e5e7eb" : "#2563eb",
              color: "white",
              border: "none",
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 500,
              cursor: !noteContent.trim() ? "not-allowed" : "pointer",
            }}
          >
            {submitting ? "Adding..." : "Add Note"}
          </button>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          background: "#fef2f2",
          border: "1px solid #fecaca",
          borderRadius: 6,
          padding: 12,
          marginBottom: 24,
          fontSize: 14,
          color: "#dc2626",
        }}>
          {error}
        </div>
      )}

      {/* Timeline */}
      <div style={{ 
        background: "white", 
        border: "1px solid #e5e7eb", 
        borderRadius: 8, 
        padding: 24 
      }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Timeline</h2>
        
        {loadingTimeline && (
          <p style={{ fontSize: 14, color: "#6b7280" }}>Loading timeline...</p>
        )}

        {!loadingTimeline && timeline.length === 0 && (
          <p style={{ fontSize: 14, color: "#6b7280" }}>No timeline entries yet.</p>
        )}

        {!loadingTimeline && timeline.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {timeline.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: 16,
                  background: item.type === "note" ? "#f9fafb" : "#fef3c7",
                  border: "1px solid",
                  borderColor: item.type === "note" ? "#e5e7eb" : "#fde68a",
                  borderRadius: 6,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: item.type === "note" ? "#2563eb" : "#d97706",
                    textTransform: "uppercase",
                  }}>
                    {item.type}
                  </span>
                  <span style={{ fontSize: 12, color: "#6b7280" }}>
                    {new Date(item.createdAt).toLocaleString("en-US")}
                  </span>
                </div>

                {item.content && (
                  <p style={{ fontSize: 14, margin: "8px 0", whiteSpace: "pre-wrap" }}>
                    {item.content}
                  </p>
                )}

                {item.action && (
                  <p style={{ fontSize: 14, margin: "8px 0", fontWeight: 500 }}>
                    {item.action}
                  </p>
                )}

                <p style={{ fontSize: 12, color: "#6b7280", marginTop: 8 }}>
                  By: {item.author || "system"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TODO: Phase 2 Features */}
      {/* TODO: Add lead assignment functionality */}
      {/* TODO: Add lead flagging/priority system */}
      {/* TODO: Add lead archiving capability */}
    </div>
  );
}
