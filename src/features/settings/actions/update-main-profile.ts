'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { requireAuth } from '@/libs/auth/require-auth';
import { mainProfileSchema, type MainProfileInput } from '@/features/settings/schemas/main-profile';
import type { ActionResponse } from '@/types/action-response';

export async function updateMainProfile(studioId: string, input: MainProfileInput): Promise<ActionResponse> {
  const { supabase } = await requireAuth();

  // Validate the studio identifier.
  if (!z.uuid().safeParse(studioId).success) {
    return {
      data: null,
      error: 'Invalid studio.',
    };
  }

  // Validate the submitted profile.
  const parsed = mainProfileSchema.safeParse(input);

  if (!parsed.success) {
    return {
      data: null,
      error: 'Please check the information you entered.',
    };
  }

  const { name, slug, bio } = parsed.data;

  // Retrieve the current slug before updating it.
  const { data: currentStudio, error: lookupError } = await supabase
    .from('studios')
    .select('slug')
    .eq('id', studioId)
    .single();

  if (lookupError || !currentStudio) {
    return {
      data: null,
      error: 'Studio not found or access denied.',
    };
  }

  const originalSlug = currentStudio.slug;

  // Update the studio. RLS enforces ownership.
  const { error: updateError } = await supabase
    .from('studios')
    .update({
      name,
      slug,
      bio: bio || null,
    })
    .eq('id', studioId)
    .select('id')
    .single();

  if (updateError) {
    if (updateError.code === '23505') {
      return {
        data: null,
        error: 'This booking link is already taken.',
      };
    }

    console.error('Failed to update studio profile:', updateError);

    return {
      data: null,
      error: 'Could not update the studio profile.',
    };
  }

  // Avoid revalidating the current route if its slug
  // has changed. The client will navigate to the new URL.
  if (slug === originalSlug) {
    revalidatePath('/app', 'layout');
  }

  return {
    data: null,
    error: null,
  };
}
