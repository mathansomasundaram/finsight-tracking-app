import { z } from 'zod'

/**
 * Transaction form validation schema
 */
export const transactionSchema = z.object({
  date: z.date({
    required_error: 'Date is required',
    invalid_type_error: 'Date must be a valid date',
  }),
  type: z.enum(['income', 'expense'], {
    errorMap: () => ({ message: 'Type must be income or expense' }),
  }),
  amount: z.number({
    required_error: 'Amount is required',
    invalid_type_error: 'Amount must be a number',
  }).positive('Amount must be greater than 0'),
  category: z.string({
    required_error: 'Category is required',
  }).min(1, 'Category cannot be empty'),
  categoryEmoji: z.string().optional(),
  accountName: z.string({
    required_error: 'Account is required',
  }).min(1, 'Account cannot be empty'),
  description: z.string({
    required_error: 'Description is required',
  }).min(1, 'Description cannot be empty'),
  notes: z.string().optional(),
})

export type TransactionFormData = z.infer<typeof transactionSchema>

/**
 * Asset form validation schema
 */
export const assetSchema = z.object({
  name: z.string({
    required_error: 'Asset name is required',
  }).min(1, 'Asset name cannot be empty'),
  type: z.enum([
    'stocks',
    'mutual_funds',
    'gold',
    'crypto',
    'bank_fd',
    'cash',
    'government_scheme',
    'international_equity',
    'bonds',
    'real_estate',
    'retirement',
    'other',
  ], {
    errorMap: () => ({ message: 'Please select a valid asset type' }),
  }),
  currentValue: z.number({
    required_error: 'Current value is required',
    invalid_type_error: 'Current value must be a number',
  }).positive('Current value must be greater than 0'),
  units: z.number().positive('Units must be greater than 0').optional(),
  subType: z.string().trim().min(1).optional(),
  exchange: z.string().trim().min(1).optional(),
  investmentDate: z.date().optional(),
  notes: z.string().optional(),
})

export type AssetFormData = z.infer<typeof assetSchema>

/**
 * Liability form validation schema
 */
export const liabilitySchema = z.object({
  name: z.string({
    required_error: 'Liability name is required',
  }).min(1, 'Liability name cannot be empty'),
  type: z.enum(['personal_loan', 'credit_card', 'informal_loan'], {
    errorMap: () => ({ message: 'Please select a valid liability type' }),
  }),
  totalAmount: z.number({
    required_error: 'Total amount is required',
    invalid_type_error: 'Total amount must be a number',
  }).positive('Total amount must be greater than 0'),
  outstandingAmount: z.number({
    required_error: 'Outstanding amount is required',
    invalid_type_error: 'Outstanding amount must be a number',
  }).positive('Outstanding amount must be greater than 0'),
  notes: z.string().optional(),
}).refine((data) => data.outstandingAmount <= data.totalAmount, {
  message: 'Outstanding amount cannot be more than total amount',
  path: ['outstandingAmount'],
})

export type LiabilityFormData = z.infer<typeof liabilitySchema>

/**
 * Goal form validation schema
 */
export const goalSchema = z.object({
  name: z.string({
    required_error: 'Goal name is required',
  }).min(1, 'Goal name cannot be empty'),
  targetAmount: z.number({
    required_error: 'Target amount is required',
    invalid_type_error: 'Target amount must be a number',
  }).positive('Target amount must be greater than 0'),
  targetDate: z.date({
    required_error: 'Target date is required',
    invalid_type_error: 'Target date must be a valid date',
  }),
  currentAmount: z.number({
    required_error: 'Current amount is required',
    invalid_type_error: 'Current amount must be a number',
  }).nonnegative('Current amount cannot be negative'),
}).refine((data) => data.targetDate > new Date(), {
  message: 'Target date must be in the future',
  path: ['targetDate'],
}).refine((data) => data.currentAmount <= data.targetAmount, {
  message: 'Current amount cannot exceed target amount',
  path: ['currentAmount'],
})

export type GoalFormData = z.infer<typeof goalSchema>

/**
 * Account form validation schema
 */
export const accountSchema = z.object({
  name: z.string({
    required_error: 'Account name is required',
  }).min(1, 'Account name cannot be empty'),
  type: z.enum(['bank', 'credit_card', 'cash', 'wallet'], {
    errorMap: () => ({ message: 'Please select a valid account type' }),
  }),
  balance: z.number({
    required_error: 'Balance is required',
    invalid_type_error: 'Balance must be a number',
  }),
  isActive: z.boolean().optional().default(true),
})

export type AccountFormData = z.infer<typeof accountSchema>

/**
 * User profile form validation schema
 */
export const userSchema = z.object({
  name: z.string({
    required_error: 'Name is required',
  }).min(1, 'Name cannot be empty').max(100, 'Name must be less than 100 characters'),
  email: z.string({
    required_error: 'Email is required',
  }).email('Please enter a valid email address'),
  baseCurrency: z.string({
    required_error: 'Currency is required',
  }).min(1, 'Currency cannot be empty'),
})

export type UserFormData = z.infer<typeof userSchema>

/**
 * Category form validation schema
 */
export const categorySchema = z.object({
  name: z.string({
    required_error: 'Category name is required',
  }).min(1, 'Category name cannot be empty'),
  emoji: z.string({
    required_error: 'Emoji is required',
  }).min(1, 'Please select an emoji'),
  isDefault: z.boolean().optional().default(false),
})

export type CategoryFormData = z.infer<typeof categorySchema>
