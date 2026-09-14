import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { LandAttributes } from "@/types/listing";

const AREA_UNIT_LABELS: Record<string, string> = { SQM: "m²", ARE: "a", HECTARE: "ha" };

async function getVisibleListing(slug: string) {
  const session = await auth();
  const listing = await prisma.listing.findUnique({ where: { slug } });
  if (!listing) return null;

  const isOwner = listing.userId === session?.user?.id;
  const isAdmin = session?.user?.role === "ADMIN";
  if (listing.status !== "PUBLISHED" && !isOwner && !isAdmin) return null;

  return listing;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getVisibleListing(slug);
  if (!listing) return {};

  const description = listing.description?.slice(0, 160) ?? `${listing.title} — LANDs.lt`;

  return {
    title: `${listing.title} | LANDs.lt`,
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
  const listing = await getVisibleListing(slug);
  if (!listing) notFound();

  await prisma.listing.update({
    where: { id: listing.id },
    data: { viewCount: { increment: 1 } },
  });

  const attributes = (listing.attributes as LandAttributes | null) ?? {};

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <div className="w-full h-64 rounded-lg bg-gradient-to-br from-green-100 to-green-300 mb-6" />

      <h1 className="text-3xl font-bold text-green-800 mb-2">{listing.title}</h1>
      <p className="text-2xl font-semibold mb-1">
        {listing.price.toString()} €
        {listing.pricePerUnit && ` (${listing.pricePerUnit.toString()} €/${AREA_UNIT_LABELS[listing.areaUnit]})`}
      </p>
      <p className="text-gray-600 mb-6">
        {listing.area.toString()} {AREA_UNIT_LABELS[listing.areaUnit]}
        {(listing.city || listing.municipality) &&
          ` • ${[listing.city, listing.municipality].filter(Boolean).join(", ")}`}
      </p>

      {listing.description && (
        <p className="whitespace-pre-line text-gray-800 mb-6">{listing.description}</p>
      )}

      <dl className="grid grid-cols-2 gap-y-2 text-sm mb-8 border-t pt-4">
        {listing.address && (
          <>
            <dt className="text-gray-500">Adresas</dt>
            <dd>{listing.address}</dd>
          </>
        )}
        {attributes.landPurpose && (
          <>
            <dt className="text-gray-500">Žemės paskirtis</dt>
            <dd>{attributes.landPurpose}</dd>
          </>
        )}
        {attributes.plotNumber && (
          <>
            <dt className="text-gray-500">Sklypo Nr.</dt>
            <dd>{attributes.plotNumber}</dd>
          </>
        )}
      </dl>

      {(listing.contactName || listing.contactPhone || listing.contactEmail) && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <h2 className="font-semibold mb-2">Kontaktai</h2>
          {listing.contactName && <p>{listing.contactName}</p>}
          {listing.contactPhone && <p>{listing.contactPhone}</p>}
          {listing.contactEmail && <p>{listing.contactEmail}</p>}
        </div>
      )}
    </main>
  );
}
