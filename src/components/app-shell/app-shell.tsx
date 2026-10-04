'use client';

import { type PropsWithChildren } from 'react';

import { AppPanel } from '@/components/app-panel/app-panel';

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className='flex h-full min-h-0 min-w-0 flex-1 overflow-hidden'>
      {children}
      <AppPanel />
    </div>
  );
}
