import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { LucideIcon } from "lucide-react";
import { ArrowLeft, Hash, Mail, MapPin, Navigation, Phone, Ruler, Sprout, Tag } from "lucide-react";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { AREA_UNIT_LABELS, STATUS_LABELS, formatArea, formatPrice } from "@/lib/format";
import { googleDirectionsUrl, wazeUrl } from "@/lib/map";
import { siteConfig } from "@/config/site";
import type { LandAttributes } from "@/types/listing";
import PlotPlaceholder from "@/components/listings/PlotPlaceholder";
import ListingMap from "@/components/map/ListingMap";

async function getVisibleListing(slug: string) {
  const session = await auth();
  const listing = await prisma.listing.findUnique({ where: { slug } });
  if (!listing) return null;

  const viewerIsAdmin = isAdmin(session?.user);
  if (listing.status !== "PUBLISHED" && !viewerIsAdmin) return null;

  return { listing, viewerIsAdmin };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await getVisibleListing(slug);
  if (!result) return {};
  const { listing } = result;

  const description = listing.description?.slice(0, 160) ?? `${listing.title} — ${siteConfig.name}`;

  return {
    title: listing.title,
    description,
    alternates: { canonical: `/skelbimai/${listing.slug}` },
    openGraph: {
      title: listing.title,
      description,
      type: "website",
    },
  };
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getVisibleListing(slug);
  if (!result) notFound();
  const { listing, viewerIsAdmin } = result;

  // Admin previews don't count as views.
  if (!viewerIsAdmin) {
    await prisma.listing.update({
      where: { id: listing.id },
      data: { viewCount: { increment: 1 } },
    });
  }

  const attributes = (listing.attributes as LandAttributes | null) ?? {};
  const location = [listing.city, listing.municipality].filter(Boolean).join(", ");
  const unit = AREA_UNIT_LABELS[listing.areaUnit];
  const coords =
    listing.latitude != null && listing.longitude != null
      ? { lat: listing.latitude, lng: listing.longitude }
      : null;

  return (
    <main className="pb-20">
      <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
        <Link
          href="/skelbimai"
          className="group inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 transition-colors hover:text-brand-700"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
          Visi skelbimai
        </Link>

        {listing.status !== "PUBLISHED" && (
          <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-200">
            Skelbimo būsena: {STATUS_LABELS[listing.status].toLowerCase()} — jį matote tik jūs.
          </p>
        )}

        <div className="relative mt-6 aspect-[16/9] animate-fade-up overflow-hidden rounded-3xl sm:aspect-[21/9]">
          <PlotPlaceholder seed={listing.slug} />
          {attributes.landPurpose && (
            <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-sm font-medium text-brand-800 shadow-sm backdrop-blur">
              {attributes.landPurpose}
            </span>
          )}
        </div>

        <div className="mt-8 animate-fade-up [animation-delay:100ms]">
          <h1 className="font-display text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
            {listing.title}
          </h1>
          {location && (
            <p className="mt-3 flex items-center gap-2 text-stone-600">
              <MapPin className="size-5 shrink-0 text-brand-600" />
              {location}
            </p>
          )}
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
          <div className="animate-fade-up [animation-delay:200ms]">
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Fact icon={Ruler} label="Plotas" value={formatArea(listing.area, listing.areaUnit)} />
              {listing.pricePerUnit && (
                <Fact icon={Tag} label={`Kaina už ${unit}`} value={formatPrice(listing.pricePerUnit)} />
              )}
              {attributes.landPurpose && <Fact icon={Sprout} label="Paskirtis" value={attributes.landPurpose} />}
              {attributes.plotNumber && <Fact icon={Hash} label="Sklypo Nr." value={attributes.plotNumber} />}
              {listing.address && <Fact icon={MapPin} label="Adresas" value={listing.address} />}
            </dl>

            {listing.description && (
              <section className="mt-10">
                <h2 className="font-display text-xl font-semibold text-stone-900">Aprašymas</h2>
                <p className="mt-3 whitespace-pre-line leading-relaxed text-stone-700">{listing.description}</p>
              </section>
            )}

            {coords && (
              <section className="mt-10">
                <h2 className="font-display text-xl font-semibold text-stone-900">Vieta</h2>
                <div className="mt-4 h-80 overflow-hidden rounded-2xl bg-stone-100 ring-1 ring-stone-200 sm:h-96">
                  <ListingMap lat={coords.lat} lng={coords.lng} />
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <DirectionsLink href={googleDirectionsUrl(coords.lat, coords.lng)} label="Google Maps" />
                  <DirectionsLink href={wazeUrl(coords.lat, coords.lng)} label="Waze" />
                </div>
              </section>
            )}
          </div>

          {/* On mobile the price + contacts card comes right after the title. */}
          <aside className="order-first animate-fade-up [animation-delay:200ms] lg:order-none">
            <ContactCard price={formatPrice(listing.price)} pricePerUnit={listing.pricePerUnit && `${formatPrice(listing.pricePerUnit)}/${unit}`} />
          </aside>
        </div>
      </div>
    </main>
  );
}

function Fact({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-stone-200/80">
      <dt className="flex items-center gap-1.5 text-sm text-stone-500">
        <Icon className="size-4 text-brand-600" />
        {label}
      </dt>
      <dd className="mt-1 font-semibold text-stone-900">{value}</dd>
    </div>
  );
}

function DirectionsLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-stone-800 shadow-sm ring-1 ring-stone-200 transition hover:-translate-y-0.5 hover:shadow-md hover:ring-brand-300"
    >
      <Navigation className="size-4 text-brand-600 transition-transform group-hover:rotate-12" />
      Nuvykti su {label}
    </a>
  );
}

function ContactCard({ price, pricePerUnit }: { price: string; pricePerUnit?: string | null }) {
  const { name, phone, email } = siteConfig.contact;

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-stone-200 lg:sticky lg:top-24">
      <p className="text-sm text-stone-500">Kaina</p>
      <p className="mt-1 font-display text-4xl font-bold tracking-tight text-stone-900">{price}</p>
      {pricePerUnit && <p className="mt-1 text-stone-500">{pricePerUnit}</p>}

      <div className="my-6 border-t border-stone-100" />

      <p className="font-semibold text-stone-900">Domina šis sklypas?</p>
      {name && <p className="mt-1 text-sm text-stone-500">{name}</p>}

      <div className="mt-4 flex flex-col gap-2.5">
        {phone && (
          <a
            href={`tel:${phone.replace(/\s+/g, "")}`}
            className="flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-brand-700"
          >
            <Phone className="size-4" />
            {phone}
          </a>
        )}
        {email && (
          <a
            href={`mailto:${email}`}
            className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold text-brand-800 ring-1 ring-brand-200 transition-colors hover:bg-brand-50"
          >
            <Mail className="size-4" />
            Rašyti el. laišką
          </a>
        )}
        {!phone && !email && (
          <p className="rounded-xl bg-stone-50 px-4 py-3 text-sm text-stone-600">
            Kontaktinė informacija bus paskelbta netrukus.
          </p>
        )}
      </div>
    </div>
  );
}
