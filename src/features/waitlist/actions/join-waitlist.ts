'use server';

import { z } from 'zod';

const waitlistSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
});

export type WaitlistState = {
  status: 'idle' | 'success' | 'error';
  message: string;
};

export async function joinWaitlist(_previousState: WaitlistState, formData: FormData): Promise<WaitlistState> {
  const result = waitlistSchema.safeParse({
    email: formData.get('email'),
  });

  if (!result.success) {
    return {
      status: 'error',
      message: 'Enter a valid email address.',
    };
  }

  // Insert into Supabase next.

  return {
    status: 'success',
    message: "You're on the list! We'll let you know when Koyomi is ready.",
  };
}
