import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address').max(254),
  password: z.string().min(8, 'Password must be at least 8 characters').max(72, 'Password must be at most 72 characters')
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').max(254),
  password: z.string().min(1, 'Password is required').max(72)
});

export const profileUpdateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
  email: z.string().email('Invalid email address').max(254).optional()
}).refine(data => data.name !== undefined || data.email !== undefined, {
  message: 'At least one field (name or email) must be provided'
});

export const passwordUpdateSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required').max(72),
  newPassword: z.string().min(8, 'New password must be at least 8 characters').max(72, 'Password must be at most 72 characters')
});

export const apiKeyCreateSchema = z.object({
  name: z.string().min(2, 'Key name must be at least 2 characters').max(100)
});

export const apiKeyUpdateSchema = z.object({
  name: z.string().min(2, 'Key name must be at least 2 characters').max(100).optional(),
  isActive: z.boolean().optional()
}).refine(data => data.name !== undefined || data.isActive !== undefined, {
  message: 'At least one field (name or isActive) must be provided'
});
