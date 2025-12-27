"use client";

import { useState, FormEvent } from "react";

type FieldErrors = Record<string, string[] | undefined>;

const COUNTRIES = [
  { value: "DE", label: "Almanya" },
  { value: "TR", label: "Türkiye" },
  { value: "NL", label: "Hollanda" },
  { value: "AT", label: "Avusturya" },
  { value: "CH", label: "İsviçre" },
];

const CONTACT_PREFERENCES = [
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "PHONE", label: "Telefon" },
  { value: "EMAIL", label: "E-posta" },
];

export default function LeadFormPage() {
  const [patientName, setPatientName] = useState("");
  const [country, setCountry] = useState("");
  const [contactPreference, setContactPreference] = useState("");
  const [requestedProcedure, setRequestedProcedure] = useState("");
  const [gdprConsent, setGdprConsent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [gdprError, setGdprError] = useState("");

  const resetForm = () => {
    setPatientName("");
    setCountry("");
    setContactPreference("");
    setRequestedProcedure("");
    setGdprConsent(false);
    setFieldErrors({});
    setGdprError("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setGdprError("");

    // GDPR check
    if (!gdprConsent) {
      setGdprError("GDPR onayı zorunludur.");
      return;
    }

    setLoading(true);
    setSuccess(false);
    setLeadId(null);

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientName,
          country,
          contactPreference,
          requestedProcedure,
          gdprConsent,
        }),
      });

      if (res.status === 201) {
        const data = await res.json();
        setSuccess(true);
        setLeadId(data.id);
        resetForm();
      } else if (res.status === 400) {
        const data = await res.json();
        if (data.fieldErrors) {
          setFieldErrors(data.fieldErrors);
        }
      } else {
        setFieldErrors({ _form: ["Bir hata oluştu. Lütfen tekrar deneyin."] });
      }
    } catch {
      setFieldErrors({ _form: ["Bağlantı hatası. Lütfen tekrar deneyin."] });
    } finally {
      setLoading(false);
    }
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

  const fieldWrapperStyle: React.CSSProperties = {
    marginBottom: 16,
  };

  const errorStyle: React.CSSProperties = {
    color: "#dc2626",
    fontSize: 13,
    marginTop: 4,
  };

  return (
    <main style={{ padding: 32, maxWidth: 500, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 24 }}>Lead Başvuru Formu</h1>

      {success && (
        <div
          style={{
            padding: 16,
            backgroundColor: "#d1fae5",
            border: "1px solid #10b981",
            borderRadius: 4,
            marginBottom: 24,
            color: "#065f46",
          }}
        >
          <p style={{ marginBottom: 12 }}>
            ✓ Başvurunuz alındı. En kısa sürede sizinle iletişime geçeceğiz.
          </p>
          {leadId && (
            <a
              href={`/lead/${leadId}/chat`}
              style={{
                display: "inline-block",
                padding: "8px 16px",
                backgroundColor: "#059669",
                color: "#fff",
                borderRadius: 4,
                textDecoration: "none",
                fontSize: 14,
              }}
            >
              Mesajlaşmaya Geç →
            </a>
          )}
        </div>
      )}

      {fieldErrors._form && (
        <div
          style={{
            padding: 16,
            backgroundColor: "#fee2e2",
            border: "1px solid #dc2626",
            borderRadius: 4,
            marginBottom: 24,
            color: "#991b1b",
          }}
        >
          {fieldErrors._form[0]}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Patient Name */}
        <div style={fieldWrapperStyle}>
          <label style={labelStyle} htmlFor="patientName">
            Hasta Adı *
          </label>
          <input
            id="patientName"
            type="text"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            style={inputStyle}
            required
          />
          {fieldErrors.patientName && (
            <div style={errorStyle}>{fieldErrors.patientName[0]}</div>
          )}
        </div>

        {/* Country */}
        <div style={fieldWrapperStyle}>
          <label style={labelStyle} htmlFor="country">
            Ülke *
          </label>
          <select
            id="country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            style={inputStyle}
            required
          >
            <option value="">Seçiniz...</option>
            {COUNTRIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          {fieldErrors.country && (
            <div style={errorStyle}>{fieldErrors.country[0]}</div>
          )}
        </div>

        {/* Contact Preference */}
        <div style={fieldWrapperStyle}>
          <label style={labelStyle}>İletişim Tercihi *</label>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {CONTACT_PREFERENCES.map((cp) => (
              <label
                key={cp.value}
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <input
                  type="radio"
                  name="contactPreference"
                  value={cp.value}
                  checked={contactPreference === cp.value}
                  onChange={(e) => setContactPreference(e.target.value)}
                  required
                />
                {cp.label}
              </label>
            ))}
          </div>
          {fieldErrors.contactPreference && (
            <div style={errorStyle}>{fieldErrors.contactPreference[0]}</div>
          )}
        </div>

        {/* Requested Procedure */}
        <div style={fieldWrapperStyle}>
          <label style={labelStyle} htmlFor="requestedProcedure">
            Talep Edilen İşlem *
          </label>
          <textarea
            id="requestedProcedure"
            value={requestedProcedure}
            onChange={(e) => setRequestedProcedure(e.target.value)}
            style={{ ...inputStyle, minHeight: 100, resize: "vertical" }}
            required
          />
          {fieldErrors.requestedProcedure && (
            <div style={errorStyle}>{fieldErrors.requestedProcedure[0]}</div>
          )}
        </div>

        {/* GDPR Consent */}
        <div style={fieldWrapperStyle}>
          <label style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            <input
              type="checkbox"
              checked={gdprConsent}
              onChange={(e) => setGdprConsent(e.target.checked)}
              style={{ marginTop: 4 }}
            />
            <span style={{ fontSize: 13 }}>
              Kişisel verilerimin işlenmesini ve GDPR/KVKK kapsamında
              saklanmasını kabul ediyorum. *
            </span>
          </label>
          {gdprError && <div style={errorStyle}>{gdprError}</div>}
          {fieldErrors.gdprConsent && (
            <div style={errorStyle}>{fieldErrors.gdprConsent[0]}</div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px 24px",
            backgroundColor: loading ? "#9ca3af" : "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            fontSize: 16,
            fontWeight: 500,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Gönderiliyor…" : "Başvuru Gönder"}
        </button>
      </form>

      <p style={{ marginTop: 24, fontSize: 13, color: "#6b7280" }}>
        <a href="/" style={{ color: "#2563eb" }}>
          ← Ana Sayfaya Dön
        </a>
      </p>
    </main>
  );
}
