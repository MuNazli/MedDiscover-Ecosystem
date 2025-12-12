import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma.js';
import { config } from '../config/index.js';
import { auditService } from './auditService.js';
import { logger } from '../utils/logger.js';

export interface LoginResult {
  success: boolean;
  token?: string;
  admin?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  error?: string;
}

export const authService = {
  async login(
    email: string, 
    password: string, 
    ipAddress?: string, 
    userAgent?: string
  ): Promise<LoginResult> {
    try {
      const admin = await prisma.admin.findUnique({
        where: { email: email.toLowerCase() }
      });

      if (!admin) {
        await auditService.log({
          action: 'ADMIN_LOGIN_FAILED',
          entityType: 'Admin',
          entityId: email,
          newValue: { reason: 'User not found' },
          ipAddress,
          userAgent
        });
        return { success: false, error: 'Invalid credentials' };
      }

      if (!admin.isActive) {
        await auditService.log({
          action: 'ADMIN_LOGIN_FAILED',
          entityType: 'Admin',
          entityId: admin.id,
          newValue: { reason: 'Account inactive' },
          ipAddress,
          userAgent,
          adminId: admin.id
        });
        return { success: false, error: 'Account is inactive' };
      }

      const validPassword = await bcrypt.compare(password, admin.passwordHash);
      if (!validPassword) {
        await auditService.log({
          action: 'ADMIN_LOGIN_FAILED',
          entityType: 'Admin',
          entityId: admin.id,
          newValue: { reason: 'Invalid password' },
          ipAddress,
          userAgent,
          adminId: admin.id
        });
        return { success: false, error: 'Invalid credentials' };
      }

      // Generate JWT
      const token = jwt.sign(
        {
          adminId: admin.id,
          email: admin.email,
          role: admin.role
        },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn }
      );

      // Update last login
      await prisma.admin.update({
        where: { id: admin.id },
        data: { lastLoginAt: new Date() }
      });

      // Audit log
      await auditService.log({
        action: 'ADMIN_LOGIN',
        entityType: 'Admin',
        entityId: admin.id,
        ipAddress,
        userAgent,
        adminId: admin.id
      });

      logger.info(`Admin logged in: ${admin.email}`);

      return {
        success: true,
        token,
        admin: {
          id: admin.id,
          email: admin.email,
          firstName: admin.firstName,
          lastName: admin.lastName,
          role: admin.role
        }
      };
    } catch (error) {
      logger.error('Login error:', error);
      return { success: false, error: 'Login failed' };
    }
  },

  async validateToken(token: string): Promise<{ valid: boolean; adminId?: string }> {
    try {
      const decoded = jwt.verify(token, config.jwtSecret) as { adminId: string };
      
      const admin = await prisma.admin.findUnique({
        where: { id: decoded.adminId },
        select: { id: true, isActive: true }
      });

      if (!admin || !admin.isActive) {
        return { valid: false };
      }

      return { valid: true, adminId: admin.id };
    } catch {
      return { valid: false };
    }
  },

  async logout(adminId: string, ipAddress?: string, userAgent?: string): Promise<void> {
    await auditService.log({
      action: 'ADMIN_LOGOUT',
      entityType: 'Admin',
      entityId: adminId,
      ipAddress,
      userAgent,
      adminId
    });
    
    logger.info(`Admin logged out: ${adminId}`);
  }
};
