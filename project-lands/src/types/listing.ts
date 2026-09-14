import type { AreaUnit, ListingStatus, ListingType, UserRole } from "@prisma/client";

export type { AreaUnit, ListingStatus, ListingType, UserRole };

// GeoJSON Polygon, as drawn on the map for a listing's boundary.
export type ListingPolygon = {
  type: "Polygon";
  coordinates: number[][][];
};

// Type-specific fields live in Listing.attributes (JSONB) so new listing
// types can be added without a schema migration. Each type gets its own
// attribute shape here.
export type LandAttributes = {
  landPurpose?: string; // žemės paskirtis
  plotNumber?: string; // sklypo numeris / kadastro Nr.
};

export type ListingAttributes = LandAttributes;

export type PropertyLocation = {
  address?: string | null;
  municipality?: string | null;
  city?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  geometry?: ListingPolygon | null;
};
