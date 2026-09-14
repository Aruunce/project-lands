import Link from "next/link";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 12;
const AREA_UNIT_LABELS: Record<string, string> = { SQM: "m²", ARE: "a", HECTARE: "ha" };

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.listing.count({ where: { status: "PUBLISHED" } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <main className="px-6 py-12 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-10">Skelbimai</h1>

      {listings.length === 0 ? (
        <p className="text-center text-gray-500">Skelbimų kol kas nėra.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {listings.map((listing) => (
            <Link
              key={listing.id}
              href={`/skelbimai/${listing.slug}`}
              className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-xl transition duration-300"
            >
              <div className="w-full h-48 bg-gradient-to-br from-green-100 to-green-300" />
              <div className="p-4">
                <h3 className="text-lg font-semibold">{listing.title}</h3>
                <p className="text-sm text-gray-600">
                  {listing.area.toString()} {AREA_UNIT_LABELS[listing.areaUnit]} • {listing.price.toString()}{" "}
                  €
                </p>
                {(listing.city || listing.municipality) && (
                  <p className="text-sm text-gray-500">
                    {[listing.city, listing.municipality].filter(Boolean).join(", ")}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-10">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/skelbimai?page=${p}`}
              className={`px-3 py-1 rounded-md border ${
                p === page ? "bg-green-700 text-white border-green-700" : "border-gray-300 hover:bg-gray-50"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
