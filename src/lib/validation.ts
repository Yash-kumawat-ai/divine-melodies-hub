import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const phoneSignupSchema = z.object({
  phone: z.string().regex(/^\+?\d{10,15}$/, 'Please enter a valid phone number'),
});

export const uploadBhajanSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  title_hindi: z.string().min(2, 'Hindi title is required').max(200),
  singer_name: z.string().min(2, 'Singer name is required').max(100),
  composer_name: z.string().max(100).optional(),
  lyrics_hindi: z.string().min(10, 'Lyrics must be at least 10 characters'),
  youtube_url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  language: z.string().min(1, 'Please select a language'),
  deity_id: z.number().int().positive('Please select a deity'),
});

export const profileUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  avatar_url: z.string().url().optional(),
});

export const newsletterSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type UploadBhajanInput = z.infer<typeof uploadBhajanSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type NewsletterInput = z.infer<typeof newsletterSchema>;
