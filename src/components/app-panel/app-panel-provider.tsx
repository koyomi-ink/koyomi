'use client';

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type AppPanelState = {
  id: string;
  title: string;
  content: ReactNode;
};

type AppPanelContextValue = {
  panel: AppPanelState | null;
  isDirty: boolean;
  isSaving: boolean;
  openPanel: (panel: AppPanelState) => void;
  togglePanel: (panel: AppPanelState) => void;
  closePanel: () => void;
  setPanelDirty: (dirty: boolean) => void;
  setPanelSaving: (saving: boolean) => void;
  navigate: (href: string) => void;
  registerDiscardHandler: (handler: (() => void) | null) => void;
};

type PendingNavigation = {
  href: string;
};

const AppPanelContext =
  createContext<AppPanelContextValue | null>(null);

export function AppPanelProvider({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();

  const [panel, setPanel] =
    useState<AppPanelState | null>(null);

  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [pendingPanel, setPendingPanel] =
    useState<AppPanelState | null | undefined>(
      undefined
    );

  const [pendingNavigation, setPendingNavigation] =
    useState<PendingNavigation | null>(null);

  const [pendingHistoryBack, setPendingHistoryBack] =
    useState(false);

  const historyGuardActive = useRef(false);

  const discardHandlerRef =
    useRef<(() => void) | null>(null);

  const registerDiscardHandler = useCallback(
    (handler: (() => void) | null) => {
      discardHandlerRef.current = handler;
    },
    []
  );
  /*
   * Reload / tab close protection.
   */
  useEffect(() => {
    if (!isDirty) {
      return;
    }

    function handleBeforeUnload(
      event: BeforeUnloadEvent
    ) {
      event.preventDefault();
      event.returnValue = '';
    }

    window.addEventListener(
      'beforeunload',
      handleBeforeUnload
    );

    return () => {
      window.removeEventListener(
        'beforeunload',
        handleBeforeUnload
      );
    };
  }, [isDirty]);

  /*
   * Browser Back protection.
   */
  useEffect(() => {
    if (!isDirty || historyGuardActive.current) {
      return;
    }

    historyGuardActive.current = true;

    window.history.pushState(
      {
        ...window.history.state,
        koyomiUnsavedGuard: true,
      },
      '',
      window.location.href
    );

    function handlePopState() {
      if (!historyGuardActive.current) {
        return;
      }

      window.history.pushState(
        {
          ...window.history.state,
          koyomiUnsavedGuard: true,
        },
        '',
        window.location.href
      );

      setPendingHistoryBack(true);
    }

    window.addEventListener(
      'popstate',
      handlePopState
    );

    return () => {
      window.removeEventListener(
        'popstate',
        handlePopState
      );

      historyGuardActive.current = false;
    };
  }, [isDirty]);

  const applyPanel = useCallback(
    (nextPanel: AppPanelState | null) => {
      setPanel(nextPanel);
      setIsDirty(false);
      setIsSaving(false);
    },
    []
  );

  const requestPanelChange = useCallback(
    (nextPanel: AppPanelState | null) => {
      if (isSaving) {
        return;
      }

      if (isDirty) {
        setPendingPanel(nextPanel);
        return;
      }

      applyPanel(nextPanel);
    },
    [isDirty, isSaving, applyPanel]
  );

  const openPanel = useCallback(
    (nextPanel: AppPanelState) => {
      requestPanelChange(nextPanel);
    },
    [requestPanelChange]
  );

  const closePanel = useCallback(() => {
    requestPanelChange(null);
  }, [requestPanelChange]);

  const togglePanel = useCallback(
    (nextPanel: AppPanelState) => {
      requestPanelChange(
        panel?.id === nextPanel.id
          ? null
          : nextPanel
      );
    },
    [panel, requestPanelChange]
  );

  const navigate = useCallback(
    (href: string) => {
      if (isSaving) {
        return;
      }

      if (isDirty) {
        setPendingNavigation({ href });
        return;
      }

      setPanel(null);
      router.push(href);
    },
    [isDirty, isSaving, router]
  );

  function keepEditing() {
    setPendingPanel(undefined);
    setPendingNavigation(null);
    setPendingHistoryBack(false);
  }

  function discardChanges() {
    discardHandlerRef.current?.();

    if (pendingHistoryBack) {
      setPendingHistoryBack(false);
      setPendingNavigation(null);
      setPendingPanel(undefined);

      setPanel(null)

      historyGuardActive.current = false;
      setIsDirty(false);
      setIsSaving(false);

      window.history.go(-2);
      return;
    }

    if (pendingNavigation) {
      const href = pendingNavigation.href;

      setPendingNavigation(null);
      setPendingPanel(undefined);
      setPanel(null);

      historyGuardActive.current = false;
      setIsDirty(false);
      setIsSaving(false);

      router.push(href);
      return;
    }

    applyPanel(pendingPanel ?? null);
    setPendingPanel(undefined);
  }

  return (
    <AppPanelContext.Provider
      value={{
        panel,
        isDirty,
        isSaving,
        openPanel,
        togglePanel,
        closePanel,
        setPanelDirty: setIsDirty,
        setPanelSaving: setIsSaving,
        navigate,
        registerDiscardHandler,
      }}
    >
      {children}

      <AlertDialog
        open={
          pendingPanel !== undefined ||
          pendingNavigation !== null ||
          pendingHistoryBack
        }
        onOpenChange={(open) => {
          if (!open) {
            keepEditing();
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Discard changes?
            </AlertDialogTitle>

            <AlertDialogDescription>
              You have unsaved changes. If you leave
              now, your changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={keepEditing}
            >
              Keep editing
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={discardChanges}
            >
              Discard changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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