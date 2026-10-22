import Link from 'next/link';

import { MarketingContainer } from './marketing-container';

import { ArrowRight } from 'lucide-react';

export function PricingSection() {
  return (
    <section id='pricing' data-marketing-section className='mt-10 bg-[var(--marketing-dark)] py-15 text-white'>
      <MarketingContainer>
        <div className='mx-auto max-w-4xl text-center'>
          <p className='font-marketing-mono text-sm font-semibold tracking-wide text-[var(--marketing-blue)] sm:text-base'>
            We keep it fair with
          </p>

          <h2 className='font-marketing-display mt-4 text-4xl leading-tight sm:text-5xl lg:text-6xl'>Pricing</h2>

          <p className='font-marketing-body mx-auto mt-6 max-w-2xl text-base leading-7 text-white/70 sm:text-lg'>
            You pay for completed appointments, with a monthly limit.
            <br />
            No fixed fees or setup fees.
          </p>
        </div>

        <div className='mx-auto mt-10 max-w-120 rounded-[2.5rem] border-2 border-white/40 p-6 text-white/70'>
          <div className='text-center'>
            <div className='flex flex-wrap items-end justify-center gap-x-3'>
              <span className='font-marketing-display text-6xl leading-none text-[var(--marketing-accent)] sm:text-7xl lg:text-8xl'>
                £5
              </span>
            </div>

            <p className='font-marketing-body mt-5 text-lg'>
              per completed appointment.
              <br />
              Capped at <strong className='text-[var(--marketing-accent)]'>£30 a month</strong>.
            </p>
          </div>
        </div>
        <div>
          <div className='mx-auto mt-10 w-full max-w-120 rounded-[2.5rem] bg-[var(--marketing-ink)]/70 px-4 py-6 text-white/70 sm:px-6'>
            <div className='mx-auto grid w-full max-w-sm grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 sm:gap-5'>
              <div className='text-center'>
                <p className='font-marketing-mono text-xs sm:text-sm'>Upfront</p>

                <p className='font-marketing-display mt-2 text-2xl text-[var(--marketing-accent)]'>£0</p>
              </div>

              <ArrowRight aria-hidden='true' strokeWidth={3} className='w-5 shrink-0 sm:w-6' />

              <div className='text-center'>
                <p className='font-marketing-mono text-xs sm:text-sm'>Monthly max</p>

                <p className='font-marketing-display mt-2 text-2xl text-[var(--marketing-accent)]'>£30</p>
              </div>
            </div>
          </div>

          <div className='mt-5 grid gap-3 text-center sm:grid-cols-1'>
            <p className='font-marketing-body text-sm'>No charge for cancellations.</p>
          </div>

          <div className='mt-12 flex flex-col items-center'>
            <Link
              href='/signup'
              className='font-marketing-body inline-flex min-w-64 items-center justify-center rounded-full bg-[var(--marketing-accent)] px-8 py-3 font-semibold text-white shadow-[0_6px_0_var(--marketing-background)] transition-all hover:translate-y-[2px] hover:shadow-[0_4px_0_var(--marketing-background)] active:translate-y-[6px] active:shadow-none'
            >
              Join as an artist
            </Link>

            <p className='font-marketing-body mt-4 text-sm text-white'>No credit card required · No setup fee</p>
          </div>
        </div>
      </MarketingContainer>
    </section>
  );
}
