import type { AreaUnit, ListingStatus, ListingType, UserRole } from "@prisma/client";

export type { AreaUnit, ListingStatus, ListingType, UserRole };

// GeoJSON Polygon, as drawn on the map for a listing's boundary.
export type ListingPolygon = {
  type: "Polygon";
  coordinates: number[][][];
};

// Type-specific fields stored in Listing.attributes (JSON), so new types need no migration.
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
