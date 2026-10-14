"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, ImagePlus, LoaderCircle, Star, Trash2 } from "lucide-react";
import { deleteListingImage, moveListingImage } from "@/lib/actions/images";
import { resizeImage } from "./resizeImage";

type Image = { id: string; thumbUrl: string };

const iconButton =
  "grid size-8 cursor-pointer place-items-center rounded-full bg-white/90 text-stone-700 shadow hover:bg-white disabled:opacity-40";

// Photo manager on the listing edit page. Photos upload one by one right after selection.
export default function ImageManager({ listingId, images }: { listingId: string; images: Image[] }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function upload(fileList: FileList | null) {
    const files = Array.from(fileList ?? []).filter((file) => file.type.startsWith("image/"));
    if (files.length === 0) return;

    setErrors([]);
    setProgress({ done: 0, total: files.length });

    for (const [index, file] of files.entries()) {
      try {
        const [full, thumb] = await Promise.all([resizeImage(file, 1920, 0.82), resizeImage(file, 640, 0.75)]);
        const body = new FormData();
        body.append("full", full.blob, "full");
        body.append("thumb", thumb.blob, "thumb");
        body.append("width", String(full.width));
        body.append("height", String(full.height));

        const response = await fetch(`/api/admin/listings/${listingId}/images`, { method: "POST", body });
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error ?? "Nepavyko įkelti");
        }
      } catch (error) {
        setErrors((current) => [...current, `${file.name}: ${error instanceof Error ? error.message : "klaida"}`]);
      }
      setProgress({ done: index + 1, total: files.length });
      router.refresh();
    }

    setProgress(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  const run = (action: () => Promise<void>) =>
    startTransition(async () => {
      await action();
      router.refresh();
    });

  return (
    <div className="flex flex-col gap-4">
      {images.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((image, index) => (
            <li key={image.id} className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-stone-100 ring-1 ring-stone-200">
              <img src={image.thumbUrl} alt="" className="h-full w-full object-cover" />
              {index === 0 && (
                <span className="absolute left-2 top-2 rounded-full bg-brand-600 px-2 py-0.5 text-xs font-semibold text-white">
                  Pagrindinė
                </span>
              )}
              <div className="absolute inset-x-2 bottom-2 flex justify-between">
                <span className="flex gap-1">
                  <button
                    type="button"
                    title="Perkelti kairėn"
                    disabled={isPending || index === 0}
                    onClick={() => run(() => moveListingImage(image.id, "left"))}
                    className={iconButton}
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  <button
                    type="button"
                    title="Perkelti dešinėn"
                    disabled={isPending || index === images.length - 1}
                    onClick={() => run(() => moveListingImage(image.id, "right"))}
                    className={iconButton}
                  >
                    <ChevronRight className="size-4" />
                  </button>
                  {index > 0 && (
                    <button
                      type="button"
                      title="Padaryti pagrindine"
                      disabled={isPending}
                      onClick={() => run(() => moveListingImage(image.id, "first"))}
                      className={iconButton}
                    >
                      <Star className="size-4" />
                    </button>
                  )}
                </span>
                <button
                  type="button"
                  title="Ištrinti"
                  disabled={isPending}
                  onClick={() => window.confirm("Ištrinti šią nuotrauką?") && run(() => deleteListingImage(image.id))}
                  className={`${iconButton} text-red-600`}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          upload(e.dataTransfer.files);
        }}
        className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors ${
          dragging ? "border-brand-600 bg-brand-50" : "border-stone-300 hover:border-brand-500 hover:bg-stone-50"
        }`}
      >
        {progress ? (
          <>
            <LoaderCircle className="size-7 animate-spin text-brand-600" />
            <span className="text-sm font-medium text-stone-700">
              Įkeliama {progress.done}/{progress.total}…
            </span>
          </>
        ) : (
          <>
            <ImagePlus className="size-7 text-brand-600" />
            <span className="text-sm font-medium text-stone-700">Pasirinkite nuotraukas arba įtempkite jas čia</span>
            <span className="text-xs text-stone-500">Galima kelias iš karto. Nuotraukos automatiškai sumažinamos.</span>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          disabled={progress !== null}
          onChange={(e) => upload(e.target.files)}
          className="sr-only"
        />
      </label>

      {errors.length > 0 && (
        <ul className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
