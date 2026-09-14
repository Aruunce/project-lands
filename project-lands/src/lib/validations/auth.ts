import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Vardas per trumpas").max(100),
  email: z.string().trim().toLowerCase().email("Neteisingas el. pašto adresas"),
  password: z
    .string()
    .min(8, "Slaptažodis turi būti bent 8 simbolių")
    .max(72, "Slaptažodis per ilgas"),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Neteisingas el. pašto adresas"),
  password: z.string().min(1, "Įveskite slaptažodį"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
