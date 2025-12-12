import { z } from 'zod'

// Current consent version - update when legal texts change
export const CONSENT_VERSION = '1.0.0'

export const leadSchema = z.object({
  firstName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .regex(/^[a-zA-ZäöüÄÖÜßğşıİçÇ\s-]+$/, 'Name contains invalid characters'),
  
  lastName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .regex(/^[a-zA-ZäöüÄÖÜßğşıİçÇ\s-]+$/, 'Name contains invalid characters'),
  
  email: z
    .string()
    .email('Invalid email address'),
  
  phone: z
    .string()
    .min(8, 'Phone number too short')
    .max(20, 'Phone number too long')
    .regex(/^\+?[0-9\s\-()]+$/, 'Invalid phone number format'),
  
  treatmentType: z.enum([
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
  ], { errorMap: () => ({ message: 'Please select a treatment type' }) }),
  
  message: z
    .string()
    .max(2000, 'Message must be less than 2000 characters')
    .optional(),
  
  preferredLanguage: z
    .enum(['de', 'tr', 'en'])
    .default('de'),
  
  // Required consents
  consentPrivacy: z
    .boolean()
    .refine(val => val === true, 'Privacy policy consent is required'),
  
  acceptAGB: z
    .boolean()
    .refine(val => val === true, 'Terms and conditions acceptance is required'),
  
  consentMarketing: z
    .boolean()
    .default(false),
  
  // Captcha
  captchaToken: z.string().min(1, 'Captcha is required'),
  captchaInput: z.string().min(1, 'Please enter the captcha text'),
  
  // Legal locale
  legalLocale: z.enum(['de', 'tr', 'en'])
})

export type LeadInput = z.infer<typeof leadSchema>

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
})

export type LoginInput = z.infer<typeof loginSchema>

export const searchSchema = z.object({
  search: z.string().max(100).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
})

export type SearchInput = z.infer<typeof searchSchema>

// Treatment type labels for display
export const treatmentTypes = {
  dental: { de: 'Zahnbehandlung', tr: 'Diş Tedavisi', en: 'Dental Treatment' },
  hair_transplant: { de: 'Haartransplantation', tr: 'Saç Ekimi', en: 'Hair Transplant' },
  plastic_surgery: { de: 'Plastische Chirurgie', tr: 'Plastik Cerrahi', en: 'Plastic Surgery' },
  eye_surgery: { de: 'Augenoperation', tr: 'Göz Ameliyatı', en: 'Eye Surgery' },
  bariatric: { de: 'Adipositaschirurgie', tr: 'Obezite Cerrahisi', en: 'Bariatric Surgery' },
  orthopedic: { de: 'Orthopädie', tr: 'Ortopedi', en: 'Orthopedic' },
  cardiology: { de: 'Kardiologie', tr: 'Kardiyoloji', en: 'Cardiology' },
  oncology: { de: 'Onkologie', tr: 'Onkoloji', en: 'Oncology' },
  fertility: { de: 'Fruchtbarkeitsbehandlung', tr: 'Tüp Bebek', en: 'Fertility Treatment' },
  other: { de: 'Sonstiges', tr: 'Diğer', en: 'Other' }
} as const
