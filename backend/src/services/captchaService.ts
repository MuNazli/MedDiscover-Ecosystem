import svgCaptcha from 'svg-captcha';
import { prisma } from '../utils/prisma.js';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

export interface CaptchaResponse {
  id: string;
  svg: string;
}

export const captchaService = {
  async generate(): Promise<CaptchaResponse> {
    const captcha = svgCaptcha.create({
      size: 5,
      noise: 3,
      color: true,
      background: '#f0f0f0',
      width: 150,
      height: 50,
      fontSize: 40
    });

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + config.captchaExpiryMinutes);

    const session = await prisma.captchaSession.create({
      data: {
        text: captcha.text.toLowerCase(),
        expiresAt
      }
    });

    logger.debug(`Captcha generated: ${session.id}`);

    return {
      id: session.id,
      svg: captcha.data
    };
  },

  async verify(id: string, text: string): Promise<boolean> {
    try {
      const session = await prisma.captchaSession.findUnique({
        where: { id }
      });

      if (!session) {
        logger.warn(`Captcha not found: ${id}`);
        return false;
      }

      if (session.used) {
        logger.warn(`Captcha already used: ${id}`);
        return false;
      }

      if (new Date() > session.expiresAt) {
        logger.warn(`Captcha expired: ${id}`);
        await prisma.captchaSession.delete({ where: { id } });
        return false;
      }

      const isValid = session.text === text.toLowerCase();

      // Mark as used regardless of validity
      await prisma.captchaSession.update({
        where: { id },
        data: { used: true }
      });

      if (!isValid) {
        logger.warn(`Captcha invalid: ${id}`);
      }

      return isValid;
    } catch (error) {
      logger.error('Captcha verification error:', error);
      return false;
    }
  },

  // Cleanup expired captchas (run periodically)
  async cleanup(): Promise<number> {
    const result = await prisma.captchaSession.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { used: true }
        ]
      }
    });

    logger.info(`Cleaned up ${result.count} expired captchas`);
    return result.count;
  }
};
