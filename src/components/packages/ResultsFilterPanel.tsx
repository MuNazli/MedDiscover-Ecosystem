// src/components/packages/ResultsFilterPanel.tsx
"use client";

import { DESTINATIONS } from "@/lib/packages/mockData";
import {
  FiltersState,
  PackageInclusion,
  SortOption,
  TreatmentCategory,
  Verification,
} from "@/lib/packages/types";

type Props = {
  filters: FiltersState;
  onChange: (next: FiltersState) => void;
};

const TREATMENTS: TreatmentCategory[] = [
  "Dental",
  "Orthopedics",
  "Cosmetic",
  "IVF",
  "Cardiology",
  "Weight Loss",
];

const VERIFICATIONS: { key: Verification; label: string }[] = [
  { key: "meddiscover_verified", label: "MedDiscover Verified" },
  { key: "jci", label: "JCI Accredited" },
  { key: "iso", label: "ISO Certified" },
];

const INCLUSIONS: { key: PackageInclusion; label: string }[] = [
  { key: "hotel", label: "Hotel included" },
  { key: "transfers", label: "Transfers included" },
  { key: "german_support", label: "German support" },
  { key: "aftercare", label: "Aftercare plan" },
];

function toggleSet<T>(set: Set<T>, v: T): Set<T> {
  const next = new Set(set);
  if (next.has(v)) next.delete(v);
  else next.add(v);
  return next;
}

export default function ResultsFilterPanel({ filters, onChange }: Props) {
  const set = (patch: Partial<FiltersState>) => onChange({ ...filters, ...patch });

  const resetAll = () => {
    onChange({
      priceMin: undefined,
      priceMax: undefined,
      treatments: new Set(),
      destinations: new Set(),
      verifications: new Set(),
      inclusions: new Set(),
      sort: "recommended",
      destinationQuery: "",
    });
  };

  return (
    <div className="w-full">
      {/* 1) Price */}
      <section className="border-b border-black/10 px-6 py-5">
        <div className="text-[14px] font-semibold">Price Range</div>
        <div className="mt-2 text-[11px] text-black/60">Estimated total package cost</div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <input
            inputMode="numeric"
            placeholder="Min"
            className="h-10 rounded-lg border border-black/10 px-3 text-[13px]"
            value={filters.priceMin ?? ""}
            onChange={(e) => set({ priceMin: e.target.value ? Number(e.target.value) : undefined })}
          />
          <input
            inputMode="numeric"
            placeholder="Max"
            className="h-10 rounded-lg border border-black/10 px-3 text-[13px]"
            value={filters.priceMax ?? ""}
            onChange={(e) => set({ priceMax: e.target.value ? Number(e.target.value) : undefined })}
          />
        </div>
      </section>

      {/* 2) Treatment */}
      <section className="border-b border-black/10 px-6 py-5">
        <div className="text-[14px] font-semibold">Treatment</div>
        <div className="mt-3 space-y-2">
          {TREATMENTS.slice(0, 6).map((t) => (
            <label key={t} className="flex items-center gap-3 text-[13px] text-black/80">
              <input
                type="checkbox"
                checked={filters.treatments.has(t)}
                onChange={() => set({ treatments: toggleSet(filters.treatments, t) })}
              />
              <span>{t}</span>
            </label>
          ))}
          <div className="text-[12px] underline text-black/60">+ Show more</div>
        </div>
      </section>

      {/* 3) Destination */}
      <section className="border-b border-black/10 px-6 py-5">
        <div className="text-[14px] font-semibold">Destination</div>
        <input
          className="mt-3 h-10 w-full rounded-lg border border-black/10 px-3 text-[13px]"
          placeholder="Search city or country..."
          value={filters.destinationQuery}
          onChange={(e) => set({ destinationQuery: e.target.value })}
        />
        <div className="mt-3 space-y-2">
          {DESTINATIONS.slice(0, 6).map((d) => (
            <label key={d} className="flex items-center gap-3 text-[13px] text-black/80">
              <input
                type="checkbox"
                checked={filters.destinations.has(d)}
                onChange={() => set({ destinations: toggleSet(filters.destinations, d) })}
              />
              <span>{d}</span>
            </label>
          ))}
          <div className="text-[12px] underline text-black/60">+ Show more</div>
        </div>
      </section>

      {/* 4) Verification */}
      <section className="border-b border-black/10 px-6 py-5">
        <div className="text-[14px] font-semibold">Quality &amp; Safety</div>
        <div className="mt-3 space-y-2">
          {VERIFICATIONS.map((v) => (
            <label key={v.key} className="flex items-center gap-3 text-[13px] text-black/80">
              <input
                type="checkbox"
                checked={filters.verifications.has(v.key)}
                onChange={() => set({ verifications: toggleSet(filters.verifications, v.key) })}
              />
              <span>{v.label}</span>
            </label>
          ))}
        </div>
      </section>

      {/* 5) Inclusions */}
      <section className="border-b border-black/10 px-6 py-5">
        <div className="text-[14px] font-semibold">Trip Essentials</div>
        <div className="mt-3 space-y-2">
          {INCLUSIONS.map((i) => (
            <label key={i.key} className="flex items-center gap-3 text-[13px] text-black/80">
              <input
                type="checkbox"
                checked={filters.inclusions.has(i.key)}
                onChange={() => set({ inclusions: toggleSet(filters.inclusions, i.key) })}
              />
              <span>{i.label}</span>
            </label>
          ))}
        </div>
      </section>

      {/* 6) Sort + reset */}
      <section className="px-6 py-5">
        <div className="text-[14px] font-semibold">Sort Results</div>
        <select
          className="mt-3 h-10 w-full rounded-lg border border-black/10 px-3 text-[13px]"
          value={filters.sort}
          onChange={(e) => set({ sort: e.target.value as SortOption })}
        >
          <option value="recommended">Recommended</option>
          <option value="price_low">Price: Low to High</option>
          <option value="rating_high">Rating: High to Low</option>
        </select>

        <button
          type="button"
          onClick={resetAll}
          className="mt-4 w-full text-center text-[12px] text-black/60 underline"
        >
          Reset all filters
        </button>
      </section>
    </div>
  );
}
