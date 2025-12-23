import {z } from 'zod';

export const signupSchema = z.object({
  name: z.string().min(2, 'Name is required').max(256, 'Name must be at most 256 characters'),
  email: z.string().min(2, 'Email is required').email('Invalid email address').max(256, 'Email must be at most 256 characters').toLowerCase().trim(),
  password: z.string().min(6, 'Password must be at least 6 characters').max(128, 'Password must be at most 128 characters'),
  role : z.enum(['user', 'admin']).default('user'),
});

export const signInSchema = z.object({
  email: z.string().email('Invalid email address').max(256, 'Email must be at most 256 characters').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
});
