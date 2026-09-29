import { PropsWithChildren, Suspense } from 'react';

import { AppSidebar } from '@/components/app-sidebar';
import { AuthenticatedApp } from '@/features/auth/components/authenticated-app';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';

export default function AppLayout({
  children,
}: PropsWithChildren) {
  return (
    <Suspense fallback={<div>Loading Koyomi...</div>}>
      <AuthenticatedApp>
        <SidebarProvider>
          <AppSidebar />

          <SidebarInset>
            <header className='flex h-14 items-center border-b px-4'>
              <SidebarTrigger />
            </header>
            <main className='flex-1'>
              <div className='container py-6'>{children}</div>
            </main>
          </SidebarInset>
        </SidebarProvider>
      </AuthenticatedApp>
    </Suspense>
  );
}