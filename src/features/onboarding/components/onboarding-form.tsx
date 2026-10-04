'use client';

import { useActionState, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createSlug } from '@/utils/create-slug';
import { formatSlugInput } from '@/utils/format-slug-input';

import { completeOnboarding } from '@/features/onboarding/actions/onboarding';

export function OnboardingForm() {
  const [studioName, setStudioName] = useState('');
  const [studioSlug, setStudioSlug] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);

  const [state, formAction, isPending] = useActionState(completeOnboarding, {
    data: null,
    error: null,
  });

  function handleStudioNameChange(value: string) {
    setStudioName(value);

    if (!slugEdited) {
      setStudioSlug(createSlug(value));
    }
  }

  function handleSlugChange(value: string) {
    setSlugEdited(true);
    setStudioSlug(formatSlugInput(value));
  }

  return (
    <form action={formAction}>
      <div>
        <Label htmlFor='displayName'>Your name</Label>

        <Input id='displayName' name='displayName' placeholder='Sarah Guerra' autoComplete='name' />
      </div>

      <div>
        <Label htmlFor='studioName'>Studio name</Label>

        <Input
          id='studioName'
          name='studioName'
          placeholder='Sakura Tattoo'
          autoComplete='organization'
          value={studioName}
          onChange={(event) => handleStudioNameChange(event.target.value)}
        />
      </div>

      <div>
        <Label htmlFor='studioSlug'>Booking page</Label>

        <div>
          <span>koyomi.ink/</span>

          <Input
            id='studioSlug'
            name='studioSlug'
            placeholder='sakura-tattoo'
            value={studioSlug}
            onChange={(event) => handleSlugChange(event.target.value)}
          />
        </div>
      </div>

      <div>
        <Label htmlFor='currency'>Currency</Label>

        <Select name='currency'>
          <SelectTrigger id='currency'>
            <SelectValue placeholder='Select a currency' />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value='EUR'>EUR — Euro</SelectItem>

            <SelectItem value='GBP'>GBP — British Pound</SelectItem>

            <SelectItem value='CAD'>CAD — Canadian Dollar</SelectItem>

            <SelectItem value='USD'>USD — US Dollar</SelectItem>

            <SelectItem value='AUD'>AUD — Australian Dollar</SelectItem>

            <SelectItem value='NZD'>NZD — New Zealand Dollar</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {state.error && <p role='alert'>{state.error}</p>}
      <Button type='submit' disabled={isPending}>
        {isPending ? 'Creating studio...' : 'Get started'}
      </Button>
    </form>
  );
}
