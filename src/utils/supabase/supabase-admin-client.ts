import 'server-only';

import { createClient } from '@supabase/supabase-js';

import type { Database } from '@/libs/supabase/types';
import { getEnvVar } from '@/utils/get-env-var';

export function createSupabaseAdminClient() {
  return createClient<Database>(
    getEnvVar(process.env.NEXT_PUBLIC_SUPABASE_URL, 'NEXT_PUBLIC_SUPABASE_URL'),
    getEnvVar(process.env.SUPABASE_SERVICE_ROLE_KEY, 'SUPABASE_SERVICE_ROLE_KEY'),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
