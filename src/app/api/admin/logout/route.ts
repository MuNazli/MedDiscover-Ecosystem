import { NextRequest, NextResponse } from 'next/server'
import { logout, getSession } from '@/lib/auth'
import { auditAdminLogout } from '@/lib/audit'

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown'
    const userAgent = request.headers.get('user-agent') || undefined

    const session = await getSession()
    
    if (session) {
      await auditAdminLogout(session.id, ip, userAgent)
    }

    await logout()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { success: false, error: 'An error occurred' },
      { status: 500 }
    )
  }
}
