import 'server-only';

import { stripeAdmin } from '@/libs/stripe/stripe-admin';
import { supabaseAdminClient } from '@/libs/supabase/supabase-admin';

type GetOrCreateStudioCustomerParams = {
  studioId: string;
  email: string;
  studioName: string;
};

export async function getOrCreateStudioCustomer({ studioId, email, studioName }: GetOrCreateStudioCustomerParams) {
  const { data: billing, error: billingError } = await supabaseAdminClient
    .from('studio_billing')
    .select('stripe_customer_id')
    .eq('studio_id', studioId)
    .maybeSingle();

  if (billingError) {
    throw billingError;
  }

  if (billing?.stripe_customer_id) {
    return billing.stripe_customer_id;
  }

  const customer = await stripeAdmin.customers.create({
    email,
    name: studioName,
    metadata: {
      studioId,
    },
  });

  const { error: upsertError } = await supabaseAdminClient.from('studio_billing').upsert(
    {
      studio_id: studioId,
      stripe_customer_id: customer.id,
    },
    {
      onConflict: 'studio_id',
    },
  );

  if (upsertError) {
    throw upsertError;
  }

  return customer.id;
}
