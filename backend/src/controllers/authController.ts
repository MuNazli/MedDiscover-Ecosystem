import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService.js';
import { AuthRequest } from '../middleware/auth.js';

export const authController = {
  // POST /api/auth/login
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      const result = await authService.login(
        email,
        password,
        req.ip,
        req.headers['user-agent']
      );

      if (!result.success) {
        res.status(401).json({
          success: false,
          error: result.error
        });
        return;
      }

      res.json({
        success: true,
        token: result.token,
        admin: result.admin
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/auth/logout
  async logout(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.admin) {
        await authService.logout(
          req.admin.id,
          req.ip,
          req.headers['user-agent']
        );
      }

      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/auth/me
  async me(req: AuthRequest, res: Response): Promise<void> {
    res.json({
      success: true,
      admin: req.admin
    });
  },

  // POST /api/auth/validate
  async validateToken(req: Request, res: Response): Promise<void> {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({
        success: false,
        valid: false
      });
      return;
    }

    const result = await authService.validateToken(token);
    
    res.json({
      success: true,
      valid: result.valid
    });
  }
};
