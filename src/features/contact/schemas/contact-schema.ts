import { z } from 'zod';

import { emailField, nameField } from '@/libs/validation/fields';

export const contactSchema = z.object({
  name: nameField,
  email: emailField,

  message: z.string().trim().min(10, 'Tell us a little more.').max(2000, 'Message is too long.'),

  company_url: z.string().max(0, 'Invalid submission.').optional(),
});
