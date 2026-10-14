"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authz";
import { deleteFiles } from "@/lib/storage";
import { revalidateListingPages } from "@/lib/revalidate";

async function findImage(imageId: string) {
  await requireAdmin();
  return prisma.listingImage.findUnique({
    where: { id: imageId },
    include: { listing: { select: { slug: true } } },
  });
}

export async function deleteListingImage(imageId: string): Promise<void> {
  const image = await findImage(imageId);
  if (!image) return;

  await prisma.listingImage.delete({ where: { id: imageId } });
  await deleteFiles([image.url, image.thumbUrl]);
  await revalidateListingPages(image.listing.slug);
}

// Moves a photo one place left/right, or to the front (= main photo).
export async function moveListingImage(imageId: string, to: "left" | "right" | "first"): Promise<void> {
  const image = await findImage(imageId);
  if (!image) return;

  const images = await prisma.listingImage.findMany({
    where: { listingId: image.listingId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: { id: true },
  });
  const ids = images.map((img) => img.id);
  const from = ids.indexOf(imageId);
  const target = to === "first" ? 0 : to === "left" ? Math.max(0, from - 1) : Math.min(ids.length - 1, from + 1);
  ids.splice(from, 1);
  ids.splice(target, 0, imageId);

  await prisma.$transaction(
    ids.map((id, index) => prisma.listingImage.update({ where: { id }, data: { sortOrder: index } })),
  );
  await revalidateListingPages(image.listing.slug);
}
