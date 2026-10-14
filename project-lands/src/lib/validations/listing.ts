import { z } from "zod";
import { BUILDING_CONDITIONS, BUILDING_KINDS, LISTING_TYPES, UTILITIES } from "@/lib/property";

const values = <T extends string>(options: readonly { value: T }[]) =>
  options.map((option) => option.value) as [T, ...T[]];

// Empty form fields become null, so clearing a field on edit clears it in the DB too.
const emptyToNull = (value: unknown) =>
  value === undefined || value === null || (typeof value === "string" && value.trim() === "") ? null : value;

const optionalText = (max: number) => z.preprocess(emptyToNull, z.string().trim().max(max).nullable());

const optionalNumber = (schema: z.ZodType<number>) => z.preprocess(emptyToNull, schema.nullable());

// Plot boundary drawn on the map: a GeoJSON Polygon sent as a JSON string.
const position = z.tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)]);
const polygonSchema = z.object({
  type: z.literal("Polygon"),
  coordinates: z.array(z.array(position).min(4).max(201)).length(1),
});
const optionalPolygon = z.preprocess((value) => {
  if (emptyToNull(value) === null) return null;
  try {
    return JSON.parse(String(value));
  } catch {
    return value; // fails validation below
  }
}, polygonSchema.nullable());

// Buildings on the property, sent as a JSON array from the form.
const buildingSchema = z.object({
  kind: z.enum(values(BUILDING_KINDS)),
  area: z.number().positive().max(100_000).optional(),
  yearBuilt: z.number().int().min(1700).max(2100).optional(),
  condition: z.enum(values(BUILDING_CONDITIONS)).optional(),
  description: z.string().trim().max(2000).optional(),
});
const buildingsSchema = z.preprocess((value) => {
  if (emptyToNull(value) === null) return [];
  try {
    return JSON.parse(String(value));
  } catch {
    return value;
  }
}, z.array(buildingSchema).max(20));

export const listingInputSchema = z.object({
  type: z.enum(values(LISTING_TYPES)),
  title: z.string().trim().min(3, "Pavadinimas per trumpas").max(200),
  description: optionalText(5000),
  price: z.coerce.number().positive("Kaina turi būti teigiama"),
  pricePerUnit: optionalNumber(z.coerce.number().positive()),
  area: z.coerce.number().positive("Plotas turi būti teigiamas"),
  areaUnit: z.enum(["SQM", "ARE", "HECTARE"]),
  address: optionalText(300),
  municipality: optionalText(200),
  city: optionalText(200),
  latitude: optionalNumber(z.coerce.number().min(-90).max(90)),
  longitude: optionalNumber(z.coerce.number().min(-180).max(180)),
  geometry: optionalPolygon,
  landPurpose: optionalText(200),
  plotNumber: optionalText(100),
  utilities: z.array(z.enum(values(UTILITIES))).max(UTILITIES.length),
  buildings: buildingsSchema,
});

export type ListingInput = z.infer<typeof listingInputSchema>;
