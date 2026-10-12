import type { Map as MapLibreMap } from "maplibre-gl";
import { MAP_STYLE_URL } from "@/lib/map";
import { polygonBounds, ringPoints } from "@/lib/geo";
import type { ListingPolygon } from "@/types/listing";
import { loadMapLibre } from "./loadMapLibre";
import { addPlotLayers, setPlotData } from "./plotLayers";
import { applyLithuanianLabels } from "./labels";

// Makes small map images for listing cards using ONE hidden map, one image at a
// time (browsers allow only a few live WebGL maps per page). Results are cached
// for the browser session.
export type ThumbnailRequest = { lat: number; lng: number; geometry?: ListingPolygon | null };

const WIDTH = 480;
const HEIGHT = 360;
const CACHE_PREFIX = "map-thumb:v3:";

let mapPromise: Promise<MapLibreMap> | null = null;
let queue: Promise<unknown> = Promise.resolve();

function getMap(): Promise<MapLibreMap> {
  mapPromise ??= loadMapLibre().then(
    ({ Map }) =>
      new Promise<MapLibreMap>((resolve) => {
        const container = document.createElement("div");
        container.setAttribute("aria-hidden", "true");
        container.style.cssText = `position:fixed;top:0;left:-${WIDTH * 2}px;width:${WIDTH}px;height:${HEIGHT}px;pointer-events:none;`;
        document.body.appendChild(container);

        const map = new Map({
          container,
          style: MAP_STYLE_URL,
          interactive: false,
          attributionControl: false,
          fadeDuration: 0,
          pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
          canvasContextAttributes: { preserveDrawingBuffer: true },
        });
        map.on("load", () => {
          applyLithuanianLabels(map);
          addPlotLayers(map, { withPoint: true });
          resolve(map);
        });
      }),
  );
  return mapPromise;
}

function waitForIdle(map: MapLibreMap, timeoutMs = 10_000): Promise<void> {
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, timeoutMs);
    map.once("idle", () => {
      clearTimeout(timer);
      resolve();
    });
  });
}

async function render({ lat, lng, geometry }: ThumbnailRequest): Promise<string> {
  const map = await getMap();
  const points = geometry ? ringPoints(geometry) : [];

  if (points.length >= 3) {
    setPlotData(map, points);
    map.fitBounds(polygonBounds(points), { padding: 70, maxZoom: 16, animate: false });
  } else {
    setPlotData(map, [], [lng, lat]);
    map.jumpTo({ center: [lng, lat], zoom: 12 });
  }
  map.triggerRepaint();
  await waitForIdle(map);
  return map.getCanvas().toDataURL("image/webp", 0.85);
}

function cacheKey({ lat, lng, geometry }: ThumbnailRequest): string {
  return CACHE_PREFIX + JSON.stringify([lat, lng, geometry?.coordinates ?? null]);
}

export function renderThumbnail(request: ThumbnailRequest): Promise<string> {
  const key = cacheKey(request);
  try {
    const cached = sessionStorage.getItem(key);
    if (cached) return Promise.resolve(cached);
  } catch {}

  const result = queue.then(() => render(request));
  queue = result.catch(() => undefined);

  return result.then((url) => {
    try {
      sessionStorage.setItem(key, url);
    } catch {} // storage full or blocked: just skip caching
    return url;
  });
}
