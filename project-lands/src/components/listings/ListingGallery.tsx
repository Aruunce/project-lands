"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, Images, X } from "lucide-react";
import { pluralize } from "@/lib/format";

export type Photo = { url: string; thumbUrl: string; width: number; height: number };

// Grid tile sizes for 1–5 visible photos on a 4×2 grid (the first one is the big one).
function tileClass(index: number, count: number): string {
  if (index === 0) return count === 1 ? "sm:col-span-4 sm:row-span-2" : "sm:col-span-2 sm:row-span-2";
  const hiddenOnMobile = "hidden sm:block";
  if (count === 2) return `${hiddenOnMobile} sm:col-span-2 sm:row-span-2`;
  if (count === 3 || (count === 4 && index === 1)) return `${hiddenOnMobile} sm:col-span-2`;
  return hiddenOnMobile;
}

export default function ListingGallery({
  photos,
  title,
  badge,
}: {
  photos: Photo[];
  title: string;
  badge?: React.ReactNode;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const visible = photos.slice(0, 5);
  const hiddenCount = photos.length - visible.length;

  return (
    <>
      <div className="relative grid h-72 gap-2 overflow-hidden rounded-3xl sm:h-[440px] sm:grid-cols-4 sm:grid-rows-2">
        {visible.map((photo, index) => (
          <button
            key={photo.url}
            type="button"
            onClick={() => setOpenIndex(index)}
            className={`group relative cursor-zoom-in overflow-hidden bg-stone-100 ${tileClass(index, visible.length)}`}
          >
            <img
              src={index === 0 ? photo.url : photo.thumbUrl}
              alt={`${title} — nuotrauka ${index + 1}`}
              loading={index === 0 ? "eager" : "lazy"}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {index === visible.length - 1 && hiddenCount > 0 && (
              <span className="absolute inset-0 grid place-items-center bg-black/45 text-2xl font-semibold text-white">
                +{hiddenCount}
              </span>
            )}
          </button>
        ))}

        {badge && <div className="pointer-events-none absolute left-4 top-4 z-10">{badge}</div>}

        <button
          type="button"
          onClick={() => setOpenIndex(0)}
          className="absolute bottom-4 right-4 z-10 flex cursor-pointer items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-sm font-medium text-stone-800 shadow-sm backdrop-blur hover:bg-white"
        >
          <Images className="size-4" />
          {photos.length} {pluralize(photos.length, ["nuotrauka", "nuotraukos", "nuotraukų"])}
        </button>
      </div>

      {openIndex !== null && (
        <Lightbox photos={photos} index={openIndex} title={title} onChange={setOpenIndex} onClose={() => setOpenIndex(null)} />
      )}
    </>
  );
}

function Lightbox({
  photos,
  index,
  title,
  onChange,
  onClose,
}: {
  photos: Photo[];
  index: number;
  title: string;
  onChange: (index: number) => void;
  onClose: () => void;
}) {
  const swipeStart = useRef<number | null>(null);
  const go = (step: number) => onChange((index + step + photos.length) % photos.length);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") go(-1);
      if (event.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  });

  const photo = photos[index];

  // Rendered into <body>, so page animations/transforms can't affect the fixed overlay.
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${title} — nuotraukos`}
      className="fixed inset-0 z-[70] flex animate-fade-in flex-col bg-black/95 text-white"
    >
      <div className="flex items-center justify-between px-4 py-3 text-sm">
        <span className="text-white/70">
          {index + 1} / {photos.length}
        </span>
        <button type="button" onClick={onClose} aria-label="Uždaryti" className="grid size-10 cursor-pointer place-items-center rounded-full hover:bg-white/10">
          <X className="size-6" />
        </button>
      </div>

      <div
        className="relative flex min-h-0 flex-1 items-center justify-center px-2 sm:px-16"
        onPointerDown={(e) => (swipeStart.current = e.clientX)}
        onPointerUp={(e) => {
          if (swipeStart.current === null) return;
          const dx = e.clientX - swipeStart.current;
          swipeStart.current = null;
          if (Math.abs(dx) > 50) go(dx > 0 ? -1 : 1);
        }}
      >
        <img
          key={photo.url}
          src={photo.url}
          alt={`${title} — nuotrauka ${index + 1}`}
          width={photo.width}
          height={photo.height}
          className="max-h-full max-w-full animate-fade-in select-none object-contain"
          draggable={false}
        />
        {photos.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Ankstesnė"
              className="absolute left-2 top-1/2 hidden size-12 -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-white/10 hover:bg-white/20 sm:grid"
            >
              <ChevronLeft className="size-7" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Kita"
              className="absolute right-2 top-1/2 hidden size-12 -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-white/10 hover:bg-white/20 sm:grid"
            >
              <ChevronRight className="size-7" />
            </button>
          </>
        )}
      </div>

      {photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto px-4 py-3">
          {photos.map((thumb, thumbIndex) => (
            <button
              key={thumb.url}
              type="button"
              onClick={() => onChange(thumbIndex)}
              aria-label={`Nuotrauka ${thumbIndex + 1}`}
              className={`h-14 w-20 shrink-0 cursor-pointer overflow-hidden rounded-md ring-2 transition ${
                thumbIndex === index ? "ring-white" : "opacity-50 ring-transparent hover:opacity-100"
              }`}
            >
              <img src={thumb.thumbUrl} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>,
    document.body,
  );
}
