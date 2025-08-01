const Joi = require('joi');
const { ErrorResponse } = require('../utils/errorResponse');

// Common validation schemas
const commonSchemas = {
  objectId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      'string.pattern.base': 'Invalid ID format',
    }),

  email: Joi.string().email().messages({
    'string.email': 'Please provide a valid email address',
  }),

  password: Joi.string().min(6).messages({
    'string.min': 'Password must be at least 6 characters long',
  }),

  phone: Joi.string()
    .pattern(/^\+?[\d\s\-\(\)]+$/)
    .messages({
      'string.pattern.base': 'Please provide a valid phone number',
    }),

  amount: Joi.number().positive().precision(2).messages({
    'number.base': 'Amount must be a number',
    'number.positive': 'Amount must be positive',
    'number.precision': 'Amount can have maximum 2 decimal places',
  }),

  date: Joi.date().iso().messages({
    'date.base': 'Invalid date format',
    'date.format': 'Date must be in ISO format (YYYY-MM-DD)',
  }),

  pagination: {
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sort: Joi.string().optional(),
  },
};

// Validation schemas for different entities
const schemas = {
  // Auth validation
  auth: {
    login: Joi.object({
      email: commonSchemas.email.required(),
      password: commonSchemas.password.required(),
    }),

    register: Joi.object({
      name: Joi.string().min(2).max(50).required().messages({
        'string.min': 'Name must be at least 2 characters long',
        'string.max': 'Name cannot exceed 50 characters',
      }),
      email: commonSchemas.email.required(),
      password: commonSchemas.password.required(),
      phone: commonSchemas.phone.optional(),
      nationalID: Joi.string().optional(),
      gender: Joi.string().valid('male', 'female', 'other').optional(),
      address: Joi.string().max(200).optional().messages({
        'string.max': 'Address cannot exceed 200 characters',
      }),
    }),

    forgotPassword: Joi.object({
      email: commonSchemas.email.required(),
    }),

    resetPassword: Joi.object({
      token: Joi.string().required(),
      password: commonSchemas.password.required(),
    }),
  },

  // User validation
  user: {
    create: Joi.object({
      name: Joi.string().min(2).max(50).required(),
      email: commonSchemas.email.required(),
      password: commonSchemas.password.required(),
      phone: commonSchemas.phone.optional(),
      nationalID: Joi.string().optional(),
      gender: Joi.string().valid('male', 'female', 'other').optional(),
      role: Joi.string()
        .valid('admin', 'officer', 'leader', 'member')
        .default('member'),
      address: Joi.string().max(200).optional(),
    }),

    update: Joi.object({
      name: Joi.string().min(2).max(50).optional(),
      phone: commonSchemas.phone.optional(),
      nationalID: Joi.string().optional(),
      gender: Joi.string().valid('male', 'female', 'other').optional(),
      address: Joi.string().max(200).optional(),
      status: Joi.string().valid('active', 'inactive', 'suspended').optional(),
    }),

    changePassword: Joi.object({
      currentPassword: Joi.string().required(),
      newPassword: commonSchemas.password.required(),
      confirmPassword: Joi.string()
        .valid(Joi.ref('newPassword'))
        .required()
        .messages({
          'any.only': 'Passwords do not match',
        }),
    }),
  },

  // Loan validation
  loan: {
    create: Joi.object({
      borrower: commonSchemas.objectId.required(),
      borrowerModel: Joi.string().valid('User', 'Group').required(),
      amountRequested: commonSchemas.amount.required(),
      interestRate: Joi.number()
        .min(0)
        .max(100)
        .precision(2)
        .default(0)
        .messages({
          'number.min': 'Interest rate cannot be negative',
          'number.max': 'Interest rate cannot exceed 100%',
        }),
      loanTerm: Joi.number().integer().min(1).max(120).required().messages({
        'number.min': 'Loan term must be at least 1 month',
        'number.max': 'Loan term cannot exceed 120 months (10 years)',
      }),
      purpose: Joi.string().max(500).optional().messages({
        'string.max': 'Purpose cannot exceed 500 characters',
      }),
    }),

    approve: Joi.object({
      status: Joi.string().valid('approved', 'rejected').required(),
      amountApproved: Joi.when('status', {
        is: 'approved',
        then: commonSchemas.amount.required(),
        otherwise: Joi.forbidden(),
      }),
      repaymentSchedule: Joi.when('status', {
        is: 'approved',
        then: Joi.array()
          .items(
            Joi.object({
              dueDate: commonSchemas.date.required(),
              amount: commonSchemas.amount.required(),
              status: Joi.string()
                .valid('pending', 'paid', 'overdue')
                .default('pending'),
            })
          )
          .optional(),
        otherwise: Joi.forbidden(),
      }),
      notes: Joi.string().max(1000).optional().messages({
        'string.max': 'Notes cannot exceed 1000 characters',
      }),
    }),

    update: Joi.object({
      amountRequested: commonSchemas.amount.optional(),
      interestRate: Joi.number().min(0).max(100).precision(2).optional(),
      loanTerm: Joi.number().integer().min(1).max(120).optional(),
      purpose: Joi.string().max(500).optional(),
    }),

    payment: Joi.object({
      amount: commonSchemas.amount.required(),
      paymentDate: commonSchemas.date.optional(),
      description: Joi.string().max(500).optional().messages({
        'string.max': 'Description cannot exceed 500 characters',
      }),
    }),
  },

  // Group validation
  group: {
    create: Joi.object({
      name: Joi.string().min(2).max(100).required().messages({
        'string.min': 'Group name must be at least 2 characters long',
        'string.max': 'Group name cannot exceed 100 characters',
      }),
      description: Joi.string().max(500).optional().messages({
        'string.max': 'Description cannot exceed 500 characters',
      }),
      meetingDay: Joi.string()
        .valid(
          'monday',
          'tuesday',
          'wednesday',
          'thursday',
          'friday',
          'saturday',
          'sunday'
        )
        .optional(),
      meetingTime: Joi.string()
        .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .optional()
        .messages({
          'string.pattern.base': 'Meeting time must be in HH:MM format',
        }),
      location: Joi.string().max(200).optional().messages({
        'string.max': 'Location cannot exceed 200 characters',
      }),
    }),

    update: Joi.object({
      name: Joi.string().min(2).max(100).optional(),
      description: Joi.string().max(500).optional(),
      meetingDay: Joi.string()
        .valid(
          'monday',
          'tuesday',
          'wednesday',
          'thursday',
          'friday',
          'saturday',
          'sunday'
        )
        .optional(),
      meetingTime: Joi.string()
        .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .optional(),
      location: Joi.string().max(200).optional(),
      status: Joi.string().valid('active', 'inactive', 'suspended').optional(),
    }),

    addMember: Joi.object({
      userId: commonSchemas.objectId.required(),
      role: Joi.string().valid('member', 'leader').default('member'),
    }),
  },

  // Transaction validation
  transaction: {
    create: Joi.object({
      type: Joi.string()
        .valid(
          'deposit',
          'withdrawal',
          'loan_disbursement',
          'loan_repayment',
          'contribution',
          'fee',
          'adjustment',
          'transfer'
        )
        .required(),
      amount: commonSchemas.amount.required(),
      description: Joi.string().max(500).required().messages({
        'string.max': 'Description cannot exceed 500 characters',
      }),
      member: commonSchemas.objectId.optional(),
      group: commonSchemas.objectId.optional(),
      account: commonSchemas.objectId.optional(),
      relatedEntity: commonSchemas.objectId.optional(),
      relatedEntityType: Joi.string().optional(),
    }),
  },

  // Meeting validation
  meeting: {
    create: Joi.object({
      group: commonSchemas.objectId.required(),
      title: Joi.string().min(2).max(200).required().messages({
        'string.min': 'Meeting title must be at least 2 characters long',
        'string.max': 'Meeting title cannot exceed 200 characters',
      }),
      description: Joi.string().max(1000).optional().messages({
        'string.max': 'Description cannot exceed 1000 characters',
      }),
      date: commonSchemas.date.required(),
      startTime: Joi.string()
        .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .required()
        .messages({
          'string.pattern.base': 'Start time must be in HH:MM format',
        }),
      endTime: Joi.string()
        .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .optional()
        .messages({
          'string.pattern.base': 'End time must be in HH:MM format',
        }),
      location: Joi.string().max(200).optional(),
      agenda: Joi.array().items(Joi.string().max(200)).optional().messages({
        'array.max': 'Agenda cannot have more than 10 items',
      }),
    }),

    update: Joi.object({
      title: Joi.string().min(2).max(200).optional(),
      description: Joi.string().max(1000).optional(),
      date: commonSchemas.date.optional(),
      startTime: Joi.string()
        .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .optional(),
      endTime: Joi.string()
        .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .optional(),
      location: Joi.string().max(200).optional(),
      agenda: Joi.array().items(Joi.string().max(200)).optional(),
      status: Joi.string()
        .valid('scheduled', 'in_progress', 'completed', 'cancelled')
        .optional(),
    }),
  },

  // Settings validation
  settings: {
    app: Joi.object({
      general: Joi.object({
        currency: Joi.string().length(3).default('USD'),
        timezone: Joi.string().default('UTC'),
        language: Joi.string().default('en'),
        dateFormat: Joi.string().default('YYYY-MM-DD'),
        timeFormat: Joi.string().valid('12h', '24h').default('24h'),
      }).optional(),
      loan: Joi.object({
        maxLoanAmount: commonSchemas.amount.optional(),
        minLoanAmount: commonSchemas.amount.optional(),
        maxLoanTerm: Joi.number().integer().min(1).max(120).optional(),
        defaultInterestRate: Joi.number()
          .min(0)
          .max(100)
          .precision(2)
          .optional(),
        requireGuarantors: Joi.boolean().default(false),
        minGuarantors: Joi.number().integer().min(0).optional(),
      }).optional(),
      savings: Joi.object({
        minDepositAmount: commonSchemas.amount.optional(),
        maxWithdrawalAmount: commonSchemas.amount.optional(),
        interestRate: Joi.number().min(0).max(100).precision(2).optional(),
        compoundingFrequency: Joi.string()
          .valid('daily', 'weekly', 'monthly', 'quarterly', 'yearly')
          .optional(),
      }).optional(),
    }),
  },
};

/**
 * Validation middleware factory
 * @param {Object} schema - Joi validation schema
 * @param {string} source - Request source ('body', 'query', 'params')
 * @returns {Function} Express middleware
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
      allowUnknown: false,
    });

    if (error) {
      const errorMessages = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        type: detail.type,
      }));

      return next(new ErrorResponse('Validation failed', 400, errorMessages));
    }

    // Replace request data with validated data
    req[source] = value;
    next();
  };
};

/**
 * Dynamic validation middleware
 * @param {string} schemaPath - Path to schema (e.g., 'auth.login', 'loan.create')
 * @param {string} source - Request source
 * @returns {Function} Express middleware
 */
const validateSchema = (schemaPath, source = 'body') => {
  return (req, res, next) => {
    const pathParts = schemaPath.split('.');
    let schema = schemas;

    for (const part of pathParts) {
      if (!schema[part]) {
        return next(
          new ErrorResponse(`Validation schema '${schemaPath}' not found`, 500)
        );
      }
      schema = schema[part];
    }

    return validate(schema, source)(req, res, next);
  };
};

/**
 * Pagination validation middleware
 * @returns {Function} Express middleware
 */
const validatePagination = () => {
  return validate(Joi.object(commonSchemas.pagination), 'query');
};

/**
 * ObjectId validation middleware
 * @param {string} paramName - Parameter name to validate
 * @returns {Function} Express middleware
 */
const validateObjectId = paramName => {
  return (req, res, next) => {
    const { error } = commonSchemas.objectId.validate(req.params[paramName]);

    if (error) {
      return next(new ErrorResponse(`Invalid ${paramName} format`, 400));
    }

    next();
  };
};

module.exports = {
  validate,
  validateSchema,
  validatePagination,
  validateObjectId,
  schemas,
  commonSchemas,
};
