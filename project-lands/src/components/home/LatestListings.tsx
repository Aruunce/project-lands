import Link from "next/link";
import type { Listing } from "@prisma/client";
import { ArrowRight, TreePine } from "lucide-react";
import ListingCard from "@/components/listings/ListingCard";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "./SectionHeading";

export default function LatestListings({ listings }: { listings: Listing[] }) {
  return (
    <section id="skelbimai" className="scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading eyebrow="Naujausi skelbimai" title="Sklypai ir kitas NT" />
          {listings.length > 0 && (
            <Link
              href="/skelbimai"
              className="group inline-flex items-center gap-1.5 font-semibold text-brand-700 hover:text-brand-800"
            >
              Visi skelbimai
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          )}
        </Reveal>

        {listings.length === 0 ? (
          <Reveal className="mt-12">
            <div className="flex flex-col items-center rounded-3xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center">
              <span className="grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                <TreePine className="size-7" />
              </span>
              <p className="mt-5 font-display text-xl font-semibold text-stone-900">Skelbimų dar nėra</p>
              <p className="mt-2 max-w-sm text-stone-500">Nauji skelbimai bus paskelbti netrukus — užsukite vėliau.</p>
            </div>
          </Reveal>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing, index) => (
              <Reveal key={listing.id} delay={(index % 3) * 110}>
                <ListingCard listing={listing} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
