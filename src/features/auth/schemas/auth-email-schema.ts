import { z } from 'zod';

import { emailField } from '@/libs/validation/fields';

export const authEmailSchema = z.object({
  email: emailField.transform((email) => email.toLowerCase()),
});
