// OpenFreeMap: free vector tiles, no API key, commercial use allowed.
export const MAP_STYLE_URL =
  process.env.NEXT_PUBLIC_MAP_STYLE_URL || "https://tiles.openfreemap.org/styles/liberty";

export const LITHUANIA_CENTER: [number, number] = [23.9, 55.2]; // [lng, lat]
export const LITHUANIA_ZOOM = 6.2;

export const MARKER_COLOR = "#2e704a"; // brand-600

export function googleMapsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

export function googleDirectionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

export function wazeUrl(lat: number, lng: number): string {
  return `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
}
