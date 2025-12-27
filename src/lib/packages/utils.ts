// src/lib/packages/utils.ts
import { FiltersState, MedicalPackage, SortOption, Verification } from "./types";

export function eur(n: number): string {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(n);
}

function matchesSet<T>(set: Set<T>, value: T): boolean {
  return set.size === 0 || set.has(value);
}

function includesAll(set: Set<string>, values: string[]): boolean {
  if (set.size === 0) return true;
  for (const v of set) if (!values.includes(v)) return false;
  return true;
}

function hasAny(set: Set<string>, values: string[]): boolean {
  if (set.size === 0) return true;
  for (const v of values) if (set.has(v)) return true;
  return false;
}

export function applyFilters(packages: MedicalPackage[], f: FiltersState): MedicalPackage[] {
  const dq = f.destinationQuery.trim().toLowerCase();

  return packages.filter((p) => {
    if (typeof f.priceMin === "number" && p.priceFromEur < f.priceMin) return false;
    if (typeof f.priceMax === "number" && p.priceFromEur > f.priceMax) return false;

    if (f.treatments.size > 0 && !f.treatments.has(p.treatmentCategory)) return false;

    // Destination: can be checkbox set + search query
    if (f.destinations.size > 0 && !f.destinations.has(p.destination)) return false;
    if (dq && !p.destination.toLowerCase().includes(dq)) return false;

    // Verification: treat as "has any of selected"
    if (!hasAny(f.verifications as unknown as Set<string>, p.verifications as unknown as string[]))
      return false;

    // Inclusions: require all selected
    if (!includesAll(f.inclusions as unknown as Set<string>, p.inclusions as unknown as string[]))
      return false;

    return true;
  });
}

export function sortPackages(list: MedicalPackage[], sort: SortOption): MedicalPackage[] {
  const copy = [...list];
  if (sort === "recommended") {
    // MVP: spotlight first, then higher satisfaction, then lower price
    copy.sort((a, b) => {
      const sa = a.spotlight ? 1 : 0;
      const sb = b.spotlight ? 1 : 0;
      if (sa !== sb) return sb - sa;
      const pa = a.satisfactionPct ?? 0;
      const pb = b.satisfactionPct ?? 0;
      if (pa !== pb) return pb - pa;
      return a.priceFromEur - b.priceFromEur;
    });
    return copy;
  }
  if (sort === "price_low") {
    copy.sort((a, b) => a.priceFromEur - b.priceFromEur);
    return copy;
  }
  // rating_high
  copy.sort((a, b) => (b.satisfactionPct ?? 0) - (a.satisfactionPct ?? 0));
  return copy;
}

export function verificationLabel(v: Verification): string {
  if (v === "meddiscover_verified") return "MedDiscover Verified";
  if (v === "jci") return "JCI Accredited";
  return "ISO Certified";
}
