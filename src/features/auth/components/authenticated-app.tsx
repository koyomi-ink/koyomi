import 'server-only';

import { PropsWithChildren } from 'react';
import { redirect } from 'next/navigation';

import { isOnboarded } from '@/features/onboarding/utils/is-onboarded';
import { requireAuth } from '@/libs/auth/require-auth';

export async function AuthenticatedApp({
  children,
}: PropsWithChildren) {
  const { supabase, userId } = await requireAuth();

  const onboarded = await isOnboarded(supabase, userId);

  if (!onboarded) {
    redirect('/onboarding');
  }

  return children;
}