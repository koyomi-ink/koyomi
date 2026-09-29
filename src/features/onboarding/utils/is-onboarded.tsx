import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@/libs/supabase/types';

export async function isOnboarded(
  supabase: SupabaseClient<Database>,
  userId: string
) {
  const { data, error } = await supabase
    .from('artists')
    .select('id')
    .eq('auth_user_id', userId)
    .eq('is_active', true)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Failed to check onboarding status:', error);
    throw new Error('Could not check onboarding status');
  }

  return data !== null;
}