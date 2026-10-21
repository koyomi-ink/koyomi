import type { ComponentProps } from 'react';

import { cn } from '@/utils/cn';

type MarketingContainerProps = ComponentProps<'div'>;

export function MarketingContainer({ className, ...props }: MarketingContainerProps) {
  return <div className={cn('mx-auto w-full max-w-[1280px] px-5 sm:px-8 lg:px-10', className)} {...props} />;
}
