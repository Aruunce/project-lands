import { prisma } from "@/lib/prisma";
import { withMainPhoto } from "@/lib/listing-queries";
import Hero from "@/components/home/Hero";
import LatestListings from "@/components/home/LatestListings";
import About from "@/components/home/About";
import Contact from "@/components/home/Contact";

export default async function HomePage() {
  const [listings, activeListings] = await Promise.all([
    prisma.listing.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 6,
      include: withMainPhoto,
    }),
    prisma.listing.count({ where: { status: "PUBLISHED" } }),
  ]);

  return (
    <main>
      <Hero activeListings={activeListings} />
      <LatestListings listings={listings} />
      <About />
      <Contact />
    </main>
  );
}
