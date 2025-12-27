// src/components/packages/MedicalSearchModule.tsx
"use client";

type Props = {
  onSubmit?: () => void; // MVP: sadece listeye git / filtreye bağlanır
};

export default function MedicalSearchModule({ onSubmit }: Props) {
  return (
    <div className="w-full max-w-[1200px] rounded-xl border border-black/10 bg-white/80 p-6">
      <div className="grid grid-cols-5 gap-0 overflow-hidden rounded-lg border border-black/10">
        {[
          { label: "From", placeholder: "Select Airport" },
          { label: "To", placeholder: "Select City or Hospital" },
          { label: "Procedure", placeholder: "All Treatments" },
          { label: "Dates", placeholder: "Check-in — Check-out" },
          { label: "Patients & Guests", placeholder: "1 Patient, 0 Guests" },
        ].map((f) => (
          <div key={f.label} className="min-h-[56px] border-r border-black/10 p-4 last:border-r-0">
            <div className="text-[12px] font-semibold uppercase tracking-wide text-black/70">
              {f.label}
            </div>
            <div className="mt-1 text-[16px] text-black/70">{f.placeholder}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={onSubmit}
          className="h-12 w-[240px] rounded-lg border border-black/10 bg-black text-[16px] font-semibold text-white"
        >
          Search Medical Trip
        </button>
      </div>
    </div>
  );
}
