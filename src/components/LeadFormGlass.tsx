"use client";

import { useState, FormEvent } from "react";
import { Locale, Messages } from "@/lib/i18n";

interface LeadFormGlassProps {
  locale: Locale;
  messages: Messages;
}

export default function LeadFormGlass({ locale, messages }: LeadFormGlassProps) {
  const { form, trust, nav } = messages;

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [language, setLanguage] = useState("");
  const [treatment, setTreatment] = useState("");
  const [notes, setNotes] = useState("");
  const [consent, setConsent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!consent) {
      setError(form.errorConsent);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientName: fullName,
          country: language,
          contactPreference: "EMAIL",
          requestedProcedure: `${treatment}${notes ? ` - ${notes}` : ""}`,
          gdprConsent: consent,
        }),
      });

      if (res.status === 201) {
        setSuccess(true);
      } else {
        const data = await res.json();
        setError(data.error || form.errorGeneric);
      }
    } catch {
      setError(form.errorConnection);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="glass-strong form-widget" style={{ maxWidth: 480 }}>
        <div className="success-box">
          <div className="success-icon">✓</div>
          <h2>{form.successTitle}</h2>
          <p>{form.successMessage}</p>
          <a href={`/${locale}`} className="btn-outline">{nav.backHome}</a>
        </div>
      </div>
    );
  }

  return (
    <div className="lead-form-layout">
      {/* Main Form Widget */}
      <div className="glass-strong form-widget lead-form-widget">
        <h2>{form.title}</h2>
        <p className="subtitle">{form.subtitle}</p>

        <form onSubmit={handleSubmit}>
          {error && <div className="error-box">{error}</div>}

          <div className="form-group">
            <label className="label-glass" htmlFor="fullName">{form.fullName} *</label>
            <input
              id="fullName"
              type="text"
              className="input-glass"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={form.fullNamePlaceholder}
              required
            />
          </div>

          <div className="form-group">
            <label className="label-glass" htmlFor="email">{form.email} *</label>
            <input
              id="email"
              type="email"
              className="input-glass"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={form.emailPlaceholder}
              required
            />
          </div>

          <div className="form-group">
            <label className="label-glass" htmlFor="phone">{form.phone}</label>
            <input
              id="phone"
              type="tel"
              className="input-glass"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={form.phonePlaceholder}
            />
          </div>

          <div className="form-row form-group">
            <div>
              <label className="label-glass" htmlFor="language">{form.language} *</label>
              <select
                id="language"
                className="select-glass"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                required
              >
                <option value="">{form.languageOptions.placeholder}</option>
                <option value="DE">{form.languageOptions.de}</option>
                <option value="EN">{form.languageOptions.en}</option>
                <option value="TR">{form.languageOptions.tr}</option>
              </select>
            </div>
            <div>
              <label className="label-glass" htmlFor="treatment">{form.treatment} *</label>
              <select
                id="treatment"
                className="select-glass"
                value={treatment}
                onChange={(e) => setTreatment(e.target.value)}
                required
              >
                <option value="">{form.treatmentOptions.placeholder}</option>
                <option value="dental-implant">{form.treatmentOptions.dentalImplant}</option>
                <option value="dental-veneers">{form.treatmentOptions.dentalVeneers}</option>
                <option value="teeth-whitening">{form.treatmentOptions.teethWhitening}</option>
                <option value="hair-transplant">{form.treatmentOptions.hairTransplant}</option>
                <option value="eye-surgery">{form.treatmentOptions.eyeSurgery}</option>
                <option value="cosmetic">{form.treatmentOptions.cosmetic}</option>
                <option value="other">{form.treatmentOptions.other}</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="label-glass" htmlFor="notes">{form.notes}</label>
            <textarea
              id="notes"
              className="textarea-glass"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={form.notesPlaceholder}
            />
          </div>

          <div className="form-group" style={{ marginBottom: "var(--s-24)" }}>
            <label className="checkbox-glass">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
              />
              <span>
                {form.consent}{" "}
                <a href={`/${locale}/privacy`}>{form.consentPrivacy}</a>{" "}
                {form.consentAnd}{" "}
                <a href={`/${locale}/terms`}>{form.consentTerms}</a>
                {form.consentEnd} *
              </span>
            </label>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: "100%" }}
          >
            {loading ? form.submitting : form.submit}
          </button>

          <p className="form-helper">{form.helper}</p>
        </form>
      </div>

      {/* Trust Card */}
      <div className="glass-card trust-card lead-form-trust">
        <h4>{trust.title}</h4>
        
        <div className="trust-item">
          <div className="trust-icon">✓</div>
          <span className="trust-text">{trust.verified}</span>
        </div>
        
        <div className="trust-item">
          <div className="trust-icon">🔒</div>
          <span className="trust-text">{trust.gdpr}</span>
        </div>
        
        <div className="trust-item">
          <div className="trust-icon">⚡</div>
          <span className="trust-text">{trust.response}</span>
        </div>
        
        <div className="trust-item">
          <div className="trust-icon">💬</div>
          <span className="trust-text">{trust.support}</span>
        </div>
      </div>
    </div>
  );
}
