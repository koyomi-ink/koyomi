'use client';

import { PropsWithChildren, useCallback, useEffect, useRef } from 'react';

import { logout } from '@/features/auth/actions/logout';

const IDLE_TIMEOUT_MS = 12 * 60 * 60 * 1000;
const MAX_SESSION_AGE_MS = 30 * 24 * 60 * 60 * 1000;

const ACTIVITY_WRITE_INTERVAL_MS = 60 * 1000;
const EXPIRY_CHECK_INTERVAL_MS = 60 * 1000;

type SessionTimeoutProviderProps = PropsWithChildren<{
  userId: string;
  sessionStartedAt: number;
}>;

export function SessionTimeoutProvider({ userId, sessionStartedAt, children }: SessionTimeoutProviderProps) {
  const loggingOutRef = useRef(false);
  const lastWriteRef = useRef(0);

  const storageKey = `koyomi:last-activity:${userId}:${sessionStartedAt}`;

  const expireSession = useCallback(async () => {
    if (loggingOutRef.current) {
      return;
    }

    loggingOutRef.current = true;

    localStorage.removeItem(storageKey);

    await logout();
  }, [storageKey]);

  const getLastActivity = useCallback(() => {
    const stored = Number(localStorage.getItem(storageKey));

    if (Number.isFinite(stored) && stored > 0) {
      return stored;
    }

    const now = Date.now();

    localStorage.setItem(storageKey, String(now));
    lastWriteRef.current = now;

    return now;
  }, [storageKey]);

  const checkExpired = useCallback(async () => {
    const now = Date.now();

    const absoluteExpired = now - sessionStartedAt >= MAX_SESSION_AGE_MS;

    const idleExpired = now - getLastActivity() >= IDLE_TIMEOUT_MS;

    if (absoluteExpired || idleExpired) {
      await expireSession();
      return true;
    }

    return false;
  }, [expireSession, getLastActivity, sessionStartedAt]);

  const recordActivity = useCallback(async () => {
    /*
     * Check first.
     *
     * Otherwise returning after 13 hours and clicking
     * the page would refresh the activity timestamp
     * before we noticed that the session had expired.
     */
    const expired = await checkExpired();

    if (expired) {
      return;
    }

    const now = Date.now();

    /*
     * Don't write to localStorage on every click/key press.
     */
    if (now - lastWriteRef.current < ACTIVITY_WRITE_INTERVAL_MS) {
      return;
    }

    localStorage.setItem(storageKey, String(now));
    lastWriteRef.current = now;
  }, [checkExpired, storageKey]);

  useEffect(() => {
    /*
     * Initialize/read the activity timestamp.
     */
    getLastActivity();

    void checkExpired();

    const handleActivity = () => {
      void recordActivity();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void recordActivity();
      }
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === storageKey) {
        void checkExpired();
      }
    };

    window.addEventListener('pointerdown', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('storage', handleStorage);

    document.addEventListener('visibilitychange', handleVisibilityChange);

    const interval = window.setInterval(() => {
      void checkExpired();
    }, EXPIRY_CHECK_INTERVAL_MS);

    return () => {
      window.removeEventListener('pointerdown', handleActivity);

      window.removeEventListener('keydown', handleActivity);

      window.removeEventListener('storage', handleStorage);

      document.removeEventListener('visibilitychange', handleVisibilityChange);

      window.clearInterval(interval);
    };
  }, [checkExpired, getLastActivity, recordActivity, storageKey]);

  return children;
}
