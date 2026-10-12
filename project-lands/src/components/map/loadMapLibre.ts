// Loads MapLibre on demand; its worker is served from /public (see scripts/copy-map-worker.js).
export async function loadMapLibre() {
  const maplibre = await import("maplibre-gl");
  maplibre.setWorkerUrl("/maplibre-gl-worker.mjs");
  return maplibre;
}
