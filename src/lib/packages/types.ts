// src/lib/packages/types.ts

export type PackageInclusion =
  | "hotel"
  | "transfers"
  | "german_support"
  | "aftercare";

export type Verification = "meddiscover_verified" | "jci" | "iso";

export type TreatmentCategory =
  | "Dental"
  | "Orthopedics"
  | "Cosmetic"
  | "IVF"
  | "Cardiology"
  | "Weight Loss";

export type SortOption = "recommended" | "price_low" | "rating_high";

export type MedicalPackage = {
  id: string;
  title: string;
  clinicName: string;
  destination: string; // e.g. "Istanbul, TR"
  treatmentCategory: TreatmentCategory;
  inclusions: PackageInclusion[];
  verifications: Verification[];
  satisfactionPct?: number; // 0-100
  hotelStars?: 3 | 4 | 5;
  priceFromEur: number; // "estimated" MVP
  bullets: string[]; // max 3
  images: { alt: string }[]; // placeholders (no real URLs yet)
  spotlight?: boolean;
};

export type FiltersState = {
  priceMin?: number;
  priceMax?: number;
  treatments: Set<TreatmentCategory>;
  destinations: Set<string>;
  verifications: Set<Verification>;
  inclusions: Set<PackageInclusion>;
  sort: SortOption;
  destinationQuery: string;
};

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "recommended", label: "Recommended" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "rating_high", label: "Highest Rated" },
];
