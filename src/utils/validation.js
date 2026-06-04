import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export const profileUpdateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email address').optional()
}).refine(data => data.name !== undefined || data.email !== undefined, {
  message: 'At least one field (name or email) must be provided'
});

export const passwordUpdateSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters')
});

export const apiKeyUpdateSchema = z.object({
  name: z.string().min(2, 'Key name must be at least 2 characters').optional(),
  isActive: z.boolean().optional()
}).refine(data => data.name !== undefined || data.isActive !== undefined, {
  message: 'At least one field (name or isActive) must be provided'
});
