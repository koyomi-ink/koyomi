function HeroToHowItWorksCurve() {
  return (
    <div
      aria-hidden='true'
      className='relative -mb-1 h-20 overflow-hidden bg-[var(--marketing-background)] sm:h-28 lg:h-36'
    >
      <svg viewBox='0 0 1440 160' preserveAspectRatio='none' className='absolute inset-0 h-full w-full'>
        <path
          d='M0 70 C 320 0, 540 20, 760 85 C 980 150, 1230 165, 1440 75 L1440 160 L0 160 Z'
          fill='var(--marketing-dark)'
        />
      </svg>
    </div>
  );
}
