import { type ReactNode, useEffect } from 'react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { render, screen, waitFor } from '@testing-library/react';

import userEvent from '@testing-library/user-event';

import { AppPanelProvider, useAppPanel } from './app-panel-provider';

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  discard: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mocks.push,
  }),
}));

function TestConsumer({ discardHandler }: { discardHandler?: () => void }) {
  const { panel, openPanel, closePanel, setPanelDirty, setPanelSaving, navigate, registerDiscardHandler } =
    useAppPanel();

  useEffect(() => {
    if (!discardHandler) {
      return;
    }

    registerDiscardHandler(discardHandler);

    return () => {
      registerDiscardHandler(null);
    };
  }, [discardHandler, registerDiscardHandler]);

  function openTestPanel() {
    openPanel({
      id: 'main-profile',
      title: 'Main profile',
      content: <div>Panel content</div>,
    });
  }

  return (
    <div>
      <div data-testid='panel-state'>{panel?.title ?? 'No panel'}</div>

      <button onClick={openTestPanel}>Open panel</button>

      <button onClick={closePanel}>Close panel</button>

      <button onClick={() => setPanelDirty(true)}>Make dirty</button>

      <button onClick={() => setPanelDirty(false)}>Make clean</button>

      <button onClick={() => setPanelSaving(true)}>Start saving</button>

      <button onClick={() => navigate('/app/swallow-studio/bookings')}>Go to bookings</button>
    </div>
  );
}

function renderProvider(options?: { discardHandler?: () => void }) {
  return render(
    <AppPanelProvider>
      <TestConsumer discardHandler={options?.discardHandler} />
    </AppPanelProvider>,
  );
}

describe('AppPanelProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    /*
     * Dirty-state protection creates temporary
     * history entries. We don't want unit tests
     * mutating jsdom's actual history stack.
     */
    vi.spyOn(window.history, 'pushState').mockImplementation(() => undefined);

    vi.spyOn(window.history, 'go').mockImplementation(() => undefined);
  });

  it('opens and closes a clean panel immediately', async () => {
    const user = userEvent.setup();

    renderProvider();

    await user.click(
      screen.getByRole('button', {
        name: 'Open panel',
      }),
    );

    expect(screen.getByTestId('panel-state')).toHaveTextContent('Main profile');

    await user.click(
      screen.getByRole('button', {
        name: 'Close panel',
      }),
    );

    expect(screen.getByTestId('panel-state')).toHaveTextContent('No panel');

    expect(screen.queryByText('Discard changes?')).not.toBeInTheDocument();
  });

  it('asks for confirmation before closing a dirty panel', async () => {
    const user = userEvent.setup();

    renderProvider();

    await user.click(
      screen.getByRole('button', {
        name: 'Open panel',
      }),
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Make dirty',
      }),
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Close panel',
      }),
    );

    expect(screen.getByText('Discard changes?')).toBeInTheDocument();

    expect(screen.getByTestId('panel-state')).toHaveTextContent('Main profile');
  });

  it('keeps the panel open when Keep editing is chosen', async () => {
    const user = userEvent.setup();

    renderProvider();

    await user.click(
      screen.getByRole('button', {
        name: 'Open panel',
      }),
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Make dirty',
      }),
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Close panel',
      }),
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Keep editing',
      }),
    );

    expect(screen.getByTestId('panel-state')).toHaveTextContent('Main profile');

    expect(screen.queryByText('Discard changes?')).not.toBeInTheDocument();
  });

  it('discards changes and closes the panel after confirmation', async () => {
    const user = userEvent.setup();

    renderProvider({
      discardHandler: mocks.discard,
    });

    await user.click(
      screen.getByRole('button', {
        name: 'Open panel',
      }),
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Make dirty',
      }),
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Close panel',
      }),
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Discard changes',
      }),
    );

    expect(mocks.discard).toHaveBeenCalledTimes(1);

    expect(screen.getByTestId('panel-state')).toHaveTextContent('No panel');
  });

  it('closes an open clean panel when navigating', async () => {
    const user = userEvent.setup();

    renderProvider();

    await user.click(
      screen.getByRole('button', {
        name: 'Open panel',
      }),
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Go to bookings',
      }),
    );

    expect(screen.getByTestId('panel-state')).toHaveTextContent('No panel');

    expect(mocks.push).toHaveBeenCalledWith('/app/swallow-studio/bookings');
  });

  it('guards navigation when the panel is dirty', async () => {
    const user = userEvent.setup();

    renderProvider({
      discardHandler: mocks.discard,
    });

    await user.click(
      screen.getByRole('button', {
        name: 'Open panel',
      }),
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Make dirty',
      }),
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Go to bookings',
      }),
    );

    expect(mocks.push).not.toHaveBeenCalled();

    expect(screen.getByText('Discard changes?')).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', {
        name: 'Discard changes',
      }),
    );

    expect(mocks.discard).toHaveBeenCalledTimes(1);

    expect(screen.getByTestId('panel-state')).toHaveTextContent('No panel');

    expect(mocks.push).toHaveBeenCalledWith('/app/swallow-studio/bookings');
  });

  it('blocks panel changes while saving', async () => {
    const user = userEvent.setup();

    renderProvider();

    await user.click(
      screen.getByRole('button', {
        name: 'Open panel',
      }),
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Start saving',
      }),
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Close panel',
      }),
    );

    expect(screen.getByTestId('panel-state')).toHaveTextContent('Main profile');

    expect(screen.queryByText('Discard changes?')).not.toBeInTheDocument();
  });

  it('protects browser unload while dirty', async () => {
    const user = userEvent.setup();

    renderProvider();

    await user.click(
      screen.getByRole('button', {
        name: 'Make dirty',
      }),
    );

    const event = new Event('beforeunload', {
      cancelable: true,
    });

    window.dispatchEvent(event);

    await waitFor(() => {
      expect(event.defaultPrevented).toBe(true);
    });
  });
});
