import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateListing } from "@/lib/actions/listings";
import ListingForm from "@/components/listings/ListingForm";
import type { LandAttributes } from "@/types/listing";

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();
  if (!session?.user) redirect("/prisijungti");

  const listing = await prisma.listing.findUnique({ where: { slug } });
  if (!listing) notFound();

  const isOwner = listing.userId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";
  if (!isOwner && !isAdmin) notFound();

  const attributes = (listing.attributes as LandAttributes | null) ?? {};
  const boundAction = updateListing.bind(null, listing.id);

  return (
    <main className="px-4 py-10">
      <h1 className="text-2xl font-bold text-green-800 text-center mb-8">Redaguoti skelbimą</h1>
      <ListingForm
        action={boundAction}
        submitLabel="Išsaugoti"
        defaults={{
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
          contactName: listing.contactName ?? undefined,
          contactPhone: listing.contactPhone ?? undefined,
          contactEmail: listing.contactEmail ?? undefined,
        }}
      />
    </main>
  );
}
