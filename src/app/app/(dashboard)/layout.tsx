import { PropsWithChildren, Suspense } from 'react';

import { LogoutButton } from '@/features/auth/components/logout-button';
import { UserInfo } from '@/features/auth/components/user-info';

export default function AppLayout({
  children,
}: PropsWithChildren) {
  return (
    <div>
      <header>
        <span>Koyomi</span>

        <Suspense fallback={<span>Loading user...</span>}>
          <UserInfo />
        </Suspense>

        <LogoutButton />
      </header>

      <main>{children}</main>
    </div>
  );
}