import type { Map as MapLibreMap } from "maplibre-gl";

// Shows place names in Lithuanian where OpenStreetMap has them (the base style uses English/Latin names).
export function applyLithuanianLabels(map: MapLibreMap) {
  for (const layer of map.getStyle().layers ?? []) {
    if (layer.type !== "symbol") continue;
    const field = map.getLayoutProperty(layer.id, "text-field");
    if (field && JSON.stringify(field).includes("name")) {
      map.setLayoutProperty(layer.id, "text-field", ["coalesce", ["get", "name:lt"], ["get", "name"]]);
    }
  }
}
