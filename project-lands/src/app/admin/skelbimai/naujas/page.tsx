import type { Metadata } from "next";
import { requireAdmin } from "@/lib/authz";
import ListingForm from "@/components/listings/ListingForm";
import { createListing } from "@/lib/actions/listings";

export const metadata: Metadata = {
  title: "Naujas skelbimas",
};

export default async function NewListingPage() {
  await requireAdmin("/admin/skelbimai/naujas");

  return (
    <main className="px-4 py-10">
      <h1 className="text-2xl font-bold text-green-800 text-center mb-8">Naujas skelbimas</h1>
      <ListingForm action={createListing} submitLabel="Sukurti (juodraštis)" />
    </main>
  );
}
