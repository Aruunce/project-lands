import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authz";
import { updateListing } from "@/lib/actions/listings";
import ListingForm from "@/components/listings/ListingForm";
import ImageManager from "@/components/admin/ImageManager";
import type { ListingAttributes, ListingPolygon } from "@/types/listing";

export const metadata: Metadata = {
  title: "Redaguoti skelbimą",
};

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  await requireAdmin(`/admin/skelbimai/${slug}/redaguoti`);

  const listing = await prisma.listing.findUnique({
    where: { slug },
    include: { images: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }], select: { id: true, thumbUrl: true } } },
  });
  if (!listing) notFound();

  const attributes = (listing.attributes as ListingAttributes | null) ?? {};
  const boundAction = updateListing.bind(null, listing.id);

  return (
    <main className="px-4 py-10">
      <h1 className="text-2xl font-bold text-green-800 text-center">Redaguoti skelbimą</h1>
      <p className="mb-8 mt-2 text-center">
        <Link href={`/skelbimai/${listing.slug}`} className="text-sm font-semibold text-brand-700 hover:underline">
          Peržiūrėti skelbimą →
        </Link>
      </p>

      <section className="mx-auto mb-10 flex max-w-2xl flex-col gap-3">
        <h2 className="border-b border-gray-200 pb-2 text-lg font-semibold text-gray-900">
          Nuotraukos <span className="font-normal text-gray-500">({listing.images.length})</span>
        </h2>
        <ImageManager listingId={listing.id} images={listing.images} />
      </section>

      <ListingForm
        action={boundAction}
        submitLabel="Išsaugoti"
        defaults={{
          type: listing.type,
          title: listing.title,
          description: listing.description ?? undefined,
          price: listing.price.toString(),
          pricePerUnit: listing.pricePerUnit?.toString(),
          area: listing.area.toString(),
          areaUnit: listing.areaUnit,
          address: listing.address ?? undefined,
          municipality: listing.municipality ?? undefined,
          city: listing.city ?? undefined,
          landPurpose: attributes.landPurpose,
          plotNumber: attributes.plotNumber,
          utilities: attributes.utilities,
          buildings: attributes.buildings,
          location:
            listing.latitude != null && listing.longitude != null
              ? { lat: listing.latitude, lng: listing.longitude }
              : null,
          geometry: listing.geometry as ListingPolygon | null,
        }}
      />
    </main>
  );
}
