"use client";

import { useEffect, useRef, useState } from "react";
import type { ListingPolygon } from "@/types/listing";
import { renderThumbnail } from "./thumbnailRenderer";

// Static map image of the plot for listing cards, rendered when the card scrolls into view.
export default function MapThumbnail({
  lat,
  lng,
  geometry,
  className = "",
}: {
  lat: number;
  lng: number;
  geometry?: ListingPolygon | null;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let cancelled = false;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        renderThumbnail({ lat, lng, geometry })
          .then((url) => !cancelled && setSrc(url))
          .catch(() => {}); // keep the placeholder
      },
      { rootMargin: "300px" },
    );
    observer.observe(element);

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [lat, lng, geometry]);

  return (
    <div ref={ref} className={`absolute inset-0 ${className}`}>
      {src && (
        <>
          <img src={src} alt="" className="absolute inset-0 h-full w-full animate-fade-in object-cover" />
          <span className="absolute bottom-1 right-1.5 rounded bg-white/70 px-1 text-[10px] leading-4 text-stone-600">
            © OpenStreetMap
          </span>
        </>
      )}
    </div>
  );
}
