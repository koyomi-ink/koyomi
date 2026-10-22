import Image from 'next/image';
import Link from 'next/link';

import { MarketingContainer } from './marketing-container';
import { MarketingNavLink } from './marketing-nav-link';

import logo from '@/imgs/branding/logo/extended-red.png';

export function MarketingFooter() {
  return (
    <footer className='bg-[var(--marketing-dark)] py-10 text-white'>
      <MarketingContainer>
        <div className='flex flex-col gap-5'>
          <div className='flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between'>
            <MarketingNavLink
              href='/#home'
              aria-label='Koyomi home'
              className='w-fit rounded-md focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none'
            >
              <Image src={logo} alt='Koyomi' width={190} height={48} className='h-10 w-auto' />
            </MarketingNavLink>
          </div>

          <div className='font-marketing-body flex flex-col gap-4 text-sm text-white/55 sm:flex-row sm:items-center sm:justify-between'>
            <p>© 2026 Koyomi. All rights reserved.</p>

            <div className='flex gap-5'>
              <Link href='/privacy' className='transition-colors hover:text-white'>
                Privacy
              </Link>

              <Link href='/terms' className='transition-colors hover:text-white'>
                Terms
              </Link>
            </div>
          </div>
        </div>
      </MarketingContainer>
    </footer>
  );
}
