'use client';

import { useActionState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent,CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { completeOnboarding } from '@/features/onboarding/actions/complete-onboarding';

const initialState = { error: {} };

export default function OnboardingForm() {
  const [state, formAction, isPending] = useActionState(completeOnboarding, initialState);

  return (
    <Card className="mx-auto max-w-md shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">Claim your Koyomi Hub</CardTitle>
        <CardDescription>
          Set up your studio identity and default ledger currency.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="slug">Studio Slug (URL)</Label>
            <div className="flex items-center rounded-md border border-input bg-background px-3 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
              <span className="text-muted-foreground text-sm select-none">koyomi.ink/</span>
              <input
                id="slug"
                name="slug"
                type="text"
                placeholder="swallowstudio"
                className="w-full bg-transparent py-2 pl-1 outline-none text-sm placeholder:text-muted-foreground"
                required
              />
            </div>
            {(state?.error as any)?.slug && (
              <p className="text-xs text-destructive">{(state.error as any).slug[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Studio Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Swallow Tattoo"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName">Artist Display Name</Label>
            <Input
              id="displayName"
              name="displayName"
              type="text"
              placeholder="Vitor / Swallow"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Currency Code</Label>
            <select
              id="currency"
              name="currency"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="JPY">JPY (¥)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>

          {(state?.error as any)?.form && (
            <p className="text-xs text-destructive">{(state.error as any).form[0]}</p>
          )}

          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-[#2B4C7E] hover:bg-[#2B4C7E]/90 text-white"
          >
            {isPending ? 'Claiming...' : 'Launch Studio Hub'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}