import { MarketingContainer } from './marketing-container';

const features = [
  {
    number: '01',
    title: 'Tailor your page to your brand',
    description:
      'Review requests, choose dates, keep track of appointment details, and manage single or multi-session tattoo projects.',
  },
  {
    number: '02',
    title: 'Tailor your page to your brand 2',
    description:
      'Keep client information, tattoo projects, appointments, payments, and history together instead of scattered across messages.',
  },
  {
    number: '03',
    title: 'Tailor your page to your brand 3',
    description:
      'Give clients one place to see your work, flash, locations, availability, pricing, policies, and booking information.',
  },
  {
    number: '04',
    title: 'Tailor your page to your brand 4',
    description:
      'Review requests, choose dates, keep track of appointment details, and manage single or multi-session tattoo projects.',
  },
  {
    number: '05',
    title: 'Tailor your page to your brand 5',
    description:
      'Keep client information, tattoo projects, appointments, payments, and history together instead of scattered across messages.',
  },
  {
    number: '06',
    title: 'Tailor your page to your brand 6',
    description:
      'Give clients one place to see your work, flash, locations, availability, pricing, policies, and booking information.',
  },
] as const;

export function FeaturesSection() {
  return (
    <section id='features' data-marketing-section className='py-24 sm:py-28 lg:py-15'>
      <MarketingContainer>
        <div className='mx-auto max-w-3xl text-center'>
          <p className='font-marketing-mono text-sm font-semibold tracking-wide text-[var(--marketing-blue)] sm:text-base'>
            Take a look at our
          </p>

          <h2 className='font-marketing-display mt-4 text-4xl leading-tight text-[var(--marketing-ink)] sm:text-5xl lg:text-6xl'>
            Features
          </h2>

          <p className='font-marketing-body mx-auto mt-6 max-w-2xl text-base leading-7 text-[var(--marketing-ink)]/75 sm:text-lg'>
            Koyomi was built around your work, so you can spend less time on admin and more on tattooing.
          </p>
        </div>

        <div className='mt-16 grid gap-6 md:grid-cols-2 lg:mt-10 xl:grid-cols-3'>
          {features.map((feature) => (
            <article
              key={feature.title}
              className='min-h-[200px] flex-col rounded-[2rem] border border-black/10 bg-white/45 p-7 sm:p-8'
            >
              <p className='font-marketing-mono text-sm font-semibold text-[var(--marketing-blue)]'>{feature.number}</p>

              <div className='mt-auto pt-5'>
                <h3 className='font-marketing-display text-2xl leading-tight text-[var(--marketing-accent)] sm:text-3xl'>
                  {feature.title}
                </h3>

                <p className='font-marketing-body mt-4 text-base leading-7 text-[var(--marketing-ink)]/75'>
                  {feature.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </MarketingContainer>
    </section>
  );
}
