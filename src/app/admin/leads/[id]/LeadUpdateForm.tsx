"use client";

import { useState, useTransition } from "react";
import { updateLead, UpdateLeadResult } from "./actions";
import { LEAD_STATUSES } from "@/lib/leadStatus";

const STATUS_LABELS: Record<(typeof LEAD_STATUSES)[number], string> = {
  NEW: "Yeni",
  IN_REVIEW: "İnceleniyor",
  OFFER_SENT: "Teklif Gönderildi",
  CLOSED: "Kapatıldı",
};

interface Props {
  leadId: string;
  currentStatus: string;
  currentNotes: string;
}

export default function LeadUpdateForm({ leadId, currentStatus, currentNotes }: Props) {
  const [status, setStatus] = useState(currentStatus);
  const [notes, setNotes] = useState(currentNotes);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<UpdateLeadResult | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);

    const formData = new FormData();
    formData.set("status", status);
    formData.set("notes", notes);

    startTransition(async () => {
      const res = await updateLead(leadId, formData);
      setResult(res);
    });
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "8px 12px",
    border: "1px solid #ccc",
    borderRadius: 4,
    fontSize: 14,
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    marginBottom: 4,
    fontWeight: 500,
  };

  return (
    <form onSubmit={handleSubmit}>
      {result?.success && (
        <div
          style={{
            padding: 12,
            backgroundColor: "#d1fae5",
            border: "1px solid #10b981",
            borderRadius: 4,
            marginBottom: 16,
            color: "#065f46",
            fontSize: 14,
          }}
        >
          ✓ Kaydedildi
        </div>
      )}

      {result?.error && !result.success && (
        <div
          style={{
            padding: 12,
            backgroundColor: "#fee2e2",
            border: "1px solid #dc2626",
            borderRadius: 4,
            marginBottom: 16,
            color: "#991b1b",
            fontSize: 14,
          }}
        >
          {result.error}
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle} htmlFor="status">
          Durum
        </label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={inputStyle}
        >
          {LEAD_STATUSES.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </select>
        {result?.fieldErrors?.status && (
          <div style={{ color: "#dc2626", fontSize: 13, marginTop: 4 }}>
            {result.fieldErrors.status[0]}
          </div>
        )}
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle} htmlFor="notes">
          Notlar
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
          placeholder="İsteğe bağlı notlar..."
        />
        {result?.fieldErrors?.notes && (
          <div style={{ color: "#dc2626", fontSize: 13, marginTop: 4 }}>
            {result.fieldErrors.notes[0]}
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        style={{
          padding: "10px 20px",
          backgroundColor: isPending ? "#9ca3af" : "#2563eb",
          color: "#fff",
          border: "none",
          borderRadius: 4,
          fontSize: 14,
          fontWeight: 500,
          cursor: isPending ? "not-allowed" : "pointer",
        }}
      >
        {isPending ? "Kaydediliyor…" : "Kaydet"}
      </button>
    </form>
  );
}
