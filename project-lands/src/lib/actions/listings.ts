"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Prisma, type ListingStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { polygonCenter, ringPoints } from "@/lib/geo";
import { requireAdmin } from "@/lib/authz";
import { listingInputSchema, type ListingInput } from "@/lib/validations/listing";
import { randomSlugSuffix, slugify } from "@/lib/slug";
import { rateLimit } from "@/lib/rate-limit";
import { buildSearchText } from "@/lib/search";
import { M2_PER_UNIT, TYPE_LABELS } from "@/lib/property";
import type { ListingAttributes } from "@/types/listing";

export type ListingFormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: string;
};

function parseForm(formData: FormData) {
  return listingInputSchema.safeParse({
    type: formData.get("type"),
    title: formData.get("title"),
    description: formData.get("description"),
    price: formData.get("price"),
    pricePerUnit: formData.get("pricePerUnit"),
    area: formData.get("area"),
    areaUnit: formData.get("areaUnit"),
    address: formData.get("address"),
    municipality: formData.get("municipality"),
    city: formData.get("city"),
    latitude: formData.get("latitude"),
    longitude: formData.get("longitude"),
    geometry: formData.get("geometry"),
    landPurpose: formData.get("landPurpose"),
    plotNumber: formData.get("plotNumber"),
    utilities: formData.getAll("utilities"),
    buildings: formData.get("buildings"),
  });
}

// Type-specific fields go into the `attributes` JSON column; only non-empty ones are kept.
function toListingData({ landPurpose, plotNumber, utilities, buildings, geometry, ...data }: ListingInput) {
  const attributes: ListingAttributes = {
    ...(landPurpose && { landPurpose }),
    ...(plotNumber && { plotNumber }),
    ...(utilities.length > 0 && { utilities }),
    ...(buildings.length > 0 && { buildings }),
  };

  // A drawn boundary without a pin gets its center as the pin.
  if (geometry && (data.latitude === null || data.longitude === null)) {
    const center = polygonCenter(ringPoints(geometry));
    data.latitude = center.lat;
    data.longitude = center.lng;
  }

  return {
    ...data,
    attributes,
    geometry: geometry ?? Prisma.DbNull,
    areaSqm: data.area * M2_PER_UNIT[data.areaUnit],
    searchText: buildSearchText([data.title, data.city, data.municipality, data.address, TYPE_LABELS[data.type]]),
  };
}

async function generateUniqueSlug(title: string): Promise<string> {
  const base = slugify(title) || "skelbimas";

  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = attempt === 0 ? base : `${base}-${randomSlugSuffix()}`;
    const existing = await prisma.listing.findUnique({ where: { slug: candidate } });
    if (!existing) return candidate;
  }

  return `${base}-${randomSlugSuffix(10)}`;
}

export async function createListing(
  _prevState: ListingFormState,
  formData: FormData,
): Promise<ListingFormState> {
  const session = await requireAdmin();

  if (!rateLimit(`create-listing:${session.user.id}`, 20, 60 * 60 * 1000)) {
    return { error: "Per daug bandymų. Bandykite vėliau." };
  }

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { error: "Patikrinkite formos laukus.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const slug = await generateUniqueSlug(parsed.data.title);

  const listing = await prisma.listing.create({
    data: {
      ...toListingData(parsed.data),
      slug,
      userId: session.user.id,
    },
  });

  revalidatePath("/admin");
  redirect(`/admin/skelbimai/${listing.slug}/redaguoti`);
}

export async function updateListing(
  id: string,
  _prevState: ListingFormState,
  formData: FormData,
): Promise<ListingFormState> {
  await requireAdmin();

  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing) return { error: "Skelbimas nerastas." };

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { error: "Patikrinkite formos laukus.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  await prisma.listing.update({
    where: { id },
    data: toListingData(parsed.data),
  });

  revalidatePath("/admin");
  revalidatePath(`/skelbimai/${listing.slug}`);
  return { success: "Pakeitimai išsaugoti." };
}

export async function deleteListing(id: string): Promise<void> {
  await requireAdmin();

  await prisma.listing.deleteMany({ where: { id } });
  revalidatePath("/admin");
}

export async function setListingStatus(id: string, status: ListingStatus): Promise<void> {
  await requireAdmin();

  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing) return;

  await prisma.listing.update({
    where: { id },
    data: {
      status,
      publishedAt: status === "PUBLISHED" && !listing.publishedAt ? new Date() : listing.publishedAt,
    },
  });

  revalidatePath("/admin");
  revalidatePath(`/skelbimai/${listing.slug}`);
}
