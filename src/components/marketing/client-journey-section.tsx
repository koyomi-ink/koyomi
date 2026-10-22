'use client';

import Image from 'next/image';
import { useState } from 'react';

import { MarketingContainer } from './marketing-container';

import learnMoreImage from '@/imgs/marketing/hero/desktop-display.webp';
import portfolioImage from '@/imgs/marketing/hero/desktop-display.webp';
import flashImage from '@/imgs/marketing/hero/desktop-display.webp';
import customImage from '@/imgs/marketing/hero/desktop-display.webp';
import rescheduleImage from '@/imgs/marketing/hero/desktop-display.webp';

import { MarketingCTA } from './marketing-cta';

const journeys = [
  {
    id: 'learn-more',
    label: 'Learn more',
    description:
      'Clients can view your policies, availability, portfolio, locations, and anything else you choose to share.',
    image: learnMoreImage,
    alt: 'Client viewing an artist profile on Koyomi',
  },
  {
    id: 'portfolio',
    label: 'Portfolio',
    description:
      'Clients can explore your work by style and category, making it easier to see what you do best before sending a booking request.',
    image: portfolioImage,
    alt: 'Client browsing portfolio on Koyomi',
  },
  {
    id: 'flash',
    label: 'Flash tattoos',
    description:
      'Clients can browse your available flash and send a booking request directly from the piece they want.',
    image: flashImage,
    alt: 'Client browsing flash tattoos on Koyomi',
  },
  {
    id: 'custom',
    label: 'Custom tattoos',
    description:
      'Clients can send the information, references, placement, and date options you need to review a custom request.',
    image: customImage,
    alt: 'Client submitting a custom tattoo request on Koyomi',
  },
  {
    id: 'reschedule',
    label: 'Reschedule',
    description:
      'Clients can manage an existing appointment through their portal without another long back-and-forth conversation.',
    image: rescheduleImage,
    alt: 'Client rescheduling an appointment on Koyomi',
  },
] as const;

type JourneyId = (typeof journeys)[number]['id'];

export function ClientJourneySection() {
  const [selectedId, setSelectedId] = useState<JourneyId>('learn-more');

  const selectedJourney = journeys.find((journey) => journey.id === selectedId) ?? journeys[0];

  return (
    <section id='client-journey' data-marketing-section className='py-15'>
      <MarketingContainer>
        <div className='mx-auto flex max-w-4xl flex-col items-center text-center'>
          <p className='font-marketing-mono text-sm font-semibold tracking-wide text-[var(--marketing-blue)] sm:text-base'>
            Now, follow
          </p>

          <h2 className='font-marketing-display mt-4 text-4xl leading-tight text-[var(--marketing-ink)] sm:text-5xl lg:text-6xl'>
            Your client&apos;s journey
          </h2>

          <div
            className='mt-8 flex w-full max-w-3xl flex-wrap justify-center gap-2'
            aria-label='Client journey examples'
          >
            {journeys.map((journey) => {
              const isSelected = journey.id === selectedId;

              return (
                <button
                  key={journey.id}
                  type='button'
                  aria-pressed={isSelected}
                  onClick={() => setSelectedId(journey.id)}
                  className={`font-marketing-body min-w-36 rounded-full border-2 border-[var(--marketing-accent)] px-5 py-2.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-[var(--marketing-accent)] focus-visible:ring-offset-2 focus-visible:outline-none ${
                    isSelected
                      ? 'bg-[var(--marketing-accent)] text-white'
                      : 'bg-transparent text-[var(--marketing-ink)] hover:bg-[var(--marketing-accent)]/10'
                  } `}
                >
                  {journey.label}
                </button>
              );
            })}
          </div>

          <p className='font-marketing-body mt-12 max-w-2xl text-lg leading-8 text-[var(--marketing-ink)] sm:text-xl sm:leading-9'>
            {selectedJourney.description}
          </p>

          <div className='mt-10 w-full max-w-2xl overflow-hidden rounded-3xl bg-white/70 shadow-sm'>
            <Image
              key={selectedJourney.id}
              src={selectedJourney.image}
              alt={selectedJourney.alt}
              sizes='(max-width: 768px) calc(100vw - 40px), 672px'
              className='h-auto w-full'
            />
          </div>
          <MarketingCTA
            href='/client-demo'
            label='Join waitlist'
            variant='dark-shadow'
            subtitle='Be the first to know when Koyomi launches'
            className='mt-15'
          />
        </div>
      </MarketingContainer>
    </section>
  );
}
