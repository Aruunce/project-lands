import type { ListingType, Prisma } from "@prisma/client";
import { LISTING_TYPES, UTILITIES, typeFromSlug, type Utility } from "@/lib/property";
import { searchTerms } from "@/lib/search";

// Listing filters, read from and written to the URL (?q=&tipas=&kaina_nuo=…).

export const SORT_OPTIONS = [
  { value: "", label: "Naujausi" },
  { value: "pigiausi", label: "Pigiausi" },
  { value: "brangiausi", label: "Brangiausi" },
  { value: "didziausi", label: "Didžiausio ploto" },
] as const;

export type SortKey = (typeof SORT_OPTIONS)[number]["value"];

export type ListingFilters = {
  q: string;
  type?: ListingType;
  municipality?: string;
  priceMin?: number;
  priceMax?: number;
  areaMin?: number; // ares
  areaMax?: number; // ares
  utilities: Utility[];
  sort: SortKey;
};

type Params = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)?.trim() ?? "";

function positiveNumber(value: string | string[] | undefined): number | undefined {
  const number = Number(first(value).replace(",", "."));
  return Number.isFinite(number) && number > 0 ? number : undefined;
}

export function parseFilters(params: Params): ListingFilters {
  const utilityValues = UTILITIES.map((u) => u.value) as string[];
  const utilities = [params.komunikacijos ?? []].flat().filter((u): u is Utility => utilityValues.includes(u));
  const sort = SORT_OPTIONS.find((option) => option.value === first(params.rikiuoti))?.value ?? "";

  return {
    q: first(params.q).slice(0, 100),
    type: typeFromSlug(first(params.tipas)),
    municipality: first(params.savivaldybe) || undefined,
    priceMin: positiveNumber(params.kaina_nuo),
    priceMax: positiveNumber(params.kaina_iki),
    areaMin: positiveNumber(params.plotas_nuo),
    areaMax: positiveNumber(params.plotas_iki),
    utilities,
    sort,
  };
}

// Number of filters set in the (collapsible) filter panel; the text search isn't counted.
export function activeFilterCount(filters: ListingFilters): number {
  return (
    [filters.type, filters.municipality, filters.priceMin, filters.priceMax, filters.areaMin, filters.areaMax].filter(
      (value) => value !== undefined,
    ).length + filters.utilities.length
  );
}

const range = (min?: number, max?: number, factor = 1) =>
  min !== undefined || max !== undefined
    ? { ...(min !== undefined && { gte: min * factor }), ...(max !== undefined && { lte: max * factor }) }
    : undefined;

export function filtersToWhere(filters: ListingFilters): Prisma.ListingWhereInput {
  const price = range(filters.priceMin, filters.priceMax);
  const areaSqm = range(filters.areaMin, filters.areaMax, 100);

  return {
    status: "PUBLISHED",
    ...(filters.type && { type: filters.type }),
    ...(filters.municipality && { municipality: filters.municipality }),
    ...(price && { price }),
    ...(areaSqm && { areaSqm }),
    AND: [
      ...searchTerms(filters.q).map((term) => ({ searchText: { contains: term } })),
      ...filters.utilities.map((utility) => ({ attributes: { path: ["utilities"], array_contains: [utility] } })),
    ],
  };
}

export function filtersToOrderBy(filters: ListingFilters): Prisma.ListingOrderByWithRelationInput[] {
  switch (filters.sort) {
    case "pigiausi":
      return [{ price: "asc" }, { id: "asc" }];
    case "brangiausi":
      return [{ price: "desc" }, { id: "asc" }];
    case "didziausi":
      return [{ areaSqm: { sort: "desc", nulls: "last" } }, { id: "asc" }];
    default:
      return [{ publishedAt: "desc" }, { id: "asc" }];
  }
}

export function filtersToSearchParams(filters: ListingFilters): URLSearchParams {
  const params = new URLSearchParams();
  const set = (key: string, value: string | number | undefined) => value !== undefined && value !== "" && params.set(key, String(value));

  set("q", filters.q);
  set("tipas", LISTING_TYPES.find((t) => t.value === filters.type)?.slug);
  set("savivaldybe", filters.municipality);
  set("kaina_nuo", filters.priceMin);
  set("kaina_iki", filters.priceMax);
  set("plotas_nuo", filters.areaMin);
  set("plotas_iki", filters.areaMax);
  filters.utilities.forEach((utility) => params.append("komunikacijos", utility));
  set("rikiuoti", filters.sort);
  return params;
}
