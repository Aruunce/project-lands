"use client";

import { useEffect, useRef, useState } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import { MapPin, X } from "lucide-react";
import { LITHUANIA_CENTER, LITHUANIA_ZOOM, MAP_STYLE_URL, MARKER_COLOR } from "@/lib/map";
import { loadMapLibre } from "./loadMapLibre";

type Point = { lat: number; lng: number };

const round = (value: number) => Math.round(value * 1e6) / 1e6;

// Admin field: click the map to place the pin, drag to adjust.
export default function LocationPicker({ defaultValue }: { defaultValue?: Point | null }) {
  const container = useRef<HTMLDivElement>(null);
  const markerRef = useRef<import("maplibre-gl").Marker | null>(null);
  const [point, setPoint] = useState<Point | null>(defaultValue ?? null);

  useEffect(() => {
    let map: import("maplibre-gl").Map | undefined;
    let cancelled = false;

    loadMapLibre().then(({ Map, Marker, NavigationControl }) => {
      if (cancelled || !container.current) return;

      map = new Map({
        container: container.current,
        style: MAP_STYLE_URL,
        center: defaultValue ? [defaultValue.lng, defaultValue.lat] : LITHUANIA_CENTER,
        zoom: defaultValue ? 14 : LITHUANIA_ZOOM,
        attributionControl: { compact: true },
      });
      map.addControl(new NavigationControl({ showCompass: false }), "top-right");
      map.getCanvas().style.cursor = "crosshair";

      const marker = new Marker({ color: MARKER_COLOR, draggable: true });
      marker.on("dragend", () => {
        const { lat, lng } = marker.getLngLat();
        setPoint({ lat: round(lat), lng: round(lng) });
      });
      markerRef.current = marker;

      if (defaultValue) marker.setLngLat([defaultValue.lng, defaultValue.lat]).addTo(map);

      map.on("click", (event) => {
        const { lat, lng } = event.lngLat;
        marker.setLngLat([lng, lat]).addTo(map!);
        setPoint({ lat: round(lat), lng: round(lng) });
      });
    });

    return () => {
      cancelled = true;
      markerRef.current = null;
      map?.remove();
    };
    // Created once; later changes come from the map itself.
  }, []);

  function clear() {
    markerRef.current?.remove();
    setPoint(null);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="relative h-80 overflow-hidden rounded-xl ring-1 ring-stone-300">
        <div ref={container} className="h-full w-full" />
      </div>

      <div className="flex items-center justify-between gap-3 text-sm">
        {point ? (
          <span className="flex items-center gap-1.5 text-stone-700">
            <MapPin className="size-4 text-brand-600" />
            {point.lat}, {point.lng}
          </span>
        ) : (
          <span className="text-stone-500">Spustelėkite žemėlapyje sklypo vietą.</span>
        )}
        {point && (
          <button
            type="button"
            onClick={clear}
            className="flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-stone-600 hover:bg-stone-100"
          >
            <X className="size-4" />
            Pašalinti
          </button>
        )}
      </div>

      <input type="hidden" name="latitude" value={point?.lat ?? ""} />
      <input type="hidden" name="longitude" value={point?.lng ?? ""} />
    </div>
  );
}
