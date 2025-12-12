import { prisma } from './prisma'
import { AuditEvent } from '@prisma/client'

export { AuditEvent }

export interface AuditLogInput {
  event: AuditEvent
  entityType: string
  entityId?: string
  details?: Record<string, unknown> | null
  ipAddress?: string
  userAgent?: string
  adminId?: string
  leadId?: string
}

export async function logAudit(input: AuditLogInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        event: input.event,
        entityType: input.entityType,
        entityId: input.entityId,
        details: input.details ? JSON.parse(JSON.stringify(input.details)) : undefined,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        adminId: input.adminId,
        leadId: input.leadId
      }
    })
  } catch (error) {
    // Log to console but don't throw - audit should not break main flow
    console.error('Audit log failed:', error)
  }
}

// Helper functions for common audit events
export async function auditLeadCreated(leadId: string, details: Record<string, unknown>, ip?: string, ua?: string) {
  await logAudit({
    event: AuditEvent.LEAD_CREATED,
    entityType: 'Lead',
    entityId: leadId,
    details,
    ipAddress: ip,
    userAgent: ua,
    leadId
  })
}

export async function auditLeadsViewed(adminId: string, count: number, ip?: string, ua?: string) {
  await logAudit({
    event: AuditEvent.LEADS_VIEWED,
    entityType: 'Lead',
    details: { count },
    ipAddress: ip,
    userAgent: ua,
    adminId
  })
}

export async function auditAdminLoginSuccess(adminId: string, email: string, ip?: string, ua?: string) {
  await logAudit({
    event: AuditEvent.ADMIN_LOGIN_SUCCESS,
    entityType: 'Admin',
    entityId: adminId,
    details: { email },
    ipAddress: ip,
    userAgent: ua,
    adminId
  })
}

export async function auditAdminLoginFail(email: string, reason: string, ip?: string, ua?: string) {
  await logAudit({
    event: AuditEvent.ADMIN_LOGIN_FAIL,
    entityType: 'Admin',
    details: { email, reason },
    ipAddress: ip,
    userAgent: ua
  })
}

export async function auditAdminLogout(adminId: string, ip?: string, ua?: string) {
  await logAudit({
    event: AuditEvent.ADMIN_LOGOUT,
    entityType: 'Admin',
    entityId: adminId,
    ipAddress: ip,
    userAgent: ua,
    adminId
  })
}

export async function auditDataCleanup(adminId: string, deletedCount: number, ip?: string, ua?: string) {
  await logAudit({
    event: AuditEvent.DATA_CLEANUP,
    entityType: 'Lead',
    details: { deletedCount },
    ipAddress: ip,
    userAgent: ua,
    adminId
  })
}
