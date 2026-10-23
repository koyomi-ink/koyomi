import 'server-only';

import { PropsWithChildren } from 'react';
import { redirect } from 'next/navigation';

import { SessionTimeoutProvider } from '@/features/auth/components/session-timeout-provider';
import { isOnboarded } from '@/features/onboarding/utils/is-onboarded';
import { requireAuth } from '@/libs/auth/require-auth';

export async function AuthenticatedApp({ children }: PropsWithChildren) {
  const { supabase, userId } = await requireAuth();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect('/login');
  }

  const onboarded = await isOnboarded(supabase, userId);

  if (!onboarded) {
    redirect('/onboarding');
  }

  if (!user.last_sign_in_at) {
    await supabase.auth.signOut();
    redirect('/login?error=session');
  }

  const sessionStartedAt = Date.parse(user.last_sign_in_at);

  if (!Number.isFinite(sessionStartedAt)) {
    await supabase.auth.signOut();
    redirect('/login?error=session');
  }

  return (
    <SessionTimeoutProvider userId={userId} sessionStartedAt={sessionStartedAt}>
      {children}
    </SessionTimeoutProvider>
  );
}
