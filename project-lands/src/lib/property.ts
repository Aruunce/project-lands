import type { AreaUnit, ListingType } from "@prisma/client";

// Property types, building kinds and utilities shown in forms, filters and listings.

export const LISTING_TYPES: { value: ListingType; label: string; slug: string }[] = [
  { value: "LAND", label: "Sklypas", slug: "sklypas" },
  { value: "FARMSTEAD", label: "Sodyba", slug: "sodyba" },
  { value: "HOUSE", label: "Namas", slug: "namas" },
  { value: "FOREST", label: "Miškas", slug: "miskas" },
  { value: "COMMERCIAL", label: "Komercinis", slug: "komercinis" },
  { value: "APARTMENT", label: "Butas", slug: "butas" },
  { value: "OTHER", label: "Kita", slug: "kita" },
];

export const TYPE_LABELS = Object.fromEntries(LISTING_TYPES.map((t) => [t.value, t.label])) as Record<
  ListingType,
  string
>;

export function typeFromSlug(slug: string | undefined): ListingType | undefined {
  return LISTING_TYPES.find((t) => t.slug === slug)?.value;
}

// Types whose main area is the land plot (apartments/commercial premises use their floor area).
export function isLandBased(type: ListingType): boolean {
  return type !== "APARTMENT" && type !== "COMMERCIAL";
}

export const UTILITIES = [
  { value: "electricity", label: "Elektra" },
  { value: "water", label: "Vanduo" },
  { value: "sewage", label: "Nuotekos" },
  { value: "gas", label: "Dujos" },
  { value: "road", label: "Privažiavimas" },
] as const;

export type Utility = (typeof UTILITIES)[number]["value"];

export const BUILDING_KINDS = [
  { value: "house", label: "Gyvenamasis namas" },
  { value: "cottage", label: "Sodo namelis" },
  { value: "outbuilding", label: "Ūkinis pastatas" },
  { value: "barn", label: "Daržinė / tvartas" },
  { value: "garage", label: "Garažas" },
  { value: "sauna", label: "Pirtis" },
  { value: "other", label: "Kitas statinys" },
] as const;

export type BuildingKind = (typeof BUILDING_KINDS)[number]["value"];

export const BUILDING_CONDITIONS = [
  { value: "equipped", label: "Pilna apdaila" },
  { value: "partial", label: "Dalinė apdaila" },
  { value: "unfinished", label: "Nebaigta statyba" },
  { value: "renovate", label: "Reikia remonto" },
] as const;

export type BuildingCondition = (typeof BUILDING_CONDITIONS)[number]["value"];

export type Building = {
  kind: BuildingKind;
  area?: number; // m²
  yearBuilt?: number;
  condition?: BuildingCondition;
  description?: string;
};

export function labelOf<T extends string>(options: readonly { value: T; label: string }[], value: T): string {
  return options.find((option) => option.value === value)?.label ?? value;
}

export const M2_PER_UNIT: Record<AreaUnit, number> = { SQM: 1, ARE: 100, HECTARE: 10_000 };
