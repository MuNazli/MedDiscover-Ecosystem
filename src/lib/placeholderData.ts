/**
 * MedDiscover MVP - Placeholder Data
 * TODO: Replace with real partner clinic data from database/API
 */

export interface FeaturedClinic {
  id: string;
  name: string;
  shortName: string; // For avatar
  location: string;
  country: string;
  rating: number;
  reviewCount: number;
  badges: string[];
}

export interface PlatformStats {
  patientsServed: string;
  partnerClinics: string;
  satisfactionRate: string;
}

// TODO: Replace with real partner clinic data from API/database
export const PLACEHOLDER_FEATURED_CLINIC: FeaturedClinic = {
  id: "placeholder-clinic-1",
  name: "İstanbul Dental Center",
  shortName: "İD",
  location: "Istanbul",
  country: "Turkey",
  rating: 4.9,
  reviewCount: 324,
  badges: ["Dental", "Top Rated"],
};

// TODO: Replace with real platform statistics from analytics/database
export const PLACEHOLDER_STATS: PlatformStats = {
  patientsServed: "500+",
  partnerClinics: "50+",
  satisfactionRate: "98%",
};

// Badge type mapping for styling
export const BADGE_STYLES: Record<string, "default" | "gold"> = {
  "Top Rated": "gold",
  "Premium": "gold",
  "Verified": "default",
  "Dental": "default",
  "Cosmetic": "default",
  "Hair": "default",
};
