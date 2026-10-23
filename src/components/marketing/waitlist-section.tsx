'use client';

import { useActionState } from 'react';

import { MarketingContainer } from './marketing-container';

import { joinWaitlist, type WaitlistState } from '@/features/waitlist/actions/join-waitlist';

const initialState: WaitlistState = {
  status: 'idle',
  message: '',
};

export function WaitlistSection() {
  const [state, formAction, isPending] = useActionState(joinWaitlist, initialState);

  const hasJoined = state.status === 'success' || state.status === 'already-joined';

  return (
    <section id='waitlist' data-marketing-section className='pt-40 pb-20'>
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

          {hasJoined ? (
            <div
              role='status'
              className='flex min-h-48 flex-col items-center justify-center rounded-3xl border border-black/10 bg-white/35 px-8 py-10 text-center'
            >
              <p className='font-marketing-display text-2xl text-[var(--marketing-accent)] sm:text-3xl'>
                {state.status === 'already-joined' ? 'Already on the list!' : "You're on the list!"}
              </p>

              <p className='font-marketing-body mt-4 max-w-md text-base leading-7 text-[var(--marketing-ink)]/75'>
                {state.status === 'already-joined'
                  ? "We've already got your email. We'll let you know when Koyomi launches."
                  : "Thanks for joining! We'll let you know as soon as Koyomi is ready."}
              </p>
            </div>
          ) : (
            <form action={formAction} className='relative space-y-6'>
              {/* Honeypot */}
              <div aria-hidden='true' className='absolute -left-[9999px] h-px w-px overflow-hidden'>
                <label htmlFor='waitlist-company-url'>Leave this field empty</label>

                <input
                  id='waitlist-company-url'
                  name='waitlist-company-url'
                  type='text'
                  tabIndex={-1}
                  autoComplete='off'
                />
              </div>

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
                    maxLength={100}
                    autoComplete='name'
                    disabled={isPending}
                    placeholder='e.g. Jane Doe'
                    className='font-marketing-body w-full rounded-2xl border border-black/15 bg-white/45 px-4 py-3 text-[var(--marketing-ink)] transition outline-none focus:border-[var(--marketing-accent)] focus:ring-2 focus:ring-[var(--marketing-accent)]/20 disabled:cursor-not-allowed disabled:opacity-60'
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
                    disabled={isPending}
                    placeholder='e.g. jdoe@email.com'
                    className='font-marketing-body w-full rounded-2xl border border-black/15 bg-white/45 px-4 py-3 text-[var(--marketing-ink)] transition outline-none focus:border-[var(--marketing-accent)] focus:ring-2 focus:ring-[var(--marketing-accent)]/20 disabled:cursor-not-allowed disabled:opacity-60'
                  />
                </div>
              </div>

              {state.status === 'error' && (
                <p role='alert' className='font-marketing-body text-sm font-medium text-[var(--marketing-accent)]'>
                  {state.message}
                </p>
              )}

              <button
                type='submit'
                disabled={isPending}
                className='font-marketing-body inline-flex min-w-48 items-center justify-center rounded-full bg-[var(--marketing-accent)] px-8 py-3 font-semibold text-white shadow-[0_6px_0_var(--marketing-dark)] transition-all hover:translate-y-[2px] hover:shadow-[0_4px_0_var(--marketing-dark)] active:translate-y-[6px] active:shadow-none disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60'
              >
                {isPending ? 'Joining...' : 'Join waitlist'}
              </button>
            </form>
          )}
        </div>
      </MarketingContainer>
    </section>
  );
}
