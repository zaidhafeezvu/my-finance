import { Request, Response, NextFunction } from 'express'
import Joi from 'joi'
import { ValidationError } from './error.middleware'

// Validation middleware factory
export const validate = (schema: {
  body?: Joi.ObjectSchema
  query?: Joi.ObjectSchema
  params?: Joi.ObjectSchema
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: string[] = []

    // Validate request body
    if (schema.body) {
      const { error } = schema.body.validate(req.body)
      if (error) {
        errors.push(`Body: ${error.details.map(d => d.message).join(', ')}`)
      }
    }

    // Validate query parameters
    if (schema.query) {
      const { error } = schema.query.validate(req.query)
      if (error) {
        errors.push(`Query: ${error.details.map(d => d.message).join(', ')}`)
      }
    }

    // Validate route parameters
    if (schema.params) {
      const { error } = schema.params.validate(req.params)
      if (error) {
        errors.push(`Params: ${error.details.map(d => d.message).join(', ')}`)
      }
    }

    if (errors.length > 0) {
      throw new ValidationError(errors.join('; '))
    }

    next()
  }
}

// Common validation schemas
export const commonSchemas = {
  objectId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/).required(),
  pagination: {
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20)
  },
  dateRange: {
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso().min(Joi.ref('startDate'))
  }
}