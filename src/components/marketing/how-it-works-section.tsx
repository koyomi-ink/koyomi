import Image from 'next/image';

import { MarketingContainer } from './marketing-container';

const steps = [
  {
    label: 'Step one',
    title: 'Set up your account',
    description:
      'Add your availability, locations, flash, pricing, policies, and the details your clients need before booking.',
    image: '/desktop display.png',
    alt: 'Koyomi studio setup',
  },
  {
    label: 'Step two',
    title: 'Customize your Digital Studio',
    description:
      'Build your public page around your work. Show your portfolio, flash, bio, locations, availability, and booking information.',
    image: '/desktop display.png',
    alt: 'Koyomi Digital Studio',
  },
  {
    label: 'Step three',
    title: 'Share your link, take bookings',
    description:
      'Put your Koyomi link in your bio and let clients learn about your work, check your policies, and send booking requests based on your availability.',
    image: '/desktop display.png',
    alt: 'Koyomi public booking experience',
  },
  {
    label: 'Step four',
    title: 'Manage your work',
    description:
      'Review requests, confirm sessions, keep track of clients, deposits, payments, and single or multi-session tattoo projects in one place.',
    image: '/desktop display.png',
    alt: 'Koyomi booking management',
  },
] as const;

export function HowItWorksSection() {
  return (
    <section id='how-it-works' data-marketing-section className='bg-[var(--marketing-dark)] py-15 text-[#f3dfdc]'>
      <MarketingContainer>
        <div className='text-center'>
          <p className='font-marketing-mono text-sm font-semibold tracking-wide text-[var(--marketing-blue)] sm:text-base'>
            First, let&apos;s see
          </p>

          <h2 className='font-marketing-display mt-4 text-4xl leading-tight sm:text-5xl lg:text-6xl'>How it works</h2>
        </div>

        <div className='mt-20 space-y-24 sm:mt-24 sm:space-y-32 lg:mt-32 lg:space-y-44'>
          {steps.map((step, index) => {
            const imageFirst = index % 2 === 1;

            return (
              <article key={step.title} className='grid items-center gap-10 lg:grid-cols-2 lg:gap-20'>
                <div className={imageFirst ? 'lg:order-2' : 'lg:order-1'}>
                  <p className='font-marketing-mono text-sm font-medium text-[#f3dfdc]/90 sm:text-base'>{step.label}</p>

                  <h3 className='font-marketing-display mt-3 text-3xl leading-tight text-[var(--marketing-accent)] sm:text-4xl lg:text-5xl'>
                    {step.title}
                  </h3>

                  <p className='font-marketing-body mt-6 max-w-xl text-lg leading-8 text-[#f3dfdc]/90 sm:text-xl sm:leading-9'>
                    {step.description}
                  </p>
                </div>

                <div className={imageFirst ? 'lg:order-1' : 'lg:order-2'}>
                  <div className='mx-auto w-full max-w-xl overflow-hidden rounded-xl'>
                    <Image
                      src={step.image}
                      alt={step.alt}
                      width={1600}
                      height={900}
                      preload={true}
                      sizes='(max-width: 1024px) 100vw, 50vw'
                      className='h-auto w-full'
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </MarketingContainer>
    </section>
  );
}
