import 'server-only';

import { PropsWithChildren } from 'react';
import { notFound } from 'next/navigation';

import { AppPanelProvider } from '@/components/app-panel/app-panel-provider';
import { AppShell } from '@/components/app-shell/app-shell';
import { AppPageTitle } from '@/components/app-shell/app-page-title';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { getCurrentStudio } from '@/features/studios/data/get-current-studio';
import { getStudioMemberships } from '@/features/studios/data/get-studio-memberships';

type StudioContextGateProps = PropsWithChildren<{
  studioSlug: string;
}>;

export async function StudioContextGate({ studioSlug, children }: StudioContextGateProps) {
  const memberships = await getStudioMemberships();

  const context = getCurrentStudio(memberships, studioSlug);

  if (!context) {
    notFound();
  }

  return (
    <AppPanelProvider>
      <SidebarProvider className='!h-dvh !min-h-0 overflow-hidden'>
        <AppSidebar currentStudio={context.studio} memberships={memberships} />

        <AppShell>
          <SidebarInset className='flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden'>
            <header className='flex h-14 shrink-0 items-center gap-2 border-b px-4'>
              <SidebarTrigger />

              <AppPageTitle />
            </header>

            <main className='min-h-0 flex-1 overflow-y-auto'>
              <div className='container py-6'>{children}</div>
            </main>
          </SidebarInset>
        </AppShell>
      </SidebarProvider>
    </AppPanelProvider>
  );
}
