'use client';

import { useActionState } from 'react';

import { joinWaitlist, type WaitlistState } from '@/actions/join-waitlist';

const initialState: WaitlistState = {
  status: 'idle',
  message: '',
};

export function WaitlistForm() {
  const [state, formAction, isPending] = useActionState(joinWaitlist, initialState);

  return (
    <form action={formAction} className='mx-auto flex w-full max-w-xl flex-col gap-3 sm:flex-row'>
      <div className='flex-1'>
        <label htmlFor='waitlist-email' className='sr-only'>
          Email address
        </label>

        <input
          id='waitlist-email'
          name='email'
          type='email'
          required
          autoComplete='email'
          placeholder='you@email.com'
          aria-describedby='waitlist-message'
          className='font-marketing-body w-full rounded-full border-2 border-[var(--marketing-ink)] bg-white px-6 py-3 outline-none focus:border-[var(--marketing-accent)]'
        />
      </div>

      <button
        type='submit'
        disabled={isPending}
        className='font-marketing-body rounded-full bg-[var(--marketing-accent)] px-8 py-3 font-semibold whitespace-nowrap text-white shadow-[0_6px_0_var(--marketing-dark)] transition-all hover:translate-y-[2px] hover:shadow-[0_4px_0_var(--marketing-dark)] active:translate-y-[6px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-60'
      >
        {isPending ? 'Joining...' : 'Join waitlist'}
      </button>

      {state.message && (
        <p id='waitlist-message' className='font-marketing-body text-sm sm:col-span-2'>
          {state.message}
        </p>
      )}
    </form>
  );
}
