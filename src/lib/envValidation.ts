/**
 * Environment variable validation
 * Validates required environment variables at build/boot time
 * Throws descriptive errors if any required env is missing
 */

const REQUIRED_ENV_VARS = [
  "DATABASE_URL",
  "ADMIN_PASSPHRASE",
] as const;

type EnvVar = (typeof REQUIRED_ENV_VARS)[number];

const ENV_DESCRIPTIONS: Record<EnvVar, string> = {
  DATABASE_URL: "PostgreSQL connection string (e.g., postgresql://user:pass@host:5432/db)",
  ADMIN_PASSPHRASE: "Secret passphrase for CMS admin authentication",
};

export function validateEnv(): void {
  const missing: string[] = [];
  const details: string[] = [];

  for (const envVar of REQUIRED_ENV_VARS) {
    const value = process.env[envVar];
    if (!value || value.trim() === "") {
      missing.push(envVar);
      details.push(`  ❌ ${envVar}: ${ENV_DESCRIPTIONS[envVar]}`);
    }
  }

  if (missing.length > 0) {
    const errorMessage = [
      "",
      "🚨 MISSING REQUIRED ENVIRONMENT VARIABLES",
      "",
      "The following environment variables are required but not set:",
      "",
      ...details,
      "",
      "Please set these in your .env.local (development) or deployment platform (production).",
      "",
    ].join("\n");

    throw new Error(errorMessage);
  }
}

/**
 * Validates environment on module load
 * Only runs in production or when explicitly needed
 */
if (process.env.NODE_ENV === "production") {
  validateEnv();
}
