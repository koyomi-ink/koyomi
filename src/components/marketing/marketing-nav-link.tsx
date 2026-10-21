'use client';

import type { ComponentProps, MouseEvent } from 'react';
import Link from 'next/link';

type MarketingNavLinkProps = Omit<ComponentProps<typeof Link>, 'href'> & {
  href: `/#${string}`;
};

export function MarketingNavLink({ href, onClick, ...props }: MarketingNavLinkProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);

    if (event.defaultPrevented) {
      return;
    }

    const hash = href.slice(1);

    if (window.location.pathname === '/' && window.location.hash === hash) {
      event.preventDefault();

      document.querySelector(hash)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }

  return <Link href={href} onClick={handleClick} {...props} />;
}
