'use server';

import { waitlistSchema } from '@/features/waitlist/schemas/waitlist-schema';
import { createSupabaseAdminClient } from '@/utils/supabase/supabase-admin-client';

export type WaitlistState = {
  status: 'idle' | 'success' | 'error' | 'already-joined';
  message: string;
};

export async function joinWaitlist(_previousState: WaitlistState, formData: FormData): Promise<WaitlistState> {
  const result = waitlistSchema.safeParse({
    name: String(formData.get('name') ?? ''),
    email: String(formData.get('email') ?? ''),
    company_url: String(formData.get('company_url') ?? ''),
  });

  if (!result.success) {
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
    if (error.code === '23505') {
      return {
        status: 'already-joined',
        message: 'This email has already joined the waitlist.',
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
