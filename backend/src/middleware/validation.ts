import { body, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

// Handle validation errors
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: 'path' in err ? err.path : 'unknown',
        message: err.msg
      }))
    });
    return;
  }
  next();
};

// Lead submission validation
export const validateLeadSubmission = [
  body('firstName')
    .trim()
    .notEmpty().withMessage('First name is required')
    .isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters')
    .matches(/^[a-zA-ZäöüÄÖÜßğşıİçÇ\s-]+$/).withMessage('First name contains invalid characters'),
  
  body('lastName')
    .trim()
    .notEmpty().withMessage('Last name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters')
    .matches(/^[a-zA-ZäöüÄÖÜßğşıİçÇ\s-]+$/).withMessage('Last name contains invalid characters'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .matches(/^\+?[0-9\s-]{8,20}$/).withMessage('Invalid phone number format'),
  
  body('dateOfBirth')
    .optional()
    .isISO8601().withMessage('Invalid date format')
    .custom((value) => {
      const date = new Date(value);
      const minDate = new Date();
      minDate.setFullYear(minDate.getFullYear() - 120);
      const maxDate = new Date();
      maxDate.setFullYear(maxDate.getFullYear() - 1);
      
      if (date < minDate || date > maxDate) {
        throw new Error('Invalid date of birth');
      }
      return true;
    }),
  
  body('treatmentType')
    .trim()
    .notEmpty().withMessage('Treatment type is required')
    .isIn([
      'dental',
      'hair_transplant',
      'plastic_surgery',
      'eye_surgery',
      'bariatric',
      'orthopedic',
      'cardiology',
      'oncology',
      'fertility',
      'other'
    ]).withMessage('Invalid treatment type'),
  
  body('medicalDescription')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Medical description must be less than 2000 characters'),
  
  body('preferredLanguage')
    .optional()
    .trim()
    .isIn(['de', 'tr', 'en']).withMessage('Invalid language'),
  
  body('consentPrivacy')
    .isBoolean().withMessage('Privacy consent must be a boolean')
    .custom((value) => {
      if (value !== true) {
        throw new Error('Privacy policy consent is required');
      }
      return true;
    }),
  
  body('consentTerms')
    .isBoolean().withMessage('Terms consent must be a boolean')
    .custom((value) => {
      if (value !== true) {
        throw new Error('Terms and conditions consent is required');
      }
      return true;
    }),
  
  body('consentMarketing')
    .optional()
    .isBoolean().withMessage('Marketing consent must be a boolean'),
  
  body('captchaId')
    .trim()
    .notEmpty().withMessage('Captcha ID is required'),
  
  body('captchaText')
    .trim()
    .notEmpty().withMessage('Captcha text is required'),
  
  handleValidationErrors
];

// Admin login validation
export const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format'),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  
  handleValidationErrors
];

// Lead search validation
export const validateLeadSearch = [
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Search query too long'),
  
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  
  query('status')
    .optional()
    .isIn(['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'ARCHIVED'])
    .withMessage('Invalid status'),
  
  handleValidationErrors
];
