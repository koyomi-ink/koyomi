import 'server-only';

import { requireAuth } from '@/libs/auth/require-auth';

export async function getStudioMemberships() {
  const { supabase, userId } = await requireAuth();

  const { data, error } = await supabase
    .from('artists')
    .select(
      `
      id,
      role,
      studio_id,
      studios (
        id,
        name,
        slug
      )
    `,
    )
    .eq('auth_user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Failed to load studio memberships:', error);
    throw new Error('Could not load studio memberships');
  }

  return data;
}
