import Link from "next/link";
import type { Listing } from "@prisma/client";
import { ArrowRight, MapPin, Ruler } from "lucide-react";
import { AREA_UNIT_LABELS, formatArea, formatPrice } from "@/lib/format";
import type { LandAttributes } from "@/types/listing";
import PlotPlaceholder from "./PlotPlaceholder";

export default function ListingCard({ listing }: { listing: Listing }) {
  const attributes = (listing.attributes as LandAttributes | null) ?? {};
  const location = [listing.city, listing.municipality].filter(Boolean).join(", ");

  return (
    <Link
      href={`/skelbimai/${listing.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200/80 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-950/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <PlotPlaceholder
          seed={listing.slug}
          className="transition-transform duration-700 ease-out group-hover:scale-105"
        />
        {attributes.landPurpose && (
          <span className="absolute left-3 top-3 max-w-[85%] truncate rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-brand-800 shadow-sm backdrop-blur">
            {attributes.landPurpose}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-baseline justify-between gap-3">
          <p className="font-display text-2xl font-bold tracking-tight text-stone-900">
            {formatPrice(listing.price)}
          </p>
          {listing.pricePerUnit && (
            <p className="shrink-0 text-sm text-stone-500">
              {formatPrice(listing.pricePerUnit)}/{AREA_UNIT_LABELS[listing.areaUnit]}
            </p>
          )}
        </div>

        <h3 className="mt-2 line-clamp-2 font-semibold text-stone-800 transition-colors group-hover:text-brand-700">
          {listing.title}
        </h3>

        {location && (
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-stone-500">
            <MapPin className="size-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{location}</span>
          </p>
        )}

        <div className="mt-auto pt-4">
          <div className="flex items-center justify-between border-t border-stone-100 pt-4">
            <span className="flex items-center gap-1.5 text-sm font-medium text-stone-700">
              <Ruler className="size-4 text-brand-600" aria-hidden="true" />
              {formatArea(listing.area, listing.areaUnit)}
            </span>
            <span className="flex items-center gap-1 text-sm font-medium text-brand-700">
              Plačiau
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
