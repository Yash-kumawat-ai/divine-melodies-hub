import { z } from 'zod';
import DOMPurify from 'dompurify';

export const DIETY_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;
export type DeityId = typeof DIETY_IDS[number];

export const LANGUAGES = ['Hindi', 'Sanskrit', 'English', 'Bengali', 'Gujarati', 'Marathi', 'Tamil', 'Telugu'] as const;
export type Language = typeof LANGUAGES[number];

export function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
}

export const loginSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email format')
    .transform(val => val.toLowerCase().trim()),
  password: z.string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

export const signupSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must not exceed 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email format')
    .transform(val => val.toLowerCase().trim()),
  phone: z.string()
    .optional()
    .transform(val => val?.trim())
    .refine(val => !val || /^[0-9+()\-\s]{6,20}$/.test(val), 'Invalid phone number'),
  password: z.string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
    .min(1, 'Please confirm your password'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const bhajanSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .min(2, 'Title must be at least 2 characters')
    .max(100, 'Title must not exceed 100 characters'),
  titleHindi: z.string()
    .min(1, 'Hindi title is required')
    .max(100, 'Hindi title must not exceed 100 characters'),
  deityId: z.number()
    .refine(val => DIETY_IDS.includes(val as DeityId), 'Please select a valid deity'),
  singerName: z.string()
    .min(1, 'Singer name is required')
    .max(100, 'Singer name must not exceed 100 characters'),
  composerName: z.string()
    .max(100, 'Composer name must not exceed 100 characters')
    .optional().or(z.literal('')),
  language: z.string()
    .refine(val => LANGUAGES.includes(val as Language), 'Please select a valid language'),
  lyrics: z.string()
    .max(5000, 'Lyrics must not exceed 5000 characters')
    .transform(val => val.replace(/<[^>]*>/g, '').trim()),
  youtubeUrl: z.string()
    .refine(val => {
      if (!val || val.trim() === '') return true;
      return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/i.test(val.trim());
    }, 'Invalid YouTube URL')
    .optional().or(z.literal('')),
});

export const searchSchema = z.object({
  query: z.string()
    .min(1, 'Search query is required')
    .max(100, 'Search query must not exceed 100 characters'),
  deityId: z.number()
    .optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type BhajanInput = z.infer<typeof bhajanSchema>;
export type SearchInput = z.infer<typeof searchSchema>;