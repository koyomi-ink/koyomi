'use server';

import { redirect } from 'next/navigation';

import { z } from 'zod';

import { stripeAdmin } from '@/libs/stripe/stripe-admin';
import { supabaseAdminClient } from '@/libs/supabase/supabase-admin';
import { createSupabaseServerClient } from '@/libs/supabase/supabase-server-client';
import { getEnvVar } from '@/utils/get-env-var';

export async function createPortalSession(formData: FormData) {
  const parsedStudioId = z.uuid().safeParse(formData.get('studioId'));

  if (!parsedStudioId.success) {
    throw new Error('Invalid studio.');
  }

  const studioId = parsedStudioId.data;

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Not authenticated.');
  }

  // Billing is owner-only. Do not rely on the studio
  // SELECT policy for authorization.
  const { data: membership, error: membershipError } = await supabase
    .from('artists')
    .select('id')
    .eq('studio_id', studioId)
    .eq('auth_user_id', user.id)
    .eq('role', 'owner')
    .eq('is_active', true)
    .maybeSingle();

  if (membershipError || !membership) {
    throw new Error('Studio not found or access denied.');
  }

  const { data: billing, error: billingError } = await supabaseAdminClient
    .from('studio_billing')
    .select('stripe_customer_id')
    .eq('studio_id', studioId)
    .maybeSingle();

  if (billingError) {
    throw new Error('Could not load studio billing information.');
  }

  if (!billing?.stripe_customer_id) {
    throw new Error('No active billing profile found for this studio.');
  }

  const { data: studio, error: studioError } = await supabase
    .from('studios')
    .select('slug')
    .eq('id', studioId)
    .single();

  if (studioError || !studio) {
    throw new Error('Could not load studio information.');
  }

  const appUrl = getEnvVar(process.env.NEXT_PUBLIC_APP_URL, 'NEXT_PUBLIC_APP_URL');

  const session = await stripeAdmin.billingPortal.sessions.create({
    customer: billing.stripe_customer_id,
    return_url: `${appUrl}/app/${studio.slug}/settings`,
  });

  if (!session.url) {
    throw new Error('Failed to create Stripe portal session.');
  }

  redirect(session.url);
}
