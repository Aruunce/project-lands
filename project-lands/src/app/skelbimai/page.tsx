import type { Metadata } from "next";
import Link from "next/link";
import { SearchX } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { pluralize } from "@/lib/format";
import {
  activeFilterCount,
  filtersToOrderBy,
  filtersToSearchParams,
  filtersToWhere,
  parseFilters,
} from "@/lib/listing-filters";
import ListingCard from "@/components/listings/ListingCard";
import ListingFilters from "@/components/listings/ListingFilters";
import Reveal from "@/components/ui/Reveal";

const PAGE_SIZE = 12;

export const metadata: Metadata = {
  title: "Skelbimai",
};

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filters = parseFilters(params);
  const page = Math.max(1, Number(params.page) || 1);
  const where = filtersToWhere(filters);
  const activeCount = activeFilterCount(filters);
  const isFiltered = activeCount > 0 || filters.q !== "";

  const [listings, total, municipalityRows] = await Promise.all([
    prisma.listing.findMany({
      where,
      orderBy: filtersToOrderBy(filters),
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.listing.count({ where }),
    prisma.listing.findMany({
      where: { status: "PUBLISHED", municipality: { not: null } },
      distinct: ["municipality"],
      select: { municipality: true },
      orderBy: { municipality: "asc" },
    }),
  ]);
  const municipalities = municipalityRows.map((row) => row.municipality!);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageHref = (p: number) => {
    const query = filtersToSearchParams(filters);
    if (p > 1) query.set("page", String(p));
    const search = query.toString();
    return search ? `/skelbimai?${search}` : "/skelbimai";
  };

  return (
    <main>
      <section className="border-b border-stone-200/70 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <h1 className="animate-fade-up font-display text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
            Sklypai ir kitas nekilnojamasis turtas
          </h1>
          <p className="mt-2 animate-fade-up text-stone-500 [animation-delay:80ms]">
            {isFiltered
              ? `Rasta ${total} ${pluralize(total, ["skelbimas", "skelbimai", "skelbimų"])}`
              : `${total} ${pluralize(total, ["aktyvus skelbimas", "aktyvūs skelbimai", "aktyvių skelbimų"])}`}
          </p>
          <div className="mt-6 animate-fade-up [animation-delay:160ms]">
            <ListingFilters filters={filters} municipalities={municipalities} activeCount={activeCount} />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        {listings.length === 0 ? (
          <div className="flex flex-col items-center rounded-3xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center">
            <span className="grid size-14 place-items-center rounded-2xl bg-stone-100 text-stone-500">
              <SearchX className="size-7" />
            </span>
            <p className="mt-5 font-display text-xl font-semibold text-stone-900">
              {isFiltered ? "Pagal pasirinktus kriterijus nieko nerasta" : "Skelbimų dar nėra"}
            </p>
            {isFiltered && (
              <Link href="/skelbimai" className="mt-3 font-semibold text-brand-700 hover:text-brand-800">
                Rodyti visus skelbimus
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing, index) => (
              <Reveal key={listing.id} delay={(index % 3) * 110}>
                <ListingCard listing={listing} />
              </Reveal>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <nav className="mt-12 flex justify-center gap-2" aria-label="Puslapiai">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={pageHref(p)}
                aria-current={p === page ? "page" : undefined}
                className={`grid size-10 place-items-center rounded-xl text-sm font-semibold transition-colors ${
                  p === page
                    ? "bg-brand-600 text-white"
                    : "bg-white text-stone-700 ring-1 ring-stone-200 hover:bg-stone-50"
                }`}
              >
                {p}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </main>
  );
}
