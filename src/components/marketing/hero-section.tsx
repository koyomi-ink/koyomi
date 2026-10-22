import Image from 'next/image';
import Link from 'next/link';

import { MarketingContainer } from './marketing-container';

export function HeroSection() {
  return (
    <section id='home' className='overflow-hidden py-15'>
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
              src='/desktop display.png'
              alt='Koyomi artist dashboard'
              preload={true}
              width={1600}
              height={900}
              sizes='(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 896px'
              className='h-auto w-full'
            />

            <Image
              src='/mobile display.png'
              alt='Koyomi mobile experience'
              width={600}
              height={1200}
              sizes='(max-width: 640px) 34vw, 25vw'
              className='absolute right-[0%] -bottom-[0%] h-auto w-[42%] sm:right-[0%] sm:-bottom-[0%] sm:w-[34%]'
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
