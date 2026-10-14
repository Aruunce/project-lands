import type { Prisma } from "@prisma/client";

// Prisma `include` for listing cards: only the main photo's thumbnail.
export const withMainPhoto = {
  images: {
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    take: 1,
    select: { thumbUrl: true },
  },
} satisfies Prisma.ListingInclude;
