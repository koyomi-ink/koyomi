import { PropsWithChildren, Suspense } from 'react';
import { redirect } from 'next/navigation';

import { isOnboarded } from '@/features/onboarding/utils/is-onboarded';
import { createSupabaseServerClient } from '@/libs/supabase/supabase-server-client';

async function OnboardingGate({ children }: PropsWithChildren) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (error || !claims?.sub) {
    redirect('/login');
  }

  const onboarded = await isOnboarded(supabase, claims.sub);

  if (onboarded) {
    redirect('/app');
  }

  return children;
}

export default function OnboardingLayout({ children }: PropsWithChildren) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OnboardingGate>{children}</OnboardingGate>
    </Suspense>
  );
}
