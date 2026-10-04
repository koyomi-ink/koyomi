import 'server-only';

import { supabaseAdminClient } from '@/libs/supabase/supabase-admin';

export async function getStudioStripeId({ studioId }: { studioId: string }) {
  const { data, error } = await supabaseAdminClient
    .from('studio_billing')
    .select('stripe_customer_id')
    .eq('studio_id', studioId)
    .maybeSingle();

  if (error) {
    throw new Error('Error fetching Stripe customer ID for studio.');
  }

  return data?.stripe_customer_id ?? null;
}
