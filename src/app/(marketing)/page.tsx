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