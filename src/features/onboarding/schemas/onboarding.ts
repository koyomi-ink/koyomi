import { z } from 'zod';

export const supportedCurrencies = [
  'USD',
  'GBP',
  'CAD',
  'AUD',
  'EUR',
  'NZD',
] as const;

export const onboardingSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, 'Your name is required.')
    .max(100, 'Your name must be 100 characters or fewer.'),

  studioName: z
    .string()
    .trim()
    .min(1, 'Studio name is required.')
    .max(100, 'Studio name must be 100 characters or fewer.'),

  studioSlug: z
    .string()
    .trim()
    .min(1, 'Studio URL is required.')
    .max(100, 'Studio URL must be 100 characters or fewer.')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Use only lowercase letters, numbers, and hyphens.'
    ),

  currency: z.enum(supportedCurrencies),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;