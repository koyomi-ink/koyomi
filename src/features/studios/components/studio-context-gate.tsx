import 'server-only';

import { PropsWithChildren } from 'react';
import { notFound } from 'next/navigation';

import { AppSidebar } from '@/components/app-sidebar';
import { getStudioMemberships } from '@/features/studios/data/get-studio-memberships';
import { getCurrentStudio } from '@/features/studios/data/get-current-studio';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';

type StudioContextGateProps = PropsWithChildren<{
  studioSlug: string;
}>;

export async function StudioContextGate({
  studioSlug,
  children,
}: StudioContextGateProps) {
  const memberships = await getStudioMemberships();

  const context = getCurrentStudio(
    memberships,
    studioSlug
  );

  if (!context) {
    notFound();
  }

  return (
    <SidebarProvider>
      <AppSidebar
        currentStudio={context.studio}
        memberships={memberships}
      />

      <SidebarInset>
        <header className='flex h-14 items-center border-b px-4'>
          <SidebarTrigger />
        </header>

        <main className='flex-1'>
          <div className='container py-6'>
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}