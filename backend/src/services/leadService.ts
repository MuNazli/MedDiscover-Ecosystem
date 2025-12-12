import { prisma } from '../utils/prisma.js';
import { auditService } from './auditService.js';
import { emailService } from './emailService.js';
import { captchaService } from './captchaService.js';
import { logger } from '../utils/logger.js';
import { LeadStatus } from '@prisma/client';

export interface CreateLeadInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  treatmentType: string;
  medicalDescription?: string;
  preferredLanguage?: string;
  consentPrivacy: boolean;
  consentTerms: boolean;
  consentMarketing?: boolean;
  captchaId: string;
  captchaText: string;
  ipAddress?: string;
  userAgent?: string;
  source?: string;
}

export interface LeadSearchParams {
  search?: string;
  status?: LeadStatus;
  page?: number;
  limit?: number;
}

export const leadService = {
  async create(input: CreateLeadInput): Promise<{ success: boolean; leadId?: string; error?: string }> {
    try {
      // Verify captcha first
      const captchaValid = await captchaService.verify(input.captchaId, input.captchaText);
      if (!captchaValid) {
        return { success: false, error: 'Invalid or expired captcha' };
      }

      // Create the lead
      const lead = await prisma.lead.create({
        data: {
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          phone: input.phone,
          dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : null,
          treatmentType: input.treatmentType,
          medicalDescription: input.medicalDescription,
          preferredLanguage: input.preferredLanguage || 'de',
          consentPrivacy: input.consentPrivacy,
          consentTerms: input.consentTerms,
          consentMarketing: input.consentMarketing || false,
          consentTimestamp: new Date(),
          ipAddress: input.ipAddress,
          userAgent: input.userAgent,
          source: input.source || 'website',
          status: LeadStatus.NEW
        }
      });

      // Record consents separately for GDPR
      await prisma.consentRecord.createMany({
        data: [
          {
            leadEmail: input.email,
            consentType: 'privacy',
            consentVersion: '1.0',
            consentGiven: input.consentPrivacy,
            ipAddress: input.ipAddress,
            userAgent: input.userAgent
          },
          {
            leadEmail: input.email,
            consentType: 'terms',
            consentVersion: '1.0',
            consentGiven: input.consentTerms,
            ipAddress: input.ipAddress,
            userAgent: input.userAgent
          },
          {
            leadEmail: input.email,
            consentType: 'marketing',
            consentVersion: '1.0',
            consentGiven: input.consentMarketing || false,
            ipAddress: input.ipAddress,
            userAgent: input.userAgent
          }
        ]
      });

      // Audit log
      await auditService.log({
        action: 'LEAD_CREATED',
        entityType: 'Lead',
        entityId: lead.id,
        newValue: {
          email: lead.email,
          treatmentType: lead.treatmentType,
          preferredLanguage: lead.preferredLanguage
        },
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        leadId: lead.id
      });

      // Send emails (non-blocking)
      const lang = (input.preferredLanguage || 'de') as 'de' | 'tr' | 'en';
      emailService.sendPatientConfirmation(
        lead.email,
        lead.firstName,
        lead.treatmentType,
        lang
      ).catch(err => logger.error('Patient email error:', err));

      emailService.sendAdminNotification({
        firstName: lead.firstName,
        lastName: lead.lastName,
        email: lead.email,
        phone: lead.phone,
        treatmentType: lead.treatmentType,
        preferredLanguage: lead.preferredLanguage,
        createdAt: lead.createdAt
      }).catch(err => logger.error('Admin email error:', err));

      logger.info(`Lead created: ${lead.id}`);
      return { success: true, leadId: lead.id };
    } catch (error) {
      logger.error('Failed to create lead:', error);
      return { success: false, error: 'Failed to create lead' };
    }
  },

  async search(params: LeadSearchParams, adminId: string) {
    const { search, status, page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      deletedAt: null // Only non-deleted leads
    };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ];
    }

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
    ]);

    return {
      leads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  async getById(id: string, adminId: string, ipAddress?: string, userAgent?: string) {
    const lead = await prisma.lead.findFirst({
      where: { 
        id, 
        deletedAt: null 
      }
    });

    if (lead) {
      // Audit log for viewing
      await auditService.log({
        action: 'LEAD_VIEWED',
        entityType: 'Lead',
        entityId: id,
        adminId,
        ipAddress,
        userAgent,
        leadId: id
      });
    }

    return lead;
  },

  async updateStatus(id: string, status: LeadStatus, adminId: string, ipAddress?: string, userAgent?: string) {
    const lead = await prisma.lead.findUnique({ where: { id } });
    if (!lead) return null;

    const updated = await prisma.lead.update({
      where: { id },
      data: { status }
    });

    await auditService.log({
      action: 'LEAD_UPDATED',
      entityType: 'Lead',
      entityId: id,
      oldValue: { status: lead.status },
      newValue: { status },
      adminId,
      ipAddress,
      userAgent,
      leadId: id
    });

    return updated;
  },

  // GDPR: Delete lead data (soft delete with reason)
  async delete(id: string, reason: string, adminId: string, ipAddress?: string, userAgent?: string) {
    const lead = await prisma.lead.findUnique({ where: { id } });
    if (!lead) return null;

    const deleted = await prisma.lead.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletionReason: reason,
        // Anonymize personal data
        firstName: '[DELETED]',
        lastName: '[DELETED]',
        email: `deleted-${id}@deleted.local`,
        phone: '[DELETED]',
        medicalDescription: null,
        ipAddress: null,
        userAgent: null
      }
    });

    await auditService.log({
      action: 'LEAD_DELETED',
      entityType: 'Lead',
      entityId: id,
      oldValue: {
        email: lead.email,
        firstName: lead.firstName,
        lastName: lead.lastName
      },
      newValue: { reason },
      adminId,
      ipAddress,
      userAgent,
      leadId: id
    });

    logger.info(`Lead deleted: ${id} by admin ${adminId}`);
    return deleted;
  },

  // GDPR: Get all data for a specific email (data export)
  async getDataByEmail(email: string) {
    const leads = await prisma.lead.findMany({
      where: { email },
      include: {
        auditLogs: true
      }
    });

    const consents = await prisma.consentRecord.findMany({
      where: { leadEmail: email }
    });

    return { leads, consents };
  }
};
