import { MarketingContainer } from './marketing-container';

export function ContactSection() {
  return (
    <section id='contact' data-marketing-section className='pt-40 pb-35'>
      <MarketingContainer>
        <div className='grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20'>
          <div className='text-center lg:text-left'>
            <p className='font-marketing-mono text-sm font-semibold tracking-wide text-[var(--marketing-blue)] sm:text-base'>
              You can also
            </p>

            <h2 className='font-marketing-display mt-4 text-4xl leading-tight text-[var(--marketing-ink)] sm:text-5xl lg:text-6xl'>
              Get in touch
            </h2>

            <p className='font-marketing-body mt-6 max-w-lg text-base leading-7 text-[var(--marketing-ink)]/75 sm:text-lg'>
              Whether you have feedback or questions, need help with anything, or just want to say hello, send us a
              message.
            </p>
          </div>

          <form className='space-y-6'>
            <div className='grid gap-6 sm:grid-cols-2'>
              <div>
                <label
                  htmlFor='contact-name'
                  className='font-marketing-mono mb-2 block text-sm font-medium text-[var(--marketing-ink)]'
                >
                  Name
                </label>

                <input
                  id='contact-name'
                  name='name'
                  type='text'
                  autoComplete='name'
                  placeholder='e.g. Jane Doe'
                  required
                  className='font-marketing-body w-full rounded-2xl border border-black/15 bg-white/45 px-4 py-3 text-[var(--marketing-ink)] transition outline-none focus:border-[var(--marketing-accent)] focus:ring-2 focus:ring-[var(--marketing-accent)]/20'
                />
              </div>

              <div>
                <label
                  htmlFor='contact-email'
                  className='font-marketing-mono mb-2 block text-sm font-medium text-[var(--marketing-ink)]'
                >
                  Email
                </label>

                <input
                  id='contact-email'
                  name='email'
                  type='email'
                  autoComplete='email'
                  placeholder='e.g. jdoe@email.com'
                  required
                  className='font-marketing-body w-full rounded-2xl border border-black/15 bg-white/45 px-4 py-3 text-[var(--marketing-ink)] transition outline-none focus:border-[var(--marketing-accent)] focus:ring-2 focus:ring-[var(--marketing-accent)]/20'
                />
              </div>
            </div>

            <div>
              <label
                htmlFor='contact-message'
                className='font-marketing-mono mb-2 block text-sm font-medium text-[var(--marketing-ink)]'
              >
                Message
              </label>

              <textarea
                id='contact-message'
                name='message'
                rows={7}
                required
                className='font-marketing-body w-full resize-y rounded-2xl border border-black/15 bg-white/45 px-4 py-3 text-[var(--marketing-ink)] transition outline-none focus:border-[var(--marketing-accent)] focus:ring-2 focus:ring-[var(--marketing-accent)]/20'
              />
            </div>

            <button
              type='submit'
              className='font-marketing-body inline-flex min-w-48 items-center justify-center rounded-full bg-[var(--marketing-accent)] px-8 py-3 font-semibold text-white shadow-[0_6px_0_var(--marketing-dark)] transition-all hover:translate-y-[2px] hover:shadow-[0_4px_0_var(--marketing-dark)] active:translate-y-[6px] active:shadow-none'
            >
              Send message
            </button>
          </form>
        </div>
      </MarketingContainer>
    </section>
  );
}
