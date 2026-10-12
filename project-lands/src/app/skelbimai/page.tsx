import type { Metadata } from "next";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { SearchX } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { pluralize } from "@/lib/format";
import ListingCard from "@/components/listings/ListingCard";
import SearchForm from "@/components/listings/SearchForm";
import Reveal from "@/components/ui/Reveal";

const PAGE_SIZE = 12;

export const metadata: Metadata = {
  title: "Skelbimai",
};

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const { page: pageParam, q: rawQuery } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const query = rawQuery?.trim().slice(0, 100) ?? "";

  const where: Prisma.ListingWhereInput = {
    status: "PUBLISHED",
    ...(query && {
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { city: { contains: query, mode: "insensitive" } },
        { municipality: { contains: query, mode: "insensitive" } },
        { address: { contains: query, mode: "insensitive" } },
      ],
    }),
  };

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.listing.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageHref = (p: number) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (p > 1) params.set("page", String(p));
    const search = params.toString();
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
            {query ? (
              <>
                Pagal „{query}“ rasta {total} {pluralize(total, ["skelbimas", "skelbimai", "skelbimų"])}
              </>
            ) : (
              <>
                {total} {pluralize(total, ["aktyvus skelbimas", "aktyvūs skelbimai", "aktyvių skelbimų"])}
              </>
            )}
          </p>
          <div className="mt-6 animate-fade-up [animation-delay:160ms]">
            <SearchForm defaultValue={query} size="compact" />
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
              {query ? "Nieko nerasta" : "Skelbimų dar nėra"}
            </p>
            {query && (
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
