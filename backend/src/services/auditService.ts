import { prisma } from '../utils/prisma.js';
import { logger } from '../utils/logger.js';

export type AuditAction =
  | 'LEAD_CREATED'
  | 'LEAD_VIEWED'
  | 'LEAD_UPDATED'
  | 'LEAD_DELETED'
  | 'LEAD_EXPORTED'
  | 'ADMIN_LOGIN'
  | 'ADMIN_LOGOUT'
  | 'ADMIN_LOGIN_FAILED'
  | 'CONSENT_RECORDED';

export interface AuditLogData {
  action: AuditAction;
  entityType: string;
  entityId: string;
  oldValue?: Record<string, unknown> | null;
  newValue?: Record<string, unknown> | null;
  ipAddress?: string;
  userAgent?: string;
  adminId?: string;
  leadId?: string;
}

export const auditService = {
  async log(data: AuditLogData): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          action: data.action,
          entityType: data.entityType,
          entityId: data.entityId,
          oldValue: data.oldValue ?? undefined,
          newValue: data.newValue ?? undefined,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          adminId: data.adminId,
          leadId: data.leadId
        }
      });

      logger.info(`Audit: ${data.action} on ${data.entityType}:${data.entityId}`);
    } catch (error) {
      logger.error('Failed to create audit log:', error);
      // Don't throw - audit logging should not break the main flow
    }
  },

  async getLogsForEntity(entityType: string, entityId: string) {
    return prisma.auditLog.findMany({
      where: {
        entityType,
        entityId
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        admin: {
          select: {
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });
  },

  async getLogsByAdmin(adminId: string, limit = 100) {
    return prisma.auditLog.findMany({
      where: { adminId },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  }
};
