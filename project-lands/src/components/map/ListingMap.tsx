"use client";

import { useEffect, useRef } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import { MAP_STYLE_URL, MARKER_COLOR } from "@/lib/map";
import { loadMapLibre } from "./loadMapLibre";

// Read-only map with the plot's pin.
export default function ListingMap({ lat, lng }: { lat: number; lng: number }) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let map: import("maplibre-gl").Map | undefined;
    let cancelled = false;

    loadMapLibre().then(({ Map, Marker, NavigationControl }) => {
      if (cancelled || !container.current) return;

      map = new Map({
        container: container.current,
        style: MAP_STYLE_URL,
        center: [lng, lat],
        zoom: 13,
        cooperativeGestures: true, // page scroll isn't hijacked by the map
        attributionControl: { compact: true },
      });
      map.addControl(new NavigationControl({ showCompass: false }), "top-right");
      new Marker({ color: MARKER_COLOR }).setLngLat([lng, lat]).addTo(map);
    });

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [lat, lng]);

  return <div ref={container} className="h-full w-full" />;
}
