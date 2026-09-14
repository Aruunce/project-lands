"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { ListingStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canCreateListings } from "@/lib/authz";
import { listingInputSchema } from "@/lib/validations/listing";
import { randomSlugSuffix, slugify } from "@/lib/slug";
import { rateLimit } from "@/lib/rate-limit";
import type { LandAttributes } from "@/types/listing";

export type ListingFormState = { error?: string; fieldErrors?: Record<string, string[]> };

function parseForm(formData: FormData) {
  return listingInputSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    price: formData.get("price"),
    pricePerUnit: formData.get("pricePerUnit"),
    area: formData.get("area"),
    areaUnit: formData.get("areaUnit"),
    address: formData.get("address"),
    municipality: formData.get("municipality"),
    city: formData.get("city"),
    landPurpose: formData.get("landPurpose"),
    plotNumber: formData.get("plotNumber"),
    contactName: formData.get("contactName"),
    contactPhone: formData.get("contactPhone"),
    contactEmail: formData.get("contactEmail"),
  });
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
  const session = await auth();
  if (!session?.user) redirect("/prisijungti");
  if (!canCreateListings(session.user)) {
    return { error: "Neturite teisės kurti skelbimų. Susisiekite su administratoriumi." };
  }

  if (!rateLimit(`create-listing:${session.user.id}`, 20, 60 * 60 * 1000)) {
    return { error: "Per daug bandymų. Bandykite vėliau." };
  }

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { error: "Patikrinkite formos laukus.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { landPurpose, plotNumber, ...data } = parsed.data;
  const attributes: LandAttributes = { landPurpose, plotNumber };
  const slug = await generateUniqueSlug(data.title);

  const listing = await prisma.listing.create({
    data: {
      ...data,
      slug,
      attributes,
      userId: session.user.id,
    },
  });

  revalidatePath("/mano-skelbimai");
  redirect(`/skelbimai/${listing.slug}/redaguoti`);
}

async function requireOwnedListing(id: string) {
  const session = await auth();
  if (!session?.user) redirect("/prisijungti");

  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing) return { session, listing: null as null };

  const isOwner = listing.userId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";
  if (!isOwner && !isAdmin) return { session, listing: null as null };

  return { session, listing };
}

export async function updateListing(
  id: string,
  _prevState: ListingFormState,
  formData: FormData,
): Promise<ListingFormState> {
  const { listing } = await requireOwnedListing(id);
  if (!listing) return { error: "Skelbimas nerastas arba neturite teisės jo redaguoti." };

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { error: "Patikrinkite formos laukus.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { landPurpose, plotNumber, ...data } = parsed.data;
  const attributes: LandAttributes = { landPurpose, plotNumber };

  await prisma.listing.update({
    where: { id },
    data: { ...data, attributes },
  });

  revalidatePath("/mano-skelbimai");
  revalidatePath(`/skelbimai/${listing.slug}`);
  return {};
}

export async function deleteListing(id: string): Promise<void> {
  const { listing } = await requireOwnedListing(id);
  if (!listing) return;

  await prisma.listing.delete({ where: { id } });
  revalidatePath("/mano-skelbimai");
}

export async function setListingStatus(id: string, status: ListingStatus): Promise<void> {
  const { listing } = await requireOwnedListing(id);
  if (!listing) return;

  await prisma.listing.update({
    where: { id },
    data: {
      status,
      publishedAt: status === "PUBLISHED" && !listing.publishedAt ? new Date() : listing.publishedAt,
    },
  });

  revalidatePath("/mano-skelbimai");
  revalidatePath(`/skelbimai/${listing.slug}`);
}
