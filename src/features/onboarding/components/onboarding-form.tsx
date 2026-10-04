'use client';

import { useActionState, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { completeOnboarding } from '@/features/onboarding/actions/onboarding';
import { createSlug } from '@/utils/create-slug';
import { formatSlugInput } from '@/utils/format-slug-input';

import type { ActionResponse } from '@/types/action-response';

const TOTAL_STEPS = 4;

const currencies = [
  {
    value: 'EUR',
    label: 'EUR — Euro',
  },
  {
    value: 'GBP',
    label: 'GBP — British Pound',
  },
  {
    value: 'CAD',
    label: 'CAD — Canadian Dollar',
  },
  {
    value: 'USD',
    label: 'USD — US Dollar',
  },
  {
    value: 'AUD',
    label: 'AUD — Australian Dollar',
  },
  {
    value: 'NZD',
    label: 'NZD — New Zealand Dollar',
  },
] as const;

export function OnboardingForm() {
  const [step, setStep] = useState(0);

  const [displayName, setDisplayName] = useState('');

  const [studioName, setStudioName] = useState('');

  const [studioSlug, setStudioSlug] = useState('');

  const [currency, setCurrency] = useState('');

  const [slugEdited, setSlugEdited] = useState(false);

  const [stepError, setStepError] = useState<string | null>(null);

  const [state, formAction, isPending] = useActionState(
    async (previousState: ActionResponse, formData: FormData): Promise<ActionResponse> => {
      const result = await completeOnboarding(previousState, formData);

      if (result.error === 'That booking URL is already taken.') {
        setStep(2);
      }

      return result;
    },
    {
      data: null,
      error: null,
    },
  );

  /*
   * If the server tells us the slug is taken,
   * send the user straight back to the URL step.
   */
  function handleStudioNameChange(value: string) {
    setStudioName(value);
    setStepError(null);

    if (!slugEdited) {
      setStudioSlug(createSlug(value));
    }
  }

  function handleSlugChange(value: string) {
    setSlugEdited(true);
    setStepError(null);

    setStudioSlug(formatSlugInput(value));
  }

  function validateCurrentStep() {
    if (step === 0 && !displayName.trim()) {
      setStepError('Enter your name to continue.');

      return false;
    }

    if (step === 1 && !studioName.trim()) {
      setStepError('Enter your studio or artist name to continue.');

      return false;
    }

    if (step === 2) {
      if (!studioSlug.trim()) {
        setStepError('Choose your Koyomi URL to continue.');

        return false;
      }

      if (studioSlug.length < 3) {
        setStepError('Your Koyomi URL must be at least 3 characters.');

        return false;
      }
    }

    if (step === 3 && !currency) {
      setStepError('Choose a currency to continue.');

      return false;
    }

    setStepError(null);

    return true;
  }

  function handleNext() {
    if (!validateCurrentStep()) {
      return;
    }

    setStep((current) => Math.min(current + 1, TOTAL_STEPS - 1));
  }

  function handlePrevious() {
    setStepError(null);

    setStep((current) => Math.max(current - 1, 0));
  }

  const progress = ((step + 1) / TOTAL_STEPS) * 100;

  return (
    <form action={formAction} className='space-y-8'>
      {/*
       * The visible step controls are managed
       * with React state.
       *
       * These hidden inputs are what actually
       * get submitted to the Server Action.
       */}
      <input type='hidden' name='displayName' value={displayName} />

      <input type='hidden' name='studioName' value={studioName} />

      <input type='hidden' name='studioSlug' value={studioSlug} />

      <input type='hidden' name='currency' value={currency} />

      <div className='space-y-3'>
        <div className='text-muted-foreground flex items-center justify-between text-sm'>
          <span>
            Step {step + 1} of {TOTAL_STEPS}
          </span>

          <span>{Math.round(progress)}%</span>
        </div>

        <div className='bg-muted h-2 overflow-hidden rounded-full'>
          <div
            className='bg-primary h-full rounded-full transition-all duration-300'
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </div>

      <div className='min-h-64'>
        {step === 0 && (
          <div className='space-y-6'>
            <div className='space-y-2'>
              <h2 className='text-2xl font-semibold tracking-tight'>What should we call you?</h2>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='displayName'>Your name</Label>

              <Input
                id='displayName'
                placeholder=''
                autoComplete='name'
                autoFocus
                value={displayName}
                onChange={(event) => {
                  setDisplayName(event.target.value);

                  setStepError(null);
                }}
              />
              <p className='text-muted-foreground text-sm'>
                This is how we&apos;ll call you and how your clients will see you.
              </p>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className='space-y-6'>
            <div className='space-y-2'>
              <h2 className='text-2xl font-semibold tracking-tight'>What&apos;s your studio called?</h2>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='studioName'>Studio name</Label>

              <Input
                id='studioName'
                placeholder=''
                autoComplete='organization'
                autoFocus
                value={studioName}
                onChange={(event) => handleStudioNameChange(event.target.value)}
              />
              <p className='text-muted-foreground text-sm'>If you work independently, your artist name works too.</p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className='space-y-6'>
            <div className='space-y-2'>
              <h2 className='text-2xl font-semibold tracking-tight'>Choose your Koyomi URL</h2>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='studioSlug'>Studio URL</Label>

              <div className='bg-background focus-within:ring-ring flex items-center rounded-md border focus-within:ring-2 focus-within:ring-offset-2'>
                <span className='text-muted-foreground shrink-0 pl-3 text-sm'>koyomi.ink/</span>

                <Input
                  id='studioSlug'
                  placeholder='sakura-tattoo'
                  autoCapitalize='none'
                  autoCorrect='off'
                  spellCheck={false}
                  autoFocus
                  value={studioSlug}
                  onChange={(event) => handleSlugChange(event.target.value)}
                  className='border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0'
                />
              </div>
              <p className='text-muted-foreground text-sm'>
                This will your Digital Hub&apos;s link, where clients can schedule with you.
              </p>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className='space-y-6'>
            <div className='space-y-2'>
              <h2 className='text-2xl font-semibold tracking-tight'>What currency do you use?</h2>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='currency'>Currency</Label>

              <Select
                value={currency}
                onValueChange={(value) => {
                  setCurrency(value);
                  setStepError(null);
                }}
              >
                <SelectTrigger id='currency' className='w-full'>
                  <SelectValue placeholder='Select a currency' />
                </SelectTrigger>

                <SelectContent>
                  {currencies.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <p className='text-muted-foreground text-sm'>This is the currency you&apos;ll be billed in.</p>
              <p className='text-muted-foreground text-sm'>This doesn&apos;t affect how your clients pay you.</p>
            </div>
          </div>
        )}
      </div>

      {stepError && (
        <p role='alert' className='text-destructive text-sm'>
          {stepError}
        </p>
      )}

      {state.error && (
        <p role='alert' className='bg-destructive/10 text-destructive rounded-md px-3 py-2 text-sm'>
          {state.error}
        </p>
      )}

      <div className='flex items-center justify-between gap-3'>
        <Button type='button' variant='outline' disabled={step === 0 || isPending} onClick={handlePrevious}>
          Back
        </Button>

        {step < TOTAL_STEPS - 1 ? (
          <Button type='button' disabled={isPending} onClick={handleNext}>
            Continue
          </Button>
        ) : (
          <Button
            type='submit'
            disabled={isPending || !currency}
            onClick={(event) => {
              if (!validateCurrentStep()) {
                event.preventDefault();
              }
            }}
          >
            {isPending ? 'Creating studio...' : 'Create studio'}
          </Button>
        )}
      </div>
    </form>
  );
}
