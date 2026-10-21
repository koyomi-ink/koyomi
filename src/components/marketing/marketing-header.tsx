import Image from 'next/image';
import Link from 'next/link';

import { MobileNavigation } from './mobile-navigation';
import { marketingNavigation } from './marketing-navigation';

const navigationLinkClassName =
  'rounded-md px-2 py-2 font-marketing-mono text-sm font-medium text-[var(--marketing-ink)] transition-colors hover:text-[var(--marketing-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--marketing-accent)]';

export function MarketingHeader() {
  return (
    <header className='sticky top-0 z-50 px-3 pt-3 before:absolute before:inset-x-0 before:top-0'>
      <nav
        aria-label='Main navigation'
        className='mx-auto flex h-16 w-full max-w-[1600px] items-center gap-6 rounded-full bg-[var(--marketing-background)]/95 px-4 backdrop-blur md:px-6'
      >
        <Link
          href='/'
          aria-label=''
          className='shrink-0 rounded-md focus-visible:ring-2 focus-visible:ring-[var(--marketing-accent)] focus-visible:outline-none'
        >
          <Image src='/nav logo.png' alt='Koyomi' width={190} height={48} priority className='h-10 w-auto' />
        </Link>

        <div className='hidden min-w-0 flex-1 items-center gap-1 lg:flex'>
          {marketingNavigation.map((item) => (
            <Link key={item.href} href={item.href} className={navigationLinkClassName}>
              {item.label}
            </Link>
          ))}
        </div>

        <div className='ml-auto hidden shrink-0 items-center gap-2 lg:flex'>
          <Link href='/login' className={navigationLinkClassName}>
            Login
          </Link>

          <Link
            href='/signup'
            className='inline-flex h-10 items-center justify-center rounded-full bg-[var(--marketing-accent)] px-6 text-sm font-medium text-white transition-colors hover:bg-[var(--marketing-accent-hover)] focus-visible:ring-2 focus-visible:ring-[var(--marketing-accent)] focus-visible:ring-offset-2 focus-visible:outline-none'
          >
            Join as an artist
          </Link>
        </div>

        <div className='ml-auto lg:hidden'>
          <MobileNavigation />
        </div>
      </nav>
    </header>
  );
}
