import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { OnboardingForm } from '@/features/onboarding/components/onboarding-form';

export default function OnboardingPage() {
  return (
    <main>
      <Card>
        <CardHeader>
          <CardTitle>Welcome to Koyomi</CardTitle>
          <CardDescription>
            Set up your studio to get started.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <OnboardingForm />
        </CardContent>
      </Card>
    </main>
  );
}