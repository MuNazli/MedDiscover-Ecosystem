"use client";

import { useEffect, useRef, useState } from "react";

type SelectedPackage = {
  id: string;
  title: string;
  destination: string;
  treatmentCategory: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  selectedPackage: SelectedPackage | null;
};

export default function LeadOfferModal({ open, onClose, selectedPackage }: Props) {
  const firstInputRef = useRef<HTMLInputElement | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    message: "",
    consentPrivacy: false,
    consentContact: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const resetForm = () => {
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      message: "",
      consentPrivacy: false,
      consentContact: false,
    });
    setError(null);
    setSuccess(false);
  };

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open]);

  useEffect(() => {
    if (open && firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, [open]);

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  // Prevent background scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.consentPrivacy || !formData.consentContact) {
      setError("Please accept both consent checkboxes to continue.");
      return;
    }

    if (!selectedPackage) {
      setError("No package selected.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        packageId: selectedPackage.id,
        packageTitle: selectedPackage.title,
        destination: selectedPackage.destination,
        treatmentCategory: selectedPackage.treatmentCategory,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
        consentPrivacy: formData.consentPrivacy,
        consentContact: formData.consentContact,
        locale: "en",
      };

      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to submit request");
      }

      setSuccess(true);
      setTimeout(() => {
        resetForm();
        onClose();
      }, 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="relative w-full max-w-[600px] rounded-xl border border-black/10 bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md border border-black/10 bg-white px-2 py-1 text-[12px] font-semibold text-black hover:bg-black/5"
          aria-label="Close"
        >
          Close
        </button>

        {success ? (
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                stroke="green"
                strokeWidth="3"
              >
                <path d="M8 16L14 22L24 10" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-black">Request Sent!</h2>
            <p className="mt-2 text-[14px] text-black/70">
              We'll contact you shortly with a personalized offer.
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-semibold text-black">Request Offer</h2>
            {selectedPackage && (
              <p className="mt-2 text-[14px] text-black/70">
                {selectedPackage.title} · {selectedPackage.destination}
              </p>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-[13px] font-semibold text-black">
                  Full Name *
                </label>
                <input
                  id="fullName"
                  type="text"
                  required
                  autoFocus
                  ref={firstInputRef}
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="mt-1 h-10 w-full rounded-lg border border-black/20 px-3 text-[14px] focus:border-black focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-[13px] font-semibold text-black">
                  Email *
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 h-10 w-full rounded-lg border border-black/20 px-3 text-[14px] focus:border-black focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-[13px] font-semibold text-black">
                  Phone (optional)
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="mt-1 h-10 w-full rounded-lg border border-black/20 px-3 text-[14px] focus:border-black focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-[13px] font-semibold text-black">
                  Message (optional)
                </label>
                <textarea
                  id="message"
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-black/20 p-3 text-[14px] focus:border-black focus:outline-none"
                  placeholder="Any questions or special requirements?"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    required
                    checked={formData.consentPrivacy}
                    onChange={(e) =>
                      setFormData({ ...formData, consentPrivacy: e.target.checked })
                    }
                    className="mt-1 h-4 w-4 rounded border-black/20"
                  />
                  <span className="text-[13px] text-black/80">
                    I agree to the Privacy Policy *
                  </span>
                </label>

                <label className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    required
                    checked={formData.consentContact}
                    onChange={(e) =>
                      setFormData({ ...formData, consentContact: e.target.checked })
                    }
                    className="mt-1 h-4 w-4 rounded border-black/20"
                  />
                  <span className="text-[13px] text-black/80">
                    I agree to be contacted about this offer *
                  </span>
                </label>
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-[13px] text-red-700">{error}</div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="h-10 flex-1 rounded-lg border border-black/20 text-[14px] font-semibold text-black hover:bg-black/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="h-10 flex-1 rounded-lg bg-black text-[14px] font-semibold text-white hover:bg-black/90 disabled:bg-black/50"
                >
                  {loading ? "Sending..." : "Submit Request"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
