import { Dela_Gothic_One, Prompt, Source_Code_Pro } from 'next/font/google';

import { MarketingHeader } from '@/components/marketing/marketing-header';
import { HeroSection } from '@/components/marketing/hero-section';
import { HowItWorksSection } from '@/components/marketing/how-it-works-section';
import { ClientJourneySection } from '@/components/marketing/client-journey-section';
import { SignupCTASection } from '@/components/marketing/signup-cta-section';
import { FeaturesSection } from '@/components/marketing/features-section';
import { PricingSection } from '@/components/marketing/pricing-section';
import { WaitlistSection } from '@/components/marketing/waitlist-section';
import { ContactSection } from '@/components/marketing/contact-section';
import { MarketingFooter } from '@/components/marketing/marketing-footer';

const sourceCodePro = Source_Code_Pro({
  subsets: ['latin'],
  variable: '--font-source-code-pro',
  display: 'swap',
});

const delaGothicOne = Dela_Gothic_One({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-dela-gothic',
  display: 'swap',
});

const prompt = Prompt({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-prompt',
  display: 'swap',
});

function HeroToHowItWorksCurve() {
  return (
    <div aria-hidden='true' className='relative h-20 overflow-hidden bg-[var(--marketing-background)] sm:h-28 lg:h-36'>
      <svg viewBox='0 0 1440 160' preserveAspectRatio='none' className='absolute inset-0 h-full w-full'>
        <path
          d='M0 70 C 320 0, 540 20, 760 85 C 980 150, 1230 165, 1440 75 L1440 160 L0 160 Z'
          fill='var(--marketing-dark)'
        />
      </svg>
    </div>
  );
}

export default function HomePage() {
  return (
    <div
      className={` ${sourceCodePro.variable} ${delaGothicOne.variable} ${prompt.variable} font-marketing-body min-h-svh bg-[var(--marketing-background)]`}
    >
      <MarketingHeader />

      <main>
        <HeroSection />

        <HeroToHowItWorksCurve />
        <HowItWorksSection />

        <ClientJourneySection />

        <hr className='mx-auto my-8 w-[85%] max-w-5xl border-0 border-t border-[var(--marketing-accent)]/90' />

        <FeaturesSection />

        <SignupCTASection />

        <PricingSection />

        <WaitlistSection />

        <hr className='mx-auto my-8 w-[85%] max-w-5xl border-0 border-t border-[var(--marketing-accent)]/90' />

        <ContactSection />

        <MarketingFooter />
      </main>
    </div>
  );
}
