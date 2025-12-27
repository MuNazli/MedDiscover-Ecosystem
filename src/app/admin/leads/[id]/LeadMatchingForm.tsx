"use client";

import { useState, useTransition } from "react";
import { updateLeadMatching, UpdateMatchingResult } from "./matching-actions";

interface Clinic {
  id: string;
  name: string;
  country: string;
}

interface Treatment {
  id: string;
  name: string;
}

interface Props {
  leadId: string;
  clinics: Clinic[];
  treatments: Treatment[];
  currentClinicId: string | null;
  currentTreatmentId: string | null;
}

export default function LeadMatchingForm({
  leadId,
  clinics,
  treatments,
  currentClinicId,
  currentTreatmentId,
}: Props) {
  const [clinicId, setClinicId] = useState(currentClinicId || "");
  const [treatmentId, setTreatmentId] = useState(currentTreatmentId || "");
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<UpdateMatchingResult | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);

    const formData = new FormData();
    formData.set("clinicId", clinicId);
    formData.set("treatmentId", treatmentId);

    startTransition(async () => {
      const res = await updateLeadMatching(leadId, formData);
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
          ✓ Eşleştirme kaydedildi
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
        <label style={labelStyle} htmlFor="clinicId">
          Klinik
        </label>
        <select
          id="clinicId"
          value={clinicId}
          onChange={(e) => setClinicId(e.target.value)}
          style={inputStyle}
        >
          <option value="">Seçilmedi</option>
          {clinics.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.country})
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle} htmlFor="treatmentId">
          Tedavi
        </label>
        <select
          id="treatmentId"
          value={treatmentId}
          onChange={(e) => setTreatmentId(e.target.value)}
          style={inputStyle}
        >
          <option value="">Seçilmedi</option>
          {treatments.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={isPending}
        style={{
          padding: "10px 20px",
          backgroundColor: isPending ? "#9ca3af" : "#059669",
          color: "#fff",
          border: "none",
          borderRadius: 4,
          fontSize: 14,
          fontWeight: 500,
          cursor: isPending ? "not-allowed" : "pointer",
        }}
      >
        {isPending ? "Kaydediliyor…" : "Eşleştirmeyi Kaydet"}
      </button>
    </form>
  );
}
