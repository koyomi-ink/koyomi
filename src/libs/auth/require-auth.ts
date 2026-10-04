import 'server-only';

import { createSupabaseServerClient } from '@/libs/supabase/supabase-server-client';

export async function requireAuth() {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.getClaims();

  const claims = data?.claims;

  if (error || !claims?.sub) {
    throw new Error('Unauthorized');
  }

  return {
    supabase,
    userId: claims.sub,
  };
}
