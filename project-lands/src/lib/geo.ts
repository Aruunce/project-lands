import type { ListingPolygon } from "@/types/listing";

export type LngLat = [number, number];

const METERS_PER_DEGREE = 111_320;

// Outer ring of a polygon without the repeated closing point.
export function ringPoints(polygon: ListingPolygon): LngLat[] {
  const ring = polygon.coordinates[0] as LngLat[];
  const first = ring[0];
  const last = ring[ring.length - 1];
  return first[0] === last[0] && first[1] === last[1] ? ring.slice(0, -1) : ring;
}

export function polygonFromPoints(points: LngLat[]): ListingPolygon {
  return { type: "Polygon", coordinates: [[...points, points[0]]] };
}

export function polygonCenter(points: LngLat[]): { lat: number; lng: number } {
  const lng = points.reduce((sum, [x]) => sum + x, 0) / points.length;
  const lat = points.reduce((sum, [, y]) => sum + y, 0) / points.length;
  return { lat, lng };
}

// Approximate area in m² (flat projection + shoelace formula; accurate enough for plot-sized shapes).
export function polygonAreaM2(points: LngLat[]): number {
  if (points.length < 3) return 0;
  const latRad = (polygonCenter(points).lat * Math.PI) / 180;
  const xy = points.map(([lng, lat]) => [lng * METERS_PER_DEGREE * Math.cos(latRad), lat * METERS_PER_DEGREE]);

  let sum = 0;
  for (let i = 0; i < xy.length; i++) {
    const [x1, y1] = xy[i];
    const [x2, y2] = xy[(i + 1) % xy.length];
    sum += x1 * y2 - x2 * y1;
  }
  return Math.abs(sum) / 2;
}

export function polygonBounds(points: LngLat[]): [LngLat, LngLat] {
  const lngs = points.map(([lng]) => lng);
  const lats = points.map(([, lat]) => lat);
  return [
    [Math.min(...lngs), Math.min(...lats)],
    [Math.max(...lngs), Math.max(...lats)],
  ];
}
