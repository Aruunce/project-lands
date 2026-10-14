import type { Metadata } from "next";
import Link from "next/link";
import { Eye, ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authz";
import { STATUS_LABELS } from "@/lib/format";
import { TYPE_LABELS } from "@/lib/property";
import { deleteListing, setListingStatus } from "@/lib/actions/listings";
import type { ListingStatus } from "@prisma/client";
import ConfirmSubmitButton from "@/components/ui/ConfirmSubmitButton";

export const metadata: Metadata = {
  title: "Valdymas",
};

export default async function AdminListingsPage() {
  await requireAdmin();

  const listings = await prisma.listing.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return (
    <main className="px-4 py-10 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-green-800">Skelbimų valdymas</h1>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/saugumas"
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <ShieldCheck className="size-4" /> Saugumas
          </Link>
          <Link
            href="/admin/skelbimai/naujas"
            className="bg-green-700 text-white font-semibold rounded-md px-4 py-2 hover:bg-green-800 transition-colors"
          >
            + Naujas skelbimas
          </Link>
        </div>
      </div>

      {listings.length === 0 ? (
        <p className="text-gray-500">Kol kas neturite skelbimų.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {listings.map((listing) => (
            <li key={listing.id} className="border rounded-lg p-4 flex items-center justify-between gap-4">
              <div>
                <Link href={`/skelbimai/${listing.slug}`} className="font-semibold hover:text-brand-700 hover:underline">
                  {listing.title}
                </Link>
                <p className="flex flex-wrap items-center gap-x-2 text-sm text-gray-500">
                  <span>{TYPE_LABELS[listing.type]}</span>
                  <span>• {STATUS_LABELS[listing.status]}</span>
                  <span>• Sukurta {listing.createdAt.toLocaleDateString("lt-LT")}</span>
                  <span className="inline-flex items-center gap-1">
                    • <Eye className="size-3.5" /> {listing.viewCount}
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap justify-end">
                <Link
                  href={`/admin/skelbimai/${listing.slug}/redaguoti`}
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
                  <ConfirmSubmitButton
                    message={`Ištrinti skelbimą „${listing.title}“? Šio veiksmo atšaukti negalima.`}
                    className="px-3 py-1 text-sm rounded-md border border-red-600 text-red-600 hover:bg-red-50"
                  >
                    Trinti
                  </ConfirmSubmitButton>
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
