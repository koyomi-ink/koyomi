import { MarketingContainer } from './marketing-container';

const features = [
  {
    number: 'Digital Studio',
    title: 'Your studio, online',
    description:
      'Show your work, flash, locations, availability, pricing, policies, and everything clients need before booking.',
  },
  {
    number: 'Booking requests',
    title: 'No more back-and-forth',
    description:
      'Collect the details you need upfront, let clients suggest dates based on your availability, and review, accept or decline requests from one place.',
  },
  {
    number: 'Clients',
    title: 'Know who you’re working with',
    description: 'Keep client details, notes, projects, payments, and appointment history together in one place.',
  },
  {
    number: 'Tattoo projects',
    title: 'Organize multi-session projects',
    description:
      'Keep multi-session work together as one project, with its appointments, dates, details and progress all connected.',
  },
  {
    number: 'Schedule',
    title: 'Stay in control of your time',
    description:
      'Set when and where you work, manage appointment dates, and only receive requests that fit your availability.',
  },
  {
    number: 'Payments & follow-up',
    title: 'From deposit to aftercare',
    description:
      'Track deposits and payments, and automate reminders for upcoming sessions and aftercare instructions.',
  },
] as const;

export function FeaturesSection() {
  return (
    <section id='features' data-marketing-section className='py-15'>
      <MarketingContainer>
        <div className='mx-auto max-w-3xl text-center'>
          <p className='font-marketing-mono text-sm font-semibold tracking-wide text-[var(--marketing-blue)] sm:text-base'>
            Take a look at our
          </p>

          <h2 className='font-marketing-display mt-4 text-4xl leading-tight text-[var(--marketing-ink)] sm:text-5xl lg:text-6xl'>
            Features
          </h2>

          <p className='font-marketing-body mx-auto mt-6 max-w-2xl text-base leading-7 text-[var(--marketing-ink)]/75 sm:text-lg'>
            From the first booking request to the final session.
            <br />
            See how Koyomi can help you spend less time on admin.
          </p>
        </div>

        <div className='mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3'>
          {features.map((feature) => (
            <article
              key={feature.title}
              className='min-h-[200px] flex-col rounded-[2rem] border border-black/10 bg-white/45 p-7 sm:p-8'
            >
              <p className='font-marketing-mono text-sm font-semibold text-[var(--marketing-blue)]'>{feature.number}</p>

              <div className='mt-auto pt-3'>
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
