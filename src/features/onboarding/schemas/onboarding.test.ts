import { describe, expect, it } from 'vitest';

import { onboardingSchema, supportedCurrencies } from './onboarding';

describe('onboardingSchema', () => {
  const validInput = {
    displayName: 'Sarah',
    studioName: 'Swallow Studio',
    studioSlug: 'swallow-studio',
    currency: 'GBP',
  };

  it('accepts valid onboarding information', () => {
    const result = onboardingSchema.safeParse(validInput);

    expect(result.success).toBe(true);
  });

  it('trims text values', () => {
    const result = onboardingSchema.safeParse({
      ...validInput,
      displayName: '  Sarah  ',
      studioName: '  Swallow Studio  ',
      studioSlug: '  swallow-studio  ',
    });

    expect(result.success).toBe(true);

    if (!result.success) {
      return;
    }

    expect(result.data.displayName).toBe('Sarah');

    expect(result.data.studioName).toBe('Swallow Studio');

    expect(result.data.studioSlug).toBe('swallow-studio');
  });

  it('normalizes the studio slug to lowercase', () => {
    const result = onboardingSchema.safeParse({
      ...validInput,
      studioSlug: 'Swallow-Studio',
    });

    expect(result.success).toBe(true);

    if (!result.success) {
      return;
    }

    expect(result.data.studioSlug).toBe('swallow-studio');
  });

  it('rejects an empty display name', () => {
    const result = onboardingSchema.safeParse({
      ...validInput,
      displayName: '',
    });

    expect(result.success).toBe(false);
  });

  it('rejects an empty studio name', () => {
    const result = onboardingSchema.safeParse({
      ...validInput,
      studioName: '',
    });

    expect(result.success).toBe(false);
  });

  it('rejects an invalid studio slug', () => {
    const result = onboardingSchema.safeParse({
      ...validInput,
      studioSlug: 'swallow studio!',
    });

    expect(result.success).toBe(false);
  });

  it.each(supportedCurrencies)('accepts supported currency %s', (currency) => {
    const result = onboardingSchema.safeParse({
      ...validInput,
      currency,
    });

    expect(result.success).toBe(true);
  });

  it('rejects an unsupported currency', () => {
    const result = onboardingSchema.safeParse({
      ...validInput,
      currency: 'JPY',
    });

    expect(result.success).toBe(false);
  });
});
