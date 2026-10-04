'use server';

import { redirect } from 'next/navigation';

import { clearArtistSignupIntent, hasArtistSignupIntent } from '@/features/auth/artist-signup-intent';
import { onboardingSchema } from '@/features/onboarding/schemas/onboarding';
import { requireAuth } from '@/libs/auth/require-auth';
import type { ActionResponse } from '@/types/action-response';

export async function completeOnboarding(_previousState: ActionResponse, formData: FormData): Promise<ActionResponse> {
  const { supabase } = await requireAuth();

  /*
   * Authentication alone does not mean this
   * user should be allowed into artist
   * onboarding.
   *
   * They must have explicitly entered through
   * the artist signup flow.
   */
  const hasSignupIntent = await hasArtistSignupIntent();

  if (!hasSignupIntent) {
    return {
      data: null,
      error: 'Your artist signup session has expired. Please start again from the signup page.',
    };
  }

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

  /*
   * Artist onboarding succeeded. The temporary
   * signup intent is no longer needed.
   */
  await clearArtistSignupIntent();

  redirect('/app');
}
