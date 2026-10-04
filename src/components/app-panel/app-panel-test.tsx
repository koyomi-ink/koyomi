'use client';

import { Button } from '@/components/ui/button';

import { useAppPanel } from './app-panel-provider';

export function AppPanelTest() {
  const { togglePanel } = useAppPanel();

  return (
    <Button
      onClick={() =>
        togglePanel({
          id: 'test:drawer',
          title: 'Drawer',
          content: (
            <div className='space-y-4'>
              <p className='text-muted-foreground text-sm'>Drawer test</p>

              <div className='rounded-lg border p-4'>fdslkjfdlskj</div>
            </div>
          ),
        })
      }
    >
      Open panel
    </Button>
  );
}
