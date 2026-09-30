import { Suspense } from 'react';

import { SettingsPage } from '@/features/settings/components/settings-page';
import { getMainProfile } from '@/features/settings/data/get-main-profile';

type SettingsRouteProps = {
  params: Promise<{
    studioSlug: string;
  }>;
};

async function SettingsContent({
  params,
}: SettingsRouteProps) {
  const { studioSlug } = await params;

  const studio = await getMainProfile(studioSlug);

  return <SettingsPage studio={studio} />;
}

export default function Page({
  params,
}: SettingsRouteProps) {
  return (
    <Suspense fallback={<div>Loading settings...</div>}>
      <SettingsContent params={params} />
    </Suspense>
  );
}