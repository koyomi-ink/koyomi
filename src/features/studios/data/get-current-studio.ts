import 'server-only';

import type { getStudioMemberships } from '@/features/studios/data/get-studio-memberships';

type StudioMemberships = Awaited<ReturnType<typeof getStudioMemberships>>;

export function getCurrentStudio(memberships: StudioMemberships, studioSlug: string) {
  const membership = memberships.find(({ studios }) => studios?.slug === studioSlug);

  if (!membership?.studios) {
    return null;
  }

  return {
    studio: membership.studios,
    membership: {
      id: membership.id,
      role: membership.role,
    },
  };
}
