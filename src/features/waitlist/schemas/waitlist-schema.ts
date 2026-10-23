import { z } from 'zod';

import { emailField, nameField } from '@/libs/validation/fields';

export const waitlistSchema = z.object({
  name: nameField,
  email: emailField,

  company_url: z.string().max(0, 'Invalid submission.').optional(),
});

export type WaitlistInput = z.infer<typeof waitlistSchema>;
