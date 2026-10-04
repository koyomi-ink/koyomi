'use server';

import { redirect } from 'next/navigation';

import { onboardingSchema } from '@/features/onboarding/schemas/onboarding';
import { requireAuth } from '@/libs/auth/require-auth';
import type { ActionResponse } from '@/types/action-response';

export async function completeOnboarding(_previousState: ActionResponse, formData: FormData): Promise<ActionResponse> {
  const { supabase } = await requireAuth();

  const parsed = onboardingSchema.safeParse({
    displayName: formData.get('displayName'),
    studioName: formData.get('studioName'),
    studioSlug: formData.get('studioSlug'),
    currency: formData.get('currency'),
  });

  if (!parsed.success) {
    return {
      data: null,
      error: 'Please check your information and try again.',
    };
  }

  const { displayName, studioName, studioSlug, currency } = parsed.data;

  const { error } = await supabase.rpc('complete_onboarding', {
    p_display_name: displayName,
    p_studio_name: studioName,
    p_studio_slug: studioSlug,
    p_currency: currency,
  });

  if (error) {
    console.error('Failed to complete onboarding:', error);

    if (error.code === '23505' && error.message.includes('studios_slug_key')) {
      return {
        data: null,
        error: 'That booking URL is already taken.',
      };
    }

    return {
      data: null,
      error: 'Could not complete onboarding. Please try again.',
    };
  }

  redirect('/app');
}
