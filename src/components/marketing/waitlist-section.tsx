'use client';

import { useActionState } from 'react';

import { MarketingContainer } from './marketing-container';

import { joinWaitlist, type WaitlistState } from '@/features/waitlist/actions/join-waitlist';

const initialState: WaitlistState = {
  status: 'idle',
  message: '',
};

export function WaitlistForm() {
  const [state, formAction, isPending] = useActionState(joinWaitlist, initialState);

  return (
    <section id='waitlist' data-marketing-section className='pt-40 pb-35'>
      <MarketingContainer>
        <div className='grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20'>
          <div className='text-center lg:text-left'>
            <p className='font-marketing-mono text-sm font-semibold tracking-wide text-[var(--marketing-blue)] sm:text-base'>
              Join our
            </p>

            <h2 className='font-marketing-display mt-4 text-4xl leading-tight text-[var(--marketing-ink)] sm:text-5xl lg:text-6xl'>
              Waitlist
            </h2>

            <p className='font-marketing-body mt-6 max-w-lg text-base leading-7 text-[var(--marketing-ink)]/75 sm:text-lg'>
              We will let you know when Koyomi launches.
              <br />
              No spam.
            </p>
          </div>

          <form action={formAction} className='space-y-6'>
            <div className='grid gap-6 sm:grid-cols-2'>
              <div>
                <label
                  htmlFor='waitlist-name'
                  className='font-marketing-mono mb-2 block text-sm font-medium text-[var(--marketing-ink)]'
                >
                  Name
                </label>

                <input
                  id='waitlist-name'
                  name='name'
                  type='text'
                  required
                  autoComplete='name'
                  placeholder='e.g. Jane Doe'
                  className='font-marketing-body w-full rounded-2xl border border-black/15 bg-white/45 px-4 py-3 text-[var(--marketing-ink)] transition outline-none focus:border-[var(--marketing-accent)] focus:ring-2 focus:ring-[var(--marketing-accent)]/20'
                />
              </div>

              <div>
                <label
                  htmlFor='waitlist-email'
                  className='font-marketing-mono mb-2 block text-sm font-medium text-[var(--marketing-ink)]'
                >
                  Email
                </label>

                <input
                  id='waitlist-email'
                  name='email'
                  type='email'
                  required
                  autoComplete='email'
                  placeholder='e.g. jdoe@email.com'
                  className='font-marketing-body w-full rounded-2xl border border-black/15 bg-white/45 px-4 py-3 text-[var(--marketing-ink)] transition outline-none focus:border-[var(--marketing-accent)] focus:ring-2 focus:ring-[var(--marketing-accent)]/20'
                />
              </div>
            </div>

            <button
              type='submit'
              disabled={isPending}
              className='font-marketing-body inline-flex min-w-48 items-center justify-center rounded-full bg-[var(--marketing-accent)] px-8 py-3 font-semibold text-white shadow-[0_6px_0_var(--marketing-dark)] transition-all hover:translate-y-[2px] hover:shadow-[0_4px_0_var(--marketing-dark)] active:translate-y-[6px] active:shadow-none'
            >
              {isPending ? 'Joining...' : 'Join waitlist'}
            </button>
          </form>
        </div>
      </MarketingContainer>
    </section>
  );
}
