'use client';

import { type FormEvent, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import type { ActionResponse } from '@/types/action-response';

type AuthMode = 'login' | 'artist-signup';

type AuthUIProps = {
  mode: AuthMode;
  authenticateWithOAuth: (provider: 'google') => Promise<ActionResponse>;
  authenticateWithEmail: (email: string) => Promise<ActionResponse>;
  initialError?: string | null;
};

const content = {
  login: {
    title: 'Sign in',
    description: 'Continue to your Koyomi account.',
    emailSuccess: 'If this email is linked to a Koyomi account, check your inbox for a sign-in link.',
  },

  'artist-signup': {
    title: 'Create your artist account',
    description: 'Set up your studio and start managing your bookings, clients and schedule.',
    emailSuccess: 'Check your email to continue setting up your artist account.',
  },
} as const;

export function AuthUI({ mode, authenticateWithOAuth, authenticateWithEmail, initialError = null }: AuthUIProps) {
  const [pending, setPending] = useState(false);

  const [message, setMessage] = useState<string | null>(initialError);

  const [isError, setIsError] = useState(Boolean(initialError));

  async function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;

    const formData = new FormData(form);

    const email = String(formData.get('email') ?? '').trim();

    if (!email) {
      return;
    }

    setPending(true);
    setMessage(null);
    setIsError(false);

    const response = await authenticateWithEmail(email);

    if (response?.error) {
      setIsError(true);
      setMessage(response.error);
      setPending(false);
      return;
    }

    setMessage(content[mode].emailSuccess);

    form.reset();
    setPending(false);
  }

  async function handleOAuthClick() {
    setPending(true);
    setMessage(null);
    setIsError(false);

    const response = await authenticateWithOAuth('google');

    if (response?.error) {
      setIsError(true);
      setMessage(response.error);
      setPending(false);
    }
  }

  return (
    <div className='bg-background w-full rounded-xl border p-6 shadow-sm sm:p-8'>
      <div className='flex flex-col items-center text-center'>
        <Image src='/logo.png' width={56} height={56} alt='Koyomi' priority />

        <h1 className='mt-6 text-2xl font-semibold tracking-tight'>{content[mode].title}</h1>

        <p className='text-muted-foreground mt-2 text-sm'>{content[mode].description}</p>
      </div>

      <div className='mt-8'>
        <Button type='button' variant='outline' className='w-full' disabled={pending} onClick={handleOAuthClick}>
          {pending ? (
            <Loader2 className='animate-spin' />
          ) : (
            <span className='flex size-5 items-center justify-center rounded-sm border text-xs font-semibold'>G</span>
          )}
          Continue with Google
        </Button>

        <div className='my-6 flex items-center gap-3'>
          <Separator className='flex-1' />

          <span className='text-muted-foreground text-xs uppercase'>or</span>

          <Separator className='flex-1' />
        </div>

        <form onSubmit={handleEmailSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <label htmlFor='email' className='text-sm font-medium'>
              Email
            </label>

            <Input
              id='email'
              name='email'
              type='email'
              placeholder='you@example.com'
              autoComplete='email'
              required
              disabled={pending}
            />
          </div>

          <Button type='submit' className='w-full' disabled={pending}>
            {pending && <Loader2 className='animate-spin' />}
            Continue with email
          </Button>
        </form>

        {message && (
          <div
            role={isError ? 'alert' : 'status'}
            className={
              isError
                ? 'bg-destructive/10 text-destructive mt-4 rounded-md px-3 py-2 text-sm'
                : 'bg-muted text-muted-foreground mt-4 rounded-md px-3 py-2 text-sm'
            }
          >
            {message}
          </div>
        )}
      </div>

      {mode === 'login' ? (
        <p className='text-muted-foreground mt-6 text-center text-sm'>
          Tattoo artist?{' '}
          <Link href='/signup' className='text-foreground font-medium underline underline-offset-4'>
            Create your studio
          </Link>
        </p>
      ) : (
        <>
          <p className='text-muted-foreground mt-6 text-center text-sm'>
            Already have an account?{' '}
            <Link href='/login' className='text-foreground font-medium underline underline-offset-4'>
              Sign in
            </Link>
          </p>

          <div className='bg-muted text-muted-foreground mt-6 rounded-md px-4 py-3 text-center text-sm'>
            Looking to book a tattoo? You don&apos;t need to create an account here. Use your artist&apos;s booking page
            instead.
          </div>

          <p className='text-muted-foreground mt-6 text-center text-xs'>
            By continuing, you agree to our{' '}
            <Link href='/terms' className='hover:text-foreground underline underline-offset-4'>
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href='/privacy' className='hover:text-foreground underline underline-offset-4'>
              Privacy Policy
            </Link>
            .
          </p>
        </>
      )}
    </div>
  );
}
