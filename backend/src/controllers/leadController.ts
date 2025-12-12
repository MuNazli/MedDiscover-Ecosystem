import { Request, Response, NextFunction } from 'express';
import { leadService, CreateLeadInput } from '../services/leadService.js';
import { captchaService } from '../services/captchaService.js';
import { AuthRequest } from '../middleware/auth.js';
import { LeadStatus } from '@prisma/client';

export const leadController = {
  // POST /api/leads - Create new lead (public)
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input: CreateLeadInput = {
        ...req.body,
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent']
      };

      const result = await leadService.create(input);

      if (!result.success) {
        res.status(400).json({
          success: false,
          error: result.error
        });
        return;
      }

      res.status(201).json({
        success: true,
        message: 'Lead created successfully',
        leadId: result.leadId
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/captcha - Generate captcha (public)
  async getCaptcha(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const captcha = await captchaService.generate();
      
      res.json({
        success: true,
        captcha: {
          id: captcha.id,
          svg: captcha.svg
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/admin/leads - List leads (admin only)
  async list(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { search, status, page, limit } = req.query;

      const result = await leadService.search(
        {
          search: search as string,
          status: status as LeadStatus,
          page: page ? parseInt(page as string, 10) : 1,
          limit: limit ? parseInt(limit as string, 10) : 20
        },
        req.admin!.id
      );

      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/admin/leads/:id - Get lead details (admin only)
  async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const lead = await leadService.getById(
        id,
        req.admin!.id,
        req.ip,
        req.headers['user-agent']
      );

      if (!lead) {
        res.status(404).json({
          success: false,
          error: 'Lead not found'
        });
        return;
      }

      res.json({
        success: true,
        lead
      });
    } catch (error) {
      next(error);
    }
  },

  // PATCH /api/admin/leads/:id/status - Update lead status (admin only)
  async updateStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!Object.values(LeadStatus).includes(status)) {
        res.status(400).json({
          success: false,
          error: 'Invalid status'
        });
        return;
      }

      const lead = await leadService.updateStatus(
        id,
        status,
        req.admin!.id,
        req.ip,
        req.headers['user-agent']
      );

      if (!lead) {
        res.status(404).json({
          success: false,
          error: 'Lead not found'
        });
        return;
      }

      res.json({
        success: true,
        lead
      });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/admin/leads/:id - Delete lead (GDPR) (admin only)
  async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      if (!reason) {
        res.status(400).json({
          success: false,
          error: 'Deletion reason is required'
        });
        return;
      }

      const lead = await leadService.delete(
        id,
        reason,
        req.admin!.id,
        req.ip,
        req.headers['user-agent']
      );

      if (!lead) {
        res.status(404).json({
          success: false,
          error: 'Lead not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Lead deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
};
