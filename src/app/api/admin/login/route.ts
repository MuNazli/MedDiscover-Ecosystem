import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { login } from '@/lib/auth'
import { loginSchema } from '@/lib/validations'
import { checkRateLimit } from '@/lib/rate-limit'
import { auditAdminLoginSuccess, auditAdminLoginFail } from '@/lib/audit'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    // Get client IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown'
    const userAgent = request.headers.get('user-agent') || undefined

    // Rate limiting
    const rateLimit = checkRateLimit('login', ip)
    if (!rateLimit.allowed) {
      await auditAdminLoginFail('unknown', 'Rate limit exceeded', ip, userAgent)
      return NextResponse.json(
        { success: false, error: 'Too many login attempts. Please try again later.' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimit.resetAt.toISOString()
          }
        }
      )
    }

    // Parse and validate body
    const body = await request.json()
    const validation = loginSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password format' },
        { status: 400 }
      )
    }

    const { email, password } = validation.data

    // Find admin
    const admin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (!admin) {
      await auditAdminLoginFail(email, 'User not found', ip, userAgent)
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    if (!admin.isActive) {
      await auditAdminLoginFail(email, 'Account inactive', ip, userAgent)
      return NextResponse.json(
        { success: false, error: 'Account is inactive' },
        { status: 401 }
      )
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, admin.passwordHash)
    if (!validPassword) {
      await auditAdminLoginFail(email, 'Invalid password', ip, userAgent)
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Create session
    const result = await login(email, password)
    
    if (!result.success) {
      await auditAdminLoginFail(email, result.error || 'Unknown error', ip, userAgent)
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 401 }
      )
    }

    // Audit success
    await auditAdminLoginSuccess(admin.id, email, ip, userAgent)

    return NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: 'An error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
