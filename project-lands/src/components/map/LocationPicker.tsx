"use client";

import { useEffect, useRef, useState } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Map as MapLibreMap, Marker } from "maplibre-gl";
import { MapPin, Undo2, X } from "lucide-react";
import { LITHUANIA_CENTER, LITHUANIA_ZOOM, MAP_LOCALE, MAP_STYLE_URL, MARKER_COLOR } from "@/lib/map";
import {
  polygonAreaM2,
  polygonBounds,
  polygonCenter,
  polygonFromPoints,
  ringPoints,
  type LngLat,
} from "@/lib/geo";
import type { ListingPolygon } from "@/types/listing";
import { loadMapLibre } from "./loadMapLibre";
import { addPlotLayers, setPlotData } from "./plotLayers";
import { applyLithuanianLabels } from "./labels";

type Point = { lat: number; lng: number };
type Mode = "point" | "boundary";

const round = (value: number) => Math.round(value * 1e6) / 1e6;

function formatPlotArea(m2: number): string {
  const format = (value: number, digits: number) =>
    new Intl.NumberFormat("lt-LT", { maximumFractionDigits: digits }).format(value);
  return m2 >= 10_000 ? `${format(m2 / 10_000, 2)} ha` : `${format(m2 / 100, 1)} a`;
}

// Admin field: either a single pin, or the plot boundary (the pin is then its center).
// Submits hidden `latitude`, `longitude` and `geometry` (GeoJSON) inputs.
export default function LocationPicker({
  defaultPoint,
  defaultGeometry,
}: {
  defaultPoint?: Point | null;
  defaultGeometry?: ListingPolygon | null;
}) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markerClass = useRef<typeof Marker | null>(null);
  const pinRef = useRef<Marker | null>(null);
  const vertexMarkers = useRef<Marker[]>([]);
  const modeRef = useRef<Mode>(defaultGeometry ? "boundary" : "point");
  const verticesRef = useRef<LngLat[]>(defaultGeometry ? ringPoints(defaultGeometry) : []);

  const [mode, setModeState] = useState<Mode>(modeRef.current);
  const [point, setPoint] = useState<Point | null>(defaultPoint ?? null);
  const [vertices, setVertices] = useState<LngLat[]>(verticesRef.current);

  function placePin(next: Point | null, draggable: boolean) {
    const map = mapRef.current;
    setPoint(next);

    if (next && pinRef.current?.isDraggable() === draggable) {
      pinRef.current.setLngLat([next.lng, next.lat]);
      return;
    }
    pinRef.current?.remove();
    pinRef.current = null;
    if (!map || !next || !markerClass.current) return;

    const pin = new markerClass.current({ color: MARKER_COLOR, draggable }).setLngLat([next.lng, next.lat]).addTo(map);
    pin.on("dragend", () => {
      const { lat, lng } = pin.getLngLat();
      setPoint({ lat: round(lat), lng: round(lng) });
    });
    pinRef.current = pin;
  }

  function handle(map: MapLibreMap, position: LngLat, className: string) {
    const element = document.createElement("div");
    element.className = className;
    return new markerClass.current!({ element, draggable: true }).setLngLat(position).addTo(map);
  }

  // Redraws the boundary; `rebuildHandles` recreates the corner and midpoint handles.
  function updateBoundary(rebuildHandles = true) {
    const map = mapRef.current;
    const points = verticesRef.current;
    setVertices([...points]);
    if (!map) return;

    setPlotData(map, points);

    if (rebuildHandles) {
      vertexMarkers.current.forEach((marker) => marker.remove());

      // Corners: drag to move, double-click to remove.
      const corners = points.map((vertex, index) => {
        const marker = handle(map, vertex, "size-4 cursor-move rounded-full border-2 border-white bg-brand-700 shadow-md");
        marker.on("drag", () => {
          const { lng, lat } = marker.getLngLat();
          verticesRef.current[index] = [round(lng), round(lat)];
          updateBoundary(false);
        });
        marker.on("dragend", () => updateBoundary());
        marker.getElement().addEventListener("dblclick", (event) => {
          event.stopPropagation();
          verticesRef.current.splice(index, 1);
          updateBoundary();
        });
        return marker;
      });

      // Midpoints between corners: drag one to add a new corner there.
      const edgeCount = points.length >= 3 ? points.length : points.length - 1;
      const midpoints = Array.from({ length: Math.max(edgeCount, 0) }, (_, index) => {
        const [a, b] = [points[index], points[(index + 1) % points.length]];
        const marker = handle(
          map,
          [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2],
          "size-3 cursor-copy rounded-full border-2 border-brand-700 bg-white/80 opacity-70 hover:opacity-100",
        );
        marker.on("dragstart", () => {
          const { lng, lat } = marker.getLngLat();
          verticesRef.current.splice(index + 1, 0, [round(lng), round(lat)]);
        });
        marker.on("drag", () => {
          const { lng, lat } = marker.getLngLat();
          verticesRef.current[index + 1] = [round(lng), round(lat)];
          updateBoundary(false);
        });
        marker.on("dragend", () => updateBoundary());
        return marker;
      });

      vertexMarkers.current = [...corners, ...midpoints];
    }

    if (points.length >= 3) {
      const center = polygonCenter(points);
      placePin({ lat: round(center.lat), lng: round(center.lng) }, false);
    } else {
      placePin(null, false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    loadMapLibre().then(({ Map, Marker, NavigationControl }) => {
      if (cancelled || !container.current) return;
      markerClass.current = Marker;

      const points = verticesRef.current;
      const map = new Map({
        container: container.current,
        style: MAP_STYLE_URL,
        center: defaultPoint ? [defaultPoint.lng, defaultPoint.lat] : LITHUANIA_CENTER,
        zoom: defaultPoint ? 15 : LITHUANIA_ZOOM,
        ...(points.length >= 3 && { bounds: polygonBounds(points), fitBoundsOptions: { padding: 50, maxZoom: 18 } }),
        attributionControl: { compact: true },
        locale: MAP_LOCALE,
      });
      mapRef.current = map;
      map.addControl(new NavigationControl({ showCompass: false }), "top-right");
      map.getCanvas().style.cursor = "crosshair";

      map.on("load", () => {
        applyLithuanianLabels(map);
        addPlotLayers(map);
        if (modeRef.current === "boundary") updateBoundary();
        else placePin(defaultPoint ?? null, true);
      });

      map.on("click", (event) => {
        // Ignore clicks on the pin / corner handles.
        if (event.originalEvent.target !== map.getCanvas()) return;
        const { lng, lat } = event.lngLat;

        if (modeRef.current === "point") {
          placePin({ lat: round(lat), lng: round(lng) }, true);
        } else {
          verticesRef.current.push([round(lng), round(lat)]);
          updateBoundary();
        }
      });
    });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // Created once; later changes come from the map itself.
  }, []);

  function setMode(next: Mode) {
    if (next === modeRef.current) return;
    modeRef.current = next;
    setModeState(next);

    if (next === "point") {
      // Keep the boundary's center as the pin, now draggable.
      const center = point;
      verticesRef.current = [];
      updateBoundary();
      placePin(center, true);
    } else {
      placePin(null, false);
    }
  }

  function undoLastCorner() {
    verticesRef.current.pop();
    updateBoundary();
  }

  function clear() {
    verticesRef.current = [];
    updateBoundary();
    placePin(null, modeRef.current === "point");
  }

  const area = vertices.length >= 3 ? polygonAreaM2(vertices) : 0;
  const geometry = vertices.length >= 3 ? JSON.stringify(polygonFromPoints(vertices)) : "";

  const tabClass = (active: boolean) =>
    `cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
      active ? "bg-white text-brand-800 shadow-sm" : "text-gray-600 hover:text-gray-900"
    }`;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex rounded-lg bg-gray-100 p-1">
          <button type="button" onClick={() => setMode("point")} className={tabClass(mode === "point")}>
            Taškas
          </button>
          <button type="button" onClick={() => setMode("boundary")} className={tabClass(mode === "boundary")}>
            Sklypo ribos
          </button>
        </div>
        <span className="text-xs text-gray-500">
          {mode === "point"
            ? "Spustelėkite objekto vietą. Žymeklį galima tempti."
            : "Spustelėkite kampus iš eilės (kiek reikia). Tempkite kampą arba tarpinį tašką, dukart spustelėkite — pašalinsite."}
        </span>
      </div>

      <div className="relative h-96 overflow-hidden rounded-xl ring-1 ring-stone-300">
        <div ref={container} className="h-full w-full" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <span className="flex items-center gap-1.5 text-stone-700">
          {point ? (
            <>
              <MapPin className="size-4 text-brand-600" />
              {point.lat}, {point.lng}
              {area > 0 && <span className="text-stone-500">· ribų plotas ≈ {formatPlotArea(area)}</span>}
            </>
          ) : (
            <span className="text-stone-500">Vieta nepažymėta.</span>
          )}
        </span>
        <span className="flex gap-1">
          {mode === "boundary" && vertices.length > 0 && (
            <button
              type="button"
              onClick={undoLastCorner}
              className="flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-stone-600 hover:bg-stone-100"
            >
              <Undo2 className="size-4" />
              Atšaukti kampą
            </button>
          )}
          {(point || vertices.length > 0) && (
            <button
              type="button"
              onClick={clear}
              className="flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-stone-600 hover:bg-stone-100"
            >
              <X className="size-4" />
              Pašalinti
            </button>
          )}
        </span>
      </div>

      <input type="hidden" name="latitude" value={point?.lat ?? ""} />
      <input type="hidden" name="longitude" value={point?.lng ?? ""} />
      <input type="hidden" name="geometry" value={geometry} />
    </div>
  );
}
