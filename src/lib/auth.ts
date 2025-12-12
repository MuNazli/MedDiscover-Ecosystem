import { cookies } from 'next/headers'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

const SESSION_COOKIE_NAME = 'meddiscover_admin_session'
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000 // 24 hours

// Simple in-memory session store (for MVP - use Redis in production)
const sessions = new Map<string, { adminId: string; expiresAt: Date }>()

function getSessionSecret(): string {
  return process.env.SESSION_SECRET || 'dev-secret-change-in-production'
}

function generateSessionId(): string {
  return crypto.randomBytes(32).toString('hex')
}

function signSession(sessionId: string): string {
  const hmac = crypto.createHmac('sha256', getSessionSecret())
  hmac.update(sessionId)
  return `${sessionId}.${hmac.digest('hex')}`
}

function verifySession(signedSession: string): string | null {
  const parts = signedSession.split('.')
  if (parts.length !== 2) return null
  
  const [sessionId, signature] = parts
  const hmac = crypto.createHmac('sha256', getSessionSecret())
  hmac.update(sessionId)
  const expectedSignature = hmac.digest('hex')
  
  if (signature !== expectedSignature) return null
  return sessionId
}

export interface AdminSession {
  id: string
  email: string
  name: string
  role: string
}

export async function login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  const admin = await prisma.admin.findUnique({
    where: { email: email.toLowerCase() }
  })

  if (!admin) {
    return { success: false, error: 'Invalid credentials' }
  }

  if (!admin.isActive) {
    return { success: false, error: 'Account is inactive' }
  }

  const validPassword = await bcrypt.compare(password, admin.passwordHash)
  if (!validPassword) {
    return { success: false, error: 'Invalid credentials' }
  }

  // Create session
  const sessionId = generateSessionId()
  const signedSession = signSession(sessionId)
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS)

  sessions.set(sessionId, { adminId: admin.id, expiresAt })

  // Update last login
  await prisma.admin.update({
    where: { id: admin.id },
    data: { lastLoginAt: new Date() }
  })

  // Set cookie
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, signedSession, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt
  })

  return { success: true }
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies()
  const signedSession = cookieStore.get(SESSION_COOKIE_NAME)?.value
  
  if (signedSession) {
    const sessionId = verifySession(signedSession)
    if (sessionId) {
      sessions.delete(sessionId)
    }
  }

  cookieStore.delete(SESSION_COOKIE_NAME)
}

export async function getSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies()
  const signedSession = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!signedSession) return null

  const sessionId = verifySession(signedSession)
  if (!sessionId) return null

  const session = sessions.get(sessionId)
  if (!session) return null

  if (new Date() > session.expiresAt) {
    sessions.delete(sessionId)
    return null
  }

  const admin = await prisma.admin.findUnique({
    where: { id: session.adminId },
    select: { id: true, email: true, name: true, role: true, isActive: true }
  })

  if (!admin || !admin.isActive) {
    sessions.delete(sessionId)
    return null
  }

  return {
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role
  }
}

export async function requireAuth(): Promise<AdminSession> {
  const session = await getSession()
  if (!session) {
    throw new Error('Unauthorized')
  }
  return session
}

// Cleanup expired sessions (call periodically)
export function cleanupSessions(): number {
  const now = new Date()
  let count = 0
  
  sessions.forEach((session, sessionId) => {
    if (now > session.expiresAt) {
      sessions.delete(sessionId)
      count++
    }
  })
  
  return count
}
