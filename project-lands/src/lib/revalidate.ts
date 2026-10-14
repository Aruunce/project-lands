import { revalidatePath } from "next/cache";

// Refreshes every page that shows a listing (admin edit, listing page, lists).
export function revalidateListingPages(slug: string) {
  revalidatePath(`/admin/skelbimai/${slug}/redaguoti`);
  revalidatePath(`/skelbimai/${slug}`);
  revalidatePath("/skelbimai");
  revalidatePath("/");
}
