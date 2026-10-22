import { MarketingCTA } from './marketing-cta';

const publicSignupsEnabled = process.env.NEXT_PUBLIC_PUBLIC_SIGNUPS_ENABLED === 'true';

type ArtistCTAProps = {
  variant?: 'dark-shadow' | 'light-shadow';
  className?: string;
  subtitleClassName?: string;
};

export function ArtistCTA({ variant = 'dark-shadow', className, subtitleClassName }: ArtistCTAProps) {
  if (publicSignupsEnabled) {
    return (
      <MarketingCTA
        href='/signup'
        label='Join as an artist'
        subtitle='No credit card required · No time limit'
        variant={variant}
        className={className}
        subtitleClassName={subtitleClassName}
      />
    );
  }

  return (
    <MarketingCTA
      href='/#waitlist'
      label='Join waitlist'
      subtitle='Be the first to know when Koyomi launches'
      variant={variant}
      className={className}
      subtitleClassName={subtitleClassName}
    />
  );
}
