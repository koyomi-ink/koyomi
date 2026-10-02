import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { MainProfileForm } from './main-profile-form';

const mocks = vi.hoisted(() => ({
  refresh: vi.fn(),

  updateMainProfile: vi.fn(),

  setPanelDirty: vi.fn(),
  setPanelSaving: vi.fn(),
  registerDiscardHandler: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mocks.refresh,
  }),
}));

vi.mock(
  '@/features/settings/actions/update-main-profile',
  () => ({
    updateMainProfile: mocks.updateMainProfile,
  })
);

vi.mock(
  '@/components/app-panel/app-panel-provider',
  () => ({
    useAppPanel: () => ({
      setPanelDirty: mocks.setPanelDirty,
      setPanelSaving: mocks.setPanelSaving,
      registerDiscardHandler:
        mocks.registerDiscardHandler,
    }),
  })
);

const studio = {
  id: '3f49e406-28a3-4fe5-bc6f-72509f5fcd82',
  name: 'Swallow Studio',
  slug: 'swallow-studio',
  bio: 'Tattoo artist',
};

describe('MainProfileForm', () => {
  beforeEach(() => {
    mocks.updateMainProfile.mockResolvedValue({
      data: null,
      error: null,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the saved studio profile', () => {
    render(<MainProfileForm studio={studio} />);

    expect(
      screen.getByLabelText('Studio name')
    ).toHaveValue('Swallow Studio');

    expect(
      screen.getByLabelText('Booking link')
    ).toHaveValue('swallow-studio');

    expect(
      screen.getByLabelText('Description')
    ).toHaveValue('Tattoo artist');
  });

    it('does not change the slug when the studio name changes', async () => {
    const user = userEvent.setup();

    render(<MainProfileForm studio={studio} />);

    const nameInput =
        screen.getByLabelText('Studio name');

    const slugInput =
        screen.getByLabelText('Booking link');

    await user.clear(nameInput);
    await user.type(nameInput, 'Black Cat Tattoo');

    expect(nameInput).toHaveValue(
        'Black Cat Tattoo'
    );

    expect(slugInput).toHaveValue(
        'swallow-studio'
    );
    });

    it('allows the booking slug to be manually edited', async () => {
    const user = userEvent.setup();

    render(<MainProfileForm studio={studio} />);

    const slugInput =
        screen.getByLabelText('Booking link');

    await user.clear(slugInput);
    await user.type(slugInput, 'custom-link');

    expect(slugInput).toHaveValue(
        'custom-link'
    );
    });

  it('shows unsaved changes and resets the form when Cancel is clicked', async () => {
    const user = userEvent.setup();

    render(<MainProfileForm studio={studio} />);

    const bioInput =
      screen.getByLabelText('Description');

    await user.clear(bioInput);
    await user.type(bioInput, 'New description');

    expect(
      screen.getByText('Changes were made')
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', {
        name: 'Cancel',
      })
    );

    expect(bioInput).toHaveValue('Tattoo artist');

    expect(
      screen.queryByText('Changes were made')
    ).not.toBeInTheDocument();
  });

  it('does not submit invalid profile information', async () => {
    const user = userEvent.setup();

    render(<MainProfileForm studio={studio} />);

    const nameInput =
      screen.getByLabelText('Studio name');

    await user.clear(nameInput);

    await user.click(
      screen.getByRole('button', {
        name: 'Save',
      })
    );

    expect(
      mocks.updateMainProfile
    ).not.toHaveBeenCalled();

    expect(
      screen.getByRole('alert')
    ).toBeInTheDocument();
  });

    it('saves valid changes and refreshes the current route', async () => {
    const user = userEvent.setup();

    render(<MainProfileForm studio={studio} />);

    const nameInput =
        screen.getByLabelText('Studio name');

    const slugInput =
        screen.getByLabelText('Booking link');

    const bioInput =
        screen.getByLabelText('Description');

    await user.clear(bioInput);
    await user.type(bioInput, 'New bio');

    expect(nameInput).toHaveValue('Swallow Studio');
    expect(slugInput).toHaveValue('swallow-studio');
    expect(bioInput).toHaveValue('New bio');

    const saveButton = screen.getByRole('button', {
        name: 'Save',
    });

    expect(saveButton).toBeEnabled();

    await user.click(saveButton);

    await waitFor(() => {
        expect(
        mocks.updateMainProfile
        ).toHaveBeenCalledWith(studio.id, {
        name: 'Swallow Studio',
        slug: 'swallow-studio',
        bio: 'New bio',
        });
    });

    await waitFor(() => {
        expect(mocks.refresh).toHaveBeenCalledTimes(1);
    });

    expect(
        screen.queryByText('Changes were made')
    ).not.toBeInTheDocument();
    });
});