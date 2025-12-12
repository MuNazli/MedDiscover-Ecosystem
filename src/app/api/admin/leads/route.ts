import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { searchSchema } from '@/lib/validations'
import { auditLeadsViewed } from '@/lib/audit'

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

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown'
    const userAgent = request.headers.get('user-agent') || undefined

    // Parse search params
    const { searchParams } = new URL(request.url)
    const validation = searchSchema.safeParse({
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') || 1,
      limit: searchParams.get('limit') || 20
    })

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid search parameters' },
        { status: 400 }
      )
    }

    const { search, page, limit } = validation.data
    const skip = (page - 1) * limit

    // Build where clause
    const where: Record<string, unknown> = {
      deletedAt: null
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Query leads
    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          treatmentType: true,
          preferredLanguage: true,
          status: true,
          createdAt: true
        }
      }),
      prisma.lead.count({ where })
    ])

    // Audit log
    await auditLeadsViewed(session.id, leads.length, ip, userAgent)

    return NextResponse.json({
      success: true,
      leads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Leads list error:', error)
    return NextResponse.json(
      { success: false, error: 'An error occurred' },
      { status: 500 }
    )
  }
}
