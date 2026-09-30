'use client';

import {
  createContext,
  type ReactNode,
  useContext,
  useState,
} from 'react';

type AppPanelState = {
  id: string;
  title: string;
  content: ReactNode;
};

type AppPanelContextValue = {
  panel: AppPanelState | null;
  openPanel: (panel: AppPanelState) => void;
  togglePanel: (panel: AppPanelState) => void;
  closePanel: () => void;
};

const AppPanelContext =
  createContext<AppPanelContextValue | null>(null);

export function AppPanelProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [panel, setPanel] =
    useState<AppPanelState | null>(null);

  function openPanel(nextPanel: AppPanelState) {
    setPanel(nextPanel);
  }

  function closePanel() {
    setPanel(null);
  }

  function togglePanel(nextPanel: AppPanelState) {
    setPanel((current) =>
      current?.id === nextPanel.id
        ? null
        : nextPanel
    );
  }

  return (
    <AppPanelContext.Provider
      value={{
        panel,
        openPanel,
        togglePanel,
        closePanel,
      }}
    >
      {children}
    </AppPanelContext.Provider>
  );
}

export function useAppPanel() {
  const context = useContext(AppPanelContext);

  if (!context) {
    throw new Error(
      'useAppPanel must be used within AppPanelProvider'
    );
  }

  return context;
}