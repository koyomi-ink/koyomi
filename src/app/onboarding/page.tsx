import OnboardingForm from '@/features/onboarding/components/onboarding-form';

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default function OnboardingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-muted/30">
      <OnboardingForm />
    </div>
  );
}