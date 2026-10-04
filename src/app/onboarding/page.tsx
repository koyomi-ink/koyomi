import { Suspense } from 'react';
import { redirect } from 'next/navigation';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { hasArtistSignupIntent } from '@/features/auth/artist-signup-intent';
import { OnboardingForm } from '@/features/onboarding/components/onboarding-form';

async function OnboardingContent() {
  const hasSignupIntent = await hasArtistSignupIntent();

  if (!hasSignupIntent) {
    redirect('/signup');
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome to Koyomi</CardTitle>

        <CardDescription>Set up your studio to get started.</CardDescription>
      </CardHeader>

      <CardContent>
        <OnboardingForm />
      </CardContent>
    </Card>
  );
}

function OnboardingFallback() {
  return (
    <Card>
      <CardHeader>
        <div className='bg-muted h-6 w-40 animate-pulse rounded' />
        <div className='bg-muted h-4 w-56 animate-pulse rounded' />
      </CardHeader>

      <CardContent>
        <div className='bg-muted h-40 animate-pulse rounded' />
      </CardContent>
    </Card>
  );
}

export default function OnboardingPage() {
  return (
    <main>
      <Suspense fallback={<OnboardingFallback />}>
        <OnboardingContent />
      </Suspense>
    </main>
  );
}
