import rateLimit from 'express-rate-limit';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

// General rate limiter
export const generalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    success: false,
    error: 'Too many requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json(options.message);
  }
});

// Stricter rate limiter for lead submission
export const leadSubmissionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 submissions per hour per IP
  message: {
    success: false,
    error: 'Too many lead submissions. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    logger.warn(`Lead submission rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json(options.message);
  }
});

// Login rate limiter (prevents brute force)
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts per 15 minutes
  message: {
    success: false,
    error: 'Too many login attempts. Please try again in 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    logger.warn(`Login rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json(options.message);
  }
});

// Captcha rate limiter
export const captchaLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 captcha requests per minute
  message: {
    success: false,
    error: 'Too many captcha requests. Please wait.'
  },
  standardHeaders: true,
  legacyHeaders: false
});
