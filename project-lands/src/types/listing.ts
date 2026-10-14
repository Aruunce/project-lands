import type { AreaUnit, ListingStatus, ListingType, UserRole } from "@prisma/client";
import type { Building, Utility } from "@/lib/property";

export type { AreaUnit, ListingStatus, ListingType, UserRole };

// GeoJSON Polygon, as drawn on the map for a listing's boundary.
export type ListingPolygon = {
  type: "Polygon";
  coordinates: number[][][];
};

// Type-specific fields stored in Listing.attributes (JSON), so new types need no migration.
export type ListingAttributes = {
  landPurpose?: string; // žemės paskirtis
  plotNumber?: string; // sklypo / unikalus Nr.
  utilities?: Utility[];
  buildings?: Building[];
};

export type PropertyLocation = {
  address?: string | null;
  municipality?: string | null;
  city?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  geometry?: ListingPolygon | null;
};
