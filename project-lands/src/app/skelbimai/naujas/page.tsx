import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { canCreateListings } from "@/lib/authz";
import ListingForm from "@/components/listings/ListingForm";
import { createListing } from "@/lib/actions/listings";

export default async function NewListingPage() {
  const session = await auth();
  if (!session?.user) redirect("/prisijungti?callbackUrl=/skelbimai/naujas");
  if (!canCreateListings(session.user)) redirect("/mano-skelbimai?noPermission=1");

  return (
    <main className="px-4 py-10">
      <h1 className="text-2xl font-bold text-green-800 text-center mb-8">Naujas skelbimas</h1>
      <ListingForm action={createListing} submitLabel="Sukurti (juodraštis)" />
    </main>
  );
}
