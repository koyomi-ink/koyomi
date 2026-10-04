import { Suspense } from 'react';

import { signInWithEmail, signInWithOAuth } from '@/features/auth/actions/auth-actions';
import { AuthUI } from '@/features/auth/components/auth-ui';

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

const errorMessages: Record<string, string> = {
  'no-account':
    'We could not find a Koyomi account for this sign-in. If you are a tattoo artist, create an artist account instead.',

  'auth-callback': 'We could not complete sign-in. Please try again.',

  'auth-routing': 'We could not determine which Koyomi account to open. Please try again.',
};

async function LoginContent({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;

  const initialError = error ? (errorMessages[error] ?? 'Something went wrong. Please try again.') : null;

  return (
    <AuthUI
      mode='login'
      authenticateWithOAuth={signInWithOAuth}
      authenticateWithEmail={signInWithEmail}
      initialError={initialError}
    />
  );
}

function LoginFallback() {
  return <AuthUI mode='login' authenticateWithOAuth={signInWithOAuth} authenticateWithEmail={signInWithEmail} />;
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  return (
    <main className='bg-muted/30 relative flex min-h-svh items-center justify-center overflow-hidden px-4 py-12'>
      <div
        aria-hidden='true'
        className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.06),transparent_40%)] dark:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_40%)]'
      />

      <div className='relative w-full max-w-sm'>
        <Suspense fallback={<LoginFallback />}>
          <LoginContent searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}
