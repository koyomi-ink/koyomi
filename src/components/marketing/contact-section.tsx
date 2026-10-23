'use client';

import { useActionState } from 'react';

import { MarketingContainer } from './marketing-container';

import { submitContact, type ContactState } from '@/features/contact/actions/submit-contact';

const initialState: ContactState = {
  status: 'idle',
  message: '',
};

export function ContactSection() {
  const [state, formAction, isPending] = useActionState(submitContact, initialState);

  const hasSent = state.status === 'success';

  return (
    <section id='contact' data-marketing-section className='pt-20 pb-40'>
      <MarketingContainer>
        <div className='grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20'>
          <div className='text-center lg:text-left'>
            <p className='font-marketing-mono text-sm font-semibold tracking-wide text-[var(--marketing-blue)] sm:text-base'>
              You can also
            </p>

            <h2 className='font-marketing-display mt-4 text-4xl leading-tight text-[var(--marketing-ink)] sm:text-5xl lg:text-6xl'>
              Get in touch
            </h2>

            <p className='font-marketing-body mt-6 max-w-lg text-base leading-7 text-[var(--marketing-ink)]/75 sm:text-lg'>
              Whether you have feedback or questions, need help with anything, or just want to say hello, send us a
              message.
            </p>
          </div>

          {hasSent ? (
            <div
              role='status'
              className='flex min-h-48 flex-col items-center justify-center rounded-3xl border border-black/10 bg-white/35 px-8 py-10 text-center'
            >
              <p className='font-marketing-display text-2xl text-[var(--marketing-accent)] sm:text-3xl'>
                Message sent!
              </p>

              <p className='font-marketing-body mt-4 max-w-md text-base leading-7 text-[var(--marketing-ink)]/75'>
                Thanks for reaching out! We&apos;ll get back to you as soon as we can.
              </p>
            </div>
          ) : (
            <form action={formAction} className='relative space-y-6'>
              {/* Honeypot */}
              <div aria-hidden='true' className='absolute -left-[9999px] h-px w-px overflow-hidden'>
                <label htmlFor='contact-company-url'>Leave this field empty</label>

                <input id='contact-company-url' name='company_url' type='text' tabIndex={-1} autoComplete='off' />
              </div>

              <div className='grid gap-6 sm:grid-cols-2'>
                <div>
                  <label
                    htmlFor='contact-name'
                    className='font-marketing-mono mb-2 block text-sm font-medium text-[var(--marketing-ink)]'
                  >
                    Name
                  </label>

                  <input
                    id='contact-name'
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
                    htmlFor='contact-email'
                    className='font-marketing-mono mb-2 block text-sm font-medium text-[var(--marketing-ink)]'
                  >
                    Email
                  </label>

                  <input
                    id='contact-email'
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

              <div>
                <label
                  htmlFor='contact-message'
                  className='font-marketing-mono mb-2 block text-sm font-medium text-[var(--marketing-ink)]'
                >
                  Message
                </label>

                <textarea
                  id='contact-message'
                  name='message'
                  rows={7}
                  required
                  maxLength={2000}
                  disabled={isPending}
                  className='font-marketing-body w-full resize-y rounded-2xl border border-black/15 bg-white/45 px-4 py-3 text-[var(--marketing-ink)] transition outline-none focus:border-[var(--marketing-accent)] focus:ring-2 focus:ring-[var(--marketing-accent)]/20 disabled:cursor-not-allowed disabled:opacity-60'
                />
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
                {isPending ? 'Sending...' : 'Send message'}
              </button>
            </form>
          )}
        </div>
      </MarketingContainer>
    </section>
  );
}
