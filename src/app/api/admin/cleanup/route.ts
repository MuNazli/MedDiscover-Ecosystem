import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { auditDataCleanup } from '@/lib/audit'
import { AdminRole } from '@prisma/client'

// POST /api/admin/cleanup - Delete expired leads (GDPR retention)
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check role - only SUPER_ADMIN and ADMIN can run cleanup
    const admin = await prisma.admin.findUnique({
      where: { id: session.id },
      select: { role: true }
    })

    if (!admin || (admin.role !== AdminRole.SUPER_ADMIN && admin.role !== AdminRole.ADMIN)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown'
    const userAgent = request.headers.get('user-agent') || undefined

    const now = new Date()

    // Find expired leads
    const expiredLeads = await prisma.lead.findMany({
      where: {
        expiresAt: { lt: now },
        deletedAt: null
      },
      select: { id: true }
    })

    if (expiredLeads.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No expired leads found',
        deletedCount: 0
      })
    }

    // Soft delete and anonymize expired leads
    const leadIds = expiredLeads.map(l => l.id)

    await prisma.lead.updateMany({
      where: { id: { in: leadIds } },
      data: {
        deletedAt: now,
        deletionReason: 'GDPR retention period expired',
        firstName: '[DELETED]',
        lastName: '[DELETED]',
        email: '[DELETED]',
        phone: '[DELETED]',
        message: null,
        ipAddress: null,
        userAgent: null
      }
    })

    // Audit log
    await auditDataCleanup(session.id, leadIds.length, ip, userAgent)

    return NextResponse.json({
      success: true,
      message: `Deleted ${leadIds.length} expired leads`,
      deletedCount: leadIds.length
    })
  } catch (error) {
    console.error('Cleanup error:', error)
    return NextResponse.json(
      { success: false, error: 'An error occurred' },
      { status: 500 }
    )
  }
}

// GET /api/admin/cleanup - Preview expired leads count
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const now = new Date()

    const expiredCount = await prisma.lead.count({
      where: {
        expiresAt: { lt: now },
        deletedAt: null
      }
    })

    const retentionDays = parseInt(process.env.DATA_RETENTION_DAYS || '730', 10)

    return NextResponse.json({
      success: true,
      expiredCount,
      retentionDays,
      message: `${expiredCount} leads have exceeded the ${retentionDays}-day retention period`
    })
  } catch (error) {
    console.error('Cleanup preview error:', error)
    return NextResponse.json(
      { success: false, error: 'An error occurred' },
      { status: 500 }
    )
  }
}
