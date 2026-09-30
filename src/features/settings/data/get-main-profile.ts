import 'server-only';

import { requireAuth } from '@/libs/auth/require-auth';

export async function getMainProfile(studioSlug: string) {
  const { supabase } = await requireAuth();

  const { data, error } = await supabase
    .from('studios')
    .select('id, name, slug, bio')
    .eq('slug', studioSlug)
    .single();

  if (error || !data) {
    console.error('Failed to load main profile:', {
      requestedSlug: studioSlug,
      errorCode: error?.code,
      errorMessage: error?.message,
      errorDetails: error?.details,
      data,
    });

    throw new Error('Could not load studio profile.');
  }

  return data;
}