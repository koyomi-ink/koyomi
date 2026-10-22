import Link from 'next/link';

type MarketingCTAProps = {
  href: string;
  label: string;
  subtitle?: string;
  variant?: 'dark-shadow' | 'light-shadow';
  className?: string;
  subtitleClassName?: string;
};

export function MarketingCTA({
  href,
  label,
  subtitle,
  variant = 'dark-shadow',
  className = '',
  subtitleClassName = 'text-[var(--marketing-ink)]',
}: MarketingCTAProps) {
  const buttonStyles = {
    'dark-shadow':
      'bg-[var(--marketing-accent)] text-white shadow-[0_6px_0_var(--marketing-dark)] hover:shadow-[0_4px_0_var(--marketing-dark)]',

    'light-shadow': 'bg-[var(--marketing-accent)] text-white shadow-[0_6px_0_#f3dfdc] hover:shadow-[0_4px_0_#f3dfdc]',
  };

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <Link
        href={href}
        className={`font-marketing-body inline-flex min-w-64 items-center justify-center rounded-full px-8 py-3 font-semibold transition-all hover:translate-y-[2px] active:translate-y-[6px] active:shadow-none ${buttonStyles[variant]}`}
      >
        {label}
      </Link>

      {subtitle && <p className={`font-marketing-body text-sm ${subtitleClassName}`}>{subtitle}</p>}
    </div>
  );
}
