import { NextRequest, NextResponse } from "next/server";

/**
 * Simple in-memory rate limiter
 * Tracks requests by IP address
 * 
 * Note: In Vercel serverless, this resets per cold start.
 * For production-grade rate limiting, consider:
 * - Upstash Redis (@upstash/ratelimit)
 * - Vercel Edge Config
 * - External rate limiting service
 * 
 * This implementation is sufficient for MVP to prevent basic abuse.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  const entries = Array.from(rateLimitStore.entries());
  for (const [key, entry] of entries) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  maxRequests: number; // Maximum requests allowed
  windowMs: number; // Time window in milliseconds
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequests: 10,
  windowMs: 60 * 1000, // 60 seconds
};

/**
 * Get client IP from request
 * Supports Vercel's x-forwarded-for and x-real-ip headers
 */
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  // Fallback (should not happen in production)
  return "unknown";
}

/**
 * Rate limit middleware
 * Returns null if within limit, or NextResponse with 429 if exceeded
 */
export function rateLimit(
  request: NextRequest,
  config: RateLimitConfig = DEFAULT_CONFIG
): NextResponse | null {
  const ip = getClientIp(request);
  const key = `${ip}`;
  const now = Date.now();
  
  let entry = rateLimitStore.get(key);
  
  if (!entry || entry.resetAt < now) {
    // Create new entry or reset expired entry
    entry = {
      count: 1,
      resetAt: now + config.windowMs,
    };
    rateLimitStore.set(key, entry);
    return null; // Allow request
  }
  
  // Increment count
  entry.count += 1;
  
  if (entry.count > config.maxRequests) {
    // Rate limit exceeded
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    
    return NextResponse.json(
      {
        error: "Too many requests. Please try again later.",
        retryAfter: `${retryAfter} seconds`,
      },
      {
        status: 429,
        headers: {
          "Retry-After": retryAfter.toString(),
          "X-RateLimit-Limit": config.maxRequests.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": entry.resetAt.toString(),
        },
      }
    );
  }
  
  // Within limit
  return null;
}

/**
 * Rate limit configurations for different endpoints
 */
export const RATE_LIMITS = {
  // Lead form submission - 10 requests per minute
  LEAD_SUBMISSION: {
    maxRequests: 10,
    windowMs: 60 * 1000,
  },
  
  // Admin login - 5 attempts per minute (stricter)
  ADMIN_AUTH: {
    maxRequests: 5,
    windowMs: 60 * 1000,
  },
} as const;
