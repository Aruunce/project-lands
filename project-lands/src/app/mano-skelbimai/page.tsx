import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canCreateListings } from "@/lib/authz";
import { deleteListing, setListingStatus } from "@/lib/actions/listings";
import type { ListingStatus } from "@prisma/client";

const STATUS_LABELS: Record<ListingStatus, string> = {
  DRAFT: "Juodraštis",
  PUBLISHED: "Publikuotas",
  HIDDEN: "Paslėptas",
  SOLD: "Parduotas",
  ARCHIVED: "Archyvuotas",
};

export default async function MyListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ noPermission?: string }>;
}) {
  const { noPermission } = await searchParams;
  const session = await auth();
  if (!session?.user) redirect("/prisijungti");

  const listings = await prisma.listing.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
  });

  const canCreate = canCreateListings(session.user);

  return (
    <main className="px-4 py-10 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-green-800">Mano skelbimai</h1>
        {canCreate && (
          <Link
            href="/skelbimai/naujas"
            className="bg-green-700 text-white font-semibold rounded-md px-4 py-2 hover:bg-green-800 transition-colors"
          >
            + Naujas skelbimas
          </Link>
        )}
      </div>

      {noPermission && (
        <p className="mb-6 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded px-3 py-2">
          Neturite teisės kurti skelbimų.
        </p>
      )}

      {!canCreate && (
        <p className="mb-6 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded px-3 py-2">
          Šiuo metu skelbimus gali kelti tik administratoriaus patvirtinti vartotojai. Jei norite kelti
          skelbimą, susisiekite su administratoriumi.
        </p>
      )}

      {listings.length === 0 ? (
        <p className="text-gray-500">Kol kas neturite skelbimų.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {listings.map((listing) => (
            <li key={listing.id} className="border rounded-lg p-4 flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold">{listing.title}</p>
                <p className="text-sm text-gray-500">
                  {STATUS_LABELS[listing.status]} • Sukurta{" "}
                  {listing.createdAt.toLocaleDateString("lt-LT")}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap justify-end">
                <Link
                  href={`/skelbimai/${listing.slug}/redaguoti`}
                  className="px-3 py-1 text-sm rounded-md border border-green-700 text-green-700 hover:bg-green-50"
                >
                  Redaguoti
                </Link>

                {listing.status !== "PUBLISHED" && (
                  <StatusForm id={listing.id} status="PUBLISHED" label="Publikuoti" />
                )}
                {listing.status === "PUBLISHED" && (
                  <StatusForm id={listing.id} status="HIDDEN" label="Paslėpti" />
                )}
                {listing.status !== "ARCHIVED" && (
                  <StatusForm id={listing.id} status="ARCHIVED" label="Archyvuoti" />
                )}

                <form action={deleteListing.bind(null, listing.id)}>
                  <button
                    type="submit"
                    className="px-3 py-1 text-sm rounded-md border border-red-600 text-red-600 hover:bg-red-50"
                  >
                    Trinti
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

function StatusForm({ id, status, label }: { id: string; status: ListingStatus; label: string }) {
  const action = setListingStatus.bind(null, id, status);
  return (
    <form action={action}>
      <button
        type="submit"
        className="px-3 py-1 text-sm rounded-md border border-gray-400 text-gray-700 hover:bg-gray-50"
      >
        {label}
      </button>
    </form>
  );
}
