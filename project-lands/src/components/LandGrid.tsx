import Link from "next/link";
import { prisma } from "@/lib/prisma";
import LandCard from "./LandCard";

const AREA_UNIT_LABELS: Record<string, string> = { SQM: "m²", ARE: "a", HECTARE: "ha" };

export default async function LandGrid() {
  const listings = await prisma.listing.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 6,
  });

  return (
    <section id="lands" className="px-6 py-12 bg-gray-100">
      <h2 className="text-3xl font-bold text-center mb-10">Aktualūs skelbimai</h2>

      {listings.length === 0 ? (
        <p className="text-center text-gray-500">Skelbimų kol kas nėra.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {listings.map((listing) => (
            <LandCard
              key={listing.id}
              land={{
                title: listing.title,
                size: `${listing.area.toString()} ${AREA_UNIT_LABELS[listing.areaUnit]}`,
                price: `${listing.price.toString()} €`,
                href: `/skelbimai/${listing.slug}`,
              }}
            />
          ))}
        </div>
      )}

      <div className="text-center mt-10">
        <Link
          href="/skelbimai"
          className="inline-block px-5 py-2 rounded-md bg-green-700 text-white font-semibold hover:bg-green-800 transition-colors"
        >
          Visi skelbimai
        </Link>
      </div>
    </section>
  );
}
