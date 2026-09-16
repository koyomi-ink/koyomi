// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components

export const instant = false;

export default async function HomePage() {
  return (
    <div className='flex flex-col gap-8 lg:gap-32'>
      <HeroSection />
    </div>
  );
}

function HeroSection() {
  return (
    <section>
      <h1>Koyomi</h1>
    </section>
  );
}