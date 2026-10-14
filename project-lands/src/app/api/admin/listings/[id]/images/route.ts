import crypto from "crypto";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { saveFile } from "@/lib/storage";
import { revalidateListingPages } from "@/lib/revalidate";

const MAX_IMAGES = 40;
const ALLOWED_TYPES: Record<string, string> = { "image/webp": "webp", "image/jpeg": "jpg" };
const MAX_FULL_BYTES = 4 * 1024 * 1024;
const MAX_THUMB_BYTES = 1024 * 1024;

const error = (message: string, status: number) => NextResponse.json({ error: message }, { status });

function validFile(value: FormDataEntryValue | null, maxBytes: number): value is File {
  return value instanceof File && value.type in ALLOWED_TYPES && value.size > 0 && value.size <= maxBytes;
}

function dimension(value: FormDataEntryValue | null): number | null {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 && number <= 10_000 ? number : null;
}

// Uploads one photo (already resized in the browser) for a listing.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user)) return error("Neprisijungta.", 401);
  if (!rateLimit(`image-upload:${session.user.id}`, 300, 60 * 60 * 1000)) {
    return error("Per daug įkėlimų. Bandykite vėliau.", 429);
  }

  const { id } = await params;
  const listing = await prisma.listing.findUnique({ where: { id }, select: { id: true, slug: true } });
  if (!listing) return error("Skelbimas nerastas.", 404);

  const count = await prisma.listingImage.count({ where: { listingId: id } });
  if (count >= MAX_IMAGES) return error(`Daugiausia ${MAX_IMAGES} nuotraukų vienam skelbimui.`, 400);

  const form = await request.formData();
  const full = form.get("full");
  const thumb = form.get("thumb");
  const width = dimension(form.get("width"));
  const height = dimension(form.get("height"));
  if (!validFile(full, MAX_FULL_BYTES) || !validFile(thumb, MAX_THUMB_BYTES) || !width || !height) {
    return error("Netinkamas nuotraukos failas.", 400);
  }

  const base = `listings/${id}/${crypto.randomUUID()}`;
  let url: string;
  let thumbUrl: string;
  try {
    [url, thumbUrl] = await Promise.all([
      saveFile(`${base}.${ALLOWED_TYPES[full.type]}`, full),
      saveFile(`${base}-thumb.${ALLOWED_TYPES[thumb.type]}`, thumb),
    ]);
  } catch (err) {
    console.error("Photo upload failed:", err);
    return error("Nepavyko išsaugoti nuotraukos. Patikrinkite, ar Vercel'yje sukurta Blob saugykla.", 503);
  }

  const last = await prisma.listingImage.aggregate({ where: { listingId: id }, _max: { sortOrder: true } });
  const image = await prisma.listingImage.create({
    data: { listingId: id, url, thumbUrl, width, height, sortOrder: (last._max.sortOrder ?? -1) + 1 },
  });

  revalidateListingPages(listing.slug);
  return NextResponse.json(image, { status: 201 });
}
