import { Suspense } from 'react';
import { redirect } from 'next/navigation';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import { hasArtistSignupIntent } from '@/features/auth/artist-signup-intent';
import { OnboardingForm } from '@/features/onboarding/components/onboarding-form';

async function OnboardingContent() {
  const hasSignupIntent = await hasArtistSignupIntent();

  if (!hasSignupIntent) {
    redirect('/signup');
  }

  return (
    <Card className='border-border/70 w-full max-w-lg shadow-sm'>
      <CardHeader className='space-y-2 px-6 pt-6 sm:px-8 sm:pt-8'>
        <CardTitle className='text-xl'>Set up your studio</CardTitle>

        <CardDescription>A few details before you start using Koyomi.</CardDescription>
      </CardHeader>

      <CardContent className='px-6 pb-6 sm:px-8 sm:pb-8'>
        <OnboardingForm />
      </CardContent>
    </Card>
  );
}

function OnboardingFallback() {
  return (
    <Card className='w-full max-w-lg shadow-sm'>
      <CardHeader className='space-y-3 px-6 pt-6 sm:px-8 sm:pt-8'>
        <Skeleton className='h-6 w-40' />
        <Skeleton className='h-4 w-64' />
      </CardHeader>

      <CardContent className='space-y-6 px-6 pb-8 sm:px-8'>
        <Skeleton className='h-2 w-full' />
        <Skeleton className='h-7 w-3/4' />
        <Skeleton className='h-10 w-full' />
      </CardContent>
    </Card>
  );
}

export default function OnboardingPage() {
  return (
    <main className='bg-muted/30 flex min-h-svh items-center justify-center px-4 py-10 sm:py-16'>
      <div className='flex w-full justify-center'>
        <Suspense fallback={<OnboardingFallback />}>
          <OnboardingContent />
        </Suspense>
      </div>
    </main>
  );
}
