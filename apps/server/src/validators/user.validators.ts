import Joi from 'joi'

// Available options for validation
const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'CNY', 'INR', 'BRL']
const DATE_FORMATS = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']
const TIMEZONES = [
  // North America
  'America/New_York',
  'America/Chicago', 
  'America/Denver',
  'America/Los_Angeles',
  'America/Toronto',
  'America/Vancouver',
  'America/Mexico_City',
  // Europe
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Rome',
  'Europe/Madrid',
  'Europe/Amsterdam',
  'Europe/Stockholm',
  'Europe/Zurich',
  // Asia
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Hong_Kong',
  'Asia/Singapore',
  'Asia/Seoul',
  'Asia/Mumbai',
  'Asia/Dubai',
  'Asia/Bangkok',
  // Oceania
  'Australia/Sydney',
  'Australia/Melbourne',
  'Australia/Perth',
  'Pacific/Auckland',
  // South America
  'America/Sao_Paulo',
  'America/Buenos_Aires',
  'America/Lima',
  // Africa
  'Africa/Cairo',
  'Africa/Johannesburg',
  'Africa/Lagos'
]

// Update preferences validation schema
export const updatePreferencesSchema = {
  body: Joi.object({
    currency: Joi.string()
      .valid(...CURRENCIES)
      .optional()
      .messages({
        'any.only': `Currency must be one of: ${CURRENCIES.join(', ')}`
      }),
    dateFormat: Joi.string()
      .valid(...DATE_FORMATS)
      .optional()
      .messages({
        'any.only': `Date format must be one of: ${DATE_FORMATS.join(', ')}`
      }),
    timezone: Joi.string()
      .valid(...TIMEZONES)
      .optional()
      .messages({
        'any.only': `Timezone must be one of the supported timezones`
      }),
    notifications: Joi.object({
      email: Joi.boolean().optional(),
      push: Joi.boolean().optional(),
      budget: Joi.boolean().optional(),
      bills: Joi.boolean().optional(),
      investments: Joi.boolean().optional(),
      goals: Joi.boolean().optional(),
      security: Joi.boolean().optional(),
      marketing: Joi.boolean().optional()
    }).optional()
  }).min(1).messages({
    'object.min': 'At least one preference field must be provided'
  })
}

// Update profile validation schema
export const updateProfileSchema = {
  body: Joi.object({
    firstName: Joi.string()
      .trim()
      .min(1)
      .max(50)
      .optional()
      .messages({
        'string.min': 'First name cannot be empty',
        'string.max': 'First name cannot exceed 50 characters'
      }),
    lastName: Joi.string()
      .trim()
      .min(1)
      .max(50)
      .optional()
      .messages({
        'string.min': 'Last name cannot be empty',
        'string.max': 'Last name cannot exceed 50 characters'
      }),
    phone: Joi.string()
      .pattern(/^\+?[\d\s\-\(\)]+$/)
      .allow('')
      .optional()
      .messages({
        'string.pattern.base': 'Please provide a valid phone number'
      }),
    timezone: Joi.string()
      .valid(...TIMEZONES)
      .optional()
      .messages({
        'any.only': `Timezone must be one of the supported timezones`
      })
  }).min(1).messages({
    'object.min': 'At least one profile field must be provided'
  })
}

// User ID parameter validation
export const userIdParamSchema = {
  params: Joi.object({
    userId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        'string.pattern.base': 'Invalid user ID format',
        'any.required': 'User ID is required'
      })
  })
}