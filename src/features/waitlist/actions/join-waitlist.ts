'use server';

import { z } from 'zod';

import { createSupabaseAdminClient } from '@/utils/supabase/supabase-admin-client';

const waitlistSchema = z.object({
  name: z.string().trim().min(1, 'Enter your name.').max(100, 'Name is too long.'),

  email: z.string().trim().email('Enter a valid email address.'),

  company_url: z.string().max(0, 'Invalid submission.').optional(),
});

export type WaitlistState = {
  status: 'idle' | 'success' | 'error' | 'already-joined';
  message: string;
};

export async function joinWaitlist(_previousState: WaitlistState, formData: FormData): Promise<WaitlistState> {
  console.log('website:', formData.get('waitlist-company-url'));

  const result = waitlistSchema.safeParse({
    name: String(formData.get('name') ?? ''),
    email: String(formData.get('email') ?? ''),
    company_url: String(formData.get('waitlist-company-url') ?? ''),
  });

  if (!result.success) {
    console.error('Waitlist validation failed:', result.error.flatten());

    return {
      status: 'error',
      message: result.error.issues[0]?.message ?? 'Check your details and try again.',
    };
  }

  const supabase = createSupabaseAdminClient();

  const { error } = await supabase.from('waitlist').insert({
    name: result.data.name,
    email: result.data.email.toLowerCase(),
  });

  if (error) {
    // Unique constraint violation: email is already registered.
    if (error.code === '23505') {
      return {
        status: 'already-joined',
        message: "You're already on the waitlist!",
      };
    }

    console.error('Failed to join waitlist:', error);

    return {
      status: 'error',
      message: 'Something went wrong. Please try again.',
    };
  }

  return {
    status: 'success',
    message: "You're on the list! We'll let you know when Koyomi launches.",
  };
}
