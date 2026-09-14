import { z } from "zod";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined));

export const listingInputSchema = z.object({
  title: z.string().trim().min(3, "Pavadinimas per trumpas").max(200),
  description: optionalText(5000),
  price: z.coerce.number().positive("Kaina turi būti teigiama"),
  pricePerUnit: z.coerce.number().positive().optional().or(z.literal("")).transform((v) => (v === "" ? undefined : v)),
  area: z.coerce.number().positive("Plotas turi būti teigiamas"),
  areaUnit: z.enum(["SQM", "ARE", "HECTARE"]),
  address: optionalText(300),
  municipality: optionalText(200),
  city: optionalText(200),
  landPurpose: optionalText(200),
  plotNumber: optionalText(100),
  contactName: optionalText(200),
  contactPhone: optionalText(50),
  contactEmail: z
    .string()
    .trim()
    .email("Neteisingas el. pašto adresas")
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : undefined)),
});

export type ListingInput = z.infer<typeof listingInputSchema>;
