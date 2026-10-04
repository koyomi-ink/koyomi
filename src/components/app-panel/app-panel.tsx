'use client';

import { type PointerEvent as ReactPointerEvent, useEffect, useState } from 'react';
import { X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';

import { useAppPanel } from './app-panel-provider';

const DEFAULT_WIDTH = 448;
const MIN_WIDTH = 320;
const MAX_WIDTH = 720;

export function AppPanel() {
  const { panel, closePanel } = useAppPanel();

  const [isCompact, setIsCompact] = useState<boolean | null>(null);
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 1023px)');

    function updateBreakpoint() {
      setIsCompact(media.matches);
    }

    updateBreakpoint();

    media.addEventListener('change', updateBreakpoint);

    return () => {
      media.removeEventListener('change', updateBreakpoint);
    };
  }, []);

  useEffect(() => {
    if (!panel || isCompact !== false) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        closePanel();
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [panel, isCompact, closePanel]);

  function handleResizeStart(event: ReactPointerEvent<HTMLDivElement>) {
    event.preventDefault();

    const startX = event.clientX;
    const startWidth = width;

    setIsResizing(true);

    function handlePointerMove(event: PointerEvent) {
      const difference = startX - event.clientX;

      const availableWidth = Math.max(MIN_WIDTH, window.innerWidth - 320);

      const nextWidth = Math.min(MAX_WIDTH, availableWidth, Math.max(MIN_WIDTH, startWidth + difference));

      setWidth(nextWidth);
    }

    function handlePointerUp() {
      setIsResizing(false);

      window.removeEventListener('pointermove', handlePointerMove);

      window.removeEventListener('pointerup', handlePointerUp);
    }

    window.addEventListener('pointermove', handlePointerMove);

    window.addEventListener('pointerup', handlePointerUp);
  }

  if (isCompact === null) {
    return null;
  }

  if (isCompact) {
    return (
      <Drawer
        open={panel !== null}
        onOpenChange={(open) => {
          if (!open) {
            closePanel();
          }
        }}
      >
        <DrawerContent className='!h-[90dvh] !max-h-[90dvh] !min-h-[90dvh] overflow-hidden'>
          {panel && (
            <>
              <DrawerHeader className='shrink-0 text-left'>
                <div className='flex items-center justify-between gap-4'>
                  <DrawerTitle>{panel.title}</DrawerTitle>

                  <Button variant='ghost' size='icon' onClick={closePanel} aria-label='Close panel'>
                    <X className='size-4' />
                  </Button>
                </div>

                <DrawerDescription className='sr-only'>{panel.title} settings</DrawerDescription>
              </DrawerHeader>

              {/*mobile*/}
              <div className='flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-4 pb-6'>
                {panel.content}
              </div>
            </>
          )}
        </DrawerContent>
      </Drawer>
    );
  }

  if (!panel) {
    return null;
  }

  return (
    <aside
      data-app-panel
      style={{ width }}
      className='bg-background relative flex min-h-0 min-w-0 shrink-0 flex-col border-l'
    >
      <div
        role='separator'
        aria-orientation='vertical'
        aria-label='Resize panel'
        onPointerDown={handleResizeStart}
        className='absolute inset-y-0 -left-1 z-10 w-2 cursor-col-resize'
      >
        <div
          className={`absolute inset-y-0 left-1/2 w-px ${isResizing ? 'bg-primary' : 'hover:bg-border bg-transparent'}`}
        />
      </div>

      <div className='flex h-14 shrink-0 items-center justify-between border-b px-5'>
        <h2 className='font-semibold'>{panel.title}</h2>

        <Button variant='ghost' size='icon' onClick={closePanel} aria-label='Close panel'>
          <X className='size-4' />
        </Button>
      </div>

      {/*desktop*/}
      <div className='flex min-h-0 flex-1 flex-col overflow-y-auto p-5'>{panel.content}</div>
    </aside>
  );
}
