
import { z } from 'zod';

// Common validation patterns
const phoneRegex = /^(\+254|0)[17]\d{8}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Base schemas
export const userBaseSchema = z.object({
  firstName: z.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'First name can only contain letters, spaces, hyphens, and apostrophes'),
    
  lastName: z.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Last name can only contain letters, spaces, hyphens, and apostrophes'),
    
  email: z.string()
    .email('Please enter a valid email address')
    .regex(emailRegex, 'Please enter a valid email format'),
    
  phone: z.string()
    .regex(phoneRegex, 'Please enter a valid Kenyan phone number (e.g., +254712345678 or 0712345678)'),
    
  address: z.string()
    .max(200, 'Address must be less than 200 characters')
    .optional(),
});

// Authentication schemas
export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = userBaseSchema.extend({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  confirmPassword: z.string(),
  role: z.enum(['admin', 'officer', 'leader', 'member']).default('member'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  confirmPassword: z.string(),
  token: z.string().min(1, 'Reset token is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// User management schemas
export const userCreateSchema = userBaseSchema.extend({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  role: z.enum(['admin', 'officer', 'leader', 'member']).default('member'),
  status: z.enum(['active', 'inactive', 'suspended', 'pending']).default('active'),
  isMember: z.boolean().default(false),
  memberId: z.string().optional(),
});

export const userUpdateSchema = userBaseSchema.extend({
  role: z.enum(['admin', 'officer', 'leader', 'member']).optional(),
  status: z.enum(['active', 'inactive', 'suspended', 'pending']).optional(),
  isMember: z.boolean().optional(),
  memberId: z.string().optional(),
}).partial();

// Group schemas
export const groupSchema = z.object({
  name: z.string()
    .min(2, 'Group name must be at least 2 characters')
    .max(100, 'Group name must be less than 100 characters'),
    
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
    
  location: z.string()
    .max(200, 'Location must be less than 200 characters'),
    
  meetingDay: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
  
  meetingTime: z.string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time (HH:MM)'),
    
  maxMembers: z.number()
    .min(5, 'Group must allow at least 5 members')
    .max(50, 'Group cannot exceed 50 members'),
    
  status: z.enum(['active', 'inactive', 'suspended']).default('active'),
});

// Loan schemas
export const loanSchema = z.object({
  borrowerId: z.string().min(1, 'Borrower is required'),
  groupId: z.string().min(1, 'Group is required'),
  
  amount: z.number()
    .min(100, 'Loan amount must be at least KES 100')
    .max(1000000, 'Loan amount cannot exceed KES 1,000,000'),
    
  purpose: z.string()
    .min(10, 'Loan purpose must be at least 10 characters')
    .max(500, 'Loan purpose must be less than 500 characters'),
    
  interestRate: z.number()
    .min(0, 'Interest rate cannot be negative')
    .max(50, 'Interest rate cannot exceed 50%'),
    
  termMonths: z.number()
    .min(1, 'Loan term must be at least 1 month')
    .max(60, 'Loan term cannot exceed 60 months'),
    
  guarantors: z.array(z.string()).min(1, 'At least one guarantor is required'),
});

export const repaymentSchema = z.object({
  amount: z.number()
    .min(1, 'Repayment amount must be greater than 0'),
    
  paymentMethod: z.enum(['cash', 'mpesa', 'bank_transfer', 'check']),
  
  reference: z.string()
    .max(100, 'Reference must be less than 100 characters')
    .optional(),
    
  notes: z.string()
    .max(500, 'Notes must be less than 500 characters')
    .optional(),
});

// Savings schemas
export const savingsAccountSchema = z.object({
  userId: z.string().min(1, 'User is required'),
  accountType: z.enum(['regular', 'fixed', 'emergency']).default('regular'),
  
  minimumBalance: z.number()
    .min(0, 'Minimum balance cannot be negative')
    .default(0),
    
  interestRate: z.number()
    .min(0, 'Interest rate cannot be negative')
    .max(20, 'Interest rate cannot exceed 20%')
    .default(0),
});

export const savingsTransactionSchema = z.object({
  type: z.enum(['deposit', 'withdrawal']),
  
  amount: z.number()
    .min(1, 'Amount must be greater than 0'),
    
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
    
  paymentMethod: z.enum(['cash', 'mpesa', 'bank_transfer', 'check']),
  
  reference: z.string()
    .max(100, 'Reference must be less than 100 characters')
    .optional(),
});

// Meeting schemas
export const meetingSchema = z.object({
  title: z.string()
    .min(5, 'Meeting title must be at least 5 characters')
    .max(200, 'Meeting title must be less than 200 characters'),
    
  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
    
  groupId: z.string().min(1, 'Group is required'),
  
  scheduledAt: z.date({
    required_error: 'Meeting date and time is required',
    invalid_type_error: 'Please enter a valid date and time',
  }),
  
  location: z.string()
    .max(200, 'Location must be less than 200 characters'),
    
  agenda: z.array(z.string()).optional(),
  
  type: z.enum(['regular', 'special', 'training', 'loan_review']).default('regular'),
});

// Transaction schemas
export const transactionSchema = z.object({
  type: z.enum([
    'loan_disbursement',
    'loan_repayment', 
    'savings_deposit',
    'savings_withdrawal',
    'fee_payment',
    'interest_payment'
  ]),
  
  amount: z.number()
    .min(0.01, 'Amount must be greater than 0'),
    
  description: z.string()
    .min(5, 'Description must be at least 5 characters')
    .max(500, 'Description must be less than 500 characters'),
    
  relatedUser: z.string().min(1, 'Related user is required'),
  
  relatedLoan: z.string().optional(),
  relatedSavings: z.string().optional(),
  
  paymentMethod: z.enum(['cash', 'mpesa', 'bank_transfer', 'check']).optional(),
  reference: z.string().max(100, 'Reference must be less than 100 characters').optional(),
});

// Chat schemas
export const chatMessageSchema = z.object({
  message: z.string()
    .min(1, 'Message cannot be empty')
    .max(1000, 'Message must be less than 1000 characters'),
    
  groupId: z.string().min(1, 'Group ID is required'),
  chatType: z.enum(['group', 'private']).default('group'),
});

// Settings schemas
export const settingsSchema = z.object({
  siteName: z.string()
    .min(2, 'Site name must be at least 2 characters')
    .max(100, 'Site name must be less than 100 characters'),
    
  currency: z.string().min(3, 'Currency code must be at least 3 characters'),
  
  defaultInterestRate: z.number()
    .min(0, 'Interest rate cannot be negative')
    .max(50, 'Interest rate cannot exceed 50%'),
    
  maxLoanAmount: z.number()
    .min(1000, 'Maximum loan amount must be at least KES 1,000'),
    
  maxLoanTerm: z.number()
    .min(1, 'Maximum loan term must be at least 1 month')
    .max(120, 'Maximum loan term cannot exceed 120 months'),
    
  penaltyRate: z.number()
    .min(0, 'Penalty rate cannot be negative')
    .max(10, 'Penalty rate cannot exceed 10%'),
    
  enableNotifications: z.boolean().default(true),
  enableChat: z.boolean().default(true),
  enableReports: z.boolean().default(true),
});

// Export validation helper
export const validateSchema = (schema, data) => {
  try {
    return {
      success: true,
      data: schema.parse(data),
      errors: null
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      errors: error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
    };
  }
};

export default {
  userBaseSchema,
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  userCreateSchema,
  userUpdateSchema,
  groupSchema,
  loanSchema,
  repaymentSchema,
  savingsAccountSchema,
  savingsTransactionSchema,
  meetingSchema,
  transactionSchema,
  chatMessageSchema,
  settingsSchema,
  validateSchema
};
