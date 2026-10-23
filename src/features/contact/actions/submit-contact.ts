'use server';

import { contactSchema } from '@/features/contact/schemas/contact-schema';
import { createSupabaseAdminClient } from '@/utils/supabase/supabase-admin-client';

export type ContactState = {
  status: 'idle' | 'success' | 'error';
  message: string;
};

export async function submitContact(_previousState: ContactState, formData: FormData): Promise<ContactState> {
  const honeypot = String(formData.get('company_url') ?? '');

  if (honeypot) {
    return {
      status: 'success',
      message: 'Thanks! We’ll get back to you soon.',
    };
  }

  const result = contactSchema.safeParse({
    name: String(formData.get('name') ?? ''),
    email: String(formData.get('email') ?? ''),
    message: String(formData.get('message') ?? ''),
    company_url: '',
  });

  if (!result.success) {
    return {
      status: 'error',
      message: result.error.issues[0]?.message ?? 'Check your details and try again.',
    };
  }

  const supabase = createSupabaseAdminClient();

  const { error } = await supabase.from('contact_messages').insert({
    name: result.data.name,
    email: result.data.email.toLowerCase(),
    message: result.data.message,
  });

  if (error) {
    console.error('Failed to submit contact form:', error);

    return {
      status: 'error',
      message: 'Something went wrong. Please try again.',
    };
  }

  return {
    status: 'success',
    message: 'Thanks! We’ll get back to you soon.',
  };
}
