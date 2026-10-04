import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '@testing-library/react';

import userEvent from '@testing-library/user-event';

import { OnboardingForm } from './onboarding-form';

vi.mock('@/features/onboarding/actions/onboarding', () => ({
  completeOnboarding: vi.fn(),
}));

describe('OnboardingForm', () => {
  it('renders the onboarding fields', () => {
    render(<OnboardingForm />);

    expect(screen.getByLabelText('Your name')).toBeInTheDocument();

    expect(screen.getByLabelText('Studio name')).toBeInTheDocument();

    expect(screen.getByLabelText('Booking page')).toBeInTheDocument();

    expect(screen.getByLabelText('Currency')).toBeInTheDocument();

    expect(
      screen.getByRole('button', {
        name: 'Get started',
      }),
    ).toBeInTheDocument();
  });

  it('automatically generates the slug from the studio name', async () => {
    const user = userEvent.setup();

    render(<OnboardingForm />);

    const studioName = screen.getByLabelText('Studio name');

    const studioSlug = screen.getByLabelText('Booking page');

    await user.type(studioName, 'Swallow Studio');

    expect(studioSlug).toHaveValue('swallow-studio');
  });

  it('formats the automatically generated slug', async () => {
    const user = userEvent.setup();

    render(<OnboardingForm />);

    const studioName = screen.getByLabelText('Studio name');

    const studioSlug = screen.getByLabelText('Booking page');

    await user.type(studioName, 'My COOL Studio!!');

    expect(studioSlug).toHaveValue('my-cool-studio');
  });

  it('allows the slug to be manually edited', async () => {
    const user = userEvent.setup();

    render(<OnboardingForm />);

    const studioSlug = screen.getByLabelText('Booking page');

    await user.type(studioSlug, 'Custom Link');

    expect(studioSlug).toHaveValue('custom-link');
  });

  it('stops automatically changing the slug after manual editing', async () => {
    const user = userEvent.setup();

    render(<OnboardingForm />);

    const studioName = screen.getByLabelText('Studio name');

    const studioSlug = screen.getByLabelText('Booking page');

    await user.type(studioName, 'Swallow Studio');

    expect(studioSlug).toHaveValue('swallow-studio');

    await user.clear(studioSlug);

    await user.type(studioSlug, 'custom-link');

    await user.clear(studioName);

    await user.type(studioName, 'Black Cat Tattoo');

    expect(studioName).toHaveValue('Black Cat Tattoo');

    expect(studioSlug).toHaveValue('custom-link');
  });
});
