'use server'

import { redirect } from 'next/navigation';

import { stripeAdmin } from '@/libs/stripe/stripe-admin';
import { createSupabaseServerClient } from '@/libs/supabase/supabase-server-client';
import { getEnvVar } from '@/utils/get-env-var';

export async function createPortalSession(formData: FormData) {
  // 1. Extract the studio ID from the form
  const studioId = formData.get('studioId') as string;

  if (!studioId) {
    throw new Error('Missing studioId');
  }

  // 2. Validate the user making the request
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Not authenticated');
  }

  // 3. Fetch the Stripe Customer ID
  // Because the client uses cookies, your RLS policies automatically 
  // ensure the artist can only fetch data for their own studio.
  const { data: studio, error: studioError } = await supabase
    .from('studios')
    .select('stripe_customer_id')
    .eq('id', studioId)
    .single();

  if (studioError || !studio) {
    throw new Error('Studio not found or access denied');
  }

  if (!studio.stripe_customer_id) {
    throw new Error('No active billing profile found for this studio');
  }

  const appUrl = getEnvVar(process.env.NEXT_PUBLIC_APP_URL, 'NEXT_PUBLIC_APP_URL');

  // 4. Generate the secure Customer Portal link
  const session = await stripeAdmin.billingPortal.sessions.create({
    customer: studio.stripe_customer_id,
    return_url: `${appUrl}/dashboard/settings/billing`,
  });

  // 5. Redirect the artist to Stripe's hosted portal
  if (session.url) {
    redirect(session.url);
  } else {
    throw new Error('Failed to create Stripe portal session');
  }
}