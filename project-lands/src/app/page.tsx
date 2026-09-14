import Hero from "@/components/Hero";
import LandGrid from "@/components/LandGrid";

export default function HomePage() {
  return (
    <main className="flex flex-col">
      <section id="hero">
        <Hero />
      </section>
      <section id="lands">
        <LandGrid />
      </section>
    </main>
  );
}