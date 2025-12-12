// Simple in-memory rate limiter for MVP
// In production, use Redis or similar

interface RateLimitEntry {
  count: number
  resetAt: number
}

const stores: Record<string, Map<string, RateLimitEntry>> = {
  leads: new Map(),
  login: new Map()
}

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
}

const configs: Record<string, RateLimitConfig> = {
  leads: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: parseInt(process.env.RATE_LIMIT_LEADS_PER_HOUR || '5', 10)
  },
  login: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_LOGIN_PER_15MIN || '5', 10)
  }
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: Date
}

export function checkRateLimit(type: 'leads' | 'login', identifier: string): RateLimitResult {
  const store = stores[type]
  const config = configs[type]
  const now = Date.now()

  let entry = store.get(identifier)

  // Reset if window expired
  if (!entry || now > entry.resetAt) {
    entry = {
      count: 0,
      resetAt: now + config.windowMs
    }
  }

  const remaining = Math.max(0, config.maxRequests - entry.count)
  const allowed = entry.count < config.maxRequests

  if (allowed) {
    entry.count++
    store.set(identifier, entry)
  }

  return {
    allowed,
    remaining: allowed ? remaining - 1 : 0,
    resetAt: new Date(entry.resetAt)
  }
}

// Cleanup old entries (call periodically)
export function cleanupRateLimits(): void {
  const now = Date.now()
  
  Object.values(stores).forEach(store => {
    store.forEach((entry, key) => {
      if (now > entry.resetAt) {
        store.delete(key)
      }
    })
  })
}
