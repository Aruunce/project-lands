import { z } from "zod";

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

export const listingInputSchema = z.object({
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
});

export type ListingInput = z.infer<typeof listingInputSchema>;
