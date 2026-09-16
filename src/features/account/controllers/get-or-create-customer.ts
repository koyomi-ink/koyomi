import { stripeAdmin } from '@/libs/stripe/stripe-admin';
import { supabaseAdminClient } from '@/libs/supabase/supabase-admin';

export async function getOrCreateStudioCustomer({ studioId, email, studioName }: { studioId: string; email: string; studioName: string }){
  const { data, error } = await supabaseAdminClient
    .from('studios')
    .select('stripe_customer_id')
    .eq('id', studioId)
    .single();

  if (error || !data?.stripe_customer_id) {
    // 1. Create the customer in Stripe
    const customerData = {
      email,
      name: studioName,
      metadata: { studioId },
    } as const;

    const customer = await stripeAdmin.customers.create(customerData);

    // 2. Save the new Stripe ID to the Koyomi studios table
    const { error: supabaseError } = await supabaseAdminClient
      .from('studios')
      .update({ stripe_customer_id: customer.id })
      .eq('id', studioId);

    if (supabaseError) throw supabaseError;

    return customer.id;
  }

  return data.stripe_customer_id;
}