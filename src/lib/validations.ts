import { z } from 'zod'

export const createSpaceSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens'),
  logo: z.string().url().optional().or(z.literal('')),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#6366f1'),
  thankYouMsg: z.string().max(500).default('Thank you for your testimonial!'),
})

export const submitTestimonialSchema = z.object({
  authorName: z.string().min(1, 'Name is required').max(100),
  authorEmail: z.string().email().optional().or(z.literal('')),
  authorTitle: z.string().max(100).optional().or(z.literal('')),
  companyLogo: z.string().url().optional().or(z.literal('')),
  socialLink: z.string().url().optional().or(z.literal('')),
  videoUrl: z.string().url().optional().or(z.literal('')),
  text: z.string().min(10, 'Please write at least 10 characters').max(2000),
  rating: z.number().int().min(1).max(5).default(5),
})

export const updateTestimonialSchema = z.object({
  status: z.enum(['approved', 'rejected', 'pending']).optional(),
  isFavorite: z.boolean().optional(),
  tags: z.array(z.string().min(1).max(30)).max(10).optional(),
})
