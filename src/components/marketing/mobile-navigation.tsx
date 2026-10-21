'use client';

import Link from 'next/link';
import { Menu } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

import { marketingNavigation } from './marketing-navigation';
import { MarketingNavLink } from './marketing-nav-link';

export function MobileNavigation() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button type='button' variant='ghost' size='icon' className='lg:hidden' aria-label='Open navigation'>
          <Menu className='size-5' />
        </Button>
      </SheetTrigger>

      <SheetContent side='right' className='w-[min(88vw,22rem)] bg-[var(--marketing-background)]'>
        <SheetHeader>
          <SheetTitle className='sr-only'>Navigation</SheetTitle>

          <SheetDescription className='sr-only'>Navigate through the Koyomi website.</SheetDescription>
        </SheetHeader>

        <nav aria-label='Mobile navigation' className='flex h-full flex-col px-2 pt-8 pb-6'>
          <div className='flex flex-col'>
            {marketingNavigation.map((item) => (
              <SheetClose key={item.href} asChild>
                <MarketingNavLink
                  href={item.href}
                  className='font-marketing-mono rounded-md px-3 py-3 text-base font-medium text-[var(--marketing-ink)] transition-colors hover:bg-black/5 focus-visible:ring-2 focus-visible:ring-[var(--marketing-accent)] focus-visible:outline-none'
                >
                  {item.label}
                </MarketingNavLink>
              </SheetClose>
            ))}
          </div>

          <div className='mt-auto space-y-3 border-t border-black/10 pt-6'>
            <SheetClose asChild>
              <Link
                href='/login'
                className='flex h-10 items-center justify-center rounded-md text-sm font-medium text-[var(--marketing-ink)] transition-colors hover:bg-black/5 focus-visible:ring-2 focus-visible:ring-[var(--marketing-accent)] focus-visible:outline-none'
              >
                Login
              </Link>
            </SheetClose>

            <SheetClose asChild>
              <Link
                href='/signup'
                className='flex h-10 items-center justify-center rounded-full bg-[var(--marketing-accent)] px-5 text-sm font-medium text-white transition-colors hover:bg-[var(--marketing-accent-hover)] focus-visible:ring-2 focus-visible:ring-[var(--marketing-accent)] focus-visible:ring-offset-2 focus-visible:outline-none'
              >
                Join as an artist
              </Link>
            </SheetClose>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
