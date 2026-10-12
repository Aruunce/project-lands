import type { GeoJSONSource, Map as MapLibreMap } from "maplibre-gl";
import { MARKER_COLOR } from "@/lib/map";
import type { LngLat } from "@/lib/geo";

// Shared map layers for a plot: boundary fill + outline, and an optional pin dot.
const SOURCE_ID = "plot";

export function addPlotLayers(map: MapLibreMap, { withPoint = false } = {}) {
  map.addSource(SOURCE_ID, { type: "geojson", data: { type: "FeatureCollection", features: [] } });
  map.addLayer({
    id: "plot-fill",
    type: "fill",
    source: SOURCE_ID,
    filter: ["==", ["geometry-type"], "Polygon"],
    paint: { "fill-color": "#3f8b5e", "fill-opacity": 0.28 },
  });
  map.addLayer({
    id: "plot-outline",
    type: "line",
    source: SOURCE_ID,
    filter: ["in", ["geometry-type"], ["literal", ["Polygon", "LineString"]]],
    paint: { "line-color": "#1f4832", "line-width": 2.5 },
  });
  if (withPoint) {
    map.addLayer({
      id: "plot-point",
      type: "circle",
      source: SOURCE_ID,
      filter: ["==", ["geometry-type"], "Point"],
      paint: {
        "circle-radius": 8,
        "circle-color": MARKER_COLOR,
        "circle-stroke-color": "#ffffff",
        "circle-stroke-width": 3,
      },
    });
  }
}

// `points` = boundary corners (closed automatically); `pin` = optional point.
export function setPlotData(map: MapLibreMap, points: LngLat[], pin?: LngLat | null) {
  const features: GeoJSON.Feature[] = [];

  if (points.length >= 3) {
    features.push({
      type: "Feature",
      properties: {},
      geometry: { type: "Polygon", coordinates: [[...points, points[0]]] },
    });
  } else if (points.length === 2) {
    features.push({ type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: points } });
  }
  if (pin) features.push({ type: "Feature", properties: {}, geometry: { type: "Point", coordinates: pin } });

  (map.getSource(SOURCE_ID) as GeoJSONSource | undefined)?.setData({ type: "FeatureCollection", features });
}
