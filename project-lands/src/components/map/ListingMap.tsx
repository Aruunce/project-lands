"use client";

import { useEffect, useRef } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import { MAP_LOCALE, MAP_STYLE_URL, MARKER_COLOR } from "@/lib/map";
import { polygonBounds, ringPoints } from "@/lib/geo";
import type { ListingPolygon } from "@/types/listing";
import { loadMapLibre } from "./loadMapLibre";
import { addPlotLayers, setPlotData } from "./plotLayers";
import { applyLithuanianLabels } from "./labels";

// Read-only map: the plot boundary if drawn, otherwise its pin.
export default function ListingMap({
  lat,
  lng,
  geometry,
}: {
  lat: number;
  lng: number;
  geometry?: ListingPolygon | null;
}) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let map: import("maplibre-gl").Map | undefined;
    let cancelled = false;

    loadMapLibre().then(({ Map, Marker, NavigationControl }) => {
      if (cancelled || !container.current) return;

      const points = geometry ? ringPoints(geometry) : [];
      map = new Map({
        container: container.current,
        style: MAP_STYLE_URL,
        center: [lng, lat],
        zoom: 13,
        ...(points.length >= 3 && { bounds: polygonBounds(points), fitBoundsOptions: { padding: 60, maxZoom: 17 } }),
        cooperativeGestures: true, // page scroll isn't hijacked by the map
        attributionControl: { compact: true },
        locale: MAP_LOCALE,
      });
      map.addControl(new NavigationControl({ showCompass: false }), "top-right");

      map.on("load", () => {
        applyLithuanianLabels(map!);
        if (points.length >= 3) {
          addPlotLayers(map!);
          setPlotData(map!, points);
        }
      });
      if (points.length < 3) new Marker({ color: MARKER_COLOR }).setLngLat([lng, lat]).addTo(map);
    });

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [lat, lng, geometry]);

  return <div ref={container} className="h-full w-full" />;
}
