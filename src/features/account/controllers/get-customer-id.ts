import { supabaseAdminClient } from '@/libs/supabase/supabase-admin';

export async function getStudioStripeId({ studioId }: { studioId: string }){
  const { data, error } = await supabaseAdminClient
    .from('studios')
    .select('stripe_customer_id')
    .eq('id', studioId)
    .single();

  if (error) {
    throw new Error('Error fetching stripe_customer_id for studio');
  }

  return data.stripe_customer_id;
}