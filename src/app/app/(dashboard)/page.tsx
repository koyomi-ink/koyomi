import { redirect } from 'next/navigation';

import { getStudioMemberships } from '@/features/studios/data/get-studio-memberships';

export default async function AppPage() {
  const memberships = await getStudioMemberships();

  const firstMembership = memberships[0];

  if (!firstMembership?.studios) {
    redirect('/onboarding');
  }

  redirect(`/app/${firstMembership.studios.slug}`);
}