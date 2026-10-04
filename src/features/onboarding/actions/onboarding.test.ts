import { beforeEach, describe, expect, it, vi } from 'vitest';

import { completeOnboarding } from './onboarding';

const mocks = vi.hoisted(() => ({
  rpc: vi.fn(),
  requireAuth: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock('@/libs/auth/require-auth', () => ({
  requireAuth: mocks.requireAuth,
}));

vi.mock('next/navigation', () => ({
  redirect: mocks.redirect,
}));

function createValidFormData() {
  const formData = new FormData();

  formData.set('displayName', 'Sarah');
  formData.set('studioName', 'Swallow Studio');
  formData.set('studioSlug', 'swallow-studio');
  formData.set('currency', 'GBP');

  return formData;
}

describe('completeOnboarding', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.requireAuth.mockResolvedValue({
      supabase: {
        rpc: mocks.rpc,
      },
    });

    mocks.rpc.mockResolvedValue({
      data: null,
      error: null,
    });
  });

  it('rejects invalid form data before calling the RPC', async () => {
    const formData = createValidFormData();

    formData.set('studioName', '');

    const result = await completeOnboarding(
      {
        data: null,
        error: null,
      },
      formData,
    );

    expect(result).toEqual({
      data: null,
      error: 'Please check your information and try again.',
    });

    expect(mocks.rpc).not.toHaveBeenCalled();
    expect(mocks.redirect).not.toHaveBeenCalled();
  });

  it('calls the onboarding RPC with validated values', async () => {
    const formData = createValidFormData();

    await completeOnboarding(
      {
        data: null,
        error: null,
      },
      formData,
    );

    expect(mocks.rpc).toHaveBeenCalledWith('complete_onboarding', {
      p_display_name: 'Sarah',
      p_studio_name: 'Swallow Studio',
      p_studio_slug: 'swallow-studio',
      p_currency: 'GBP',
    });
  });

  it('redirects to the app after successful onboarding', async () => {
    const formData = createValidFormData();

    await completeOnboarding(
      {
        data: null,
        error: null,
      },
      formData,
    );

    expect(mocks.redirect).toHaveBeenCalledWith('/app');
  });

  it('returns a clear error when the booking URL is already taken', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    mocks.rpc.mockResolvedValue({
      data: null,
      error: {
        code: '23505',
        message: 'duplicate key value violates unique constraint "studios_slug_key"',
      },
    });

    const result = await completeOnboarding(
      {
        data: null,
        error: null,
      },
      createValidFormData(),
    );

    expect(result).toEqual({
      data: null,
      error: 'That booking URL is already taken.',
    });

    expect(mocks.redirect).not.toHaveBeenCalled();

    consoleError.mockRestore();
  });

  it('returns a generic error when onboarding fails', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    mocks.rpc.mockResolvedValue({
      data: null,
      error: {
        code: 'UNKNOWN',
        message: 'Something went wrong',
      },
    });

    const result = await completeOnboarding(
      {
        data: null,
        error: null,
      },
      createValidFormData(),
    );

    expect(result).toEqual({
      data: null,
      error: 'Could not complete onboarding. Please try again.',
    });

    expect(mocks.redirect).not.toHaveBeenCalled();

    consoleError.mockRestore();
  });
});
