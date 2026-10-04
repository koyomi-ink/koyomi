import { signUpArtistWithEmail, signUpArtistWithOAuth } from '@/features/auth/actions/auth-actions';
import { AuthUI } from '@/features/auth/components/auth-ui';

export default function SignupPage() {
  return (
    <main className='bg-muted/30 relative flex min-h-svh items-center justify-center overflow-hidden px-4 py-12'>
      <div
        aria-hidden='true'
        className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.06),transparent_40%)] dark:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_40%)]'
      />

      <div className='relative w-full max-w-sm'>
        <AuthUI
          mode='artist-signup'
          authenticateWithOAuth={signUpArtistWithOAuth}
          authenticateWithEmail={signUpArtistWithEmail}
        />
      </div>
    </main>
  );
}
