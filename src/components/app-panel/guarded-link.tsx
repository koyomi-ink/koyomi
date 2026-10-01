'use client';

import {
  type ComponentProps,
  type MouseEvent,
} from 'react';
import Link from 'next/link';

import { useAppPanel } from './app-panel-provider';

type GuardedLinkProps = ComponentProps<typeof Link>;

export function GuardedLink({
  href,
  onClick,
  ...props
}: GuardedLinkProps) {
  const { navigate } = useAppPanel();

  function handleClick(
    event: MouseEvent<HTMLAnchorElement>
  ) {
    onClick?.(event);

    if (event.defaultPrevented) {
      return;
    }

    // Preserve normal browser behavior for things like
    // Ctrl+click, Cmd+click and opening in a new tab.
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    if (typeof href !== 'string') {
      return;
    }

    event.preventDefault();
    navigate(href);
  }

  return (
    <Link
      href={href}
      onClick={handleClick}
      {...props}
    />
  );
}