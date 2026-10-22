import Image from 'next/image';
import Link from 'next/link';

import desktopDisplay from '@/imgs/marketing/hero/desktop-display.webp';
import mobileDisplay from '@/imgs/marketing/hero/mobile-display.webp';

import { MarketingContainer } from './marketing-container';

export function HeroSection() {
  return (
    <section
      id='home'
      data-marketing-section
      className='scroll-mt-28 overflow-hidden pt-20 pb-24 sm:scroll-mt-32 sm:pt-24 lg:pt-28 lg:pb-32'
    >
      <MarketingContainer>
        <div className='mx-auto flex max-w-5xl flex-col items-center text-center'>
          <p className='font-marketing-mono text-sm font-semibold tracking-wide text-[var(--marketing-blue)] sm:text-base'>
            We&apos;re here to help you manage
          </p>

          <h1 className='font-marketing-display mt-6 max-w-none text-4xl leading-tight tracking-tight text-[var(--marketing-ink)] sm:text-5xl xl:text-6xl xl:whitespace-nowrap'>
            Your tattoo business, all in one place
          </h1>

          <p className='font-marketing-body mt-6 max-w-2xl text-base leading-7 text-[var(--marketing-ink)]/400 sm:text-lg'>
            Set up your page for free, show off your work, only pay when you complete appointments. No fixed fees or
            setup fees.
          </p>

          {/* Product preview */}
          <div className='relative mt-12 w-full max-w-4xl pb-10 sm:pb-14'>
            <Image
              src={desktopDisplay}
              alt='Koyomi artist dashboard'
              sizes='(max-width: 640px) calc(100vw - 40px), (max-width: 1024px) 80vw, 896px'
              loading='eager'
              fetchPriority='high'
              className='h-auto w-full'
            />

            <Image
              src={mobileDisplay}
              alt='Koyomi mobile experience'
              sizes='(max-width: 640px) 42vw, (max-width: 1024px) 34vw, 32vw'
              className='absolute right-[1%] -bottom-[5%] h-auto w-[42%] sm:right-[2%] sm:-bottom-[7%] sm:w-[34%] lg:w-[32%]'
            />
          </div>

          <div className='mt-12 flex flex-col items-center gap-3 sm:mt-5'>
            <Link
              href='/signup'
              className='font-marketing-body inline-flex min-w-64 items-center justify-center rounded-full bg-[var(--marketing-accent)] px-8 py-3 font-semibold text-white shadow-[0_6px_0_var(--marketing-dark)] transition-all hover:translate-y-[2px] hover:shadow-[0_4px_0_var(--marketing-dark)] active:translate-y-[6px] active:shadow-none'
            >
              Join as an artist
            </Link>

            <p className='font-marketing-body text-sm text-[var(--marketing-ink)]'>
              No credit card required · No time limit
            </p>
          </div>
        </div>
      </MarketingContainer>
    </section>
  );
}
