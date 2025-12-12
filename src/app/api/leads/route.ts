import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { leadSchema, CONSENT_VERSION } from '@/lib/validations'
import { validateCaptcha } from '@/lib/captcha'
import { checkRateLimit } from '@/lib/rate-limit'
import { auditLeadCreated } from '@/lib/audit'
import { sendPatientConfirmation, sendAdminNotification } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    // Get client IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown'
    const userAgent = request.headers.get('user-agent') || undefined

    // Rate limiting
    const rateLimit = checkRateLimit('leads', ip)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again later.' },
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
    const validation = leadSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed',
          details: validation.error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        },
        { status: 400 }
      )
    }

    const data = validation.data

    // Verify captcha
    const captchaResult = validateCaptcha(data.captchaToken, data.captchaInput)
    if (!captchaResult.valid) {
      return NextResponse.json(
        { success: false, error: captchaResult.error },
        { status: 400 }
      )
    }

    // Calculate expiration date based on retention policy
    const retentionDays = parseInt(process.env.DATA_RETENTION_DAYS || '730', 10)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + retentionDays)

    // Create lead
    const lead = await prisma.lead.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email.toLowerCase(),
        phone: data.phone,
        treatmentType: data.treatmentType,
        message: data.message,
        preferredLanguage: data.preferredLanguage,
        consentPrivacy: data.consentPrivacy,
        acceptAGB: data.acceptAGB,
        consentMarketing: data.consentMarketing,
        consentVersion: CONSENT_VERSION,
        consentTimestamp: new Date(),
        legalLocale: data.legalLocale,
        ipAddress: ip,
        userAgent,
        expiresAt
      }
    })

    // Create consent records for GDPR
    await prisma.consentRecord.createMany({
      data: [
        {
          leadId: lead.id,
          consentType: 'privacy',
          consentVersion: CONSENT_VERSION,
          consentGiven: data.consentPrivacy,
          legalLocale: data.legalLocale,
          ipAddress: ip,
          userAgent
        },
        {
          leadId: lead.id,
          consentType: 'agb',
          consentVersion: CONSENT_VERSION,
          consentGiven: data.acceptAGB,
          legalLocale: data.legalLocale,
          ipAddress: ip,
          userAgent
        },
        {
          leadId: lead.id,
          consentType: 'marketing',
          consentVersion: CONSENT_VERSION,
          consentGiven: data.consentMarketing,
          legalLocale: data.legalLocale,
          ipAddress: ip,
          userAgent
        }
      ]
    })

    // Audit log
    await auditLeadCreated(
      lead.id,
      { 
        email: lead.email, 
        treatmentType: lead.treatmentType,
        legalLocale: lead.legalLocale 
      },
      ip,
      userAgent
    )

    // Send emails (non-blocking)
    sendPatientConfirmation(
      lead.email,
      lead.firstName,
      data.treatmentType,
      data.preferredLanguage
    ).catch(console.error)

    sendAdminNotification({
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email,
      phone: lead.phone,
      treatmentType: lead.treatmentType,
      preferredLanguage: lead.preferredLanguage
    }).catch(console.error)

    return NextResponse.json(
      { 
        success: true, 
        message: 'Lead created successfully',
        leadId: lead.id
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Lead creation error:', error)
    return NextResponse.json(
      { success: false, error: 'An error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
