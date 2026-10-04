import { PropsWithChildren, Suspense } from 'react';

import { StudioContextGate } from '@/features/studios/components/studio-context-gate';

type StudioLayoutProps = PropsWithChildren<{
  params: Promise<{
    studioSlug: string;
  }>;
}>;

async function StudioLayoutContent({ children, params }: StudioLayoutProps) {
  const { studioSlug } = await params;

  return <StudioContextGate studioSlug={studioSlug}>{children}</StudioContextGate>;
}

export default function StudioLayout({ children, params }: StudioLayoutProps) {
  return (
    <Suspense fallback={<div>Loading studio...</div>}>
      <StudioLayoutContent params={params}>{children}</StudioLayoutContent>
    </Suspense>
  );
}
