import Link from 'next/link';

import { MarketingContainer } from './marketing-container';

import { MarketingCTA } from './marketing-cta';

export function SignupCTASection() {
  return (
    <section className='py-10'>
      <MarketingContainer>
        <div className='overflow-hidden rounded-[2rem] bg-[var(--marketing-blue)] px-6 py-10 text-center sm:px-10 sm:py-10 lg:px-16 lg:py-10'>
          <div className='mx-auto flex max-w-3xl flex-col items-center'>
            <h2 className='font-marketing-display mt-4 text-4xl leading-tight text-white sm:text-5xl lg:text-6xl'>
              Set up your account for free in 5 minutes.
            </h2>

            <p className='font-marketing-body mt-6 max-w-2xl text-base leading-7 text-white sm:text-lg'>
              No fixed fees or setup fees, only pay when you complete appointments.
            </p>

            <MarketingCTA
              href='/signup'
              label='Join as an artist'
              variant='light-shadow'
              subtitle='No credit card required · No time limit'
              className='mt-15'
              subtitleClassName='text-white'
            />
          </div>
        </div>
      </MarketingContainer>
    </section>
  );
}
