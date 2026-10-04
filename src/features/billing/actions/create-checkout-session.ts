'use server';

import { redirect } from 'next/navigation';

import { getOrCreateStudioCustomer } from '@/features/account/controllers/get-or-create-customer';
import { stripeAdmin } from '@/libs/stripe/stripe-admin';
import { createSupabaseServerClient } from '@/libs/supabase/supabase-server-client';
import { getEnvVar } from '@/utils/get-env-var';

export async function createCheckoutSession(formData: FormData) {
  // 1. Extract the required IDs from the form submission
  const priceId = formData.get('priceId') as string;
  const studioId = formData.get('studioId') as string;

  if (!priceId || !studioId) {
    throw new Error('Missing priceId or studioId');
  }

  // 2. Validate the user making the request (Security Check)
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user?.email) {
    throw new Error('Not authenticated');
  }

  // 3. Fetch the studio name from the database for Stripe's records
  const { data: studio, error: studioError } = await supabase
    .from('studios')
    .select('name')
    .eq('id', studioId)
    .single();

  if (studioError || !studio) {
    throw new Error('Studio not found');
  }

  // 4. Use your Get-or-Create Controller to guarantee a Stripe ID
  const customerId = await getOrCreateStudioCustomer({
    studioId,
    email: user.email,
    studioName: studio.name,
  });

  const appUrl = getEnvVar(process.env.NEXT_PUBLIC_APP_URL, 'NEXT_PUBLIC_APP_URL');

  // 5. Generate the secure Checkout Session
  const session = await stripeAdmin.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription', // Tells Stripe this is a recurring/metered plan
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    // CRITICAL: This passes the studioId through Stripe and into your webhook
    subscription_data: {
      metadata: {
        studioId: studioId,
      },
    },
    success_url: `${appUrl}/dashboard?billing=success`,
    cancel_url: `${appUrl}/onboarding/plans?canceled=true`,
  });

  // 6. Redirect the artist to the hosted Stripe page
  if (session.url) {
    redirect(session.url);
  } else {
    throw new Error('Failed to create Stripe session');
  }
}
