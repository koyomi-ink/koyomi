import { PropsWithChildren, Suspense } from 'react';

import { AuthenticatedApp } from '@/features/auth/components/authenticated-app';

export default function AppLayout({
  children,
}: PropsWithChildren) {
  return (
    <Suspense fallback={<div>Loading Koyomi...</div>}>
      <AuthenticatedApp>
        {children}
      </AuthenticatedApp>
    </Suspense>
  );
}