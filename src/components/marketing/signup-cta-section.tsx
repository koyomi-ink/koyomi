import Link from 'next/link';

import { MarketingContainer } from './marketing-container';

export function SignupCTASection() {
  return (
    <section className='py-12 sm:py-16 lg:py-10'>
      <MarketingContainer>
        <div className='overflow-hidden rounded-[2rem] bg-[var(--marketing-blue)] px-6 py-10 text-center sm:px-10 sm:py-10 lg:px-16 lg:py-10'>
          <div className='mx-auto flex max-w-3xl flex-col items-center'>
            <h2 className='font-marketing-display mt-4 text-4xl leading-tight text-white sm:text-5xl lg:text-6xl'>
              Set up your account for free in 5 minutes.
            </h2>

            <p className='font-marketing-body mt-6 max-w-2xl text-base leading-7 text-white/85 sm:text-lg'>
              No fixed fees or setup fees, only pay when you complete appointments.
            </p>

            <Link
              href='/signup'
              className='font-marketing-body mt-10 inline-flex min-w-64 items-center justify-center rounded-full bg-[var(--marketing-accent)] px-8 py-3 font-semibold text-white shadow-[0_6px_0_var(--marketing-dark)] transition-all hover:translate-y-[2px] hover:shadow-[0_4px_0_var(--marketing-dark)] active:translate-y-[6px] active:shadow-none'
            >
              Join as an artist
            </Link>

            <p className='font-marketing-body mt-4 text-sm text-white/85'>No credit card required · No time limit</p>
          </div>
        </div>
      </MarketingContainer>
    </section>
  );
}
