import { z } from 'zod';

export const mainProfileSchema = z.object({
  name: z.string().trim().min(1, 'Studio name is required.').max(100, 'Studio name must be 100 characters or fewer.'),

  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, 'Booking link must have at least 3 characters.')
    .max(50, 'Booking link must be 50 characters or fewer.')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and hyphens.'),

  bio: z.string().trim().max(50, 'Description must be 50 characters or fewer.'),
});

export type MainProfileInput = z.infer<typeof mainProfileSchema>;
